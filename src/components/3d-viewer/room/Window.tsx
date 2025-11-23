/**
 * Window - 3D window model
 * Uses custom geometry with world coordinates (EXACTLY like wall and door)
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Window3D } from '../../../utils/floorPlanTo3D';

interface WindowProps {
  window: Window3D;
  frameColor?: string;
}

const Window: React.FC<WindowProps> = ({
  window,
  frameColor = '#444444'
}) => {
  const [width, height, depth] = window.dimensions;

  // Create custom geometry EXACTLY like wall (vertices in world coordinates)
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Window center position in world space
    const centerX = window.position[0];
    const centerY = window.position[1];
    const centerZ = window.position[2];

    // Window rotation angle
    const angle = window.rotation[1];

    // Calculate 4 corners of window (like wall corners)
    const halfWidth = width / 2;
    const halfThickness = depth / 2;

    // Corner offsets in local space (before rotation)
    const corners = [
      { x: -halfWidth, z: -halfThickness }, // c0
      { x: -halfWidth, z: +halfThickness }, // c1
      { x: +halfWidth, z: +halfThickness }, // c2
      { x: +halfWidth, z: -halfThickness }, // c3
    ];

    // Rotate corners by angle and translate to world position
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const worldCorners = corners.map(c => ({
      x: centerX + c.x * cosAngle - c.z * sinAngle,
      z: centerZ + c.x * sinAngle + c.z * cosAngle
    }));

    // Create vertices (8 points: 4 bottom + 4 top)
    const bottomY = centerY - height / 2;
    const topY = centerY + height / 2;

    const vertices = new Float32Array([
      // Bottom face
      worldCorners[0].x, bottomY, worldCorners[0].z,  // 0
      worldCorners[1].x, bottomY, worldCorners[1].z,  // 1
      worldCorners[2].x, bottomY, worldCorners[2].z,  // 2
      worldCorners[3].x, bottomY, worldCorners[3].z,  // 3

      // Top face
      worldCorners[0].x, topY, worldCorners[0].z,  // 4
      worldCorners[1].x, topY, worldCorners[1].z,  // 5
      worldCorners[2].x, topY, worldCorners[2].z,  // 6
      worldCorners[3].x, topY, worldCorners[3].z,  // 7
    ]);

    // Indices (same as wall and door)
    const indices = new Uint16Array([
      0, 2, 1, 0, 3, 2,  // Bottom
      4, 5, 6, 4, 6, 7,  // Top
      0, 1, 5, 0, 5, 4,  // Side 1
      1, 2, 6, 1, 6, 5,  // Side 2
      2, 3, 7, 2, 7, 6,  // Side 3
      3, 0, 4, 3, 4, 7,  // Side 4
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(new THREE.BufferAttribute(indices, 1));
    geo.computeVertexNormals();

    return geo;
  }, [width, height, depth, window.position, window.rotation]);

  // Render EXACTLY like wall: rotation=[0,0,0], position=[0,0,0]
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={frameColor} />
    </mesh>
  );
};

export default Window;
