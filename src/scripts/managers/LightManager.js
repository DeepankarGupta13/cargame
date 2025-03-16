import * as THREE from 'three';

export default class LightManager {
    constructor(stage) {
        this.stage = stage;
        this.shadowEnabled = false;

        // Ambient light.
        this.ambientLightDefaultIntensity = 1;
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.ambientLight.castShadow = true;
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        const directionalLight1 = new THREE.DirectionalLight(0xff0000, 100);
        directionalLight1.position.set(1, 1, 1).normalize();

        const directionalLight2 = new THREE.DirectionalLight(0x0000ff, 100);
        directionalLight2.position.set(-10, 10, 5).normalize();

        this.objectsGroupWithoutShadows = new THREE.Group();
        this.objectsGroupWithoutShadows.add(this.ambientLight);

        this.stage.sceneManager.scene.add(this.objectsGroupWithoutShadows);
    }
}