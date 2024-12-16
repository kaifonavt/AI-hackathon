from openai import AsyncOpenAI
import asyncio

from main.env import OPENAI_API_KEY

INSTRUCTIONS = ""

FUNCTIONS = []

async def create_assistant(api_key: str, name: str):
    client = AsyncOpenAI(api_key=api_key)
    
    assistant = await client.beta.assistants.create(
        name=name,
        instructions=INSTRUCTIONS,
        model="gpt-4o",
        tools=FUNCTIONS
    )
    
    await client.close()
    return assistant.id

async def main():
    assistant_id = await create_assistant(
        api_key=OPENAI_API_KEY,
        name="Assistant"
    )
    print(f"Created assistant: {assistant_id}")

if __name__ == "__main__":
    asyncio.run(main())