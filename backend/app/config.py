import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    APP_NAME: str = "LEIA Assistant"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"


settings = Settings()