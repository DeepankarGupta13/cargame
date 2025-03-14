import * as THREE from 'three';

export default class RendererManager {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

        this.DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        this.renderer.setPixelRatio(this.DPR);

        this.renderer.setSize(canvas.width, canvas.height);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resizeRenderer(screenDimensions) {
        this.renderer.setSize(screenDimensions.width, screenDimensions.height);
    }

    getDomElement() {
        return this.renderer.domElement;
    }
}