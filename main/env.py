import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")
ASSISTANT_ID=os.getenv("ASSISTANT_ID")
BOT_TOKEN=os.getenv("BOT_TOKEN")