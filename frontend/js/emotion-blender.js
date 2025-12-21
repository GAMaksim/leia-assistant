/**
 * EmotionBlender - Плавные переходы между эмоциями
 * Вместо резкой смены - плавное смешивание
 */

class EmotionBlender {
    constructor(vrm) {
        this.vrm = vrm;
        
        // Текущие значения эмоций (0-1)
        this.currentEmotions = {
            neutral: 1,
            happy:  0,
            sad: 0,
            surprised: 0,
            angry: 0,
            thinking: 0
        };
        
        // Целевые значения
        this.targetEmotions = { ...this.currentEmotions };
        
        // Настройки
        this.transitionSpeed = 0.08;  // Скорость перехода (0-1)
        this.isBlending = false;
        
        // Запустить update loop
        this.startUpdateLoop();
        
        console.log('😊 EmotionBlender initialized');
    }
    
    // ============================================
    // ОСНОВНЫЕ МЕТОДЫ
    // ============================================
    
    /**
     * Плавно перейти к эмоции
     * @param {string} emotion - Название эмоции
     * @param {number} intensity - Интенсивность (0-1)
     */
    blendTo(emotion, intensity = 1.0) {
        // Сбросить все целевые эмоции
        Object.keys(this.targetEmotions).forEach(e => {
            this.targetEmotions[e] = 0;
        });
        
        // Установить целевую эмоцию
        if (this.targetEmotions.hasOwnProperty(emotion)) {
            this.targetEmotions[emotion] = Math.max(0, Math.min(1, intensity));
        } else {
            // Маппинг нестандартных эмоций
            const emotionMap = {
                'greeting': 'happy',
                'farewell': 'neutral',
                'excited': 'happy',
                'grateful': 'happy',
                'agreeing': 'happy',
                'thinking': 'neutral'
            };
            
            const mappedEmotion = emotionMap[emotion] || 'neutral';
            this.targetEmotions[mappedEmotion] = intensity;
        }
        
        this.isBlending = true;
        console.log(`😊 Blending to:  ${emotion} (${intensity})`);
    }
    
    /**
     * Смешать несколько эмоций
     * @param {Object} emotions - { happy: 0.6, surprised: 0.4 }
     */
    blendMultiple(emotions) {
        // Сбросить все
        Object.keys(this.targetEmotions).forEach(e => {
            this.targetEmotions[e] = 0;
        });
        
        // Установить переданные
        Object.entries(emotions).forEach(([emotion, value]) => {
            if (this.targetEmotions.hasOwnProperty(emotion)) {
                this.targetEmotions[emotion] = Math.max(0, Math.min(1, value));
            }
        });
        
        this.isBlending = true;
        console.log('😊 Blending multiple:', emotions);
    }
    
    /**
     * Мгновенно установить эмоцию (без перехода)
     */
    setImmediate(emotion, intensity = 1.0) {
        Object.keys(this.currentEmotions).forEach(e => {
            this.currentEmotions[e] = 0;
            this.targetEmotions[e] = 0;
        });
        
        if (this.currentEmotions.hasOwnProperty(emotion)) {
            this.currentEmotions[emotion] = intensity;
            this.targetEmotions[emotion] = intensity;
        }
        
        this.applyEmotions();
    }
    
    /**
     * Сбросить к нейтральному
     */
    reset() {
        this.blendTo('neutral', 1);
    }
    
    // ============================================
    // UPDATE LOOP
    // ============================================
    
    startUpdateLoop() {
        const update = () => {
            this.update();
            requestAnimationFrame(update);
        };
        update();
    }
    
    update() {
        if (! this.isBlending) return;
        
        let stillBlending = false;
        
        // Интерполировать каждую эмоцию к целевому значению
        Object.keys(this.currentEmotions).forEach(emotion => {
            const current = this.currentEmotions[emotion];
            const target = this.targetEmotions[emotion];
            const diff = target - current;
            
            if (Math.abs(diff) > 0.01) {
                this.currentEmotions[emotion] += diff * this.transitionSpeed;
                stillBlending = true;
            } else {
                this.currentEmotions[emotion] = target;
            }
        });
        
        this.isBlending = stillBlending;
        this.applyEmotions();
    }
    
    applyEmotions() {
        if (!this.vrm?.expressionManager) return;
        
        Object.entries(this.currentEmotions).forEach(([emotion, value]) => {
            try {
                // VRM expression names
                const expressionName = this.getExpressionName(emotion);
                if (expressionName) {
                    this.vrm.expressionManager.setValue(expressionName, value);
                }
            } catch (e) {
                // Игнорировать если expression не существует
            }
        });
    }
    
    getExpressionName(emotion) {
        // Маппинг на VRM expressions
        const map = {
            'neutral': 'neutral',
            'happy':  'happy',
            'sad': 'sad',
            'surprised': 'surprised',
            'angry': 'angry',
            'thinking': 'neutral'  // Thinking через neutral + анимацию
        };
        return map[emotion];
    }
    
    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    /**
     * Получить текущую доминирующую эмоцию
     */
    getCurrentEmotion() {
        let maxEmotion = 'neutral';
        let maxValue = 0;
        
        Object.entries(this.currentEmotions).forEach(([emotion, value]) => {
            if (value > maxValue) {
                maxValue = value;
                maxEmotion = emotion;
            }
        });
        
        return maxEmotion;
    }
    
    /**
     * Установить скорость перехода
     * @param {number} speed - 0.01 (медленно) до 0.5 (быстро)
     */
    setTransitionSpeed(speed) {
        this.transitionSpeed = Math.max(0.01, Math.min(0.5, speed));
    }
}

export { EmotionBlender };