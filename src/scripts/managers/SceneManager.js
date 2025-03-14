import * as THREE from 'three';

export default class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
    }

    add(...obj) {
        this.scene.add(...obj);
    }

    clear() {
        const objs = [...this.scene.children];
        this.scene.remove(...objs);
        this.dispose(...objs);
    }

    dispose(...objs) {
        objs.forEach(obj => {
            if (obj instanceof THREE.Mesh) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(material => material.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            }
            else if (obj instanceof THREE.Object3D) {
                this.dispose(...obj.children);
            }
        });
    }

    remove(...obj) {
        const objs = [...obj];
        this.scene.remove(...obj);

        objs.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(material => material.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
    }
}