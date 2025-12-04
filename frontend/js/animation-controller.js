export class AnimationController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentState = 'idle';
        this.isAnimating = false;
        this.clock = 0;
        
        // Animation loop flags
        this.breathingEnabled = true;
        this.blinkingEnabled = true;
        this.idleMotionEnabled = true;
        
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
        
        // Start continuous animations
        this.startContinuousAnimations();
        
        // Start idle animation
        this.playAnimation('idle');
    }

    startContinuousAnimations() {
        // Main animation loop
        const animate = () => {
            this.clock += 0.016; // ~60fps
            
            if (this.breathingEnabled) {
                this.updateBreathing();
            }
            
            if (this.blinkingEnabled) {
                this.updateBlinking();
            }
            
            if (this.idleMotionEnabled && this.currentState === 'idle') {
                this.updateIdleMotion();
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Random blinking
        this.scheduleNextBlink();
    }

    updateBreathing() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const spine = humanoid.getRawBoneNode('spine');
        const chest = humanoid.getRawBoneNode('chest');
        
        // Subtle breathing motion
        const breathAmount = Math.sin(this.clock * 1.5) * 0.01;
        
        if (spine) {
            spine.rotation.x = breathAmount;
        }
        if (chest) {
            chest.rotation.x = breathAmount * 0.5;
        }
    }

    updateBlinking() {
        // Blinking is handled by scheduleNextBlink
    }

    scheduleNextBlink() {
        // Random interval between 2-6 seconds
        const nextBlinkTime = 2000 + Math.random() * 4000;
        
        setTimeout(() => {
            this.blink();
            this.scheduleNextBlink();
        }, nextBlinkTime);
    }

    async blink() {
        if (!this.vrm) return;
        
        const blendShapeProxy = this.vrm.expressionManager || this.vrm.blendShapeProxy;
        if (!blendShapeProxy) return;
        
        // Close eyes
        try {
            blendShapeProxy.setValue('blink', 1);
            blendShapeProxy.update();
        } catch (e) {
            // Try alternative blend shape names
            try {
                blendShapeProxy.setValue('Blink', 1);
                blendShapeProxy.update();
            } catch (e2) {}
        }
        
        await this.delay(100);
        
        // Open eyes
        try {
            blendShapeProxy.setValue('blink', 0);
            blendShapeProxy.update();
        } catch (e) {
            try {
                blendShapeProxy.setValue('Blink', 0);
                blendShapeProxy.update();
            } catch (e2) {}
        }
    }

    updateIdleMotion() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const head = humanoid.getRawBoneNode('head');
        const neck = humanoid.getRawBoneNode('neck');
        
        // Subtle head movement
        const headSwayX = Math.sin(this.clock * 0.5) * 0.02;
        const headSwayZ = Math.sin(this.clock * 0.3) * 0.015;
        
        if (head) {
            head.rotation.y = headSwayX;
            head.rotation.z = headSwayZ;
        }
        
        if (neck) {
            neck.rotation.y = headSwayX * 0.5;
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

    // Reset pose to neutral
    resetPose() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const bones = ['rightUpperArm', 'rightLowerArm', 'leftUpperArm', 'leftLowerArm', 
                       'rightUpperLeg', 'rightLowerLeg', 'leftUpperLeg', 'leftLowerLeg',
                       'spine', 'chest', 'neck', 'head'];
        
        bones.forEach(boneName => {
            const bone = humanoid.getRawBoneNode(boneName);
            if (bone) {
                // Reset to default rotation
                bone.rotation.set(0, 0, 0);
            }
        });
        
        // Set arms to natural position (slightly down)
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const leftUpperArm = humanoid.getRawBoneNode('leftUpperArm');
        
        if (rightUpperArm) {
            rightUpperArm.rotation.z = 0.3; // Slight angle down
        }
        if (leftUpperArm) {
            leftUpperArm.rotation.z = -0.3;
        }
    }

    // Animation implementations
    async waveAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const rightLowerArm = humanoid.getRawBoneNode('rightLowerArm');
        const rightHand = humanoid.getRawBoneNode('rightHand');
        
        if (rightUpperArm) {
            // Raise arm
            await this.animateBone(rightUpperArm, 'z', -1.2, 400);
            await this.animateBone(rightUpperArm, 'x', 0.3, 200);
            
            // Wave back and forth
            for (let i = 0; i < 3; i++) {
                if (rightHand) {
                    await this.animateBone(rightHand, 'z', 0.4, 150);
                    await this.animateBone(rightHand, 'z', -0.4, 150);
                } else if (rightLowerArm) {
                    await this.animateBone(rightLowerArm, 'y', 0.3, 150);
                    await this.animateBone(rightLowerArm, 'y', -0.3, 150);
                }
            }
            
            // Lower arm smoothly
            await this.animateBone(rightUpperArm, 'x', 0, 300);
            await this.animateBone(rightUpperArm, 'z', 0.3, 400);
        }
        
        this.currentState = 'idle';
    }

    async bowAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const spine = humanoid.getRawBoneNode('spine');
        const chest = humanoid.getRawBoneNode('chest');
        const head = humanoid.getRawBoneNode('head');
        
        // Bow down
        if (spine) await this.animateBone(spine, 'x', 0.3, 500);
        if (chest) await this.animateBone(chest, 'x', 0.2, 300);
        if (head) await this.animateBone(head, 'x', 0.1, 200);
        
        await this.delay(800);
        
        // Return
        if (head) await this.animateBone(head, 'x', 0, 200);
        if (chest) await this.animateBone(chest, 'x', 0, 300);
        if (spine) await this.animateBone(spine, 'x', 0, 500);
        
        this.currentState = 'idle';
    }

    async nodAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const head = humanoid.getRawBoneNode('head');
        
        if (head) {
            // Nod down and up twice
            for (let i = 0; i < 2; i++) {
                await this.animateBone(head, 'x', 0.15, 200);
                await this.animateBone(head, 'x', 0, 200);
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
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const head = humanoid.getRawBoneNode('head');
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const rightLowerArm = humanoid.getRawBoneNode('rightLowerArm');
        
        // Tilt head and bring hand to chin
        if (head) {
            await this.animateBone(head, 'z', 0.1, 400);
            await this.animateBone(head, 'x', -0.05, 200);
        }
        
        if (rightUpperArm && rightLowerArm) {
            await this.animateBone(rightUpperArm, 'z', -0.5, 400);
            await this.animateBone(rightUpperArm, 'x', 0.8, 300);
            await this.animateBone(rightLowerArm, 'x', 1.2, 300);
        }
        
        this.currentState = 'thinking';
    }

    async talkingAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        // Subtle gestures while talking
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const leftUpperArm = humanoid.getRawBoneNode('leftUpperArm');
        
        // Small hand gestures
        if (rightUpperArm) {
            await this.animateBone(rightUpperArm, 'z', -0.4, 300);
            await this.animateBone(rightUpperArm, 'x', 0.2, 200);
        }
        
        this.currentState = 'talking';
    }

    pointingAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const rightLowerArm = humanoid.getRawBoneNode('rightLowerArm');
        
        if (rightUpperArm) {
            this.animateBone(rightUpperArm, 'z', -1.0, 400);
            this.animateBone(rightUpperArm, 'x', 0.3, 300);
        }
        if (rightLowerArm) {
            this.animateBone(rightLowerArm, 'x', 0.2, 300);
        }
        
        this.currentState = 'pointing';
    }

    async happyJumpAnimation() {
        if (!this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        const hips = humanoid.getRawBoneNode('hips');
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        const leftUpperArm = humanoid.getRawBoneNode('leftUpperArm');
        
        // Raise both arms
        if (rightUpperArm) await this.animateBone(rightUpperArm, 'z', -2.0, 300);
        if (leftUpperArm) await this.animateBone(leftUpperArm, 'z', 2.0, 300);
        
        // Small jump (move hips up)
        if (hips) {
            const originalY = hips.position.y;
            hips.position.y += 0.1;
            await this.delay(200);
            hips.position.y = originalY;
        }
        
        // Lower arms
        await this.delay(300);
        if (rightUpperArm) await this.animateBone(rightUpperArm, 'z', 0.3, 400);
        if (leftUpperArm) await this.animateBone(leftUpperArm, 'z', -0.3, 400);
        
        this.currentState = 'idle';
    }

    // Helper methods
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
                
                // Smooth easing (ease-out cubic)
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}