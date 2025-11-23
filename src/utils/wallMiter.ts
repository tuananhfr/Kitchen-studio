/**
 * Wall Bevel - Calculate beveled corners at wall junctions
 * When walls meet, corners change from 90° to 45° and 135°
 * This creates a smooth bevel instead of overlapping square corners
 */

import type { Point2D, Wall } from '../types';
import { distanceBetweenPoints } from './geometryUtils';

/**
 * Junction information with walls meeting at a point
 */
interface Junction {
  point: Point2D;
  walls: Array<{
    wall: Wall;
    isStart: boolean; // true if this wall's start is at junction
  }>;
}

/**
 * Mitered wall corner - includes miter points instead of square corners
 */
export interface MiteredWallCorners {
  wallId: string;
  corners: Point2D[]; // Can have more than 4 points with mitered corners
}

/**
 * Detect all junctions in floor plan
 */
function detectJunctions(walls: Wall[], tolerance: number = 2): Junction[] {
  const junctions: Junction[] = [];
  const points: Array<{ point: Point2D; wall: Wall; isStart: boolean }> = [];

  // Collect all wall endpoints
  walls.forEach(wall => {
    points.push({ point: wall.start, wall, isStart: true });
    points.push({ point: wall.end, wall, isStart: false });
  });

  const processed = new Set<number>();

  for (let i = 0; i < points.length; i++) {
    if (processed.has(i)) continue;

    const cluster = [points[i]];
    processed.add(i);

    // Find all points within tolerance
    for (let j = i + 1; j < points.length; j++) {
      if (processed.has(j)) continue;

      const dist = distanceBetweenPoints(points[i].point, points[j].point);
      if (dist <= tolerance) {
        cluster.push(points[j]);
        processed.add(j);
      }
    }

    // If multiple walls meet, it's a junction
    if (cluster.length >= 2) {
      const avgPoint = {
        x: cluster.reduce((sum, p) => sum + p.point.x, 0) / cluster.length,
        y: cluster.reduce((sum, p) => sum + p.point.y, 0) / cluster.length
      };

      junctions.push({
        point: avgPoint,
        walls: cluster.map(c => ({
          wall: c.wall,
          isStart: c.isStart
        }))
      });
    }
  }

  return junctions;
}

/**
 * Calculate wall direction vector at junction
 */
function getWallDirection(wall: Wall, isStart: boolean): Point2D {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (isStart) {
    // Direction going away from start
    return { x: dx / length, y: dy / length };
  } else {
    // Direction going away from end (reversed)
    return { x: -dx / length, y: -dy / length };
  }
}


/**
 * Calculate beveled corners for all walls
 * Logic: When two walls meet at 90°, the junction corners become 45° and 135°
 */
export function calculateMiteredWallCorners(walls: Wall[]): MiteredWallCorners[] {
  if (walls.length === 0) return [];

  const junctions = detectJunctions(walls);
  const result: MiteredWallCorners[] = [];

  for (const wall of walls) {
    // Wall has 4 corners: corner1, corner2, corner3, corner4
    // Numbered counter-clockwise from start

    // Calculate basic wall geometry
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / length; // Direction vector
    const dirY = dy / length;
    const perpX = -dy / length; // Perpendicular (left side)
    const perpY = dx / length;
    const halfThickness = wall.thickness / 2;

    // Base corners (before beveling)
    // Corner 1: start + left perpendicular
    // Corner 2: start - left perpendicular
    // Corner 3: end - left perpendicular
    // Corner 4: end + left perpendicular

    let corner1 = { x: wall.start.x + perpX * halfThickness, y: wall.start.y + perpY * halfThickness };
    let corner2 = { x: wall.start.x - perpX * halfThickness, y: wall.start.y - perpY * halfThickness };
    let corner3 = { x: wall.end.x - perpX * halfThickness, y: wall.end.y - perpY * halfThickness };
    let corner4 = { x: wall.end.x + perpX * halfThickness, y: wall.end.y + perpY * halfThickness };

    // Find junctions at start and end
    const startJunction = junctions.find(j =>
      distanceBetweenPoints(j.point, wall.start) < 2
    );
    const endJunction = junctions.find(j =>
      distanceBetweenPoints(j.point, wall.end) < 2
    );

    const corners: Point2D[] = [];

    // START CORNERS (corner1 and corner2)
    if (startJunction && startJunction.walls.length >= 2) {
      const otherWall = startJunction.walls.find(w => w.wall.id !== wall.id);

      if (otherWall) {
        // Get direction of the other wall
        const otherDir = getWallDirection(otherWall.wall, otherWall.isStart);
        const wallDir = { x: dirX, y: dirY };

        // Check if roughly perpendicular
        const dotProduct = Math.abs(wallDir.x * otherDir.x + wallDir.y * otherDir.y);

        if (dotProduct < 0.3) { // Perpendicular
          // Calculate the bevel point where the two 45° edges meet
          // This point is at the junction + halfThickness in both wall directions

          // Determine which side the other wall is on
          const cross = wallDir.x * otherDir.y - wallDir.y * otherDir.x;

          // Calculate the shared bevel point
          // It's offset by halfThickness along current wall direction
          // AND offset by halfThickness perpendicular to other wall
          const bevelPoint = {
            x: startJunction.point.x + dirX * halfThickness,
            y: startJunction.point.y + dirY * halfThickness
          };

          if (cross > 0) {
            // Other wall is on the LEFT side
            // Set corner1 to the bevel point
            corner1 = bevelPoint;
          } else {
            // Other wall is on the RIGHT side
            // Set corner2 to the bevel point
            corner2 = bevelPoint;
          }
        }
      }
    }

    // END CORNERS (corner3 and corner4)
    if (endJunction && endJunction.walls.length >= 2) {
      const otherWall = endJunction.walls.find(w => w.wall.id !== wall.id);

      if (otherWall) {
        const otherDir = getWallDirection(otherWall.wall, otherWall.isStart);
        const wallDir = { x: -dirX, y: -dirY }; // Reversed for end

        const dotProduct = Math.abs(wallDir.x * otherDir.x + wallDir.y * otherDir.y);

        if (dotProduct < 0.3) { // Perpendicular
          // Calculate the bevel point (same as start logic but reversed)
          const cross = wallDir.x * otherDir.y - wallDir.y * otherDir.x;

          // Bevel point is junction - halfThickness along wall direction
          const bevelPoint = {
            x: endJunction.point.x - dirX * halfThickness,
            y: endJunction.point.y - dirY * halfThickness
          };

          if (cross > 0) {
            // Other wall is on the LEFT side (from end perspective)
            // Set corner4 to bevel point
            corner4 = bevelPoint;
          } else {
            // Other wall is on the RIGHT side (from end perspective)
            // Set corner3 to bevel point
            corner3 = bevelPoint;
          }
        }
      }
    }

    // Add corners in order: 1 -> 2 -> 3 -> 4
    corners.push(corner1);
    corners.push(corner2);
    corners.push(corner3);
    corners.push(corner4);

    result.push({
      wallId: wall.id,
      corners
    });
  }

  return result;
}
