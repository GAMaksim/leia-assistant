export class AnimationController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentState = 'idle';
        this.isAnimating = false;
        this.clock = 0;
        
        this.breathingEnabled = true;
        this.blinkingEnabled = true;
        this.idleMotionEnabled = true;
        
        // Флаг для предотвращения застревания blink
        this.isBlinking = false;
        
        this.idlePose = {
            rightUpperArm: { z: -1.2 },
            leftUpperArm: { z: 1.2 }
        };
        
        this.baseHipsY = null;
        this.baseHipsRotationX = 0;
        
        this.animations = {
            wave: this.waveAnimation.bind(this),
            bow: this.bowAnimation.bind(this),
            idle: this.idleAnimation.bind(this),
            thinking: this.thinkingAnimation.bind(this),
            pointing: this.pointingAnimation.bind(this),
            happy_jump: this.happyJumpAnimation.bind(this),
            standby: this.idleAnimation.bind(this),
            talking: this.talkingAnimation.bind(this),
            nod: this.nodAnimation.bind(this)
        };
        
        this.initBasePosition();
        this.startContinuousAnimations();
        this.playAnimation('idle');
    }

    initBasePosition() {
        const hips = this.getBone('hips');
        if (hips) {
            this.baseHipsY = hips.position.y;
            this.baseHipsRotationX = hips.rotation.x;
        }
    }

    getBone(name) {
        if (!this.vrm || !this.vrm.humanoid) return null;
        return this.vrm.humanoid.getNormalizedBoneNode(name);
    }

    startContinuousAnimations() {
        const animate = () => {
            this.clock += 0.016;
            
            if (this.breathingEnabled) {
                this.updateBreathing();
            }
            
            if (this.idleMotionEnabled && this.currentState === 'idle') {
                this.updateIdleMotion();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        this.scheduleNextBlink();
    }

    updateBreathing() {
        const chest = this.getBone('chest');
        const spine = this.getBone('spine');
        const breathAmount = Math.sin(this.clock * 1.2) * 0.012;
        const breathAmount2 = Math.sin(this.clock * 1.2 + 0.5) * 0.008;
        
        if (chest) chest.rotation.x = breathAmount;
        if (spine) spine.rotation.x = breathAmount2;
    }

    scheduleNextBlink() {
        const nextBlinkTime = 2000 + Math.random() * 4000;
        
        setTimeout(() => {
            if (this.blinkingEnabled) {
                this.blink();
            }
            this.scheduleNextBlink();
        }, nextBlinkTime);
    }

    // 👁️ ИСПРАВЛЕННОЕ моргание - без GSAP для blinkProgress
    async blink() {
        if (! this.vrm || !this.vrm.expressionManager) return;
        if (this.isBlinking) return; // Предотвратить двойное моргание
        
        this.isBlinking = true;
        
        try {
            // Закрыть глаза
            const closeEyes = () => {
                return new Promise((resolve) => {
                    let progress = 0;
                    const animate = () => {
                        progress += 0.15;
                        if (progress >= 1) {
                            this.vrm.expressionManager.setValue('blink', 1);
                            resolve();
                        } else {
                            this.vrm.expressionManager.setValue('blink', progress);
                            requestAnimationFrame(animate);
                        }
                    };
                    animate();
                });
            };
            
            // Открыть глаза
            const openEyes = () => {
                return new Promise((resolve) => {
                    let progress = 1;
                    const animate = () => {
                        progress -= 0.1;
                        if (progress <= 0) {
                            this.vrm.expressionManager.setValue('blink', 0);
                            resolve();
                        } else {
                            this.vrm.expressionManager.setValue('blink', progress);
                            requestAnimationFrame(animate);
                        }
                    };
                    animate();
                });
            };
            
            await closeEyes();
            await this.delay(50);
            await openEyes();
            
        } catch (e) {
            // Гарантированно открыть глаза при ошибке
            try {
                this.vrm.expressionManager.setValue('blink', 0);
            } catch (e2) {}
        }
        
        this.isBlinking = false;
    }

    // 🔄 Живое idle движение
    updateIdleMotion() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        const spine = this.getBone('spine');
        
        const headSwayY = Math.sin(this.clock * 0.4) * 0.025;
        const headSwayZ = Math.sin(this.clock * 0.25) * 0.015;
        const headSwayX = Math.sin(this.clock * 0.3) * 0.01;
        
        if (head) {
            head.rotation.y = headSwayY;
            head.rotation.z = headSwayZ;
            head.rotation.x = headSwayX;
        }
        
        if (neck) {
            neck.rotation.y = headSwayY * 0.4;
            neck.rotation.x = Math.sin(this.clock * 0.35) * 0.008;
        }
        
        if (spine) {
            spine.rotation.y = Math.sin(this.clock * 0.2) * 0.01;
        }
    }

    playAnimation(name) {
        if (!this.animations[name]) {
            console.warn(`Animation '${name}' not found`);
            return;
        }
        
        console.log(`🎬 Playing animation: ${name}`);
        this.currentState = name;
        this.animations[name]();
    }

    transitionTo(state) {
        this.currentState = state;
    }

    // 🔄 ИСПРАВЛЕННЫЙ сброс позы - гарантированный возврат в idle
    resetPose() {
        const bones = ['rightLowerArm', 'leftLowerArm', 
                       'rightHand', 'leftHand',
                       'spine', 'chest', 'neck', 'head'];
        
        bones.forEach(boneName => {
            const bone = this.getBone(boneName);
            if (bone) {
                gsap.killTweensOf(bone.rotation);
                gsap.killTweensOf(bone.position);
                gsap.to(bone.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
        
        // Отдельно обработать руки - вернуть в правильную позу
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        if (rightUpperArm) {
            gsap.killTweensOf(rightUpperArm.rotation);
            gsap.to(rightUpperArm.rotation, { 
                x: 0, y: 0, z: -1.2, 
                duration: 0.4, 
                ease: "power2.out" 
            });
        }
        if (leftUpperArm) {
            gsap.killTweensOf(leftUpperArm.rotation);
            gsap.to(leftUpperArm.rotation, { 
                x: 0, y: 0, z: 1.2, 
                duration: 0.4, 
                ease: "power2.out" 
            });
        }
        
        // Сбросить hips позицию
        const hips = this.getBone('hips');
        if (hips && this.baseHipsY !== null) {
            gsap.killTweensOf(hips.position);
            gsap.killTweensOf(hips.rotation);
            gsap.to(hips.position, {
                y: this.baseHipsY,
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(hips.rotation, {
                x: 0, y: 0, z: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
        
        // Открыть глаза
        if (this.vrm && this.vrm.expressionManager) {
            try {
                this.vrm.expressionManager.setValue('blink', 0);
            } catch (e) {}
        }
    }

    // 👋 ИСПРАВЛЕННОЕ приветствие - с гарантированным возвратом
    async waveAnimation() {
        this.isAnimating = true;
        
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        if (! rightUpperArm) {
            this.isAnimating = false;
            return;
        }

        try {
            // Убить предыдущие анимации на этих костях
            gsap.killTweensOf(rightUpperArm.rotation);
            if (rightLowerArm) gsap.killTweensOf(rightLowerArm.rotation);
            if (rightHand) gsap.killTweensOf(rightHand.rotation);

            // Поднять руку
            await gsap.to(rightUpperArm.rotation, {
                z: 0.6,
                x: 0.4,
                duration: 0.5,
                ease: "back.out(1.4)"
            });
            
            // Помахать
            if (rightLowerArm) {
                for (let i = 0; i < 3; i++) {
                    await gsap.to(rightLowerArm.rotation, {
                        y: 0.5,
                        duration: 0.12,
                        ease: "sine.inOut"
                    });
                    await gsap.to(rightLowerArm.rotation, {
                        y: -0.5,
                        duration: 0.12,
                        ease: "sine.inOut"
                    });
                }
                
                // Сбросить forearm
                gsap.to(rightLowerArm.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
            // Опустить руку обратно
            await gsap.to(rightUpperArm.rotation, {
                x: 0,
                y: 0,
                z: -1.2,
                duration: 0.5,
                ease: "power2.inOut"
            });
            
            if (rightHand) {
                gsap.to(rightHand.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
        } catch (e) {
            console.error('Wave animation error:', e);
            this.resetPose();
        }
        
        this.isAnimating = false;
        this.currentState = 'idle';
    }

    // 🙇 Поклон
    async bowAnimation() {
        this.isAnimating = true;
        
        const hips = this.getBone('hips');
        const spine = this.getBone('spine');
        const chest = this.getBone('chest');
        const neck = this.getBone('neck');
        const head = this.getBone('head');
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        try {
            // Руки прижать к телу
            if (rightUpperArm) {
                gsap.to(rightUpperArm.rotation, { z: -0.3, x: 0, y: 0, duration: 0.4, ease: "power2.out" });
            }
            if (leftUpperArm) {
                gsap.to(leftUpperArm.rotation, { z: 0.3, x: 0, y: 0, duration: 0.4, ease: "power2.out" });
            }
            
            await this.delay(200);
            
            // Наклон
            if (hips) gsap.to(hips.rotation, { x: -0.35, duration: 0.7, ease: "power2.inOut" });
            if (spine) gsap.to(spine.rotation, { x: -0.1, duration: 0.6, ease: "power2.inOut" });
            if (chest) gsap.to(chest.rotation, { x: -0.1, duration: 0.5, ease: "power2.inOut" });
            if (neck) gsap.to(neck.rotation, { x: -0.15, duration: 0.5, ease: "power2.inOut" });
            if (head) await gsap.to(head.rotation, { x: -0.1, duration: 0.5, ease: "power2.inOut" });
            
            await this.delay(800);
            
            // Подняться
            if (head) gsap.to(head.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.inOut" });
            if (neck) gsap.to(neck.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.inOut" });
            if (chest) gsap.to(chest.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.inOut" });
            if (spine) gsap.to(spine.rotation, { x: 0, y: 0, z: 0, duration: 0.6, ease: "power2.inOut" });
            if (hips) await gsap.to(hips.rotation, { x: 0, y: 0, z: 0, duration: 0.7, ease: "power2.inOut" });
            
            // Вернуть руки
            if (rightUpperArm) gsap.to(rightUpperArm.rotation, { z: -1.2, x: 0, y: 0, duration: 0.5, ease: "power2.out" });
            if (leftUpperArm) await gsap.to(leftUpperArm.rotation, { z: 1.2, x: 0, y: 0, duration: 0.5, ease: "power2.out" });
            
        } catch (e) {
            console.error('Bow animation error:', e);
            this.resetPose();
        }
        
        this.isAnimating = false;
        this.currentState = 'idle';
    }

    // 😊 Кивок
    async nodAnimation() {
        this.isAnimating = true;
        
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        
        if (!head) {
            this.isAnimating = false;
            return;
        }

        try {
            for (let i = 0; i < 2; i++) {
                // Кивнуть вниз
                if (neck) gsap.to(neck.rotation, { x: -0.08, duration: 0.15, ease: "power2.out" });
                await gsap.to(head.rotation, { x: -0.2, duration: 0.15, ease: "power2.out" });
                
                // Вернуться
                if (neck) gsap.to(neck.rotation, { x: 0, duration: 0.18, ease: "power2.inOut" });
                await gsap.to(head.rotation, { x: 0.05, duration: 0.18, ease: "power2.inOut" });
                
                await gsap.to(head.rotation, { x: 0, duration: 0.12, ease: "power2.out" });
                
                await this.delay(100);
            }
        } catch (e) {
            console.error('Nod animation error:', e);
        }
        
        this.isAnimating = false;
        this.currentState = 'idle';
    }

    idleAnimation() {
        this.currentState = 'idle';
        this.resetPose();
    }

    // 🤔 Задумчивость
    async thinkingAnimation() {
        this.isAnimating = true;
        
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        try {
            // Убить предыдущие анимации
            if (rightUpperArm) gsap.killTweensOf(rightUpperArm.rotation);
            if (rightLowerArm) gsap.killTweensOf(rightLowerArm.rotation);
            
            // Наклон головы
            if (head) gsap.to(head.rotation, { z: 0.15, y: 0.1, duration: 0.5, ease: "power2.out" });
            if (neck) gsap.to(neck.rotation, { z: 0.05, duration: 0.5, ease: "power2.out" });
            
            // Рука к подбородку
            if (rightUpperArm) {
                await gsap.to(rightUpperArm.rotation, { z: -0.2, x: 0.9, duration: 0.5, ease: "power3.out" });
            }
            if (rightLowerArm) {
                await gsap.to(rightLowerArm.rotation, { x: 1.6, duration: 0.4, ease: "power2.out" });
            }
            if (rightHand) {
                gsap.to(rightHand.rotation, { x: -0.3, duration: 0.3, ease: "power2.out" });
            }
        } catch (e) {
            console.error('Thinking animation error:', e);
        }
        
        this.isAnimating = false;
        this.currentState = 'thinking';
    }

    // Выйти из thinking и вернуться в idle
    async stopThinking() {
        if (this.currentState !== 'thinking') return;
        
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        // Вернуть голову
        if (head) gsap.to(head.rotation, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.out" });
        if (neck) gsap.to(neck.rotation, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.out" });
        
        // Вернуть руку
        if (rightHand) gsap.to(rightHand.rotation, { x: 0, y: 0, z: 0, duration: 0.3, ease: "power2.out" });
        if (rightLowerArm) gsap.to(rightLowerArm.rotation, { x: 0, y: 0, z: 0, duration: 0.4, ease: "power2.out" });
        if (rightUpperArm) await gsap.to(rightUpperArm.rotation, { x: 0, y: 0, z: -1.2, duration: 0.5, ease: "power2.out" });
        
        this.currentState = 'idle';
    }

    // 🗣️ Разговор
    async talkingAnimation() {
        this.isAnimating = true;
        
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        try {
            if (rightUpperArm) {
                gsap.killTweensOf(rightUpperArm.rotation);
                gsap.to(rightUpperArm.rotation, { z: -0.8, x: 0.3, duration: 0.4, ease: "power2.out" });
            }
            if (leftUpperArm) {
                gsap.killTweensOf(leftUpperArm.rotation);
                gsap.to(leftUpperArm.rotation, { z: 0.9, x: 0.2, duration: 0.4, ease: "power2.out" });
            }
        } catch (e) {
            console.error('Talking animation error:', e);
        }
        
        this.isAnimating = false;
        this.currentState = 'talking';
    }

    // 👆 Указание
    async pointingAnimation() {
        this.isAnimating = true;
        
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        try {
            if (rightUpperArm) {
                gsap.killTweensOf(rightUpperArm.rotation);
                await gsap.to(rightUpperArm.rotation, { z: 0.2, x: 0.4, duration: 0.4, ease: "back.out(1.2)" });
            }
            if (rightLowerArm) {
                gsap.killTweensOf(rightLowerArm.rotation);
                await gsap.to(rightLowerArm.rotation, { x: 0.3, duration: 0.3, ease: "power2.out" });
            }
            if (rightHand) {
                gsap.to(rightHand.rotation, { x: 0.2, duration: 0.2, ease: "power2.out" });
            }
        } catch (e) {
            console.error('Pointing animation error:', e);
        }
        
        this.isAnimating = false;
        this.currentState = 'pointing';
    }

    // 🎉 Радостный прыжок
    async happyJumpAnimation() {
        this.isAnimating = true;
        
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        const hips = this.getBone('hips');
        const head = this.getBone('head');
        
        if (hips && this.baseHipsY === null) {
            this.baseHipsY = hips.position.y;
        }
        
        try {
            // Убить предыдущие анимации
            if (rightUpperArm) gsap.killTweensOf(rightUpperArm.rotation);
            if (leftUpperArm) gsap.killTweensOf(leftUpperArm.rotation);
            if (hips) {
                gsap.killTweensOf(hips.position);
                gsap.killTweensOf(hips.rotation);
            }
            
            // Присесть
            if (hips) {
                await gsap.to(hips.position, { y: this.baseHipsY - 0.05, duration: 0.15, ease: "power2.in" });
            }
            
            // Руки вверх + прыжок
            if (rightUpperArm) gsap.to(rightUpperArm.rotation, { z: 1.2, x: 0.2, duration: 0.25, ease: "back.out(1.5)" });
            if (leftUpperArm) gsap.to(leftUpperArm.rotation, { z: -1.2, x: 0.2, duration: 0.25, ease: "back.out(1.5)" });
            if (hips) gsap.to(hips.position, { y: this.baseHipsY + 0.18, duration: 0.2, ease: "power2.out" });
            if (head) gsap.to(head.rotation, { z: 0.1, duration: 0.2, ease: "power2.out" });
            
            await this.delay(250);
            
            // Приземление
            if (hips) {
                await gsap.to(hips.position, { y: this.baseHipsY - 0.03, duration: 0.15, ease: "power2.in" });
                await gsap.to(hips.position, { y: this.baseHipsY, duration: 0.2, ease: "bounce.out" });
            }
            
            if (head) gsap.to(head.rotation, { x: 0, y: 0, z: 0, duration: 0.3, ease: "power2.out" });
            
            await this.delay(200);
            
            // Опустить руки
            if (rightUpperArm) gsap.to(rightUpperArm.rotation, { z: -1.2, x: 0, y: 0, duration: 0.5, ease: "power2.inOut" });
            if (leftUpperArm) await gsap.to(leftUpperArm.rotation, { z: 1.2, x: 0, y: 0, duration: 0.5, ease: "power2.inOut" });
            
        } catch (e) {
            console.error('Happy jump animation error:', e);
            this.resetPose();
        }
        
        this.isAnimating = false;
        this.currentState = 'idle';
    }

    // Вернуться в idle из любого состояния
    async returnToIdle() {
        // Остановить thinking если активно
        if (this.currentState === 'thinking') {
            await this.stopThinking();
        } else {
            this.resetPose();
        }
        
        await this.delay(400);
        this.currentState = 'idle';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}