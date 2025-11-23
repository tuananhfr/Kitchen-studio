/**
 * 3D Wall Geometry with Junction Adjustment
 * Creates custom geometry for walls with adjusted corners at junctions
 */

import * as THREE from 'three';
// import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';
import type { Wall } from '../types';
import type { Wall3D } from './floorPlanTo3D';
import { detectJunctions, getAdjustedWallCorners } from './wallJunctions';

/**
 * Create 3D wall geometry with adjusted corners matching 2D footprint
 * Logic: Chân tường (bottom footprint) phải giống với polygon 2D
 * Now supports cutouts (doors/windows) via ExtrudeGeometry with holes
 */
export function createWallGeometry(
  wall3D: Wall3D,
  allWalls2D: Wall[]
): THREE.BufferGeometry {
  const [, height] = wall3D.dimensions;

  // Find the corresponding 2D wall
  const wall2D = allWalls2D.find(w => w.id === wall3D.id);
  if (!wall2D) {
    // Fallback to simple box if 2D wall not found
    console.warn(`2D wall not found for wall3D ${wall3D.id}, using simple box`);
    return new THREE.BoxGeometry(wall3D.dimensions[0], height, wall3D.dimensions[2]);
  }

  // Detect junctions
  const junctions = detectJunctions(allWalls2D);

  // Get adjusted corners from 2D (EXACTLY as rendered in 2D)
  const adjustedCorners2D = getAdjustedWallCorners(wall2D, allWalls2D, junctions);

  if (!adjustedCorners2D || adjustedCorners2D.length !== 4) {
    // Fallback to simple box if corners not calculated
    console.warn(`Adjusted corners not calculated for wall ${wall3D.id}, using simple box`);
    return new THREE.BoxGeometry(wall3D.dimensions[0], height, wall3D.dimensions[2]);
  }

  console.log(`Creating 3D wall geometry for ${wall3D.id.substring(0, 8)} with adjusted corners:`, {
    c0: `(${adjustedCorners2D[0].x.toFixed(1)}, ${adjustedCorners2D[0].y.toFixed(1)})`,
    c1: `(${adjustedCorners2D[1].x.toFixed(1)}, ${adjustedCorners2D[1].y.toFixed(1)})`,
    c2: `(${adjustedCorners2D[2].x.toFixed(1)}, ${adjustedCorners2D[2].y.toFixed(1)})`,
    c3: `(${adjustedCorners2D[3].x.toFixed(1)}, ${adjustedCorners2D[3].y.toFixed(1)})`,
  });

  const footprintHeight = 0.5;

  // Create BufferGeometry with vertices in WORLD space
  const geometry = new THREE.BufferGeometry();

  // 4 corners from 2D adjusted
  const c0 = adjustedCorners2D[0];
  const c1 = adjustedCorners2D[1];
  const c2 = adjustedCorners2D[2];
  const c3 = adjustedCorners2D[3];

  // Vertices: 8 points (4 bottom + 4 top) in WORLD SPACE
  const vertices = new Float32Array([
    // Bottom face at y=0.5 (starts above footprint)
    c0.x, footprintHeight, c0.y,  // 0
    c1.x, footprintHeight, c1.y,  // 1
    c2.x, footprintHeight, c2.y,  // 2
    c3.x, footprintHeight, c3.y,  // 3

    // Top face at y=height+0.5 (đỉnh tường)
    c0.x, height + footprintHeight, c0.y,  // 4
    c1.x, height + footprintHeight, c1.y,  // 5
    c2.x, height + footprintHeight, c2.y,  // 6
    c3.x, height + footprintHeight, c3.y,  // 7
  ]);

  // Indices for triangles (2 triangles per face, 6 faces total)
  const indices = new Uint16Array([
    // Bottom face (looking from below, counter-clockwise)
    0, 2, 1,
    0, 3, 2,

    // Top face (looking from above, clockwise)
    4, 5, 6,
    4, 6, 7,

    // 4 Side faces
    // Side 1: c0-c1
    0, 1, 5,
    0, 5, 4,

    // Side 2: c1-c2
    1, 2, 6,
    1, 6, 5,

    // Side 3: c2-c3
    2, 3, 7,
    2, 7, 6,

    // Side 4: c3-c0
    3, 0, 4,
    3, 4, 7,
  ]);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  // No cutouts support for now - doors/windows will render separately and overlap
  // TODO: Implement proper cutouts without WebGL context loss

  return geometry;
}

