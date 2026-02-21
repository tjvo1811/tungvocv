
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Stars, Environment, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const DataNode = ({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.1;
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.z = t * 0.1;
    }
  });

  return (
    <Icosahedron ref={ref} args={[1, 0]} position={position} scale={scale}>
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.8}
        wireframe
      />
    </Icosahedron>
  );
};

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <DataNode position={[0, 0, 0]} color="#C5A059" scale={1.5} />
          
           {/* Connectivity Rings */}
           <Torus args={[3.5, 0.02, 16, 100]} rotation={[Math.PI / 2.5, 0, 0]}>
                <meshBasicMaterial color="#333" transparent opacity={0.2} />
           </Torus>
           <Torus args={[4, 0.02, 16, 100]} rotation={[Math.PI / 3, Math.PI/4, 0]}>
                <meshBasicMaterial color="#333" transparent opacity={0.1} />
           </Torus>
        </Float>
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <DataNode position={[-3, 1.5, -2]} color="#44403C" scale={0.6} />
           <DataNode position={[3, -1.5, -3]} color="#C5A059" scale={0.7} />
        </Float>

        <Environment preset="city" />
        <Stars radius={100} depth={50} count={800} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
};

export const GlobalScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#C5A059" />
        <Environment preset="studio" />
        
        <Float rotationIntensity={0.4} floatIntensity={0.2} speed={1}>
          <group>
            {/* Abstract Globe */}
            <Sphere args={[1.5, 32, 32]}>
               <meshStandardMaterial color="#1c1917" roughness={0.5} metalness={0.5} />
            </Sphere>
            {/* Latitude/Longitude lines */}
            <Sphere args={[1.51, 16, 16]}>
               <meshStandardMaterial color="#C5A059" wireframe transparent opacity={0.3} />
            </Sphere>
            
            {/* Orbiting Elements */}
            <group rotation={[0, 0, Math.PI / 4]}>
                <Torus args={[2.2, 0.05, 16, 64]}>
                     <meshStandardMaterial color="#57534e" metalness={0.8} />
                </Torus>
                <Sphere args={[0.2, 16, 16]} position={[2.2, 0, 0]}>
                     <meshStandardMaterial color="#C5A059" emissive="#C5A059" emissiveIntensity={2} />
                </Sphere>
            </group>
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
