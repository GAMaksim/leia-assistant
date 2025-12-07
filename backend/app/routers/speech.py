from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.speech_service import SpeechService

router = APIRouter()
speech_service = SpeechService()


class TTSRequest(BaseModel):
    text: str
    language: str = "ru"


class STTResponse(BaseModel):
    text: str
    language: str


class TTSResponse(BaseModel):
    audio_url: str
    duration: float


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """Преобразование речи в текст"""
    try:
        result = await speech_service.transcribe(audio)
        return STTResponse(
            text=result["text"],
            language=result["language"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """Преобразование текста в речь"""
    try:
        result = await speech_service.synthesize(
            text=request.text,
            language=request.language
        )
        return TTSResponse(
            audio_url=result["audio_url"],
            duration=result["duration"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))