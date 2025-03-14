import * as THREE from "three";

/**
 * TODO: 
 * 1. Increase the number of vertices to 15 for a more detailed grass blade
 * 2. move those vertices smothly to simulate wind effect
 * 3. Add a color gradient to the grass blades for a more realistic look in the fragment shader
 * 4. curve the normal to have a more realistic look instead of a flat surface grass
 */

export default class GrassField {
  constructor(width, height, numBlades, windStrength) {
    this.width = width; // Width of the grass field
    this.height = height; // Height of the grass field
    this.numBlades = numBlades; // Number of grass blades
    this.windStrength = windStrength; // Strength of the wind effect

    // Create the grass field
    this.grassMesh = this.createGrassField();
  }

  createGrassField() {
    const grassGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 0.1, 0, 0, 0.05, 1, 0]);
    grassGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );

    const instancedMesh = new THREE.InstancedMesh(
      grassGeometry,
      this.grassMaterial(),
      this.numBlades
    );

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < this.numBlades; i++) {
      const x = (Math.random() - 0.5) * this.width;
      const z = (Math.random() - 0.5) * this.height;
      const y = 0;

      const scale = 0.5 + Math.random() * 0.5;
      matrix.makeScale(1, scale, 1);

      // TODO: make tiles on the ground and place grass on them for position
      // divide the ground into tiles and place grass on them
      matrix.setPosition(x, y, z);
      matrix.multiply(
        new THREE.Matrix4().makeRotationY(Math.random() * Math.PI * 2)
      );

      instancedMesh.setMatrixAt(i, matrix);
    }

    return instancedMesh;
  }

  grassMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: this.grassVertexShader(), // Vertex shader for grass animation
      fragmentShader: this.grassFragmentShader(), // Fragment shader for grass color
      uniforms: {
        time: { value: 0 }, // Time uniform for wind animation
        windStrength: { value: this.windStrength }, // Wind strength uniform
      },
      side: THREE.DoubleSide, // Render both sides of the grass blades
      transparent: true, // Enable transparency for better blending
    });
  }

  // Vertex shader for grass animation
  grassVertexShader() {
    return `
      uniform float time; // Time uniform for wind animation
      uniform float windStrength; // Wind strength uniform

      void main() {
        // Get the original position of the vertex
        vec3 pos = position;

        // Simulate wind effect using a sine wave
        float wind = sin(pos.y * 2.0 + time * 2.0) * windStrength; // Wind effect based on height and time
        pos.x += wind * (1.0 - pos.y); // Bend the grass blade based on height

        // Transform the position to screen space
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    `;
  }

  // Fragment shader for grass color
  grassFragmentShader() {
    return `
      void main() {
        // Set the color of the grass blades
        gl_FragColor = vec4(0.2, 0.8, 0.2, 1.0); // Green color for grass
      }
    `;
  }

  // Update the grass field (call this in the animation loop)
  update(time) {
    this.grassMesh.material.uniforms.time.value = time; // Update time for wind animation
  }
}
