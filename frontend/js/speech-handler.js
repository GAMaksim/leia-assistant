export class SpeechHandler {
    constructor(language = 'ru') {
        this.language = language;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        
        this.languageMap = {
            'ru': 'ru-RU',
            'uz': 'uz-UZ',
            'en': 'en-US',
            'ja': 'ja-JP'
        };
        
        this.initRecognition();
    }

    initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.languageMap[this.language];
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = this.languageMap[lang];
        }
    }

    startListening(callback) {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return;
        }
        
        this.isListening = true;
        
        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            console.log('Recognized:', text);
            callback(text);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
        };
        
        try {
            this.recognition.start();
            console.log('🎤 Listening started...');
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            console.log('🎤 Listening stopped');
        }
    }

    speak(text) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.languageMap[this.language];
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for LEIA
        utterance.volume = 1.0;
        
        // Try to find a female voice
        const voices = this.synthesis.getVoices();
        const femaleVoice = voices.find(v => 
            v.lang.startsWith(this.languageMap[this.language].split('-')[0]) && 
            v.name.toLowerCase().includes('female')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
        
        utterance.onstart = () => {
            console.log('🔊 Speaking started');
            // Trigger lip sync in emotion controller if available
            if (window.leiaApp?.emotionController) {
                window.leiaApp.emotionController.startLipSync();
            }
        };
        
        utterance.onend = () => {
            console.log('🔊 Speaking ended');
            if (window.leiaApp?.emotionController) {
                window.leiaApp.emotionController.stopLipSync();
            }
        };
        
        this.synthesis.speak(utterance);
    }
}