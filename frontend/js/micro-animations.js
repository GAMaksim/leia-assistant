/**
 * MicroAnimations - Случайные мелкие движения для "живости"
 * Делает модель живой даже когда она ничего не делает
 */

class MicroAnimations {
    constructor(vrm, animationController) {
        this.vrm = vrm;
        this.animationController = animationController;
        this.enabled = true;
        
        // Таймеры
        this.gestureTimer = null;
        this.breathingTimer = null;
        
        // Настройки
        this.config = {
            gestureInterval: { min: 8000, max: 20000 },  // 8-20 секунд между жестами
            breathingSpeed: 0.003,
        };
        
        // Флаг что основная анимация играет
        this.isMainAnimationPlaying = false;
        
        this.init();
    }
    
    init() {
        this.startRandomGestures();
        this.startSubtleBreathing();
        this.startEyeMovements();
        
        console.log('🎭 MicroAnimations initialized');
    }
    
    // ============================================
    // СЛУЧАЙНЫЕ МИНИ-ЖЕСТЫ
    // ============================================
    
    startRandomGestures() {
        const gestures = [
            () => this.tiltHead(),
            () => this.shiftWeight(),
            () => this.smallNod(),
            () => this.lookAround(),
            () => this.shoulderRoll(),
            () => this.headTurn(),
        ];
        
        const doRandomGesture = () => {
            // Не делать жесты если играет основная анимация
            if (! this.enabled || this.isMainAnimationPlaying) {
                this.scheduleNextGesture(doRandomGesture);
                return;
            }
            
            // Проверить что модель в idle
            if (this.animationController?.currentState !== 'idle') {
                this.scheduleNextGesture(doRandomGesture);
                return;
            }
            
            // Выбрать случайный жест
            const gesture = gestures[Math.floor(Math.random() * gestures.length)];
            gesture();
            
            this.scheduleNextGesture(doRandomGesture);
        };
        
        // Первый жест через 5 секунд
        setTimeout(doRandomGesture, 5000);
    }
    
    scheduleNextGesture(callback) {
        const delay = this.config.gestureInterval.min + 
            Math.random() * (this.config.gestureInterval.max - this.config.gestureInterval.min);
        this.gestureTimer = setTimeout(callback, delay);
    }
    
    // ============================================
    // ИНДИВИДУАЛЬНЫЕ ЖЕСТЫ
    // ============================================
    
    // Наклон головы в сторону
    tiltHead() {
        const head = this.vrm?.humanoid?.getNormalizedBoneNode('head');
        if (! head) return;
        
        const direction = Math.random() > 0.5 ?  1 : -1;
        const tilt = 0.05 + Math.random() * 0.08;
        
        gsap.to(head.rotation, {
            z: tilt * direction,
            duration: 0.6,
            ease:  "power2.out",
            onComplete:  () => {
                // Вернуть обратно
                gsap.to(head.rotation, {
                    z: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    delay: 1 + Math.random()
                });
            }
        });
        
        console.log('🎭 Micro:  tiltHead');
    }
    
    // Перенос веса с ноги на ногу
    shiftWeight() {
        const hips = this.vrm?.humanoid?.getNormalizedBoneNode('hips');
        const spine = this.vrm?.humanoid?.getNormalizedBoneNode('spine');
        if (!hips) return;
        
        const direction = Math.random() > 0.5 ? 1 : -1;
        const shift = 0.02 + Math.random() * 0.02;
        
        gsap.to(hips.position, {
            x: `+=${shift * direction}`,
            duration: 1.2,
            ease:  "power1.inOut",
            onComplete: () => {
                gsap.to(hips.position, {
                    x:  `-=${shift * direction}`,
                    duration: 1.2,
                    ease: "power1.inOut"
                });
            }
        });
        
        if (spine) {
            gsap.to(spine.rotation, {
                z: 0.02 * direction,
                duration: 1.2,
                ease:  "power1.inOut",
                onComplete: () => {
                    gsap.to(spine.rotation, {
                        z: 0,
                        duration: 1.2,
                        ease: "power1.inOut"
                    });
                }
            });
        }
        
        console.log('🎭 Micro: shiftWeight');
    }
    
    // Маленький кивок
    smallNod() {
        const head = this.vrm?.humanoid?.getNormalizedBoneNode('head');
        if (!head) return;
        
        gsap.to(head.rotation, {
            x: 0.08,
            duration:  0.3,
            ease: "power2.out",
            onComplete:  () => {
                gsap.to(head.rotation, {
                    x:  0,
                    duration: 0.4,
                    ease: "power2.inOut"
                });
            }
        });
        
        console.log('🎭 Micro: smallNod');
    }
    
    // Посмотреть в сторону
    lookAround() {
        const head = this.vrm?.humanoid?.getNormalizedBoneNode('head');
        const neck = this.vrm?.humanoid?.getNormalizedBoneNode('neck');
        if (!head) return;
        
        const direction = Math.random() > 0.5 ?  1 : -1;
        const turn = 0.15 + Math.random() * 0.15;
        
        // Голова поворачивается
        gsap.to(head.rotation, {
            y: turn * direction,
            duration: 0.8,
            ease: "power2.out"
        });
        
        // Шея немного следует
        if (neck) {
            gsap.to(neck.rotation, {
                y:  turn * 0.3 * direction,
                duration: 0.8,
                ease: "power2.out"
            });
        }
        
        // Вернуться через 1-2 секунды
        setTimeout(() => {
            gsap.to(head.rotation, {
                y: 0,
                duration: 0.8,
                ease: "power2.inOut"
            });
            if (neck) {
                gsap.to(neck.rotation, {
                    y: 0,
                    duration: 0.8,
                    ease: "power2.inOut"
                });
            }
        }, 1000 + Math.random() * 1000);
        
        console.log('🎭 Micro:  lookAround');
    }
    
