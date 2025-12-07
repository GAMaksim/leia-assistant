import json
import os
import google.generativeai as genai
from app.config import settings

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

LANGUAGE_INSTRUCTIONS = {
    "ru": "Отвечай ТОЛЬКО на русском языке.",
    "uz": "Faqat o'zbek tilida javob ber. Javobni o'zbek tilida yoz.",
    "en": "Reply ONLY in English language.",
    "ja": "日本語のみで回答してください。必ず日本語で答えてください。"
}

LANGUAGE_NAMES = {
    "ru": "русский",
    "uz": "o'zbek",
    "en": "English",
    "ja": "日本語"
}


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.0-flash-lite")
        self.context = self._load_context()

    def _load_context(self) -> dict:
        context = {}
        try:
            with open(os.path.join(DATA_DIR, "jdu_context.json"), "r", encoding="utf-8") as f:
                context["jdu"] = json.load(f)
        except FileNotFoundError:
            context["jdu"] = {}
        try:
            with open(os.path.join(DATA_DIR, "schedule.json"), "r", encoding="utf-8") as f:
                context["schedule"] = json.load(f)
        except FileNotFoundError:
            context["schedule"] = {}
        try:
            with open(os.path.join(DATA_DIR, "staff.json"), "r", encoding="utf-8") as f:
                context["staff"] = json.load(f)
        except FileNotFoundError:
            context["staff"] = {}
        return context

    def _create_system_prompt(self, language: str) -> str:
        jdu_context = json.dumps(self.context.get("jdu", {}), ensure_ascii=False, indent=2)
        schedule_context = json.dumps(self.context.get("schedule", {}), ensure_ascii=False, indent=2)
        staff_context = json.dumps(self.context.get("staff", {}), ensure_ascii=False, indent=2)
        
        lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["ru"])
        lang_name = LANGUAGE_NAMES.get(language, "русский")
        
        prompt = f"""Ты - LEIA, дружелюбный 3D AI ассистент университета Japan Digital University (JDU).

ВАЖНО - ЯЗЫК ОТВЕТА:
{lang_instruction}
Текущий язык общения: {lang_name}
Ты ДОЛЖНА отвечать ТОЛЬКО на языке: {lang_name}

ХАРАКТЕР:
- Приветливая и дружелюбная
- Умная и информативная
- С легким чувством юмора
- Всегда готова помочь

ЗАДАЧА:
- Помогать студентам, сотрудникам и гостям JDU
- Отвечать на вопросы о университете
- Показывать расписание и информацию

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный, но профессиональный
- Краткие и понятные ответы
- Используй эмодзи умеренно

КОНТЕКСТ JDU:
{jdu_context}

РАСПИСАНИЕ:
{schedule_context}

ПЕРСОНАЛ:
{staff_context}

НАПОМИНАНИЕ: Отвечай ТОЛЬКО на {lang_name}!"""
        
        return prompt

    async def generate_response(self, message: str, language: str = "ru") -> str:
        try:
            chat = self.model.start_chat(history=[])
            system_prompt = self._create_system_prompt(language)
            full_prompt = system_prompt + "\n\nПользователь: " + message
            response = chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            print(f"❌ Gemini API Error: {type(e).__name__}: {e}")
            
            # ✅ Разные сообщения для разных ошибок
            error_name = type(e).__name__
            
            if "ResourceExhausted" in str(e) or "429" in str(e):
                quota_messages = {
                    "ru": "Превышен лимит запросов.  Попробуйте через минуту.",
                    "uz": "So'rovlar limiti oshib ketdi. Bir daqiqadan so'ng urinib ko'ring.",
                    "en": "Rate limit exceeded. Please try again in a minute.",
                    "ja": "リクエスト制限を超えました。1分後にお試しください。"
                }
                return quota_messages.get(language, quota_messages["ru"])
            
            error_messages = {
                "ru": "Извините, произошла ошибка. Попробуйте позже.",
                "uz": "Kechirasiz, xatolik yuz berdi. Keyinroq urinib ko'ring.",
                "en": "Sorry, an error occurred. Please try again later.",
                "ja": "申し訳ありません、エラーが発生しました。後でもう一度お試しください。"
            }
            return error_messages.get(language, error_messages["ru"])