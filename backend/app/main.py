from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, speech, avatar

app = FastAPI(
    title="LEIE Assistant API",
    description="3D Living AI Assistant for JDU",
    version="1.0.0"
)

# CORS для frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(speech.router, prefix="/api/speech", tags=["speech"])
app. include_router(avatar.router, prefix="/api/avatar", tags=["avatar"])


@app.get("/")
async def root():
    return {
        "message": "LEIE Assistant API is running! ",
        "status": "ok",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}