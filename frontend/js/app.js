import { VRMLoader } from './vrm-loader.js';
import { AnimationController } from './animation-controller.js';
import { EmotionController } from './emotion-controller.js';
import { SpeechHandler } from './speech-handler.js';
import { PresenceDetector } from './presence-detector.js';

class LEIAApp {
    constructor() {
        this.apiUrl = 'http://localhost:8000';
        this.currentLanguage = 'ru';
        this.isListening = false;
        this.isBusy = false; // Флаг чтобы предотвратить прерывание
        
        // Controllers (will be initialized after VRM loads)
        this.vrmLoader = null;
        this.animationController = null;
        this.emotionController = null;
        this.speechHandler = null;
        this.presenceDetector = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing LEIA App...');
        
        // Update datetime
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize VRM
        await this.initVRM();
        
        // Initialize speech handler
        this.speechHandler = new SpeechHandler(this.currentLanguage);
        
        // Initialize presence detector
        this.presenceDetector = new PresenceDetector((detected) => {
            if (detected && !this.isBusy) {
                this.onUserDetected();
            }
        });
        
        console.log('✅ LEIA App initialized! ');
        this.setStatus('ready');
    }

    async initVRM() {
        try {
            this.vrmLoader = new VRMLoader('avatar-container');
            await this.vrmLoader.init();
            
            // Try to load VRM model
            try {
                await this.vrmLoader.loadModel('models/leia.vrm');
                this.animationController = new AnimationController(this.vrmLoader.vrm);
                this.emotionController = new EmotionController(this.vrmLoader.vrm);
                console.log('✅ VRM model loaded! ');
            } catch (e) {
                console.log('ℹ️ VRM model not found, running in demo mode');
            }
        } catch (error) {
            console.error('Failed to initialize VRM:', error);
        }
    }

    setupEventListeners() {
        // Language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang));
        });
        
        // Mic button
        document.getElementById('mic-button').addEventListener('click', () => {
            this.toggleListening();
        });
        
        // Send button
        document.getElementById('send-button').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Text input enter
        document.getElementById('text-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('datetime').textContent = now.toLocaleDateString(this.currentLanguage === 'uz' ? 'uz-UZ' : this.currentLanguage + '-' + this.currentLanguage.toUpperCase(), options);
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        // Update speech handler
        if (this.speechHandler) {
            this.speechHandler.setLanguage(lang);
        }
        
        // Update status text based on language
        this.setStatus('ready');
        
        console.log(`🌐 Language set to: ${lang}`);
    }

    // Локализованные статусы
    getStatusText(status) {
        const statusTexts = {
            'ready': {
                'ru': 'Готова',
                'uz': 'Tayyor',
                'en': 'Ready',
                'ja': '準備完了'
            },
            'listening': {
                'ru': 'Слушаю...',
                'uz': 'Tinglayapman...',
                'en': 'Listening...',
                'ja': '聞いています...'
            },
            'thinking': {
                'ru': 'Думаю...',
                'uz': 'O\'ylayapman...',
                'en': 'Thinking...',
                'ja': '考えています...'
            },
            'speaking': {
                'ru': 'Говорю...',
                'uz': 'Gaplashyapman...',
                'en': 'Speaking...',
                'ja': '話しています...'
            },
            'error': {
                'ru': 'Ошибка',
                'uz': 'Xatolik',
                'en': 'Error',
                'ja': 'エラー'
            }
        };
        
        return statusTexts[status]?.[this.currentLanguage] || statusTexts[status]?.['en'] || status;
    }

    toggleListening() {
        const micBtn = document.getElementById('mic-button');
        
        if (this.isListening) {
            this.isListening = false;
            micBtn.classList.remove('recording');
            this.speechHandler?.stopListening();
            this.setStatus('ready');
        } else {
            this.isListening = true;
            micBtn.classList.add('recording');
            this.setStatus('listening');
            
            this.speechHandler?.startListening((text) => {
                this.handleSpeechInput(text);
            });
        }
    }

    handleSpeechInput(text) {
        console.log('🎤 Speech input:', text);
        document.getElementById('text-input').value = text;
        this.sendMessage();
        this.toggleListening();
    }

    // Добавьте эти методы в класс LEIAApp

showImage(imageUrl) {
    const container = document.getElementById('image-display');
    const img = document.getElementById('display-image');
    
    if (! container || !img) return;
    
    img.src = imageUrl;
    container.classList.remove('hidden', 'hiding');
    
    console.log('🖼️ Showing image:', imageUrl);
}

