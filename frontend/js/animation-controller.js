export class AnimationController {
    constructor(vrm) {
        this.vrm = vrm;
        this.currentState = 'idle';
        this.isAnimating = false;
        
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
            happy_jump: this.happyJumpAnimation. bind(this),
            standby: this.idleAnimation.bind(this)
        };
        
        // Start idle animation
        this.playAnimation('idle');
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
        if (this.states[state]) {
            this.currentState = state;
        }
    }

    // Animation implementations
    async waveAnimation() {
        if (! this.vrm) return;
        
        const humanoid = this.vrm.humanoid;
        if (!humanoid) return;
        
        // Simple wave using bone rotation
        const rightUpperArm = humanoid. getRawBoneNode('rightUpperArm');
        const rightLowerArm = humanoid.getRawBoneNode('rightLowerArm');
        
        if (rightUpperArm) {
            // Raise arm
            await this.animateBone(rightUpperArm, 'z', -1.5, 500);
            
            // Wave back and forth
            for (let i = 0; i < 3; i++) {
                await this.animateBone(rightLowerArm, 'y', 0.3, 200);
                await this.animateBone(rightLowerArm, 'y', -0.3, 200);
            }
            
            // Lower arm
            await this.animateBone(rightUpperArm, 'z', 0, 500);
        }
    }

    async bowAnimation() {
        if (! this.vrm) return;
        
        const humanoid = this.vrm. humanoid;
        if (!humanoid) return;
        
        const spine = humanoid.getRawBoneNode('spine');
        
        if (spine) {
            // Bow down
            await this. animateBone(spine, 'x', 0.5, 500);
            await this.delay(500);
            // Return
            await this.animateBone(spine, 'x', 0, 500);
        }
    }

    idleAnimation() {
        // Subtle breathing animation would go here
        console.log('Playing idle animation');
    }

    thinkingAnimation() {
        if (!this. vrm) return;
        
        const humanoid = this. vrm.humanoid;
        if (! humanoid) return;
        
        // Tilt head slightly
        const head = humanoid. getRawBoneNode('head');
        if (head) {
            this.animateBone(head, 'z', 0.1, 500);
        }
    }

    pointingAnimation() {
        if (!this. vrm) return;
        
        const humanoid = this. vrm.humanoid;
        if (! humanoid) return;
        
        const rightUpperArm = humanoid.getRawBoneNode('rightUpperArm');
        if (rightUpperArm) {
            this.animateBone(rightUpperArm, 'z', -1.2, 500);
        }
    }

    async happyJumpAnimation() {
        // Simple happy reaction
        console.log('Playing happy jump animation');
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
                
                // Easing
                const easeProgress = 1 - Math. pow(1 - progress, 3);
                
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