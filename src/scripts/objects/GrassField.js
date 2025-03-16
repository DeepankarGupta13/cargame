import * as THREE from "three";

export default class GrassField {
  constructor(stage, width, height, numBlades, windStrength) {
    this.stage = stage; // Stage object to add the grass field
    this.width = width; // Width of the grass field
    this.height = height; // Height of the grass field
    this.numBlades = numBlades; // Number of grass blades
    this.windStrength = windStrength; // Strength of the wind effect

    // Initialize wind direction
    this.windDirection = new THREE.Vector2(1, 0); // Initial wind direction

    // Create the grass field
    this.grassMesh = this.createGrassField();
    this.outlineMesh = this.createOutlineMesh(); // Create outline mesh
  }

  createGrassField() {
    const grassGeometry = this.createGrassGeometry();
    const instancedMesh = new THREE.InstancedMesh(
      grassGeometry,
      this.grassMaterial(),
      this.numBlades
    );

    this.setInstanceMatrices(instancedMesh);
    return instancedMesh;
  }

  createOutlineMesh() {
    const grassGeometry = this.createGrassGeometry();
    const outlineMaterial = new THREE.ShaderMaterial({
      vertexShader: this.grassVertexShader(), // Use the same vertex shader
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black color for outlines
        }
      `,
      uniforms: {
        time: { value: 0 }, // Time uniform for wind animation
        windStrength: { value: this.windStrength }, // Wind strength uniform
        windDirection: { value: new THREE.Vector2(1, 0) }, // Wind direction uniform
      },
      side: THREE.DoubleSide,
    });

    const outlineMesh = new THREE.InstancedMesh(
      grassGeometry,
      outlineMaterial,
      this.numBlades
    );

    // Slightly scale up the outline mesh to make it visible behind the grass
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < this.numBlades; i++) {
      matrix.makeScale(0.1,0.1,0.1); // Scale up by 10%
      outlineMesh.setMatrixAt(i, matrix);
    }

    return outlineMesh;
  }

  createGrassGeometry() {
    const grassGeometry = new THREE.BufferGeometry();
    const numVertices = 15; // Number of vertices per grass blade
    const slimScale = 10;
    const vertices = new Float32Array(numVertices * 3); // 3 components (x, y, z) per vertex
    const indices = []; // Indices to define the triangles

    // Create a more detailed grass blade with 15 vertices
    for (let i = 0; i < numVertices; i++) {
      const t = i / (numVertices - 1) / slimScale; // Normalized height along the blade (0 to 1)
      const y = Math.sin(t * slimScale * Math.PI); // Slight curve for the grass blade
      const x = t * 0.6; // Height of the grass blade
      const z = 0;

      // Set vertex positions
      vertices[i * 3] = x;
      vertices[i * 3 + 1] = y;
      vertices[i * 3 + 2] = z;
    }

    for (let i = 0; i <= parseInt(numVertices / 2, 10); i++) {
      indices.push(i, i + 1, numVertices - i - 1);
      if (i != parseInt(numVertices / 2, 10))
        indices.push(numVertices - i - 1, i + 1, numVertices - i - 2);
    }

    // Set attributes for the geometry
    grassGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );
    grassGeometry.setIndex(indices);

    return grassGeometry;
  }

  setInstanceMatrices(instancedMesh) {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < this.numBlades; i++) {
      const x = (Math.random() - 0.5) * this.width;
      const z = (Math.random() - 0.5) * this.height;
      const y = 0;

      const scale = 0.5 + Math.random() * 0.5;
      matrix.makeScale(1, scale, 1);

      // Position each grass blade
      matrix.setPosition(x, y, z);

      instancedMesh.setMatrixAt(i, matrix);
    }
  }

  grassMaterial() {
    return new THREE.ShaderMaterial({
      vertexShader: this.grassVertexShader(), // Vertex shader for grass animation
      fragmentShader: this.grassFragmentShader(), // Fragment shader for grass color
      uniforms: {
        time: { value: 0 }, // Time uniform for wind animation
        windStrength: { value: this.windStrength }, // Wind strength uniform
        windDirection: { value: new THREE.Vector2(1, 0) }, // Wind direction uniform
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
      uniform vec2 windDirection; // Wind direction uniform

      // Function to create a 3x3 rotation matrix around the X-axis
      mat3 rotateX(float angle) {
          return mat3(
              1.0, 0.0, 0.0,
              0.0, cos(angle), -sin(angle),
              0.0, sin(angle), cos(angle)
          );
      }

      varying vec3 vPosition; // Varying variable to pass the position to the fragment shader

      void main() {
          // Get the original position of the vertex
          vec3 pos = position;

          vPosition = pos; // Pass the position to the fragment shader

          // Calculate height percentage (normalized height along the blade)
          float heightPercent = pos.y;
          
          // Random lean for each grass blade (you can pass this as a uniform or generate it)
          float randomLean = sin(time + pos.y) * 0.3; // Example random lean
          
          // Calculate curve amount based on random lean and height percentage
          float curveAmount = sin(randomLean * heightPercent);

          // noise for wind effect
          float noiseSample = sin(((time*0.35) + pos.y));
          
          curveAmount += noiseSample * windStrength;

          // Apply wind direction to the curve amount
          curveAmount *= windDirection.x; // Use windDirection.x to influence the curve

          // Create a 3x3 rotation matrix around the X-axis
          mat3 grassMat = rotateX(curveAmount);

          // Apply the rotation to the grass vertex position
          vec3 grassVertexPosition = grassMat * vec3(pos.x, pos.y, 0.0);

          // Transform the position to screen space
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(grassVertexPosition, 1.0);
      }
    `;
  }

  // Fragment shader for grass color
  grassFragmentShader() {
    return `
      varying vec3 vPosition; // Varying variable to pass the position to the fragment shader
      void main() {
        vec3 baseColor = vec3(0.0, 0.5, 0.0); // Base color for the grass
        vec3 tipColor = vec3(0.5, 0.5, 0.1);  // Tip color for the grass

        // Use the v-coordinate of the UV to determine the gradient
        float gradientFactor = vPosition.y; // Assuming vPosition.y is normalized (0 at base, 1 at tip)

        // Interpolate between baseColor and tipColor
        vec3 diffuseColor = mix(baseColor, tipColor, clamp(gradientFactor, 0.0, 1.0));

        vec3 ambientLightColor = vec3(0.2, 0.2, 0.2); // Soft white ambient light
        float ambientIntensity = 1.0; // Intensity of ambient light

        // Calculate ambient light contribution
        vec3 ambient = ambientLightColor * ambientIntensity;

        // Light direction (example: light coming from the top-right)
        vec3 lightDirection = normalize(vec3(10.0, 10.0, 10.0));

        // Surface normal (assuming it's passed from the vertex shader)
        vec3 normal = normalize(vec3(0.5, 1, 0));

        // Diffuse reflection calculation
        float diffuseIntensity = max(dot(normal, lightDirection), 0.2);
        vec3 diffuseReflection = diffuseColor * diffuseIntensity;

        // Combine ambient and diffuse reflection
        vec3 finalColor = ambient + diffuseReflection;

        // Set the final color
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
  }

  // Update the grass field
  update(time) {
    this.grassMesh.material.uniforms.time.value = time; // Update time for wind animation
    this.outlineMesh.material.uniforms.time.value = time; // Update time for outline mesh

    // Update wind direction over time
    const angle = Math.sin(time) * Math.PI * 0.25; // Oscillate wind direction
    this.windDirection.set(Math.cos(angle), Math.sin(angle));
    this.grassMesh.material.uniforms.windDirection.value.copy(this.windDirection);
    this.outlineMesh.material.uniforms.windDirection.value.copy(this.windDirection);
  }

  startAnimation() {
    this.interval = setInterval(() => {
      const now = Date.now();
      this.update(Math.sin(now * 2.0) * 0.5 + 0.5);
    }, 100);
  }

  stopAnimation() {
    clearInterval(this.interval);
  }
}