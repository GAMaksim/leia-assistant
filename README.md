#  LEIA Assistant

<div align="center">

**🌍 Язык / Language / 言語**

[![Russian](https://img.shields.io/badge/Русский-blue)](README.md)
[![English](https://img.shields.io/badge/English-green)](README.en.md)
[![Japanese](https://img.shields.io/badge/日本語-red)](README.ja.md)

---

![LEIA](frontend/images/leia.jpg)

**3D Living AI Assistant для Japan Digital University**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![Three.js](https://img.shields.io/badge/Three.js-r150+-orange.svg)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Демо](#-демо) • [Установка](#-установка) • [Возможности](#-возможности) • [Презентация](presentation.md) • [Технологии](#️-технологии)

</div>

---

## 🏢 О проекте

**LEIA** (Living Educational Interactive Assistant) — продукт компании **AIYM**.

AIDE (LEIA) — это 3D-голографический живой AI-ассистент, который помогает студентам, сотрудникам, гостям и клиентам получать ответы на вопросы и информацию в реальном времени.

> 📊 **[Полная презентация для инвесторов →](presentation.md)**

### Возможности LEIA

| Функция | Описание |
|---------|----------|
| 👁️ **Видит** | Камера + распознавание присутствия |
| 👂 **Слушит** | Микрофон, Speech-to-Text |
| 🧠 **Думает** | AI обработка (Gemini) |
| 🗣️ **Говорит** | TTS + мультиязычный голос |
| 😊 **Чувствует** | 10 эмоций, 9 анимаций |
| 🌍 **Multilingual** | RU / UZ / EN / JP |

---

## 🎯 Целевой рынок

| Сегмент | Применение |
|---------|------------|
| 🏫 Университеты | Информация, расписание, навигация |
| 🏦 Банки | Консультации, очереди |
| 🏨 Отели | Ресепшн 24/7 |
| 🛒 Супермаркеты | Навигация, акции |
| 🏛️ Госучреждения | Документы, справки |
| 🏢 Бизнес-центры | Ресепшн, навигация |

**Step 1:** Japan Digital University (JDU) — пилотный проект

---

## ✨ Возможности

### 🎭 10 Эмоций

| Эмоция | Триггер | Анимация |
|--------|---------|----------|
| 😊 `happy` | рад, отлично | nod |
| 😢 `sad` | извини | idle |
| 🤔 `thinking` | думаю, хм | thinking |
| 😮 `surprised` | вау, wow | wave |
| 🎉 `excited` | круто, супер | happy_jump |
| 😐 `neutral` | (default) | talking |
| 👋 `greeting` | привет, hello | wave |
| 👋 `farewell` | пока, goodbye | bow |
| 🙏 `grateful` | спасибо, thanks | bow |
| ✅ `agreeing` | понял, ok | nod |

### 🏃 9 Анимаций

- 👋 **wave** — помахать рукой
- 🙇 **bow** — японский поклон
- 😊 **nod** — кивок головой
- 🤔 **thinking** — рука у подбородка
- 🗣️ **talking** — жестикуляция
- 👆 **pointing** — указывание
- 🎉 **happy_jump** — радостный прыжок
- 😌 **idle** — покой с дыханием
- 👁️ **blink** — автоматическое моргание

### 🖼️ Показ изображений

```
👤: Покажи кампус
🤖: Вот наш прекрасный кампус!  [показывает фото]

👤: Где 101 аудитория? 
🤖: 101 аудитория на первом этаже [показывает фото]
```

---

## 🎬 Демо

### Примеры диалогов

```
👤: Привет! 
🤖: Привет! 👋 Я LEIA, чем могу помочь? 
    [анимация: wave, эмоция: greeting]

👤: Расскажи о JDU
🤖: Japan Digital University — это современный университет...
    [анимация: talking, эмоция: neutral]

👤: Спасибо! 
🤖: Всегда рада помочь! 🙏
    [анимация: bow, эмоция: grateful]

👤: До свидания! 
🤖: До встречи!  Хорошего дня!  👋
    [анимация: bow, эмоция: farewell]
```

---

## 🚀 Установка

### Требования

- Python 3.11+
- Node.js 18+ (опционально)
- Google Gemini API ключ

### Backend

```bash
# Клонировать репозиторий
git clone https://github.com/GAMaksim/leia-assistant.git
cd leia-assistant

# Создать виртуальное окружение
cd backend
python -m venv venv

# Активировать
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Настроить переменные окружения
cp .env.example .env
# Добавить GEMINI_API_KEY в .env

# Запустить сервер
uvicorn app.main:app --port 8000
```

### Frontend

```bash
cd frontend

# Запустить локальный сервер
python -m http.server 3000
# или
npx serve -p 3000
```

### Открыть

```
http://localhost:3000
```

---

## 🛠️ Технологии

### Архитектура

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

### Стек

| Компонент | Технология |
|-----------|------------|
| 3D Графика | Three.js, WebGL |
| 3D Аватар | VRM (VRoidStudio) |
| Анимации | GSAP |
| Backend | FastAPI (Python) |
| AI | Google Gemini API |
| Речь | Web Speech API |

---

## 📁 Структура проекта

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
│   │   ├── campus.jpg
│   │   ├── room_101.jpg
│   │   ├── library.jpg
│   │   └── cafeteria.jpg
│   ├── models/
│   │   └── leia.vrm
│   └── index.html
├── presentation.md          
├── LICENSE
└── README.md
```

---

## 🔧 API

### POST `/api/chat`

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!", "language": "ru"}'
```

**Ответ:**

```json
{
  "response": "Привет!  Я LEIA, чем могу помочь?",
  "emotion": "greeting",
  "animation": "wave",
  "image": null
}
```

### Эндпоинты

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/chat` | Отправить сообщение |
| POST | `/api/speech/stt` | Speech-to-Text |
| POST | `/api/speech/tts` | Text-to-Speech |
| GET | `/health` | Проверка статуса |

---

## 🌍 Языки

| Код | Язык | UI | STT | TTS | Эмоции |
|-----|------|----|----|-----|--------|
| 🇷🇺 ru | Русский | ✅ | ✅ | ✅ | ✅ |
| 🇺🇿 uz | O'zbek | ✅ | ✅ | ⚠️ | ✅ |
| 🇬🇧 en | English | ✅ | ✅ | ✅ | ✅ |
| 🇯🇵 ja | 日本語 | ✅ | ✅ | ✅ | ✅ |

> ⚠️ Узбекский TTS ограничен возможностями браузера

---

## 📊 Презентация

Полная презентация проекта для инвесторов:

### 📄 [presentation.md](presentation.md)

Содержит:
- 🎯 Проблема и решение
- 💎 Ценность для клиента
- 💰 Бизнес-модель
- 🚀 Roadmap
- 📊 Текущий прогресс
- 💵 Инвестиции
- 🎬 Сценарий презентации

---

## 🚀 Roadmap

- [x] ✅ **Step 1:** JDU Prototype (MVP)
- [ ] 🔄 **Step 2:** Beta для бизнесов (Q1 2026)
- [ ] 📋 **Step 3:** Коммерческий запуск (Q3 2026)
- [ ] 📋 **Step 4:** Международный рынок (2027)

---

## 👥 Команда

**AIYM Company**

- 👨‍💻 Lead Developer — [@GAMaksim](https://github.com/GAMaksim)
- 🏫 Partner — Japan Digital University

---

## 📄 Лицензия

MIT License — см.[LICENSE](LICENSE)

---

<div align="center">

**⭐ Поставьте звезду, если проект понравился!**

[![GitHub stars](https://img.shields.io/github/stars/GAMaksim/leia-assistant?style=social)](https://github.com/GAMaksim/leia-assistant)

---

**🏢 AIYM Company** | **🤖 LEIA** | **🎓 JDU**

*Made with ❤️ in Tashkent*

</div>