    // Движение плечами
    shoulderRoll() {
        const leftShoulder = this.vrm?.humanoid?.getNormalizedBoneNode('leftShoulder');
        const rightShoulder = this.vrm?.humanoid?.getNormalizedBoneNode('rightShoulder');
        
        if (!leftShoulder && !rightShoulder) return;
        
        const shoulder = Math.random() > 0.5 ?  leftShoulder : rightShoulder;
        if (!shoulder) return;
        
        gsap.to(shoulder.rotation, {
            z: 0.1,
            duration:  0.4,
            ease:  "power2.out",
            onComplete:  () => {
                gsap.to(shoulder.rotation, {
                    z:  0,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            }
        });
        
        console.log('🎭 Micro: shoulderRoll');
    }
    
    // Поворот головы
    headTurn() {
        const head = this.vrm?.humanoid?.getNormalizedBoneNode('head');
        if (!head) return;
        
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        gsap.to(head.rotation, {
            y:  0.2 * direction,
            z: 0.05 * direction,
            duration: 0.7,
            ease:  "power2.out",
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(head.rotation, {
                        y: 0,
                        z: 0,
                        duration: 0.7,
                        ease: "power2.inOut"
                    });
                }, 800 + Math.random() * 500);
            }
        });
        
        console.log('🎭 Micro: headTurn');
    }
    
    // ============================================
    // ДЫХАНИЕ (более выраженное)
    // ============================================
    
    startSubtleBreathing() {
        const chest = this.vrm?.humanoid?.getNormalizedBoneNode('chest');
        const spine = this.vrm?.humanoid?.getNormalizedBoneNode('spine');
        
        if (!chest && !spine) return;
        
        // Плавное дыхание через GSAP
        const breathe = () => {
            if (! this.enabled) return;
            
            if (chest) {
                gsap.to(chest.rotation, {
                    x: -0.02,
                    duration: 2,
                    ease: "sine.inOut",
                    onComplete: () => {
                        gsap.to(chest.rotation, {
                            x: 0.02,
                            duration: 2,
                            ease:  "sine.inOut",
                            onComplete: breathe
                        });
                    }
                });
            }
        };
        
        breathe();
    }
    
    // ============================================
    // ДВИЖЕНИЯ ГЛАЗ
    // ============================================
    
    startEyeMovements() {
        const moveEyes = () => {
            if (!this.enabled) {
                setTimeout(moveEyes, 3000);
                return;
            }
            
            // VRM expressionManager для глаз
            if (this.vrm?.expressionManager) {
                // Случайное направление взгляда
                const lookLeft = Math.random() * 0.3;
                const lookRight = Math.random() * 0.3;
                const lookUp = Math.random() * 0.2;
                const lookDown = Math.random() * 0.2;
                
                // Выбрать одно направление
                const direction = Math.floor(Math.random() * 4);
                
                try {
                    // Сбросить все
                    this.vrm.expressionManager.setValue('lookLeft', 0);
                    this.vrm.expressionManager.setValue('lookRight', 0);
                    this.vrm.expressionManager.setValue('lookUp', 0);
                    this.vrm.expressionManager.setValue('lookDown', 0);
                    
                    // Применить одно
                    switch(direction) {
                        case 0: this.vrm.expressionManager.setValue('lookLeft', lookLeft); break;
                        case 1: this.vrm.expressionManager.setValue('lookRight', lookRight); break;
                        case 2: this.vrm.expressionManager.setValue('lookUp', lookUp); break;
                        case 3: this.vrm.expressionManager.setValue('lookDown', lookDown); break;
                    }
                    
                    // Вернуть в центр через 1-2 сек
                    setTimeout(() => {
                        if (this.vrm?.expressionManager) {
                            this.vrm.expressionManager.setValue('lookLeft', 0);
                            this.vrm.expressionManager.setValue('lookRight', 0);
                            this.vrm.expressionManager.setValue('lookUp', 0);
                            this.vrm.expressionManager.setValue('lookDown', 0);
                        }
                    }, 1000 + Math.random() * 1000);
                    
                } catch (e) {
                    // Модель может не поддерживать эти expressions
                }
            }
            
            // Следующее движение через 3-6 секунд
            setTimeout(moveEyes, 3000 + Math.random() * 3000);
        };
        
        // Начать через 2 секунды
        setTimeout(moveEyes, 2000);
    }
    
    // ============================================
    // УПРАВЛЕНИЕ
    // ============================================
    
    // Вызывать когда начинается основная анимация
    pauseForAnimation() {
        this.isMainAnimationPlaying = true;
    }
    
    // Вызывать когда основная анимация закончилась
    resumeAfterAnimation() {
        this.isMainAnimationPlaying = false;
    }
    
    disable() {
        this.enabled = false;
    }
    
    enable() {
        this.enabled = true;
    }
    
    destroy() {
        if (this.gestureTimer) clearTimeout(this.gestureTimer);
        if (this.breathingTimer) clearTimeout(this.breathingTimer);
    }
}

export { MicroAnimations };