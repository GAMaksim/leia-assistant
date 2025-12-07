export class AnimationController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentState = 'idle';
        this.isAnimating = false;
        this.clock = 0;
        
        this.breathingEnabled = true;
        this.blinkingEnabled = true;
        this.idleMotionEnabled = true;
        
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

    // 💨 Дыхание с GSAP-подобной плавностью
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
            this.blink();
            this.scheduleNextBlink();
        }, nextBlinkTime);
    }

    // 👁️ Плавное моргание с GSAP
    async blink() {
        if (! this.vrm || !this.vrm.expressionManager) return;
        
        try {
            // Плавное закрытие глаз
            gsap.to(this, {
                duration: 0.08,
                ease: "power2.in",
                onUpdate: () => {
                    const progress = gsap.getProperty(this, "blinkProgress") || 0;
                    this.vrm.expressionManager.setValue('blink', progress);
                },
                blinkProgress: 1
            });
            
            await this.delay(80);
            
            // Плавное открытие глаз
            gsap.to(this, {
                duration: 0.12,
                ease: "power2.out",
                onUpdate: () => {
                    const progress = gsap.getProperty(this, "blinkProgress") || 1;
                    this.vrm.expressionManager.setValue('blink', progress);
                },
                blinkProgress: 0
            });
        } catch (e) {}
    }

    // 🔄 Живое idle движение
    updateIdleMotion() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        const spine = this.getBone('spine');
        
        // Многослойное движение для естественности
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
        if (! this.animations[name]) {
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

    // 🔄 Сброс позы с GSAP
    resetPose() {
        const bones = ['rightUpperArm', 'rightLowerArm', 'leftUpperArm', 'leftLowerArm', 
                       'spine', 'chest', 'neck', 'head', 'hips'];
        
        bones.forEach(boneName => {
            const bone = this.getBone(boneName);
            if (bone) {
                gsap.to(bone.rotation, {
                    x: 0, y: 0, z: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
        
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        if (rightUpperArm) {
            gsap.to(rightUpperArm.rotation, { z: -1.2, duration: 0.4, ease: "power2.out" });
        }
        if (leftUpperArm) {
            gsap.to(leftUpperArm.rotation, { z: 1.2, duration: 0.4, ease: "power2.out" });
        }
    }

    // 👋 Приветствие с GSAP - живое и пружинящее
    async waveAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        if (!rightUpperArm) return;

        // Поднять руку с пружинящим эффектом
        gsap.to(rightUpperArm.rotation, {
            z: 0.6,
            x: 0.4,
            duration: 0.5,
            ease: "back.out(1.4)"
        });
        
        await this.delay(400);
        
        // Помахать - живое движение
        const waveTl = gsap.timeline();
        
        for (let i = 0; i < 3; i++) {
            waveTl
                .to(rightLowerArm?.rotation || {}, {
                    y: 0.5,
                    duration: 0.12,
                    ease: "sine.inOut"
                })
                .to(rightLowerArm?.rotation || {}, {
                    y: -0.5,
                    duration: 0.12,
                    ease: "sine.inOut"
                });
                
            // Добавить движение кисти для естественности
            if (rightHand) {
                waveTl.to(rightHand.rotation, {
                    z: 0.3,
                    duration: 0.12,
                    ease: "sine.inOut"
                }, "<")
                .to(rightHand.rotation, {
                    z: -0.3,
                    duration: 0.12,
                    ease: "sine.inOut"
                });
            }
        }
        
        await waveTl;
        
        // Плавно опустить руку
        gsap.to(rightUpperArm.rotation, {
            x: 0,
            z: -1.2,
            duration: 0.6,
            ease: "power2.inOut"
        });
        
        if (rightLowerArm) {
            gsap.to(rightLowerArm.rotation, {
                y: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        }
        
        if (rightHand) {
            gsap.to(rightHand.rotation, {
                z: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
        
        await this.delay(600);
        this.currentState = 'idle';
    }

    // 🙇 Поклон с GSAP - плавный японский стиль
    async bowAnimation() {
        const hips = this.getBone('hips');
        const spine = this.getBone('spine');
        const chest = this.getBone('chest');
        const neck = this.getBone('neck');
        const head = this.getBone('head');
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        // Руки прижать к телу
        gsap.to(rightUpperArm?.rotation || {}, {
            z: -0.3,
            duration: 0.4,
            ease: "power2.out"
        });
        gsap.to(leftUpperArm?.rotation || {}, {
            z: 0.3,
            duration: 0.4,
            ease: "power2.out"
        });
        
        await this.delay(200);
        
        // Плавный наклон всего тела
        const bowTl = gsap.timeline();
        
        bowTl
            .to(hips?.rotation || {}, {
                x: -0.35,
                duration: 0.7,
                ease: "power2.inOut"
            })
            .to(spine?.rotation || {}, {
                x: -0.1,
                duration: 0.6,
                ease: "power2.inOut"
            }, "<0.1")
            .to(chest?.rotation || {}, {
                x: -0.1,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<0.1")
            .to(neck?.rotation || {}, {
                x: -0.15,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<0.1")
            .to(head?.rotation || {}, {
                x: -0.1,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<0.1");
        
        await bowTl;
        await this.delay(800);
        
        // Подняться
        const riseTl = gsap.timeline();
        
        riseTl
            .to(head?.rotation || {}, {
                x: 0,
                duration: 0.5,
                ease: "power2.inOut"
            })
            .to(neck?.rotation || {}, {
                x: 0,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<0.05")
            .to(chest?.rotation || {}, {
                x: 0,
                duration: 0.5,
                ease: "power2.inOut"
            }, "<0.05")
            .to(spine?.rotation || {}, {
                x: 0,
                duration: 0.6,
                ease: "power2.inOut"
            }, "<0.05")
            .to(hips?.rotation || {}, {
                x: 0,
                duration: 0.7,
                ease: "power2.inOut"
            }, "<0.1");
        
        await riseTl;
        
        // Вернуть руки
        gsap.to(rightUpperArm?.rotation || {}, {
            z: -1.2,
            duration: 0.5,
            ease: "power2.out"
        });
        gsap.to(leftUpperArm?.rotation || {}, {
            z: 1.2,
            duration: 0.5,
            ease: "power2.out"
        });
        
        await this.delay(500);
        this.currentState = 'idle';
    }

    // 😊 Кивок с GSAP
    async nodAnimation() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        
        if (!head) return;

        for (let i = 0; i < 2; i++) {
            const nodTl = gsap.timeline();
            
            nodTl
                .to(head.rotation, {
                    x: -0.2,
                    duration: 0.15,
                    ease: "power2.out"
                })
                .to(neck?.rotation || {}, {
                    x: -0.08,
                    duration: 0.15,
                    ease: "power2.out"
                }, "<")
                .to(head.rotation, {
                    x: 0.05,
                    duration: 0.18,
                    ease: "power2.inOut"
                })
                .to(neck?.rotation || {}, {
                    x: 0,
                    duration: 0.18,
                    ease: "power2.inOut"
                }, "<")
                .to(head.rotation, {
                    x: 0,
                    duration: 0.12,
                    ease: "power2.out"
                });
            
            await nodTl;
            await this.delay(100);
        }
        
        this.currentState = 'idle';
    }

    idleAnimation() {
        this.currentState = 'idle';
        this.resetPose();
    }

    // 🤔 Задумчивость с GSAP
    async thinkingAnimation() {
        const head = this.getBone('head');
        const neck = this.getBone('neck');
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        // Наклон головы
        gsap.to(head?.rotation || {}, {
            z: 0.15,
            y: 0.1,
            duration: 0.5,
            ease: "power2.out"
        });
        
        gsap.to(neck?.rotation || {}, {
            z: 0.05,
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Рука к подбородку - плавно
        const thinkTl = gsap.timeline();
        
        thinkTl
            .to(rightUpperArm?.rotation || {}, {
                z: -0.2,
                x: 0.9,
                duration: 0.5,
                ease: "power3.out"
            })
            .to(rightLowerArm?.rotation || {}, {
                x: 1.6,
                duration: 0.4,
                ease: "power2.out"
            }, "<0.1")
            .to(rightHand?.rotation || {}, {
                x: -0.3,
                duration: 0.3,
                ease: "power2.out"
            }, "<0.1");
        
        await thinkTl;
        this.currentState = 'thinking';
    }

    // 🗣️ Разговор
    async talkingAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        
        gsap.to(rightUpperArm?.rotation || {}, {
            z: -0.8,
            x: 0.3,
            duration: 0.4,
            ease: "power2.out"
        });
        
        gsap.to(leftUpperArm?.rotation || {}, {
            z: 0.9,
            x: 0.2,
            duration: 0.4,
            ease: "power2.out"
        });
        
        this.currentState = 'talking';
    }

    // 👆 Указание
    async pointingAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const rightLowerArm = this.getBone('rightLowerArm');
        const rightHand = this.getBone('rightHand');
        
        const pointTl = gsap.timeline();
        
        pointTl
            .to(rightUpperArm?.rotation || {}, {
                z: 0.2,
                x: 0.4,
                duration: 0.4,
                ease: "back.out(1.2)"
            })
            .to(rightLowerArm?.rotation || {}, {
                x: 0.3,
                duration: 0.3,
                ease: "power2.out"
            }, "<0.1")
            .to(rightHand?.rotation || {}, {
                x: 0.2,
                duration: 0.2,
                ease: "power2.out"
            }, "<0.1");
        
        await pointTl;
        this.currentState = 'pointing';
    }

    // 🎉 Радостный прыжок с GSAP - живой и упругий
    async happyJumpAnimation() {
        const rightUpperArm = this.getBone('rightUpperArm');
        const leftUpperArm = this.getBone('leftUpperArm');
        const hips = this.getBone('hips');
        const head = this.getBone('head');
        
        if (hips && this.baseHipsY === null) {
            this.baseHipsY = hips.position.y;
        }
        
        // Подготовка к прыжку - присесть
        gsap.to(hips?.position || {}, {
            y: this.baseHipsY - 0.05,
            duration: 0.15,
            ease: "power2.in"
        });
        
        await this.delay(150);
        
        // Руки вверх + прыжок одновременно
        const jumpTl = gsap.timeline();
        
        jumpTl
            // Руки вверх с энтузиазмом
            .to(rightUpperArm?.rotation || {}, {
                z: 1.2,
                x: 0.2,
                duration: 0.25,
                ease: "back.out(1.5)"
            })
            .to(leftUpperArm?.rotation || {}, {
                z: -1.2,
                x: 0.2,
                duration: 0.25,
                ease: "back.out(1.5)"
            }, "<")
            // Прыжок вверх
            .to(hips?.position || {}, {
                y: this.baseHipsY + 0.18,
                duration: 0.2,
                ease: "power2.out"
            }, "<")
            // Радостный наклон головы
            .to(head?.rotation || {}, {
                z: 0.1,
                duration: 0.2,
                ease: "power2.out"
            }, "<");
        
        await jumpTl;
        
        // Приземление с отскоком
        gsap.to(hips?.position || {}, {
            y: this.baseHipsY - 0.03,
            duration: 0.15,
            ease: "power2.in"
        });
        
        await this.delay(150);
        
        // Финальное выпрямление
        gsap.to(hips?.position || {}, {
            y: this.baseHipsY,
            duration: 0.2,
            ease: "bounce.out"
        });
        
        gsap.to(head?.rotation || {}, {
            z: 0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        await this.delay(300);
        
        // Опустить руки плавно
        gsap.to(rightUpperArm?.rotation || {}, {
            z: -1.2,
            x: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        gsap.to(leftUpperArm?.rotation || {}, {
            z: 1.2,
            x: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        await this.delay(500);
        this.currentState = 'idle';
    }

    // Вернуться в idle из любого состояния
    async returnToIdle() {
        this.resetPose();
        await this.delay(500);
        this.currentState = 'idle';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}