/**
 * Subtract cutouts (doors/windows) from wall geometry using CSG in LOCAL SPACE
 * NOTE: Currently disabled due to WebGL Context Lost issues
 */
// function subtractCutoutsLocalSpace(
//   wallGeometry: THREE.BufferGeometry,
//   cutouts: Array<{
//     id: string;
//     type: 'door' | 'window';
//     position: [number, number, number];
//     dimensions: [number, number, number];
//   }>,
//   wallCenterX: number,
//   wallCenterY: number,
//   wallCenterZ: number
// ): THREE.BufferGeometry {
//   const evaluator = new Evaluator();

//   // Create Brush from wall geometry (already in local space)
//   let wallBrush = new Brush(wallGeometry);
//   wallBrush.updateMatrixWorld();

//   // Subtract each cutout
//   cutouts.forEach(cutout => {
//     // Create box geometry for cutout
//     const [width, height, depth] = cutout.dimensions;
//     const cutoutGeometry = new THREE.BoxGeometry(width, height, depth);

//     // Convert cutout position from world space to wall's local space
//     const localX = cutout.position[0] - wallCenterX;
//     const localY = cutout.position[1] - wallCenterY;
//     const localZ = cutout.position[2] - wallCenterZ;

//     // Position cutout geometry in local space
//     const matrix = new THREE.Matrix4();
//     matrix.makeTranslation(localX, localY, localZ);
//     cutoutGeometry.applyMatrix4(matrix);

//     // Create Brush from cutout
//     const cutoutBrush = new Brush(cutoutGeometry);
//     cutoutBrush.updateMatrixWorld();

//     console.log(`Subtracting cutout ${cutout.id.substring(0, 8)} at local (${localX.toFixed(1)}, ${localY.toFixed(1)}, ${localZ.toFixed(1)})`);

//     // Subtract cutout from wall
//     wallBrush = evaluator.evaluate(wallBrush, cutoutBrush, SUBTRACTION);
//   });

//   // Return the resulting geometry (still in local space)
//   const resultGeometry = wallBrush.geometry;

//   // Preserve userData
//   resultGeometry.userData = wallGeometry.userData;

//   return resultGeometry;
// }

/**
 * Calculate center point of all walls (để xác định hướng inner)
 */
function calculateWallsCenter(walls: Wall[]): { x: number; y: number } {
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  walls.forEach(wall => {
    sumX += wall.start.x + wall.end.x;
    sumY += wall.start.y + wall.end.y;
    count += 2;
  });

  return {
    x: sumX / count,
    y: sumY / count
  };
}

/**
 * Determine which edge of wall is inner edge (toward room center)
 * Returns indices [idx1, idx2] for inner edge corners
 */
