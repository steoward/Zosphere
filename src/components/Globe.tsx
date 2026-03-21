import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store/useStore";

// Custom shader for the atmospheric halo effect
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    // Tighter fresnel for a realistic thin atmosphere
    float fresnel = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
    
    // Sun direction matching the directional light
    vec3 sunDir = normalize(vec3(5.0, 3.0, -5.0));
    
    // Calculate sun alignment
    float sunAlign = max(0.0, dot(vNormal, sunDir));
    
    // Colors
    vec3 atmosphereColor = vec3(0.1, 0.4, 0.9); // Deep blue
    vec3 sunColor = vec3(0.9, 0.95, 1.0); // Bright white-blue
    
    // Mix colors based on sun alignment
    vec3 finalColor = mix(atmosphereColor, sunColor, pow(sunAlign, 4.0));
    
    // Alpha: subtle everywhere, bright near the sun
    float alpha = fresnel * (0.1 + pow(sunAlign, 2.0) * 2.0);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function RealisticEarth() {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load high-resolution textures (Using night map for city lights)
  const [nightMap, bumpMap, specularMap, cloudsMap] = useTexture([
    "https://unpkg.com/three-globe/example/img/earth-night.jpg",
    "https://unpkg.com/three-globe/example/img/earth-topology.png",
    "https://unpkg.com/three-globe/example/img/earth-water.png",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0003; // Slower, more cinematic rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0004;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Earth Sphere */}
      <Sphere args={[2, 128, 128]}>
        <meshPhongMaterial
          map={nightMap}
          bumpMap={bumpMap}
          bumpScale={0.02}
          specularMap={specularMap}
          specular={new THREE.Color(0x3399ff)}
          shininess={100}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xffffff)}
          emissiveIntensity={1.2} // Boost city lights
        />
      </Sphere>

      {/* Clouds Sphere */}
      <Sphere args={[2.015, 128, 128]} ref={cloudsRef}>
        <meshLambertMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </Sphere>

      {/* Atmospheric Halo (Custom Shader) - Tightened for realism */}
      <Sphere args={[2.08, 64, 64]}>
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent={true}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}

export function Globe() {
  const { theme } = useStore();
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
        {/* Cinematic Lighting Setup */}
        
        {/* Very subtle dark blue ambient light for the dark side of the earth */}
        <ambientLight intensity={0.05} color="#0a1a3a" />
        
        {/* Key Light (Main Sun) - Positioned to match the shader */}
        <directionalLight 
          position={[5, 3, -5]} 
          intensity={4} 
          color="#ffffff" 
        />
        
        {/* Soft Fill Light - To slightly illuminate the clouds and oceans on the dark side */}
        <directionalLight 
          position={[-5, 3, 5]} 
          intensity={0.2} 
          color="#1e3a8a" 
        />
        
        {isDark && (
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={3}
            saturation={0}
            fade
            speed={0.5}
          />
        )}

        <Suspense fallback={null}>
          <RealisticEarth />
        </Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.4}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}



