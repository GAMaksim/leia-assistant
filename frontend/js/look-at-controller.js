/**
 * LookAtController - Управление взглядом модели
 * Применяется ПОСЛЕ анимаций чтобы не перезаписываться
 */

class LookAtController {
    constructor(vrm) {
        this.vrm = vrm;
        this.enabled = true;
        this.intensity = 0.7;
        
        this.target = { x: 0, y: 0 };
        this.currentLook = { x: 0, y: 0 };
        this.smoothness = 0.08;
        
        this.headBone = null;
        this.neckBone = null;
        
        // Базовые rotation (сохраняем из анимации)
        this.baseHeadRotation = { x: 0, y: 0, z: 0 };
        this.baseNeckRotation = { x:  0, y:  0, z:  0 };
        
        this.logCounter = 0;
        
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        
        this.findBones();
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseleave', this.onMouseLeave);
        console.log('👁️ LookAtController initialized');
    }
    
    findBones() {
        if (!this.vrm?.humanoid) return;
        
        const humanoid = this.vrm.humanoid;
        
        if (humanoid.humanBones) {
            this.headBone = humanoid.humanBones.head?.node;
            this.neckBone = humanoid.humanBones.neck?.node;
        }
        
        if (this.headBone) {
            console.log('✅ LookAt:  Head bone found! ', this.headBone.name);
        }
    }
    
    onMouseMove(event) {
        if (! this.enabled) return;
        
        this.target.x = (event.clientX / window.innerWidth - 0.5) * 2;
        this.target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }
    
    onMouseLeave() {
        this.target.x = 0;
        this.target.y = 0;
    }
    
    update() {
        if (! this.vrm || !this.enabled || !this.headBone) return;
        
        // Плавная интерполяция
        this.currentLook.x += (this.target.x - this.currentLook.x) * this.smoothness;
        this.currentLook.y += (this.target.y - this.currentLook.y) * this.smoothness;
    }
    
    // Вызывать ПОСЛЕ vrm.update() и анимаций! 
    applyHeadRotation() {
        if (!this.headBone || !this.enabled) return;
        
        // Вычисляем добавку от взгляда
        const lookRotY = this.currentLook.x * 0.4 * this.intensity;
        const lookRotX = -this.currentLook.y * 0.2 * this.intensity;
        
        // ДОБАВЛЯЕМ к текущему rotation (не заменяем!)
        this.headBone.rotation.y += lookRotY;
        this.headBone.rotation.x += lookRotX;
        
        if (this.neckBone) {
            this.neckBone.rotation.y += lookRotY * 0.3;
            this.neckBone.rotation.x += lookRotX * 0.3;
        }
        
        // Лог
        // this.logCounter++;
        // if (this.logCounter % 120 === 0 && (Math.abs(this.currentLook.x) > 0.1 || Math.abs(this.currentLook.y) > 0.1)) {
        //     console.log(`👁️ LookAt applied: rotY=${lookRotY.toFixed(3)}`);
        // }
    }
    
    disable() { this.enabled = false; }
    enable() { this.enabled = true; }
    
    destroy() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseleave', this.onMouseLeave);
    }
}

export { LookAtController };