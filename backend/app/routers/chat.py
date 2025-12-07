from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import GeminiService
from app.services.emotion_service import EmotionService
from app.services.image_service import image_service  

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
    image: str | None = None  


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Получаем ответ от Gemini
        response = await gemini_service.generate_response(
            message=request.message,
            language=request.language
        )
        
        # Определяем эмоцию и анимацию
        emotion = emotion_service.analyze_emotion(request.message)
        animation = emotion_service.get_animation_for_emotion(emotion)
        
        # ✅ Ищем изображение для показа
        image_url = image_service.find_image(request.message, request.language)
        
        return ChatResponse(
            response=response,
            emotion=emotion,
            animation=animation,
            image=image_url  
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))