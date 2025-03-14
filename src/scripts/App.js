import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SceneManager from './managers/SceneManager';
import CameraManager from './managers/CameraManager';
import LightManager from './managers/LightManager';
import RendererManager from './managers/RendererManager';
import Ground from './objects/Ground';

export default class App {
    constructor() {
        window.windowTHREE = THREE;
        window.windowStage = this;
        window.orbitControls = null;
    }

    loadStage(canvas) {
        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height
        };
        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager(this.screenDimensions);
        this.rendererManager = new RendererManager(canvas);
        this.lightManager = new LightManager(this);

        this.ground = new Ground(this);

        this.controls = new OrbitControls(this.cameraManager.camera, this.rendererManager.renderer.domElement);
        window.orbitControls = this.controls;

        this.start();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        // this.ground.grassField.update(Math.random() * 0.01);
        this.rendererManager.render(this.sceneManager.scene, this.cameraManager.camera);
    }

    start() {
        this.animate();
    }
}