import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.addSkySphere();
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

    // addSkySphere() {
    //     // Vertex Shader (Simple pass-through)
    //     const vertexShader = `
    //         varying vec3 vWorldPosition;
    //         void main() {
    //             vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    //             vWorldPosition = worldPosition.xyz;
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //         }
    //     `;

    //     // Fragment Shader (Procedural Sky)
    //     const fragmentShader = `
    //         varying vec3 vWorldPosition;
    //         uniform vec3 topColor; // Top color of the sky
    //         uniform vec3 bottomColor; // Bottom color of the sky
    //         uniform float offset; // Offset for the gradient
    //         uniform float exponent; // Controls the gradient sharpness

    //         void main() {
    //             float h = normalize(vWorldPosition + offset).y; // Height factor
    //             h = clamp(h, 0.0, 1.0);
    //             h = pow(h, exponent); // Apply exponent for sharper gradient
    //             vec3 color = mix(bottomColor, topColor, h); // Blend colors
    //             gl_FragColor = vec4(color, 1.0); // Output color
    //         }
    //     `;

    //     // Create the sky material
    //     const skyMaterial = new THREE.ShaderMaterial({
    //         vertexShader,
    //         fragmentShader,
    //         uniforms: {
    //             topColor: { value: new THREE.Color(0x87CEEB) }, // Light blue
    //             bottomColor: { value: new THREE.Color(0xFFFFFF) }, // White
    //             offset: { value: 33 },
    //             exponent: { value: 0.6 },
    //         },
    //         side: THREE.BackSide, // Render the inside of the sphere
    //     });

    //     // Create a large sphere for the sky
    //     const skyGeometry = new THREE.SphereGeometry(500, 32, 32); // Large radius
    //     const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    //     this.scene.add(sky);
    // }

    addSkySphere() {
        // Load the HDRI texture
        const loader = new RGBELoader();
        loader.load("http://localhost:5173/sky.hdr", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            // Set the scene background and environment
            this.scene.background = texture;
            this.scene.environment = texture;
        });
    }
}