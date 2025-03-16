import * as THREE from 'three';

export default class CameraManager {
    constructor(screenDimensions) {
        this.camera = new THREE.PerspectiveCamera(75, screenDimensions.width / screenDimensions.height, 0.1, 1000);
        
        this.camera.position.set(0.4, 0.4, 1);
        this.camera.lookAt(0, 0, 0);
    }

    getCamera() {
        return this.camera;
    }

    updatePerspectiveCamera(screenDimensions) {
        this.perspectiveCamera.aspect = screenDimensions.width / screenDimensions.height;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    enableCameraHelper(sceneManager) {
        this.isCameraHelperEnabled = true;
        this.helper = new THREE.CameraHelper(this.camera);
        sceneManager.scene.add(this.helper);
    }
}