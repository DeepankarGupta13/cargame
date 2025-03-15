import * as THREE from "three";

export default class GrassField {
  constructor(stage, width, height, numBlades, windStrength) {
    this.stage = stage; // Stage object to add the grass field
    this.width = width; // Width of the grass field
    this.height = height; // Height of the grass field
    this.numBlades = numBlades; // Number of grass blades
    this.windStrength = windStrength; // Strength of the wind effect

    // Create the grass field
    this.grassMesh = this.createGrassField();
  }

  createGrassField() {
    const grassGeometry = new THREE.BufferGeometry();
    const numVertices = 15; // Number of vertices per grass blade
    const slimScale = 10;
    const vertices = new Float32Array(numVertices * 3); // 3 components (x, y, z) per vertex
    const uvs = new Float32Array(numVertices * 2); // 2 components (u, v) per vertex
    const indices = []; // Indices to define the triangles
  
    // Create a more detailed grass blade with 15 vertices
    for (let i = 0; i < numVertices; i++) {
      const t = (i / (numVertices - 1)) / slimScale; // Normalized height along the blade (0 to 1)
      const y = Math.sin(t * slimScale * Math.PI); // Slight curve for the grass blade
      const x = Math.cos(t * slimScale * Math.PI); // Height of the grass blade
      const z = 0;
  
      // Set vertex positions
      vertices[i * 3] = x;
      vertices[i * 3 + 1] = y;
      vertices[i * 3 + 2] = z;
  
      // Set UVs (texture coordinates)
      uvs[i * 2] = t; // U coordinate (along the blade)
      uvs[i * 2 + 1] = 0; // V coordinate (across the blade)
    }
  
    for (let i = 0; i <= parseInt(numVertices/2, 10); i++) {
      indices.push(i, i + 1, numVertices - i - 1);
      if (i != parseInt(numVertices/2, 10))
      indices.push(numVertices - i - 1, i + 1, numVertices - i - 2);
    }
  
    // Set attributes for the geometry
    grassGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    grassGeometry.setIndex(indices);

    // Create the instanced mesh
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
  
      // Position and rotate each grass blade
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

        // // Simulate wind effect using a sine wave
        // float wind = sin(pos.y * 5.0 + time * 2.0) * windStrength; // Wind effect based on height and time
        // pos.x += wind * (1.0 - pos.y); // Bend the grass blade based on height

        // // Curve the normal for a more realistic look
        // vec3 normal = vec3(-wind * 0.5, 1.0, 0.0);
        // normal = normalize(normal);

        // // Transform the position to screen space
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    `;
  }

  // Fragment shader for grass color
  grassFragmentShader() {
    return `
      void main() {
        // Set the color of the grass blades with a gradient
        vec3 color = mix(vec3(0.2, 0.6, 0.1), vec3(0.3, 0.8, 0.2), gl_FragCoord.y / 500.0);
        gl_FragColor = vec4(color, 1.0); // Green color for grass with gradient
      }
    `;
  }

  // Update the grass field
  update(time) {
    this.grassMesh.material.uniforms.time.value = time; // Update time for wind animation
  }
}