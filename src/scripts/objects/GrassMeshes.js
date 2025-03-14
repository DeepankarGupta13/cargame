import * as THREE from "three";

const GRASS_BLADES = 1024;
const GRASS_BLADE_VERTICES = 15;
const NUM_GRASS_X = 32;
const NUM_GRASS_Y = 32;
const GRASS_PATH_SIZE = 0.5;

export default class GrassMeshes {
    constructor(stage) {
        this.stage = stage;

        this.grassGeom = this.CreateTileGeometry();
        this.grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
        });

        this.grassMesh = new THREE.Mesh(this.grassGeom, this.grassMaterial);
        this.stage.sceneManager.add(this.grassMesh);
    }

    CreateTileGeometry() {
        function rand_range(min, max) {
            return Math.random() * (max - min) + min;
        }

        function CreateIndexBuffer() {
            const indices = [];
            for (let i = 0; i < GRASS_BLADES; ++i) {
                const baseIndex = i * GRASS_BLADE_VERTICES;
                for (let j = 0; j < GRASS_BLADE_VERTICES - 2; ++j) {
                    indices.push(baseIndex + j);
                    indices.push(baseIndex + j + 1);
                    indices.push(baseIndex + j + 2);
                }
            }
            return new Uint16Array(indices);
        }

        let offsets = [];
        for (let i = 0; i < NUM_GRASS_X; ++i) {
            const x = i / NUM_GRASS_Y - 0.5;
            for (let j = 0; j < NUM_GRASS_X; ++j) {
                const y = j / NUM_GRASS_Y - 0.5;
                offsets.push(x * GRASS_PATH_SIZE + rand_range(-0.2, 0.2));
                offsets.push(y * GRASS_PATH_SIZE + rand_range(-0.2, 0.2));
                offsets.push(0);
            }
        }

        if (offsets.length === 0) {
            console.error("Offsets array is empty. Check your loop logic.");
            return;
        }

        const offsetsData = new Uint16Array(
            offsets.map(THREE.DataUtils.toHalfFloat)
        );

        const vertID = new Uint8Array(GRASS_BLADE_VERTICES);
        for (let i = 0; i < GRASS_BLADE_VERTICES; ++i) {
            vertID[i] = i;
        }

        const geo = new THREE.InstancedBufferGeometry();
        geo.instanceCount = GRASS_BLADES;
        geo.setAttribute("vertIndex", new THREE.Uint8BufferAttribute(vertID, 1));
        geo.setAttribute(
            "position",
            new THREE.InstancedBufferAttribute(offsetsData, 3)
        );
        geo.setIndex(CreateIndexBuffer());
        return geo;
    }
}
