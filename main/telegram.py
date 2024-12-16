from aiogram import Bot, Dispatcher, types, Router
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.storage.memory import MemoryStorage
import asyncio
import logging
from typing import Dict
from openai_service import OpenAIAsyncClient
from env import BOT_TOKEN, OPENAI_API_KEY

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize router
router = Router()

# Dictionary to store user thread IDs
user_threads: Dict[int, str] = {}

# Initialize OpenAI client
openai_client = OpenAIAsyncClient(api_key=OPENAI_API_KEY)

@router.message(Command("start"))
async def cmd_start(message: Message):
    """Handler for /start command"""
    await message.answer(
        "👋 Hi! I'm a bot powered by OpenAI. Send me a message and I'll respond using the GPT model.\n"
        "Use /new to start a new conversation thread."
    )

@router.message(Command("new"))
async def cmd_new(message: Message):
    """Handler for /new command - starts a new conversation thread"""
    user_id = message.from_user.id
    if user_id in user_threads:
        del user_threads[user_id]
    await message.answer("Starting a new conversation thread. Send me a message!")

@router.message()
async def handle_message(message: Message):
    """Handler for all text messages"""
    try:
        user_id = message.from_user.id
        user_message = message.text
        
        # Show typing status
        await message.bot.send_chat_action(message.chat.id, 'typing')
        
        # Process message with OpenAI
        thread_id = user_threads.get(user_id)
        result = await openai_client.process_and_poll(user_message, thread_id)
        
        # Store thread ID for continued conversation
        if result["thread_id"]:
            user_threads[user_id] = result["thread_id"]
        
        # Handle failed status
        if result["status"] == "failed":
            error_message = "Sorry, I encountered an error while processing your message. Please try again."
            logger.error(f"Error processing message: {result['content']}")
            await message.answer(error_message)
            return
            
        # Send response
        response_text = result["content"]
        
        # Split long messages if needed
        if len(response_text) > 4000:
            parts = [response_text[i:i+4000] for i in range(0, len(response_text), 4000)]
            for part in parts:
                await message.answer(part)
        else:
            await message.answer(response_text)
            
        # Log function calls if any occurred
        if result["function_details"]:
            logger.info(f"Functions called: {result['function_details']}")
            
    except Exception as e:
        logger.error(f"Error in message handler: {str(e)}")
        await message.answer("An error occurred while processing your message. Please try again later.")

async def main():
    # Initialize bot and dispatcher
    bot = Bot(token=BOT_TOKEN)
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)
    
    try:
        # Start polling
        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await bot.session.close()
        await openai_client.close()

if __name__ == "__main__":
    asyncio.run(main())