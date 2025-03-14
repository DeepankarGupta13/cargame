import * as THREE from 'three';

export default class LightManager {
    constructor(stage) {
        this.stage = stage;
        this.shadowEnabled = false;

        // Ambient light.
        this.ambientLightDefaultIntensity = 1;
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.ambientLight.castShadow = false;
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        this.objectsGroupWithoutShadows = new THREE.Group();
        this.objectsGroupWithoutShadows.add(this.ambientLight);

        this.stage.sceneManager.scene.add(this.objectsGroupWithoutShadows);
    }
}