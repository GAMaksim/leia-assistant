import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    APP_NAME: str = "LEIA Assistant"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"


settings = Settings()

# ✅ ДОБАВЬТЕ ЭТО - проверка при запуске
if not settings.GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY не установлен!  Проверьте .env файл")
else:
    print(f"✅ GEMINI_API_KEY загружен (первые 10 символов: {settings.GEMINI_API_KEY[:10]}... )")