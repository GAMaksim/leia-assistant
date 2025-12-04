import re


class EmotionService:
    """Сервис для анализа эмоций и выбора анимаций"""
    
    EMOTIONS = ["happy", "sad", "thinking", "surprised", "excited", "neutral", "grateful", "agreeing"]
    
    EMOTION_KEYWORDS = {
        "grateful": ["спасибо", "благодарю", "рахмат", "thank", "thanks", "ありがとう", "arigato"],
        "agreeing": ["понял", "понятно", "хорошо", "ладно", "ok", "okay", "договорились", "ясно", "tushundim", "yaxshi", "わかりました", "了解"],
        "happy": ["рад", "отлично", "прекрасно", "добро пожаловать", "happy", "great", "welcome"],
        "sad": ["извини", "к сожалению", "не могу", "проблема", "sorry", "unfortunately"],
        "thinking": ["думаю", "возможно", "наверное", "хм", "интересно", "let me think", "maybe", "hmm"],
        "surprised": ["ого", "вау", "wow", "amazing", "incredible", "すごい"],
        "excited": ["круто", "замечательно", "восхитительно", "ура", "супер", "awesome", "wonderful", "cool", "やった"],
    }
    
    ANIMATION_MAP = {
        "happy": "nod",
        "sad": "idle",
        "thinking": "thinking",
        "surprised": "wave",
        "excited": "happy_jump",
        "neutral": "talking",
        "greeting": "wave",
        "farewell": "bow",
        "grateful": "bow",
        "agreeing": "nod"
    }

    def analyze_emotion(self, text: str) -> str:
        """Анализ эмоции из текста"""
        text_lower = text.lower()
        
        # Проверка приветствия
        if any(word in text_lower for word in ["привет", "здравствуй", "hello", "hi", "салом", "salom", "こんにちは"]):
            return "greeting"
        
        # Проверка прощания
        if any(word in text_lower for word in ["пока", "до свидания", "goodbye", "bye", "xayr", "さようなら"]):
            return "farewell"
        
        # Проверка ключевых слов для каждой эмоции (в порядке приоритета)
        priority_order = ["grateful", "agreeing", "excited", "thinking", "surprised", "happy", "sad"]
        
        for emotion in priority_order:
            keywords = self.EMOTION_KEYWORDS.get(emotion, [])
            if any(keyword in text_lower for keyword in keywords):
                return emotion
        
        return "neutral"

    def get_animation_for_emotion(self, emotion: str) -> str:
        """Получение анимации для эмоции"""
        return self.ANIMATION_MAP.get(emotion, "talking")

    def get_animation_for_context(self, context: str) -> str:
        """Получение анимации для контекста"""
        context_animations = {
            "greeting": "wave",
            "farewell": "bow",
            "explaining": "talking",
            "thinking": "thinking",
            "celebrating": "happy_jump",
            "agreeing": "nod",
            "thanking": "bow"
        }
        return context_animations.get(context, "talking")