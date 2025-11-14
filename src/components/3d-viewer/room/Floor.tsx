/**
 * Floor - 3D floor plane
 */

import React from 'react';

interface FloorProps {
  width: number;
  depth: number;
  position?: [number, number, number];
  color?: string;
}

const Floor: React.FC<FloorProps> = ({
  width,
  depth,
  position = [0, 0, 0],
  color = '#cccccc'
}) => {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Floor;