function getInnerEdgeIndices(
  wallCorners: Array<{ x: number; y: number }>,
  roomCenter: { x: number; y: number }
): [number, number] {
  if (wallCorners.length !== 4) {
    return [1, 2]; // fallback
  }

  // Calculate midpoint of edge A (corners 0-3)
  const midpointA = {
    x: (wallCorners[0].x + wallCorners[3].x) / 2,
    y: (wallCorners[0].y + wallCorners[3].y) / 2
  };

  // Calculate midpoint of edge B (corners 1-2)
  const midpointB = {
    x: (wallCorners[1].x + wallCorners[2].x) / 2,
    y: (wallCorners[1].y + wallCorners[2].y) / 2
  };

  // Calculate distance to room center
  const distA = Math.sqrt(
    Math.pow(midpointA.x - roomCenter.x, 2) +
    Math.pow(midpointA.y - roomCenter.y, 2)
  );

  const distB = Math.sqrt(
    Math.pow(midpointB.x - roomCenter.x, 2) +
    Math.pow(midpointB.y - roomCenter.y, 2)
  );

  // Inner edge is closer to room center
  if (distB < distA) {
    return [1, 2]; // Edge B is inner
  } else {
    return [0, 3]; // Edge A is inner
  }
}

/**
 * Create footprint geometry (chân tường màu đen)
 * Only renders INNER EDGE (toward room), matching floor polygon logic
 */
export function createFootprintGeometry(
  wall3D: Wall3D,
  allWalls2D: Wall[],
  footprintHeight: number = 0.5
): THREE.BufferGeometry | null {
  // Find the corresponding 2D wall
  const wall2D = allWalls2D.find(w => w.id === wall3D.id);
  if (!wall2D) {
    return null;
  }

  // Detect junctions
  const junctions = detectJunctions(allWalls2D);

  // Get adjusted corners from 2D
  const adjustedCorners2D = getAdjustedWallCorners(wall2D, allWalls2D, junctions);

  if (!adjustedCorners2D || adjustedCorners2D.length !== 4) {
    return null;
  }

  // Calculate room center
  const roomCenter = calculateWallsCenter(allWalls2D);

  // Get inner edge indices
  const [idx1, idx2] = getInnerEdgeIndices(adjustedCorners2D, roomCenter);

  // Inner edge corners
  const c1 = adjustedCorners2D[idx1];
  const c2 = adjustedCorners2D[idx2];

  const geometry = new THREE.BufferGeometry();

  // Footprint width (thickness of footprint line)
  const footprintThickness = 3; // 3cm thick line

  // Calculate direction vector of inner edge
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (pointing toward wall center, away from room)
  const perpX = -dy / length;
  const perpY = dx / length;
  const halfThick = footprintThickness / 2;

  // 4 corners of footprint rectangle (along inner edge)
  const p0 = { x: c1.x - perpX * halfThick, y: c1.y - perpY * halfThick };
  const p1 = { x: c1.x + perpX * halfThick, y: c1.y + perpY * halfThick };
  const p2 = { x: c2.x + perpX * halfThick, y: c2.y + perpY * halfThick };
  const p3 = { x: c2.x - perpX * halfThick, y: c2.y - perpY * halfThick };

  // Vertices: 8 points (4 bottom at y=0 + 4 top at y=footprintHeight)
  const vertices = new Float32Array([
    // Bottom face at y=0
    p0.x, 0, p0.y,  // 0
    p1.x, 0, p1.y,  // 1
    p2.x, 0, p2.y,  // 2
    p3.x, 0, p3.y,  // 3

    // Top face at y=footprintHeight
    p0.x, footprintHeight, p0.y,  // 4
    p1.x, footprintHeight, p1.y,  // 5
    p2.x, footprintHeight, p2.y,  // 6
    p3.x, footprintHeight, p3.y,  // 7
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
}

/**
 * Create wall geometry with cutouts (doors/windows)
 * More complex version that handles splitting walls around cutouts
 */
export function createWallGeometryWithCutouts(
  wall3D: Wall3D,
  allWalls2D: Wall[]
): THREE.BufferGeometry[] {
  // If no cutouts, return single geometry
  if (wall3D.cutouts.length === 0) {
    return [createWallGeometry(wall3D, allWalls2D)];
  }

  // TODO: Implement cutout logic
  // For now, fallback to simple geometry
  // This requires splitting the wall into segments around cutouts
  // while maintaining the adjusted corners at the ends

  return [createWallGeometry(wall3D, allWalls2D)];
}
