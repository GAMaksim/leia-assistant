import { VRMLoader } from './vrm-loader.js';
import { AnimationController } from './animation-controller.js';
import { EmotionController } from './emotion-controller.js';
import { SpeechHandler } from './speech-handler.js';
import { PresenceDetector } from './presence-detector.js';

class LEIEApp {
    constructor() {
        this.apiUrl = 'http://localhost:8000';
        this.currentLanguage = 'ru';
        this.isListening = false;
        
        // Controllers (will be initialized after VRM loads)
        this.vrmLoader = null;
        this.animationController = null;
        this.emotionController = null;
        this.speechHandler = null;
        this.presenceDetector = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing LEIA App.. .');
        
        // Update datetime
        this.updateDateTime();
        setInterval(() => this. updateDateTime(), 1000);
        
        // Setup event listeners
        this. setupEventListeners();
        
        // Initialize VRM
        await this.initVRM();
        
        // Initialize speech handler
        this.speechHandler = new SpeechHandler(this.currentLanguage);
        
        // Initialize presence detector
        this.presenceDetector = new PresenceDetector((detected) => {
            if (detected) {
                this. onUserDetected();
            }
        });
        
        console.log('✅ LEIA App initialized! ');
        this.setStatus('Готов к общению');
    }

    async initVRM() {
        try {
            this.vrmLoader = new VRMLoader('avatar-container');
            await this.vrmLoader.init();
            
            // Try to load VRM model
            try {
                await this.vrmLoader. loadModel('models/leia.vrm');
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
            btn.addEventListener('click', () => this.setLanguage(btn. dataset.lang));
        });
        
        // Mic button
        document. getElementById('mic-button').addEventListener('click', () => {
            this.toggleListening();
        });
        
        // Send button
        document.getElementById('send-button').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Text input enter
        document.getElementById('text-input'). addEventListener('keypress', (e) => {
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
        document.getElementById('datetime'). textContent = now.toLocaleDateString('ru-RU', options);
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn. dataset.lang === lang);
        });
        
        // Update speech handler
        if (this.speechHandler) {
            this.speechHandler.setLanguage(lang);
        }
        
        console.log(`🌐 Language set to: ${lang}`);
    }

    toggleListening() {
        const micBtn = document.getElementById('mic-button');
        
        if (this. isListening) {
            this.isListening = false;
            micBtn. classList.remove('recording');
            this.speechHandler?. stopListening();
            this.setStatus('Готов к общению');
        } else {
            this.isListening = true;
            micBtn.classList.add('recording');
            this.setStatus('Слушаю.. .');
            
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

    async sendMessage() {
        const input = document.getElementById('text-input');
        const message = input.value.trim();
        
        if (! message) return;
        
        // Clear input
        input. value = '';
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        
        // Show thinking animation
        if (this.animationController) {
            this.animationController.playAnimation('thinking');
        }
        if (this.emotionController) {
            this.emotionController.setEmotion('thinking');
        }
        this.setStatus('Думаю...');
        
        try {
            // Send to API
            const response = await this.chat(message);
            
            // Update emotion and animation
            if (this. emotionController) {
                this.emotionController.setEmotion(response.emotion);
            }
            if (this.animationController) {
                this.animationController.playAnimation(response. animation);
            }
            
            // Add assistant response
            this. addChatMessage(response.response, 'assistant');
            this.showSubtitles(response.response);
            
            // Speak response
            if (this.speechHandler) {
                this. speechHandler.speak(response.response);
            }
            
            this.setStatus('Готов к общению');
            
        } catch (error) {
            console.error('Chat error:', error);
            this.addChatMessage('Извините, произошла ошибка.  Попробуйте позже.', 'assistant');
            this. setStatus('Ошибка соединения');
        }
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
        
        if (! response.ok) {
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
    }

    showSubtitles(text) {
        const subtitles = document.getElementById('subtitles');
        subtitles.textContent = text;
        subtitles.classList.add('visible');
        
        // Hide after 5 seconds
        setTimeout(() => {
            subtitles.classList.remove('visible');
        }, 5000);
    }

    setStatus(status) {
        document.getElementById('status-text').textContent = status;
    }

    onUserDetected() {
        console.log('👋 User detected!');
        
        // Play greeting animation
        if (this.animationController) {
            this.animationController. playAnimation('wave');
        }
        if (this.emotionController) {
            this.emotionController.setEmotion('happy');
        }
        
        // Show greeting
        const greetings = {
            'ru': 'Привет! Я LEIA, чем могу помочь? ',
            'uz': 'Salom! Men LEIA, sizga qanday yordam bera olaman?',
            'en': 'Hello! I\'m LEIA, how can I help you? ',
            'ja': 'こんにちは！LEIAです、何かお手伝いしましょうか？'
        };
        
        this.showSubtitles(greetings[this.currentLanguage]);
        
        if (this.speechHandler) {
            this.speechHandler.speak(greetings[this.currentLanguage]);
        }
    }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
    window.leieApp = new LEIEApp();
});