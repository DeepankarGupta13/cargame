import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Car {
    constructor(stage) {
        this.stage = stage;

        this.speed = 0;
        this.acceleration = 0.1;
        this.maxSpeed = 0.5;

        this.car = null;
    }

    load() {
        const loader = new GLTFLoader();
        loader.load('http://localhost:5173/car.glb', (gltf) => {
            this.car = gltf.scene;

            this.car.scale.set(0.02, 0.02, 0.02);
            this.car.position.set(0, 0, 0);
            this.car.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                    object.material.envMapIntensity = 20;
                }
            });

            this.stage.sceneManager.add(this.car);
            const axesHelper = new THREE.AxesHelper(5);
            this.car.add(axesHelper);
        });
    }
}