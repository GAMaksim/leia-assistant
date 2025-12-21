import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

export class VRMLoader {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.vrm = null;
        this.clock = new THREE.Clock();
    }

    async init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            30,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 1.3, 3);
        this.camera.lookAt(0, 1, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0x7b2cbf, 0.3);
        backLight.position.set(-1, 1, -1);
        this.scene.add(backLight);
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
        
        // Start animation loop
        this.animate();
    }

    async loadModel(url) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.register((parser) => new VRMLoaderPlugin(parser));
            
            loader.load(
                url,
                (gltf) => {
                    this.vrm = gltf.userData.vrm;
                    
                    // Rotate model to face camera
                    this.vrm.scene.rotation.y = Math.PI;
                    
                    this.scene.add(this.vrm.scene);
                    
                    console.log('VRM loaded:', this.vrm);
                    resolve(this.vrm);
                },
                (progress) => {
                    console.log('Loading VRM:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
                },
                (error) => {
                    console.error('Error loading VRM:', error);
                    reject(error);
                }
            );
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();

        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Update VRM
        if (this.vrm) {
            this.vrm.update(delta);
        }

        if (window.leiaApp?.lookAtController) {
            window.leiaApp.lookAtController.applyHeadRotation();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}