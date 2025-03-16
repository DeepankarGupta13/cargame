import * as THREE from 'three';
import GrassField from './GrassField';
import Car from './Car';

export default class Ground {
    constructor(stage) {
        this.stage = stage;
        this.numBlades = 589945;
        this.windStrength = 0.1;

        this.width = 100;
        this.height = 100;

        this.material = null;

        this.load();
    }

    load() {
        this.createGround();
        this.createGrassField();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(this.width, this.height);
        const groundMaterial = this.getGroundMaterial();
        const plane = new THREE.Mesh(groundGeometry, groundMaterial);
        plane.rotation.x = - Math.PI / 2;
        this.plane = plane;
        this.stage.sceneManager.add(this.plane);
    }

    removeGround() {
        this.stage.sceneManager.remove(this.plane);
        this.plane.geometry.dispose();
        this.plane.material.dispose();
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;
        this.removeGround();
        this.createGround();

        this.grassField.height = height;
        this.grassField.width = width;
        this.grassField.updateGrassObject();
    }

    updateNoOfGrassBlades(numBlades) {
        this.grassField.numBlades = numBlades;
        this.grassField.updateGrassObject();
    }

    updateWindStrength(windStrength) {
        this.windStrength = windStrength;
        this.grassField.updateWindStrength(this.windStrength);
    }

    updateGrassRotation(grassRotate) {
        this.grassField.setGrassRotate(grassRotate);
        this.grassField.updateGrassObject();
    }

    createGrassField() {
        this.grassField = new GrassField(this.stage, this.width, this.height, this.numBlades, this.windStrength);
        this.stage.sceneManager.add(this.grassField.grassMesh);
        this.grassField.startAnimation();
    }

    getGroundMaterial() {
        if (this.material) return this.material;
        const texture = new THREE.TextureLoader().load('http://localhost:5173/groundTexture.png'); 
        // immediately use the texture for material creation 

        const material = new THREE.MeshBasicMaterial( { map:texture } );
        this.material = material;
        return this.material;
    }

    getGroundShaderMaterial() {
        return new THREE.ShaderMaterial({
            vertexShader: this.createVertexShader(),
            fragmentShader: this.createFragmentShader(),
            side: THREE.DoubleSide, // Render both sides of the grass blades
        });
    }

    createVertexShader() {
        return `
            varying vec2 vUv; // UV coordinates to pass to the fragment shader

            void main() {
                vUv = uv; // Pass UV coordinates to the fragment shader
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    createFragmentShader() {
        return `
            varying vec2 vUv; // UV coordinates passed from the vertex shader

            // Simplex noise function (you can replace this with any noise function)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 100.0)) * 100.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 100.0)) * 100.0; }
            vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
            }

            // Function to generate fractal noise
            float fbm(vec3 p) {
                float total = 0.0;
                float frequency = 1.0;
                float amplitude = 1.0;
                float persistence = 0.5;
                int octaves = 10;

                for (int i = 0; i < octaves; i++) {
                    total += snoise(p * frequency) * amplitude;
                    frequency *= 2.0;
                    amplitude *= persistence;
                }

                return total;
            }

            void main() {
                vec2 uv = vUv * 10.0; // Scale UV coordinates for more detail

                // Generate noise for ground texture
                float noise = fbm(vec3(uv, 0.0));

                // Base colors
                vec3 dirtColor = vec3(0.4, 0.3, 0.2); // Brown dirt color
                vec3 grassColor = vec3(0.1, 0.4, 0.1); // Dark green grass color

                // Blend between dirt and grass based on noise
                float dirtAmount = smoothstep(0.3, 0.7, noise);
                vec3 groundColor = mix(dirtColor, grassColor, dirtAmount);

                // Add small dirt particles
                float dirtParticles = fbm(vec3(uv * 50.0, 0.0));
                dirtParticles = smoothstep(0.4, 0.6, dirtParticles);
                groundColor = mix(groundColor, dirtColor, dirtParticles * 0.3);

                // Add dark green patches
                float grassPatches = fbm(vec3(uv * 20.0, 10.0));
                grassPatches = smoothstep(0.5, 0.7, grassPatches);
                groundColor = mix(groundColor, grassColor, grassPatches * 0.2);

                // Output final color
                gl_FragColor = vec4(groundColor, 1.0);
            }
        `;
    }
}