from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import GeminiService
from app.services.emotion_service import EmotionService

router = APIRouter()
gemini_service = GeminiService()
emotion_service = EmotionService()


class ChatRequest(BaseModel):
    message: str
    language: str = "ru"


class ChatResponse(BaseModel):
    response: str
    emotion: str
    animation: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Получаем ответ от Gemini
        response = await gemini_service.generate_response(
            message=request.message,
            language=request.language
        )
        
        # Определяем эмоцию и анимацию на основе СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ
        # Это позволяет правильно реагировать на "спасибо", "привет" и т.д.
        emotion = emotion_service.analyze_emotion(request.message)
        animation = emotion_service.get_animation_for_emotion(emotion)
        
        return ChatResponse(
            response=response,
            emotion=emotion,
            animation=animation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))