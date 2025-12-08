#  LEIA Assistant

<div align="center">

**🌍 Язык / Language / 言語**

[![Russian](https://img.shields.io/badge/Русский-blue)](README.md)
[![English](https://img.shields.io/badge/English-green)](README.en.md)
[![Japanese](https://img.shields.io/badge/日本語-red)](README.ja.md)

---

![LEIA](frontend/images/leia.jpg)

**3D Living AI Assistant for Japan Digital University**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Three.js](https://img.shields.io/badge/Three.js-r150+-orange.svg)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Demo](#-demo) • [Installation](#-installation) • [Features](#-features) • [Presentation](presentation.en.md) • [Technologies](#️-technologies)

</div>

---

## 🏢 About the Project

**LEIA** (Living Educational Interactive Assistant) — a product by **AIYM Company**.

AIDE (LEIA) is a 3D holographic living AI assistant that helps students, staff, guests, and customers get answers and information in real-time.

> 📊 **[Full Investor Presentation →](presentation.en.md)**

### LEIA Capabilities

| Function | Description |
|----------|-------------|
| 👁️ **Sees** | Camera + presence detection |
| 👂 **Listens** | Microphone, Speech-to-Text |
| 🧠 **Thinks** | AI processing (Gemini) |
| 🗣️ **Speaks** | TTS + multilingual voice |
| 😊 **Feels** | 10 emotions, 9 animations |
| 🌍 **Multilingual** | RU / UZ / EN / JP |

---

## 🎯 Target Market

| Segment | Application |
|---------|-------------|
| 🏫 Universities | Information, schedules, navigation |
| 🏦 Banks | Consultations, queue management |
| 🏨 Hotels | 24/7 Reception |
| 🛒 Supermarkets | Navigation, promotions |
| 🏛️ Government | Documents, certificates |
| 🏢 Business Centers | Reception, navigation |

**Step 1:** Japan Digital University (JDU) — Pilot Project

---

## ✨ Features

### 🎭 10 Emotions

| Emotion | Trigger | Animation |
|---------|---------|-----------|
| 😊 `happy` | great, excellent | nod |
| 😢 `sad` | sorry | idle |
| 🤔 `thinking` | thinking, hmm | thinking |
| 😮 `surprised` | wow, amazing | wave |
| 🎉 `excited` | cool, awesome | happy_jump |
| 😐 `neutral` | (default) | talking |
| 👋 `greeting` | hello, hi | wave |
| 👋 `farewell` | goodbye, bye | bow |
| 🙏 `grateful` | thank you, thanks | bow |
| ✅ `agreeing` | ok, understood | nod |

### 🏃 9 Animations

- 👋 **wave** — wave hand
- 🙇 **bow** — Japanese bow
- 😊 **nod** — head nod
- 🤔 **thinking** — hand on chin
- 🗣️ **talking** — gesturing
- 👆 **pointing** — pointing
- 🎉 **happy_jump** — joyful jump
- 😌 **idle** — breathing at rest
- 👁️ **blink** — automatic blinking

### 🖼️ Image Display

```
👤: Show me the campus
🤖: Here's our beautiful campus!  [displays photo]

👤: Where is room 101?
🤖: Room 101 is on the first floor [displays photo]
```

---

## 🎬 Demo

### Example Dialogues

```
👤: Hello! 
🤖: Hello! 👋 I'm LEIA, how can I help you? 
    [animation: wave, emotion: greeting]

👤: Tell me about JDU
🤖: Japan Digital University is a modern university...
    [animation: talking, emotion: neutral]

👤: Thank you! 
🤖: Always happy to help! 🙏
    [animation: bow, emotion: grateful]

👤: Goodbye! 
🤖: See you!  Have a great day! 👋
    [animation: bow, emotion: farewell]
```

---

## 🚀 Installation

### Requirements

- Python 3.11+
- Node.js 18+ (optional)
- Google Gemini API key

### Backend

```bash
# Clone the repository
git clone https://github.com/GAMaksim/leia-assistant.git
cd leia-assistant

# Create virtual environment
cd backend
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Add GEMINI_API_KEY to .env

# Start server
uvicorn app.main:app --port 8000
```

### Frontend

```bash
cd frontend

# Start local server
python -m http.server 3000
# or
npx serve -p 3000
```

### Open

```
http://localhost:3000
```

---

## 🛠️ Technologies

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │ Three.js  │  │    VRM    │  │   Web     │       │
│   │  WebGL    │  │  Avatar   │  │  Speech   │       │
│   └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────┬───────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────┐
│                     BACKEND                         │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│   │  FastAPI  │  │  Gemini   │  │  Context  │       │
│   │  Python   │  │    AI     │  │   Data    │       │
│   └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────┘
```

### Stack

| Component | Technology |
|-----------|------------|
| 3D Graphics | Three.js, WebGL |
| 3D Avatar | VRM (VRoidStudio) |
| Animations | GSAP |
| Backend | FastAPI (Python) |
| AI | Google Gemini API |
| Speech | Web Speech API |

---

## 📁 Project Structure

```
leia-assistant/
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   ├── jdu_context.json
│   │   │   ├── schedule.json
│   │   │   ├── staff.json
│   │   │   └── images.json
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   ├── speech.py
│   │   │   └── avatar.py
│   │   ├── services/
│   │   │   ├── gemini_service.py
│   │   │   ├── emotion_service.py
│   │   │   ├── image_service.py
│   │   │   └── speech_service.py
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── vrm-loader.js
│   │   ├── animation-controller.js
│   │   ├── emotion-controller.js
│   │   ├── speech-handler.js
│   │   └── presence-detector.js
│   ├── images/
│   ├── models/
│   │   └── leia.vrm
│   └── index.html
├── presentation.md
├── presentation.en.md
├── presentation.ja.md
├── LICENSE
├── README.md
├── README.en.md
└── README.ja.md
```

---

## 🔧 API

### POST `/api/chat`

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "language": "en"}'
```

**Response:**

```json
{
  "response": "Hello! I'm LEIA, how can I help you?",
  "emotion": "greeting",
  "animation": "wave",
  "image": null
}
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message |
| POST | `/api/speech/stt` | Speech-to-Text |
| POST | `/api/speech/tts` | Text-to-Speech |
| GET | `/health` | Health check |

---

## 🌍 Languages

| Code | Language | UI | STT | TTS | Emotions |
|------|----------|----|----|-----|----------|
| 🇷🇺 ru | Russian | ✅ | ✅ | ✅ | ✅ |
| 🇺🇿 uz | Uzbek | ✅ | ✅ | ⚠️ | ✅ |
| 🇬🇧 en | English | ✅ | ✅ | ✅ | ✅ |
| 🇯🇵 ja | Japanese | ✅ | ✅ | ✅ | ✅ |

> ⚠️ Uzbek TTS is limited by browser capabilities

---

## 📊 Presentation

Full investor presentation:

### 📄 [presentation.en.md](presentation.en.md)

Contents:
- 🎯 Problem and Solution
- 💎 Customer Value
- 💰 Business Model
- 🚀 Roadmap
- 📊 Current Progress
- 💵 Investment
- 🎬 Presentation Script

---

## 🚀 Roadmap

- [x] ✅ **Step 1:** JDU Prototype (MVP)
- [ ] 🔄 **Step 2:** Beta for businesses (Q1 2026)
- [ ] 📋 **Step 3:** Commercial launch (Q3 2026)
- [ ] 📋 **Step 4:** International market (2027)

---

## 👥 Team

**AIYM Company**

- 👨‍💻 Lead Developer — [@GAMaksim](https://github.com/GAMaksim)
- 🏫 Partner — Japan Digital University

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">

**⭐ Star this repo if you like it!**

[![GitHub stars](https://img.shields.io/github/stars/GAMaksim/leia-assistant?style=social)](https://github.com/GAMaksim/leia-assistant)

---

**🏢 AIYM Company** | **🤖 LEIA** | **🎓 JDU**

*Made with ❤️ in Tashkent*

</div>