/**
 * Door - 3D door model (simplified)
 */

import React from 'react';
import type { Door3D } from '../../../utils/floorPlanTo3D';

interface DoorProps {
  door: Door3D;
  color?: string;
}

const Door: React.FC<DoorProps> = ({ door, color = '#8b4513' }) => {
  const [width, height, thickness] = door.dimensions;

  return (
    <group position={door.position} rotation={door.rotation}>
      {/* Door frame */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, thickness]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Door handle */}
      <mesh position={[width * 0.4, 0, thickness / 2 + 2]} castShadow>
        <cylinderGeometry args={[1.5, 1.5, 3, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

export default Door;
