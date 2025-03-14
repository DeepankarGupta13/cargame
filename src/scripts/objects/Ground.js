import * as THREE from 'three';
import GrassField from './GrassField';

export default class Ground {
    constructor(stage) {
        this.stage = stage;

        this.load();
    }

    load() {
        this.createGround();
        this.createGrassField();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff , side: THREE.DoubleSide });
        const plane = new THREE.Mesh(groundGeometry, groundMaterial);
        plane.rotation.x = - Math.PI / 2;
        this.plane = plane;
        this.stage.sceneManager.add(this.plane);
    }

    createGrassField() {
        this.grassField = new GrassField(10, 10, 1000, 5);
        this.stage.sceneManager.add(this.grassField.grassMesh);
    }
}