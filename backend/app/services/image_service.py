import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


class ImageService:
    def __init__(self):
        self.images = self._load_images()
    
    def _load_images(self) -> dict:
        try:
            with open(os.path.join(DATA_DIR, "images.json"), "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            print("⚠️ images.json not found")
            return {}
    
    def find_image(self, message: str, language: str = "ru") -> str | None:
        """
        Ищет изображение по ключевым словам в сообщении. 
        Возвращает URL изображения или None.
        """
        message_lower = message.lower()
        
        # Проверяем, есть ли команда "покажи", "show", "ko'rsat" и т.д. 
        show_commands = {
            "ru": ["покажи", "показать", "где", "как выглядит"],
            "uz": ["ko'rsat", "qayerda", "ko'rsating"],
            "en": ["show", "where", "what does", "look like"],
            "ja": ["見せて", "どこ", "見たい"]
        }
        
        has_show_command = any(
            cmd in message_lower 
            for cmd in show_commands.get(language, show_commands["ru"])
        )
        print(f"   Команда 'покажи' найдена: {has_show_command}")
        
        # Ищем совпадение по ключевым словам
        for image_id, image_data in self.images.items():
            keywords = image_data.get("keywords", {}).get(language, [])
            
            for keyword in keywords:
                if keyword.lower() in message_lower:
                    print(f"✅ Найдено совпадение: '{keyword}' -> {image_data.get('url')}")
                    # Если есть команда "покажи" или ключевое слово содержит номер
                    if has_show_command or re.search(r'\d+', keyword):
                        return image_data.get("url")
                    
        print("❌ Изображение не найдено")
        return None


image_service = ImageService()