import re


class EmotionService:
    """Сервис для анализа эмоций и выбора анимаций"""
    
    EMOTIONS = ["happy", "sad", "thinking", "surprised", "excited", "neutral"]
    
    EMOTION_KEYWORDS = {
        "happy": ["рад", "отлично", "прекрасно", "хорошо", "спасибо", "пожалуйста", "добро пожаловать", "happy", "great", "good"],
        "sad": ["извини", "к сожалению", "не могу", "проблема", "sorry", "unfortunately"],
        "thinking": ["думаю", "возможно", "наверное", "хм", "let me think", "maybe"],
        "surprised": ["ого", "вау", "интересно", "wow", "amazing", "incredible"],
        "excited": ["круто", "замечательно", "восхитительно", "awesome", "wonderful"],
    }
    
    ANIMATION_MAP = {
        "happy": "happy_jump",
        "sad": "idle",
        "thinking": "thinking",
        "surprised": "wave",
        "excited": "happy_jump",
        "neutral": "idle",
        "greeting": "wave",
        "farewell": "bow"
    }

    def analyze_emotion(self, text: str) -> str:
        """Анализ эмоции из текста"""
        text_lower = text.lower()
        
        # Проверка приветствия
        if any(word in text_lower for word in ["привет", "здравствуй", "hello", "hi", "салом"]):
            return "happy"
        
        # Проверка прощания
        if any(word in text_lower for word in ["пока", "до свидания", "goodbye", "bye"]):
            return "happy"
        
        # Проверка ключевых слов для каждой эмоции
        for emotion, keywords in self.EMOTION_KEYWORDS.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion
        
        return "neutral"

    def get_animation_for_emotion(self, emotion: str) -> str:
        """Получение анимации для эмоции"""
        return self.ANIMATION_MAP.get(emotion, "idle")

    def get_animation_for_context(self, context: str) -> str:
        """Получение анимации для контекста"""
        context_animations = {
            "greeting": "wave",
            "farewell": "bow",
            "explaining": "pointing",
            "thinking": "thinking",
            "celebrating": "happy_jump"
        }
        return context_animations.get(context, "idle")