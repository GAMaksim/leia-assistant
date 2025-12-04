export class PresenceDetector {
    constructor(onDetected) {
        this.onDetected = onDetected;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.previousFrame = null;
        this.isActive = false;
        this.lastDetectionTime = 0;
        this.detectionCooldown = 10000; // 10 seconds between greetings
        
        // Motion detection threshold
        this.motionThreshold = 30;
        this.pixelChangeThreshold = 0.05; // 5% of pixels changed
        
        this.init();
    }

    async init() {
        try {
            // Create hidden video element
            this.video = document. createElement('video');
            this.video. setAttribute('autoplay', '');
            this.video.setAttribute('playsinline', '');
            this.video.style.display = 'none';
            document.body.appendChild(this. video);
            
            // Create canvas for processing
            this.canvas = document.createElement('canvas');
            this.canvas.width = 320;
            this.canvas.height = 240;
            this.ctx = this.canvas.getContext('2d');
            
            // Request camera access
            const stream = await navigator. mediaDevices.getUserMedia({
                video: { width: 320, height: 240 }
            });
            
            this.video.srcObject = stream;
            this.isActive = true;
            
            console.log('📷 Presence detector initialized');
            
            // Start detection loop
            this.detectLoop();
            
        } catch (error) {
            console.warn('Presence detection not available:', error.message);
        }
    }

    detectLoop() {
        if (!this.isActive) return;
        
        // Draw current frame
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const currentFrame = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas. height);
        
        if (this.previousFrame) {
            const motion = this.detectMotion(currentFrame, this.previousFrame);
            
            if (motion && Date.now() - this.lastDetectionTime > this.detectionCooldown) {
                console.log('👤 Motion detected! ');
                this.lastDetectionTime = Date.now();
                this.onDetected(true);
            }
        }
        
        this.previousFrame = currentFrame;
        
        // Next frame
        requestAnimationFrame(() => this.detectLoop());
    }

    detectMotion(current, previous) {
        const data1 = current.data;
        const data2 = previous.data;
        let changedPixels = 0;
        const totalPixels = data1.length / 4;
        
        for (let i = 0; i < data1.length; i += 4) {
            const rDiff = Math.abs(data1[i] - data2[i]);
            const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
            const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
            
            const avgDiff = (rDiff + gDiff + bDiff) / 3;
            
            if (avgDiff > this.motionThreshold) {
                changedPixels++;
            }
        }
        
        const changeRatio = changedPixels / totalPixels;
        return changeRatio > this.pixelChangeThreshold;
    }

    stop() {
        this.isActive = false;
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks(). forEach(track => track.stop());
        }
    }
}