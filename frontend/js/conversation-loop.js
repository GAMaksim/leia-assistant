/**
 * ConversationLoop - Непрерывный голосовой диалог
 * STT → AI → TTS → STT (цикл)
 */

class ConversationLoop {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.isPaused = false;
        
        // Настройки
        this.config = {
            silenceTimeout: 3000,      // 3 сек тишины = конец фразы
            maxListenTime: 15000,      // Максимум 15 сек слушания
            pauseBetweenTurns: 500,    // Пауза между репликами
            stopWords: ['стоп', 'хватит', 'пока', 'stop', 'bye', 'goodbye', 'to\'xta', 'やめて', 'ストップ']
        };
        
        // Таймеры
        this.silenceTimer = null;
        this.maxListenTimer = null;
        
        // Состояния
        this.state = 'idle';  // idle, listening, thinking, speaking
        
        // Speech Recognition
        this.recognition = null;
        this.initRecognition();
        
        console.log('🎤 ConversationLoop initialized');
    }
    
    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.getLanguageCode();
        
        // Обработчики
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
    }
    
    getLanguageCode() {
        const langMap = {
            'ru': 'ru-RU',
            'uz': 'uz-UZ',
            'en': 'en-US',
            'ja': 'ja-JP'
        };
        return langMap[this.app.currentLanguage] || 'ru-RU';
    }
    
    // ============================================
    // УПРАВЛЕНИЕ ЦИКЛОМ
    // ============================================
    
    async start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.state = 'idle';
        
        console.log('🎤 Conversation loop STARTED');
        this.updateUI('active');
        
        // Приветствие
        await this.speak(this.getGreeting());
        
        // Начать слушать
        this.startListening();
    }
    
    stop() {
        this.isActive = false;
        this.state = 'idle';
        
        this.stopListening();
        this.clearTimers();
        
        console.log('🎤 Conversation loop STOPPED');
        this.updateUI('inactive');
        
        // Прощание
        this.speak(this.getFarewell());
    }
    
    pause() {
        this.isPaused = true;
        this.stopListening();
    }
    
    resume() {
        this.isPaused = false;
        if (this.isActive && this.state === 'idle') {
            this.startListening();
        }
    }
    
    // ============================================
    // СЛУШАНИЕ
    // ============================================
    
    startListening() {
        if (! this.recognition || !this.isActive || this.isPaused) return;
        
        this.state = 'listening';
        this.recognition.lang = this.getLanguageCode();
        
        try {
            this.recognition.start();
            console.log('👂 Listening...');
            this.updateUI('listening');
            
            // Таймер максимального времени слушания
            this.maxListenTimer = setTimeout(() => {
                console.log('⏱️ Max listen time reached');
                this.stopListening();
                this.startListening(); // Перезапустить
            }, this.config.maxListenTime);
            
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }
    
    stopListening() {
        this.clearTimers();
        
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
    }
    
    onRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Показать промежуточный результат
        if (interimTranscript) {
            this.showInterimText(interimTranscript);
            this.resetSilenceTimer();
        }
        
        // Финальный результат
        if (finalTranscript) {
            console.log('🎤 Heard:', finalTranscript);
            this.processUserInput(finalTranscript.trim());
        }
    }
    
    onRecognitionError(event) {
        console.error('Recognition error:', event.error);
        
        if (event.error === 'no-speech') {
            // Тишина - это нормально, перезапустить
            if (this.isActive) {
                setTimeout(() => this.startListening(), 500);
            }
        }
    }
    
    onRecognitionEnd() {
        // Если цикл активен и мы должны слушать - перезапустить
        if (this.isActive && this.state === 'listening' && ! this.isPaused) {
            setTimeout(() => this.startListening(), 300);
        }
    }
    
    resetSilenceTimer() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        
        this.silenceTimer = setTimeout(() => {
            // Тишина - возможно пользователь закончил говорить
            console.log('🔇 Silence detected');
        }, this.config.silenceTimeout);
    }
    
    clearTimers() {
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        if (this.maxListenTimer) clearTimeout(this.maxListenTimer);
    }
    
    // ============================================
    // ОБРАБОТКА ВВОДА
    // ============================================
    
    async processUserInput(text) {
        if (!text || ! this.isActive) return;
        
        // Проверить стоп-слова
        const textLower = text.toLowerCase();
        if (this.config.stopWords.some(word => textLower.includes(word))) {
            this.stop();
            return;
        }
        
        // Остановить слушание
        this.stopListening();
        this.state = 'thinking';
        this.updateUI('thinking');
        
        // Добавить сообщение пользователя в чат
        this.app.addChatMessage(text, 'user');
        
        // Анимация "думает"
        if (this.app.animationController) {
            this.app.animationController.playAnimation('thinking');
        }
        if (this.app.emotionController) {
            this.app.emotionController.setEmotion('thinking');
        }
        
        try {
            // Получить ответ от AI
            const response = await this.app.chat(text);
            
            // Выйти из "думает"
            if (this.app.animationController?.currentState === 'thinking') {
                await this.app.animationController.stopThinking();
            }
            
            // Эмоция и анимация
            if (this.app.emotionController) {
                this.app.emotionController.setEmotion(response.emotion);
            }
            if (this.app.animationController) {
                this.app.animationController.playAnimation(response.animation);
            }
            
            // Добавить ответ в чат
            this.app.addChatMessage(response.response, 'assistant');
            this.app.showSubtitles(response.response);
            
            // Показать изображение если есть
            if (response.image) {
                this.app.showImage(response.image);
                setTimeout(() => this.app.hideImage(), 10000);
            }
            
            // Произнести ответ
            this.state = 'speaking';
            this.updateUI('speaking');
            await this.speak(response.response);
            
            // Вернуть в idle
            if (this.app.animationController) {
                await this.app.animationController.returnToIdle();
            }
            
        } catch (error) {
            console.error('Conversation error:', error);
            await this.speak(this.getErrorMessage());
        }
        
        // Продолжить слушать
        if (this.isActive) {
            this.state = 'idle';
            setTimeout(() => {
                this.startListening();
            }, this.config.pauseBetweenTurns);
        }
    }
    
    // ============================================
    // СИНТЕЗ РЕЧИ
    // ============================================
    
    speak(text) {
        return new Promise((resolve) => {
            if (!text) {
                resolve();
                return;
            }
            
            const synthesis = window.speechSynthesis;
            synthesis.cancel(); // Остановить предыдущее
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getLanguageCode();
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            
            // Lip sync
            utterance.onstart = () => {
                if (this.app.emotionController) {
                    this.app.emotionController.startLipSync();
                }
            };
            
            utterance.onend = () => {
                if (this.app.emotionController) {
                    this.app.emotionController.stopLipSync();
                }
                resolve();
            };
            
            utterance.onerror = () => {
                resolve();
            };
            
            synthesis.speak(utterance);
        });
    }
    
    // ============================================
    // UI
    // ============================================
    
    updateUI(state) {
        const btn = document.getElementById('conversation-btn');
        const statusText = document.getElementById('status-text');
        
        if (btn) {
            btn.classList.remove('active', 'listening', 'thinking', 'speaking');
            if (state !== 'inactive') {
                btn.classList.add(state);
            }
        }
        
        const statusMap = {
            'active': { ru: 'Диалог активен', en: 'Dialog active', uz: 'Dialog faol', ja: '対話中' },
            'listening':  { ru: 'Слушаю...', en: 'Listening...', uz: 'Tinglayapman...', ja: '聞いています...' },
            'thinking': { ru:  'Думаю...', en: 'Thinking...', uz: "O'ylayapman...", ja: '考えています...' },
            'speaking': { ru:  'Говорю...', en: 'Speaking...', uz: 'Gaplashyapman...', ja: '話しています...' },
            'inactive':  { ru: 'Готова', en: 'Ready', uz: 'Tayyor', ja: '準備完了' }
        };
        
        if (statusText && statusMap[state]) {
            statusText.textContent = statusMap[state][this.app.currentLanguage] || statusMap[state]['en'];
        }
    }
    
    showInterimText(text) {
        const subtitles = document.getElementById('subtitles');
        if (subtitles) {
            subtitles.textContent = '🎤 ' + text;
            subtitles.classList.add('visible', 'interim');
        }
    }
    
    // ============================================
    // ЛОКАЛИЗОВАННЫЕ ФРАЗЫ
    // ============================================
    
    getGreeting() {
        const greetings = {
            'ru':  'Привет!  Я слушаю тебя. Говори! ',
            'en': "Hi! I'm listening. Go ahead!",
            'uz': 'Salom! Sizni tinglayapman. Gapiring!',
            'ja': 'こんにちは！聞いていますよ。どうぞ！'
        };
        return greetings[this.app.currentLanguage] || greetings['en'];
    }
    
    getFarewell() {
        const farewells = {
            'ru': 'Пока!  Обращайся, если нужна помощь! ',
            'en': 'Bye! Let me know if you need help!',
            'uz': "Xayr! Yordam kerak bo'lsa, murojaat qiling! ",
            'ja': 'さようなら！また何かあれば声をかけてね！'
        };
        return farewells[this.app.currentLanguage] || farewells['en'];
    }
    
    getErrorMessage() {
        const errors = {
            'ru': 'Извини, произошла ошибка. Попробуй ещё раз.',
            'en':  'Sorry, an error occurred. Please try again.',
            'uz': 'Kechirasiz, xatolik yuz berdi. Qaytadan urinib ko\'ring.',
            'ja': 'すみません、エラーが発生しました。もう一度お試しください。'
        };
        return errors[this.app.currentLanguage] || errors['en'];
    }
    
    // ============================================
    // ОЧИСТКА
    // ============================================
    
    destroy() {
        this.stop();
        if (this.recognition) {
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
        }
    }
}

export { ConversationLoop };