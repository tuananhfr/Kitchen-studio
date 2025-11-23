/**
 * Wall - 3D wall with cutouts for doors/windows
 */

import { useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import type { Wall3D } from '../../../utils/floorPlanTo3D';
import type { Wall as Wall2D } from '../../../types';
import { createWallGeometry } from '../../../utils/wall3DGeometry';
import { detectJunctions, getAdjustedWallCorners } from '../../../utils/wallJunctions';

interface WallProps {
  wall: Wall3D;
  walls2D: Wall2D[];
  color?: string;
  opacityValue?: number;
}

const Wall = forwardRef<THREE.Mesh, WallProps>(({ wall, walls2D, color = '#f5f5f5', opacityValue = 1 }, ref) => {
  /**
   * Create wall geometry with adjusted corners (matching 2D rendering)
   */
  const customGeometry = useMemo(() => {
    return createWallGeometry(wall, walls2D);
  }, [wall, walls2D]);

  /**
   * Create footprint geometry - EXACTLY like 2D fill between outer and inner lines
   * Use same 4 adjusted corners from 2D, extrude to 0.5cm height
   */
  const footprintGeometry = useMemo(() => {
    // Find the corresponding 2D wall
    const wall2D = walls2D.find(w => w.id === wall.id);
    if (!wall2D) return null;

    // Detect junctions
    const junctions = detectJunctions(walls2D);

    // Get adjusted corners from 2D (SAME as 2D rendering!)
    const adjustedCorners2D = getAdjustedWallCorners(wall2D, walls2D, junctions);
    if (!adjustedCorners2D || adjustedCorners2D.length !== 4) return null;

    // Use corners as-is (2D coordinates already correct)
    const c0 = adjustedCorners2D[0];
    const c1 = adjustedCorners2D[1];
    const c2 = adjustedCorners2D[2];
    const c3 = adjustedCorners2D[3];

    const geometry = new THREE.BufferGeometry();
    const footprintHeight = 0.5;

    // Vertices: 8 points (4 at bottom y=0, 4 at top y=footprintHeight)
    const vertices = new Float32Array([
      // Bottom face (y=0)
      c0.x, 0, c0.y,  // 0
      c1.x, 0, c1.y,  // 1
      c2.x, 0, c2.y,  // 2
      c3.x, 0, c3.y,  // 3

      // Top face (y=footprintHeight)
      c0.x, footprintHeight, c0.y,  // 4
      c1.x, footprintHeight, c1.y,  // 5
      c2.x, footprintHeight, c2.y,  // 6
      c3.x, footprintHeight, c3.y,  // 7
    ]);

    // Indices for triangles
    const indices = new Uint16Array([
      // Bottom face
      0, 2, 1,
      0, 3, 2,

      // Top face
      4, 5, 6,
      4, 6, 7,

      // Side faces
      0, 1, 5,
      0, 5, 4,

      1, 2, 6,
      1, 6, 5,

      2, 3, 7,
      2, 7, 6,

      3, 0, 4,
      3, 4, 7,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    return geometry;
  }, [wall, walls2D]);

  /**
   * Create wall segments - all walls use custom geometry (with adjusted corners)
   * Doors/windows are hidden inside the wall for now
   */
  const wallSegments = useMemo(() => {
    // Always use custom geometry regardless of cutouts
    return [{
      geometry: customGeometry,
      position: [0, 0, 0] as [number, number, number]
    }];
  }, [customGeometry]);

  /**
   * OLD: Create wall geometry with cutouts using THREE.Shape with holes
   */
  // @ts-ignore - Keeping for reference
  const wallGeometry_OLD = useMemo(() => {
    const [width, height, depth] = wall.dimensions;

    // If no cutouts, return simple box
    if (wall.cutouts.length === 0) {
      return new THREE.BoxGeometry(width, height, depth);
    }

    // Create wall shape with cutouts (holes)
    const shape = new THREE.Shape();

    // Main wall rectangle (centered at origin)
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    shape.moveTo(-halfWidth, -halfHeight);
    shape.lineTo(halfWidth, -halfHeight);
    shape.lineTo(halfWidth, halfHeight);
    shape.lineTo(-halfWidth, halfHeight);
    shape.lineTo(-halfWidth, -halfHeight);

    // Add holes for doors/windows
    // Cutouts from floorPlanTo3D have absolute world positions
    // We need to convert them to wall's local coordinate system
    wall.cutouts.forEach(cutout => {
      const hole = new THREE.Path();

      // Get cutout position in world space
      const cutoutWorldX = cutout.position[0];
      const cutoutWorldY = cutout.position[1];
      const cutoutWorldZ = cutout.position[2];

      // Get wall position in world space
      const wallWorldX = wall.position[0];
      const wallWorldY = wall.position[1];
      const wallWorldZ = wall.position[2];

      // Calculate offset from wall center in world space
      const offsetX = cutoutWorldX - wallWorldX;
      const offsetY = cutoutWorldY - wallWorldY;
      const offsetZ = cutoutWorldZ - wallWorldZ;

      // Wall rotation around Y axis
      const wallRotationY = wall.rotation[1];

      // Transform offset to wall's local coordinate system
      // Rotate offset by -wallRotationY around Y axis
      const cosAngle = Math.cos(-wallRotationY);
      const sinAngle = Math.sin(-wallRotationY);

      const localX = offsetX * cosAngle - offsetZ * sinAngle;
      const localY = offsetY;

      // For the 2D shape (XY plane), we use localX as X and localY as Y
      const cutoutHalfWidth = cutout.dimensions[0] / 2;
      const cutoutHalfHeight = cutout.dimensions[1] / 2;

      // Calculate cutout bounds
      let cutoutBottom = localY - cutoutHalfHeight;
      const cutoutTop = localY + cutoutHalfHeight;

      // For doors (cutouts that go to floor), extend to bottom of wall to prevent remnants
      // Use -halfHeight + 0.1 to avoid ExtrudeGeometry edge case issues
      if (cutout.type === 'door' || cutoutBottom > -halfHeight + 5) {
        cutoutBottom = -halfHeight + 0.1;
      }

      // Clamp cutoutTop to not exceed wall top
      const clampedCutoutTop = Math.min(cutoutTop, halfHeight - 0.1);

      console.log(`Cutout ${cutout.id}:`, {
        type: cutout.type,
        localX: localX.toFixed(2),
        localY: localY.toFixed(2),
        cutoutBottom: cutoutBottom.toFixed(2),
        cutoutTop: cutoutTop.toFixed(2),
        clampedTop: clampedCutoutTop.toFixed(2),
        wallBottom: (-halfHeight).toFixed(2),
        wallTop: halfHeight.toFixed(2)
      });

      // Create rectangle hole - COUNTER-CLOCKWISE winding (same as outer shape for holes)
      hole.moveTo(localX - cutoutHalfWidth, cutoutBottom);
      hole.lineTo(localX + cutoutHalfWidth, cutoutBottom);
      hole.lineTo(localX + cutoutHalfWidth, clampedCutoutTop);
      hole.lineTo(localX - cutoutHalfWidth, clampedCutoutTop);
      hole.lineTo(localX - cutoutHalfWidth, cutoutBottom);

      shape.holes.push(hole);
    });

    // Extrude shape to create 3D geometry
    const extrudeSettings = {
      depth: depth,
      bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Center the geometry (ExtrudeGeometry starts at z=0, we need it centered)
    geometry.translate(0, 0, -depth / 2);

    return geometry;
  }, [wall.dimensions, wall.cutouts, wall.position, wall.rotation]);

  // Determine visibility based on opacity
  const showFullWall = opacityValue > 0.5;

  return (
    <group>
      {/* Footprint - EXACTLY like 2D fill, extruded to 0.5cm */}
      {footprintGeometry && (
        <mesh
          geometry={footprintGeometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1a1a1a" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Main wall - visible when opacity > 0.5 */}
      {/* Render wall segments */}
      {showFullWall && wallSegments.map((segment, index) => {
        // Check if this is custom geometry (already in world space)
        const isCustomGeometry = segment.geometry instanceof THREE.BufferGeometry &&
                                  !(segment.geometry instanceof THREE.BoxGeometry);

        // Check if geometry uses local space (has userData.hasLocalSpace)
        const hasLocalSpace = (segment.geometry as any).userData?.hasLocalSpace;
        const worldPosition = (segment.geometry as any).userData?.worldPosition;

        return (
          <mesh
            key={`wall-segment-${index}`}
            ref={index === 0 ? ref : undefined}
            position={hasLocalSpace && worldPosition ? [
              worldPosition[0],
              worldPosition[1],
              worldPosition[2]
            ] : isCustomGeometry ? [
              0,
              segment.position[1],
              0
            ] : [
              wall.position[0] + segment.position[0],
              wall.position[1] + segment.position[1],
              wall.position[2] + segment.position[2]
            ]}
            rotation={isCustomGeometry || hasLocalSpace ? [0, 0, 0] : wall.rotation}
            geometry={segment.geometry}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={color}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Cutouts visualization - disabled */}
      {/* {wall.cutouts.map((cutout) => {
        // For doors, show extended cutout height
        const visualHeight = cutout.type === 'door' ? wall.dimensions[1] - cutout.position[1] + wall.position[1] : cutout.dimensions[1];
        const visualY = cutout.type === 'door' ? visualHeight / 2 : cutout.position[1];

        return (
          <mesh
            key={`cutout-vis-${cutout.id}`}
            position={[cutout.position[0], visualY, cutout.position[2]]}
            rotation={wall.rotation}
          >
            <boxGeometry args={[cutout.dimensions[0], visualHeight, cutout.dimensions[2] + 2]} />
            <meshStandardMaterial color="#FF00FF" opacity={0.3} transparent />
          </mesh>
        );
      })} */}
    </group>
  );
});

Wall.displayName = 'Wall';

export default Wall;
