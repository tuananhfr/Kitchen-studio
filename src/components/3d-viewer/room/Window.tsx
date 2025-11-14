/**
 * Window - 3D window model (simplified)
 */

import React from 'react';
import type { Window3D } from '../../../utils/floorPlanTo3D';

interface WindowProps {
  window: Window3D;
  frameColor?: string;
  glassColor?: string;
}

const Window: React.FC<WindowProps> = ({
  window,
  frameColor = '#87ceeb',
  glassColor = '#a0d8ef'
}) => {
  const [width, height, depth] = window.dimensions;

  return (
    <group position={window.position} rotation={window.rotation}>
      {/* Window frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>

      {/* Glass pane */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[width * 0.9, height * 0.9]} />
        <meshStandardMaterial
          color={glassColor}
          transparent
          opacity={0.4}
          side={2}
        />
      </mesh>

      {/* Window dividers */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1, height, depth]} />
        <meshStandardMaterial color={frameColor} />
      </mesh>
    </group>
  );
};

export default Window;
