export class EmotionController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentEmotion = 'neutral';
        
        this.emotions = {
            happy: {
                preset: 'happy',
                blendShapes: { 'happy': 1.0 }
            },
            sad: {
                preset: 'sad',
                blendShapes: { 'sad': 1.0 }
            },
            thinking: {
                preset: 'neutral',
                blendShapes: { 'neutral': 0.5 }
            },
            surprised: {
                preset: 'surprised',
                blendShapes: { 'surprised': 1.0 }
            },
            excited: {
                preset: 'happy',
                blendShapes: { 'happy': 1.0 }
            },
            neutral: {
                preset: 'neutral',
                blendShapes: { 'neutral': 1.0 }
            }
        };
        
        // Lip sync vowels
        this.vowels = ['a', 'i', 'u', 'e', 'o'];
        this.currentVowel = null;
        this.isSpeaking = false;
    }

    setEmotion(emotion) {
        if (!this.emotions[emotion]) {
            console.warn(`Emotion '${emotion}' not found`);
            return;
        }
        
        console.log(`😊 Setting emotion: ${emotion}`);
        this.currentEmotion = emotion;
        
        if (!this.vrm || !this.vrm.expressionManager) return;
        
        // Reset all expressions
        this.resetExpressions();
        
        // Apply new emotion
        const emotionConfig = this.emotions[emotion];
        
        try {
            // Try using preset
            this.vrm.expressionManager.setValue(emotionConfig.preset, 1.0);
        } catch (e) {
            // Fallback to blend shapes
            for (const [shapeName, value] of Object.entries(emotionConfig.blendShapes)) {
                try {
                    this.vrm.expressionManager.setValue(shapeName, value);
                } catch (err) {
                    // Ignore if blend shape doesn't exist
                }
            }
        }
    }

    resetExpressions() {
        if (!this.vrm || !this.vrm.expressionManager) return;
        
        const expressionNames = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
        expressionNames.forEach(name => {
            try {
                this.vrm.expressionManager.setValue(name, 0);
            } catch (e) {
                // Ignore
            }
        });
    }

    // Lip sync
    startLipSync() {
        this.isSpeaking = true;
        this.animateLipSync();
    }

    stopLipSync() {
        this.isSpeaking = false;
        this.setVowel(null);
    }

    animateLipSync() {
        if (!this.isSpeaking) return;
        
        // Random vowel for simple lip sync
        const vowel = this.vowels[Math.floor(Math.random() * this.vowels.length)];
        this.setVowel(vowel);
        
        setTimeout(() => {
            this.animateLipSync();
        }, 100 + Math.random() * 100);
    }

    setVowel(vowel) {
        if (!this.vrm || !this.vrm.expressionManager) return;
        
        // Reset all vowels
        this.vowels.forEach(v => {
            try {
                this.vrm.expressionManager.setValue(v, 0);
            } catch (e) {}
        });
        
        // Set current vowel
        if (vowel) {
            try {
                this.vrm.expressionManager.setValue(vowel, 0.8);
            } catch (e) {}
        }
    }

    // Blink animation
    startBlinking() {
        this.blink();
    }

    blink() {
        if (!this.vrm || !this.vrm.expressionManager) return;
        
        // Close eyes
        try {
            this.vrm.expressionManager.setValue('blink', 1);
        } catch (e) {}
        
        setTimeout(() => {
            try {
                this.vrm.expressionManager.setValue('blink', 0);
            } catch (e) {}
            
            // Next blink in 2-5 seconds
            setTimeout(() => this.blink(), 2000 + Math.random() * 3000);
        }, 150);
    }
}