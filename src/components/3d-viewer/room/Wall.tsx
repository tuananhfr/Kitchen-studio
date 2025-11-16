/**
 * Wall - 3D wall with cutouts for doors/windows
 */

import { useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import type { Wall3D } from '../../../utils/floorPlanTo3D';

interface WallProps {
  wall: Wall3D;
  color?: string;
  opacityValue?: number;
}

const Wall = forwardRef<THREE.Mesh, WallProps>(({ wall, color = '#f5f5f5', opacityValue = 1 }, ref) => {
  /**
   * Create wall geometry with cutouts using CSG (Constructive Solid Geometry)
   * For simplicity, we'll just render the wall box for now
   * TODO: Implement actual cutouts with CSG or custom BufferGeometry
   */
  const wallGeometry = useMemo(() => {
    const [width, height, depth] = wall.dimensions;
    return new THREE.BoxGeometry(width, height, depth);
  }, [wall.dimensions]);

  // Determine visibility based on opacity
  const showFullWall = opacityValue > 0.5;

  // Calculate footprint dimensions
  const [width, , depth] = wall.dimensions;
  const footprintHeight = 0.5; // Very thin plane just above floor

  return (
    <group>
      {/* Wall footprint on floor - always visible with wall color */}
      <mesh
        position={[wall.position[0], footprintHeight / 2, wall.position[2]]}
        rotation={wall.rotation}
        receiveShadow
      >
        <boxGeometry args={[width, footprintHeight, depth]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Main wall - visible when opacity > 0.5 */}
      {showFullWall && (
        <mesh
          ref={ref}
          position={wall.position}
          rotation={wall.rotation}
          geometry={wallGeometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Cutouts visualization - temporarily hidden to debug */}
      {/* {wall.cutouts.map((cutout) => (
        <mesh
          key={cutout.id}
          position={cutout.position}
          rotation={wall.rotation}
        >
          <boxGeometry args={[cutout.dimensions[0], cutout.dimensions[1], cutout.dimensions[2] + 2]} />
          <meshStandardMaterial color="#333333" opacity={0.5} transparent />
        </mesh>
      ))} */}
    </group>
  );
});

Wall.displayName = 'Wall';

export default Wall;
