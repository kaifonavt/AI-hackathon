from openai import AsyncOpenAI, OpenAIError
import asyncio
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import json
from env import ASSISTANT_ID, OPENAI_API_KEY

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

INSTRUCTIONS = ""
FUNCTIONS = []

class OpenAIAsyncClient:
    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        temperature: float = 0.7
    ):
        try:
            self.client = AsyncOpenAI(api_key=api_key)
            self.model = model
            self.temperature = temperature
            self.function_prompts = {}
            try:
                self.load_function_prompts()
            except:
                logger.warning("No function prompts file found, continuing without functions")
            logger.info(f"Initialized OpenAI client with model: {model}")
        except Exception as e:
            logger.error(f"Failed to initialize client: {str(e)}")
            raise

    def load_function_prompts(self) -> Dict[str, str]:
        try:
            with open('/openai_functions/function_prompts.json', 'r') as f:
                self.function_prompts = json.load(f)
                logger.info(f"Loaded {len(self.function_prompts)} function prompts")
        except FileNotFoundError:
            logger.warning("function_prompts.json not found")
            self.function_prompts = {}
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in function_prompts.json: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error loading function prompts: {str(e)}")
            raise

    async def create_thread(self, message: str) -> str:
        try:
            thread = await self.client.beta.threads.create(
                messages=[{"role": "user", "content": message}]
            )
            return thread.id
        except Exception as e:
            logger.error(f"Error creating thread: {str(e)}")
            raise

    async def call_function(self, function_name: str, function_args: dict) -> str:
        try:
            if function_name not in self.function_prompts:
                raise ValueError(f"Function {function_name} not found")
            
            prompt = self.function_prompts[function_name]
            logger.info(f"Called function {function_name} with args {function_args}")
            return prompt
            
        except Exception as e:
            logger.error(f"Error calling function: {str(e)}")
            raise

    async def handle_run_actions(self, thread_id: str, run) -> Dict[str, Any]:
        function_details = []
        while run.status == "requires_action":
            logger.info(f"Run for thread {thread_id} requires action")
            tool_outputs = []
            
            for tool_call in run.required_action.submit_tool_outputs.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                logger.info(f"Calling function {function_name} for run in thread {thread_id}")
                
                function_response = await self.call_function(function_name, function_args)
                
                tool_outputs.append({
                    "tool_call_id": tool_call.id,
                    "output": function_response
                })
                
                function_details.append({
                    "name": function_name,
                    "arguments": function_args,
                    "response": function_response,
                })
                
            logger.info(f"Submitting tool outputs for run in thread {thread_id}")
            run = await self.client.beta.threads.runs.submit_tool_outputs_and_poll(
                thread_id=thread_id,
                run_id=run.id,
                tool_outputs=tool_outputs
            )
            
        return {"run": run, "function_details": function_details}

    async def add_message(self, thread_id: str, message: str) -> Dict[str, Any]:
        try:
            start_time = datetime.now()
            
            if not message or not isinstance(message, str):
                raise ValueError("Invalid message format")

            await self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )
            
            run = await self.client.beta.threads.runs.create_and_poll(
                thread_id=thread_id,
                assistant_id=ASSISTANT_ID
            )
            
            if not run:
                raise OpenAIError("Failed to get run response")

            if run.status == "requires_action":
                action_result = await self.handle_run_actions(thread_id, run)
                run = action_result["run"]
                function_details = action_result["function_details"]
            else:
                function_details = []

            messages = await self.client.beta.threads.messages.list(thread_id=thread_id)
            if not messages.data:
                raise OpenAIError("No messages in response")
                
            duration = (datetime.now() - start_time).total_seconds()
            
            result = {
                "status": run.status,
                "content": messages.data[0].content[0].text.value,
                "duration": duration,
                "thread_id": thread_id,
                "function_details": function_details
            }
            
            logger.info(f"Processed message in {duration:.2f}s with status: {result['status']}")
            return result
            
        except Exception as e:
            logger.error(f"Error in add_message: {str(e)}")
            return {
                "status": "failed",
                "content": str(e),
                "duration": 0,
                "thread_id": thread_id,
                "function_details": []
            }

    async def process_and_poll(self, message: str, thread_id: Optional[str] = None) -> Dict[str, Any]:
        try:
            if thread_id:
                return await self.add_message(thread_id, message)
            
            thread_id = await self.create_thread(message)
            return await self.add_message(thread_id, message)
            
        except Exception as e:
            logger.error(f"Error in process_and_poll: {str(e)}")
            return {
                "status": "failed",
                "content": str(e),
                "duration": 0,
                "thread_id": thread_id if thread_id else None,
                "function_details": []
            }

    async def process_multiple_and_poll(self, messages: List[str], thread_id: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            if not messages or not isinstance(messages, list):
                raise ValueError("Invalid messages format")

            tasks = [self.process_and_poll(msg, thread_id) for msg in messages]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            valid_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Error processing message {i}: {str(result)}")
                    valid_results.append({
                        "status": "failed",
                        "content": str(result),
                        "duration": 0,
                        "thread_id": thread_id if thread_id else None,
                        "function_details": []
                    })
                else:
                    valid_results.append(result)
                    
            return valid_results
            
        except Exception as e:
            logger.error(f"Error processing multiple messages: {str(e)}")
            return [{"status": "failed", "content": str(e), "duration": 0, "thread_id": thread_id if thread_id else None, "function_details": []}]

    async def close(self):
        try:
            await self.client.close()
            logger.info("Client closed successfully")
        except Exception as e:
            logger.error(f"Error closing client: {str(e)}")

async def main():
    client = OpenAIAsyncClient(api_key=OPENAI_API_KEY)
    
    try:
        # Create new thread with first message
        result = await client.process_and_poll("First message")
        print("Initial message result:", result)
        
        # Use the same thread for next message
        thread_id = result["thread_id"]
        next_result = await client.process_and_poll("Follow up question?", thread_id)
        print("Follow up result:", next_result)
        
        # Multiple messages in same thread
        messages = ["Message 1", "Message 2", "Message 3"]
        results = await client.process_multiple_and_poll(messages, thread_id)
        print("Multiple messages results:", results)
        
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())