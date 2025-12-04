export class AnimationController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentState = 'idle';
        this.isAnimating = false;
        this.clock = 0;
        
        this.breathingEnabled = true;
        this.blinkingEnabled = true;
        this.idleMotionEnabled = true;
        
        // Правильные значения для idle позы (руки вниз)
        this.idlePose = {
            rightUpperArm: { z: -1.2 },
            leftUpperArm: { z: 1.2 }
        };
        
        // Базовая позиция hips для прыжка
        this.baseHipsY = null;
        this.baseHipsRotationX = 0;
        
        this.states = {
            idle: { duration: -1 },
            greeting: { duration: 2000 },
            thinking: { duration: 3000 },
            speaking: { duration: -1 },
            pointing: { duration: 2000 }
        };
        
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
        const breathAmount = Math.sin(this.clock * 1.5) * 0.015;
        if (chest) chest.rotation.x = breathAmount;
    }

    scheduleNextBlink() {
        const nextBlinkTime = 2000 + Math.random() * 4000;
        
        setTimeout(() => {
            this.blink();
            this.scheduleNextBlink();
        }, nextBlinkTime);
    }

    async blink() {
        if (!this.vrm || !this.vrm.expressionManager) return;
        
        try {
            this.vrm.expressionManager.setValue('blink', 1);
            await this.delay(100);
            this.vrm.expressionManager.setValue('blink', 0);
        } catch (e) {}
    }

    updateIdleMotion() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        
        const headSwayY = Math.sin(this.clock * 0.5) * 0.03;
        const headSwayZ = Math.sin(this.clock * 0.3) * 0.02;
        
        if (head) {
            head.rotation.y = headSwayY;
            head.rotation.z = headSwayZ;
        }
        
        if (neck) {
            neck.rotation.y = headSwayY * 0.5;
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
        if (this.states[state]) {
            this.currentState = state;
        }
    }

    resetPose() {
        const bones = ['rightUpperArm', 'rightLowerArm', 'leftUpperArm', 'leftLowerArm', 
                       'spine', 'chest', 'neck', 'head', 'hips'];
        
        bones.forEach(boneName => {
            const bone = this.getBone(boneName);
            if (bone) bone.rotation.set(0, 0, 0);
        });
        
        // Установить правильную idle позу (руки вниз)
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        if (rightUpperArm) rightUpperArm.rotation.z = -1.2;
        if (leftUpperArm) leftUpperArm.rotation.z = 1.2;
    }

    async waveAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        
        if (rightUpperArm) {
            // Поднять руку для приветствия
            await this.animateBone(rightUpperArm, 'z', 0.5, 400);
            await this.animateBone(rightUpperArm, 'x', 0.3, 200);
            
            // Помахать
            for (let i = 0; i < 3; i++) {
                if (rightLowerArm) {
                    await this.animateBone(rightLowerArm, 'y', 0.4, 150);
                    await this.animateBone(rightLowerArm, 'y', -0.4, 150);
                }
            }
            
            // Опустить руку в idle
            await this.animateBone(rightUpperArm, 'x', 0, 300);
            await this.animateBone(rightUpperArm, 'z', -1.2, 400);
            if (rightLowerArm) rightLowerArm.rotation.y = 0;
        }
        
        this.currentState = 'idle';
    }

    async bowAnimation() {
        const hips = this.getBone('hips');
        const neck = this.getBone('neck');
        const head = this.getBone('head');
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        // Руки прижать к телу для японского поклона
        if (rightUpperArm) this.animateBone(rightUpperArm, 'z', -0.5, 300);
        if (leftUpperArm) this.animateBone(leftUpperArm, 'z', 0.5, 300);
        
        await this.delay(200);
        
        // Наклон через hips (основной наклон тела)
        if (hips) this.animateBone(hips, 'x', -0.4, 500);
        if (neck) this.animateBone(neck, 'x', -0.15, 500);
        if (head) await this.animateBone(head, 'x', -0.15, 500);
        
        // Задержка в поклоне
        await this.delay(800);
        
        // Вернуться в исходное положение
        if (head) this.animateBone(head, 'x', 0, 500);
        if (neck) this.animateBone(neck, 'x', 0, 500);
        if (hips) await this.animateBone(hips, 'x', 0, 600);
        
        // Вернуть руки в idle позу
        if (rightUpperArm) this.animateBone(rightUpperArm, 'z', -1.2, 400);
        if (leftUpperArm) await this.animateBone(leftUpperArm, 'z', 1.2, 400);
        
        this.currentState = 'idle';
    }

    async nodAnimation() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        
        if (head) {
            for (let i = 0; i < 2; i++) {
                if (neck) this.animateBone(neck, 'x', -0.1, 150);
                await this.animateBone(head, 'x', -0.2, 150);
                
                if (neck) this.animateBone(neck, 'x', 0, 150);
                await this.animateBone(head, 'x', 0, 150);
            }
        }
        
        this.currentState = 'idle';
    }

    idleAnimation() {
        this.currentState = 'idle';
        this.resetPose();
        console.log('Playing idle animation');
    }

    async thinkingAnimation() {
        const head = this.getBone('head');
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        
        if (head) {
            await this.animateBone(head, 'z', 0.15, 400);
        }
        
        // Рука к подбородку
        if (rightUpperArm && rightLowerArm) {
            await this.animateBone(rightUpperArm, 'z', -0.3, 400);
            await this.animateBone(rightUpperArm, 'x', 0.8, 300);
            await this.animateBone(rightLowerArm, 'x', 1.5, 300);
        }
        
        this.currentState = 'thinking';
    }

    async talkingAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        
        if (rightUpperArm) {
            await this.animateBone(rightUpperArm, 'z', -0.8, 300);
            await this.animateBone(rightUpperArm, 'x', 0.3, 200);
        }
        
        this.currentState = 'talking';
    }

    async pointingAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        
        if (rightUpperArm) {
            await this.animateBone(rightUpperArm, 'z', 0, 400);
            await this.animateBone(rightUpperArm, 'x', 0.3, 300);
        }
        if (rightLowerArm) {
            await this.animateBone(rightLowerArm, 'x', 0.3, 300);
        }
        
        this.currentState = 'pointing';
    }

    async happyJumpAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        const hips = this.getBone('hips');
        
        // Запомнить базовую позицию если еще не запомнили
        if (hips && this.baseHipsY === null) {
            this.baseHipsY = hips.position.y;
        }
        
        // Поднять обе руки вверх
        if (rightUpperArm) this.animateBone(rightUpperArm, 'z', 1.0, 300);
        if (leftUpperArm) this.animateBone(leftUpperArm, 'z', -1.0, 300);
        
        await this.delay(300);
        
        // Настоящий прыжок через hips.position.y
        if (hips && this.baseHipsY !== null) {
            // Прыжок вверх
            await this.animatePosition(hips, 'y', this.baseHipsY + 0.15, 150);
            // Приземление
            await this.animatePosition(hips, 'y', this.baseHipsY, 200);
        }
        
        await this.delay(100);
        
        // Опустить руки в idle позу
        if (rightUpperArm) await this.animateBone(rightUpperArm, 'z', -1.2, 400);
        if (leftUpperArm) await this.animateBone(leftUpperArm, 'z', 1.2, 400);
        
        this.currentState = 'idle';
    }

    animateBone(bone, axis, targetValue, duration) {
        return new Promise((resolve) => {
            if (!bone) {
                resolve();
                return;
            }
            
            const startValue = bone.rotation[axis];
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                bone.rotation[axis] = startValue + (targetValue - startValue) * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    animatePosition(bone, axis, targetValue, duration) {
        return new Promise((resolve) => {
            if (!bone) {
                resolve();
                return;
            }
            
            const startValue = bone.position[axis];
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Easing для прыжка
                const easeProgress = 1 - Math.pow(1 - progress, 2);
                
                bone.position[axis] = startValue + (targetValue - startValue) * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}