from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class EmotionRequest(BaseModel):
    emotion: str  # happy, sad, thinking, surprised, excited, neutral


class AnimationRequest(BaseModel):
    animation: str  # wave, bow, idle, thinking, pointing, happy_jump
    duration: Optional[float] = None


class AvatarResponse(BaseModel):
    status: str
    current_state: str


@router.post("/emotion", response_model=AvatarResponse)
async def set_emotion(request: EmotionRequest):
    """Установить эмоцию аватара"""
    valid_emotions = ["happy", "sad", "thinking", "surprised", "excited", "neutral"]
    
    if request.emotion not in valid_emotions:
        return AvatarResponse(
            status="error",
            current_state=f"Invalid emotion.  Valid: {valid_emotions}"
        )
    
    return AvatarResponse(
        status="ok",
        current_state=request.emotion
    )


@router.post("/animation", response_model=AvatarResponse)
async def play_animation(request: AnimationRequest):
    """Воспроизвести анимацию"""
    valid_animations = ["wave", "bow", "idle", "thinking", "pointing", "happy_jump", "standby"]
    
    if request.animation not in valid_animations:
        return AvatarResponse(
            status="error",
            current_state=f"Invalid animation. Valid: {valid_animations}"
        )
    
    return AvatarResponse(
        status="ok",
        current_state=request.animation
    )