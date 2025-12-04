import json
import os
import google.generativeai as genai
from app.config import settings

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.0-flash-lite")
        self.context = self._load_context()
        self.system_prompt = self._create_system_prompt()

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

    def _create_system_prompt(self) -> str:
        jdu_context = json.dumps(self.context.get("jdu", {}), ensure_ascii=False, indent=2)
        schedule_context = json.dumps(self.context.get("schedule", {}), ensure_ascii=False, indent=2)
        staff_context = json.dumps(self.context.get("staff", {}), ensure_ascii=False, indent=2)
        
        prompt = """Ты - LEIA, дружелюбный 3D AI ассистент университета Japan Digital University (JDU).

ХАРАКТЕР:
- Приветливая и дружелюбная
- Умная и информативная
- С легким чувством юмора
- Всегда готова помочь

ЯЗЫКИ:
- Русский, Узбекский, Английский, Японский
- Отвечай на том языке, на котором к тебе обращаются

ЗАДАЧА:
- Помогать студентам, сотрудникам и гостям JDU
- Отвечать на вопросы о университете
- Показывать расписание и информацию

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный, но профессиональный
- Краткие и понятные ответы
- Используй эмодзи умеренно

КОНТЕКСТ JDU:
""" + jdu_context + """

РАСПИСАНИЕ:
""" + schedule_context + """

ПЕРСОНАЛ:
""" + staff_context
        
        return prompt

    async def generate_response(self, message: str, language: str = "ru") -> str:
        try:
            chat = self.model.start_chat(history=[])
            full_prompt = self.system_prompt + "\n\nПользователь: " + message
            response = chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            return "Извините, произошла ошибка: " + str(e)