hideImage() {
    const container = document.getElementById('image-display');
    if (!container) return;
    
    container.classList.add('hiding');
    
    setTimeout(() => {
        container.classList.add('hidden');
        container.classList.remove('hiding');
    }, 300);
    
    console.log('🖼️ Image hidden');
}

    async sendMessage() {
        const input = document.getElementById('text-input');
        const message = input.value.trim();
        
        if (! message || this.isBusy) return;
        
        this.isBusy = true;
        
        // Clear input
        input.value = '';
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        
        // Show thinking animation
        if (this.animationController) {
            this.animationController.playAnimation('thinking');
        }
        if (this.emotionController) {
            this.emotionController.setEmotion('thinking');
        }
        this.setStatus('thinking');
        
        try {
            // Send to API
            const response = await this.chat(message);
            
            // Сначала выйти из thinking
            if (this.animationController && this.animationController.currentState === 'thinking') {
                await this.animationController.stopThinking();
            }
            
            // Update emotion
            if (this.emotionController) {
                this.emotionController.setEmotion(response.emotion);
            }
            
            // Play response animation
            if (this.animationController) {
                this.animationController.playAnimation(response.animation);
            }
            
            // Add assistant response
            this.addChatMessage(response.response, 'assistant');
            this.showSubtitles(response.response);

            //  Показать изображение если есть
            if (response.image) {
                this.showImage(response.image);
                setTimeout(() => this.hideImage(), 10000);
            }       
            
            // Speak response and WAIT for it to finish
            this.setStatus('speaking');
            if (this.speechHandler) {
                await this.speechHandler.speak(response.response);
            }
            
            //  ВАЖНО: После завершения речи - вернуть в idle
            if (this.animationController) {
                await this.animationController.returnToIdle();
            }
            
            this.setStatus('ready');
            
        } catch (error) {
            console.error('Chat error:', error);
            
            // Вернуть в idle при ошибке
            if (this.animationController) {
                this.animationController.resetPose();
            }
            
            const errorMessages = {
                'ru': 'Извините, произошла ошибка.Попробуйте позже.',
                'uz': 'Kechirasiz, xatolik yuz berdi.Keyinroq urinib ko\'ring.',
                'en': 'Sorry, an error occurred.Please try again later.',
                'ja': '申し訳ありませんが、エラーが発生しました。後でもう一度お試しください。'
            };
            
            this.addChatMessage(errorMessages[this.currentLanguage] || errorMessages['en'], 'assistant');
            this.setStatus('error');
            
            // Через 2 секунды вернуть статус
            setTimeout(() => this.setStatus('ready'), 2000);
        }
        
        this.isBusy = false;
    }

    async chat(message) {
        const response = await fetch(`${this.apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                language: this.currentLanguage
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        return await response.json();
    }

    addChatMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        messageEl.textContent = text;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Ограничить количество сообщений (держать только последние 10)
        while (messagesContainer.children.length > 10) {
            messagesContainer.removeChild(messagesContainer.firstChild);
        }
    }

    showSubtitles(text) {
        const subtitles = document.getElementById('subtitles');
        subtitles.textContent = text;
        subtitles.classList.add('visible');
        
        // Hide after text is spoken (roughly 100ms per character + 2 sec)
        const duration = Math.max(3000, text.length * 80 + 2000);
        setTimeout(() => {
            subtitles.classList.remove('visible');
        }, duration);
    }

    setStatus(status) {
        document.getElementById('status-text').textContent = this.getStatusText(status);
        
        // Изменить цвет точки в зависимости от статуса
        const dot = document.getElementById('status-dot');
        if (dot) {
            dot.style.background = status === 'error' ? '#ef4444' : 
                                   status === 'thinking' ? '#f59e0b' : 
                                   status === 'speaking' ? '#8b5cf6' :
                                   status === 'listening' ? '#3b82f6' : '#22c55e';
        }
    }

    // ✅ Сделали async
    async onUserDetected() {
        // Не прерывать если уже занята
        if (this.isBusy) return;
        
        this.isBusy = true;
        console.log('👋 User detected!');
        
        // Play greeting animation
        if (this.animationController) {
            this.animationController.playAnimation('wave');
        }
        if (this.emotionController) {
            this.emotionController.setEmotion('happy');
        }
        
        // Show greeting
        const greetings = {
            'ru': 'Привет!  Я ЛЕЯ, чем могу помочь?',
            'uz': 'Salom! Men LEIA, sizga qanday yordam bera olaman?',
            'en': 'Hello! I\'m LEIA, how can I help you? ',
            'ja': 'こんにちは！LEIAです、何かお手伝いしましょうか？'
        };
        
        this.showSubtitles(greetings[this.currentLanguage]);
        
        // ✅ Ждём завершения речи
        if (this.speechHandler) {
            await this.speechHandler.speak(greetings[this.currentLanguage]);
        }
        
        // ✅ После приветствия - вернуть в idle
        if (this.animationController) {
            await this.animationController.returnToIdle();
        }
        
        this.isBusy = false;
    }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
    window.leiaApp = new LEIAApp();
});