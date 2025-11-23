/**
 * Wall Junction utilities
 * Handles merging wall polygons at connection points to eliminate overlapping corners
 */

import type { Point2D, Wall } from '../types';
import { distanceBetweenPoints } from './geometryUtils';

/**
 * Wall junction - represents a point where multiple walls meet
 */
export interface WallJunction {
  point: Point2D;
  wallIds: string[];
  angles: number[]; // Angle of each wall at this junction
}

/**
 * Extended wall corner information
 */
export interface WallCorners {
  wallId: string;
  corner1: Point2D; // Top-left from wall perspective
  corner2: Point2D; // Bottom-left
  corner3: Point2D; // Bottom-right
  corner4: Point2D; // Top-right
  centerline: { start: Point2D; end: Point2D };
}

/**
 * Detect all junctions in the floor plan
 */
export function detectJunctions(walls: Wall[], tolerance: number = 1): WallJunction[] {
  const junctions: WallJunction[] = [];
  const points: Array<{ point: Point2D; wallId: string; isStart: boolean }> = [];

  // Collect all wall endpoints
  walls.forEach(wall => {
    points.push({ point: wall.start, wallId: wall.id, isStart: true });
    points.push({ point: wall.end, wallId: wall.id, isStart: false });
  });

  // Find clusters of nearby points (junctions)
  const processed = new Set<number>();

  for (let i = 0; i < points.length; i++) {
    if (processed.has(i)) continue;

    const cluster: typeof points = [points[i]];
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

    // If multiple walls meet at this point, it's a junction
    if (cluster.length >= 2) {
      const avgPoint = {
        x: cluster.reduce((sum, p) => sum + p.point.x, 0) / cluster.length,
        y: cluster.reduce((sum, p) => sum + p.point.y, 0) / cluster.length
      };

      const wallIds = [...new Set(cluster.map(p => p.wallId))];

      // Calculate angles for each wall at this junction
      const angles = wallIds.map(wallId => {
        const wall = walls.find(w => w.id === wallId)!;
        const isStart = cluster.find(p => p.wallId === wallId)?.isStart;

        // Calculate angle from junction point
        const dx = isStart ? wall.end.x - wall.start.x : wall.start.x - wall.end.x;
        const dy = isStart ? wall.end.y - wall.start.y : wall.start.y - wall.end.y;
        return Math.atan2(dy, dx);
      });

      junctions.push({
        point: avgPoint,
        wallIds,
        angles
      });
    }
  }

  return junctions;
}

/**
 * Calculate wall corners (4 corners of the wall polygon)
 */
export function calculateWallCorners(wall: Wall): WallCorners {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (for thickness)
  const perpX = -dy / length;
  const perpY = dx / length;
  const halfThickness = wall.thickness / 2;

  return {
    wallId: wall.id,
    corner1: {
      x: wall.start.x + perpX * halfThickness,
      y: wall.start.y + perpY * halfThickness
    },
    corner2: {
      x: wall.start.x - perpX * halfThickness,
      y: wall.start.y - perpY * halfThickness
    },
    corner3: {
      x: wall.end.x - perpX * halfThickness,
      y: wall.end.y - perpY * halfThickness
    },
    corner4: {
      x: wall.end.x + perpX * halfThickness,
      y: wall.end.y + perpY * halfThickness
    },
    centerline: {
      start: wall.start,
      end: wall.end
    }
  };
}

/**
 * Calculate merged polygon points for walls at a junction
 * Returns polygon points in counter-clockwise order
 */
export function calculateMergedWallPolygon(walls: Wall[]): Point2D[] {
  if (walls.length === 0) return [];
  if (walls.length === 1) {
    // Single wall - return its 4 corners
    const corners = calculateWallCorners(walls[0]);
    return [corners.corner1, corners.corner2, corners.corner3, corners.corner4];
  }

  // Find all junctions
  // const junctions = detectJunctions(walls); // TODO: Use for more sophisticated merging

  // For now, we'll use a simpler approach:
  // Draw each wall but trim the endpoints at junctions
  // This creates a continuous polygon

  const allCorners = walls.map(w => calculateWallCorners(w));
  const points: Point2D[] = [];

  // Sort walls by angle to create continuous polygon
  // This is a simplified approach - may need more sophisticated algorithm

  for (const corners of allCorners) {
    // Add corners in order, but skip duplicates at junctions
    const addPoint = (p: Point2D) => {
      const isDuplicate = points.some(existing =>
        distanceBetweenPoints(existing, p) < 2
      );
      if (!isDuplicate) {
        points.push(p);
      }
    };

    addPoint(corners.corner1);
    addPoint(corners.corner2);
    addPoint(corners.corner3);
    addPoint(corners.corner4);
  }

  return points;
}

/**
 * Get modified wall corners at junction to prevent overlap while preserving thickness
 * Returns adjusted corners for a wall based on adjacent walls at junctions
 */
export function getAdjustedWallCorners(
  wall: Wall,
  allWalls: Wall[],
  junctions: WallJunction[]
): Point2D[] {
  const baseCorners = calculateWallCorners(wall);
  let corners = [
    baseCorners.corner1,
    baseCorners.corner2,
    baseCorners.corner3,
    baseCorners.corner4
  ];

  // Check if start point is at a junction
  const startJunction = junctions.find(j =>
    distanceBetweenPoints(j.point, wall.start) < 2
  );

  // Check if end point is at a junction
  const endJunction = junctions.find(j =>
    distanceBetweenPoints(j.point, wall.end) < 2
  );

  // Helper function to calculate miter point (điểm giao hoàn hảo)
  const calculateMiterPoint = (
    edge1Start: Point2D,
    edge1End: Point2D,
    edge2Start: Point2D,
    edge2End: Point2D
  ): Point2D | null => {
    // Line 1: edge1Start -> edge1End
    const dx1 = edge1End.x - edge1Start.x;
    const dy1 = edge1End.y - edge1Start.y;

    // Line 2: edge2Start -> edge2End
    const dx2 = edge2End.x - edge2Start.x;
    const dy2 = edge2End.y - edge2Start.y;

    // Calculate intersection using parametric form
    const denominator = dx1 * dy2 - dy1 * dx2;

    if (Math.abs(denominator) < 0.0001) {
      // Lines are parallel
      return null;
    }

    const t = ((edge2Start.x - edge1Start.x) * dy2 - (edge2Start.y - edge1Start.y) * dx2) / denominator;

    // Calculate intersection point
    return {
      x: edge1Start.x + t * dx1,
      y: edge1Start.y + t * dy1
    };
  };

  // Helper function to adjust wall corners for perfect miter joint
  const adjustWallEndForMiter = (
    isStart: boolean,
    junction: WallJunction,
    corners: Point2D[]
  ): Point2D[] => {
    // Find the other wall(s) at this junction
    const otherWalls = junction.wallIds
      .filter(id => id !== wall.id)
      .map(id => allWalls.find(w => w.id === id)!)
      .filter(w => w);

    if (otherWalls.length === 0) return corners;

    // For simplicity, adjust based on the first other wall
    const otherWall = otherWalls[0];

    // Calculate current wall direction vector
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate perpendicular vector for other wall
    const otherDx = otherWall.end.x - otherWall.start.x;
    const otherDy = otherWall.end.y - otherWall.start.y;
    const otherLength = Math.sqrt(otherDx * otherDx + otherDy * otherDy);
    const otherPerpX = -otherDy / otherLength;
    const otherPerpY = otherDx / otherLength;
    const otherHalfThickness = otherWall.thickness / 2;

    // Determine which end of other wall connects to this junction
    const otherWallAtStart = distanceBetweenPoints(otherWall.start, junction.point) < 2;

    // Calculate other wall's edge lines
    let otherEdge1Start: Point2D, otherEdge1End: Point2D;
    let otherEdge2Start: Point2D, otherEdge2End: Point2D;

    if (otherWallAtStart) {
      // Other wall starts at junction
      otherEdge1Start = {
        x: otherWall.start.x + otherPerpX * otherHalfThickness,
        y: otherWall.start.y + otherPerpY * otherHalfThickness
      };
      otherEdge1End = {
        x: otherWall.end.x + otherPerpX * otherHalfThickness,
        y: otherWall.end.y + otherPerpY * otherHalfThickness
      };
      otherEdge2Start = {
        x: otherWall.start.x - otherPerpX * otherHalfThickness,
        y: otherWall.start.y - otherPerpY * otherHalfThickness
      };
      otherEdge2End = {
        x: otherWall.end.x - otherPerpX * otherHalfThickness,
        y: otherWall.end.y - otherPerpY * otherHalfThickness
      };
    } else {
      // Other wall ends at junction
      otherEdge1Start = {
        x: otherWall.end.x + otherPerpX * otherHalfThickness,
        y: otherWall.end.y + otherPerpY * otherHalfThickness
      };
      otherEdge1End = {
        x: otherWall.start.x + otherPerpX * otherHalfThickness,
        y: otherWall.start.y + otherPerpY * otherHalfThickness
      };
      otherEdge2Start = {
        x: otherWall.end.x - otherPerpX * otherHalfThickness,
        y: otherWall.end.y - otherPerpY * otherHalfThickness
      };
      otherEdge2End = {
        x: otherWall.start.x - otherPerpX * otherHalfThickness,
        y: otherWall.start.y - otherPerpY * otherHalfThickness
      };
    }

    // Calculate current wall's edge lines
    const perpX = -dy / length;
    const perpY = dx / length;
    const halfThickness = wall.thickness / 2;

    let currentEdge1Start: Point2D, currentEdge1End: Point2D;
    let currentEdge2Start: Point2D, currentEdge2End: Point2D;

    if (isStart) {
      // Current wall starts at junction
      currentEdge1Start = {
        x: wall.start.x + perpX * halfThickness,
        y: wall.start.y + perpY * halfThickness
      };
      currentEdge1End = {
        x: wall.end.x + perpX * halfThickness,
        y: wall.end.y + perpY * halfThickness
      };
      currentEdge2Start = {
        x: wall.start.x - perpX * halfThickness,
        y: wall.start.y - perpY * halfThickness
      };
      currentEdge2End = {
        x: wall.end.x - perpX * halfThickness,
        y: wall.end.y - perpY * halfThickness
      };
    } else {
      // Current wall ends at junction
      currentEdge1Start = {
        x: wall.end.x + perpX * halfThickness,
        y: wall.end.y + perpY * halfThickness
      };
      currentEdge1End = {
        x: wall.start.x + perpX * halfThickness,
        y: wall.start.y + perpY * halfThickness
      };
      currentEdge2Start = {
        x: wall.end.x - perpX * halfThickness,
        y: wall.end.y - perpY * halfThickness
      };
      currentEdge2End = {
        x: wall.start.x - perpX * halfThickness,
        y: wall.start.y - perpY * halfThickness
      };
    }

    // Calculate miter points (giao điểm hoàn hảo)
    const miter1 = calculateMiterPoint(currentEdge1Start, currentEdge1End, otherEdge1Start, otherEdge1End);
    const miter2 = calculateMiterPoint(currentEdge2Start, currentEdge2End, otherEdge2Start, otherEdge2End);

    // Limit miter extension to prevent long spikes (góc nhọn)
    const maxMiterExtension = wall.thickness * 3; // Max 3x wall thickness

    const limitMiterPoint = (miterPoint: Point2D | null, originalCorner: Point2D): Point2D => {
      if (!miterPoint) return originalCorner;

      // Calculate distance from original corner to miter point
      const distance = Math.sqrt(
        Math.pow(miterPoint.x - originalCorner.x, 2) +
        Math.pow(miterPoint.y - originalCorner.y, 2)
      );

      // If miter is too far, clamp it
      if (distance > maxMiterExtension) {
        // Calculate direction from original to miter
        const dirX = (miterPoint.x - originalCorner.x) / distance;
        const dirY = (miterPoint.y - originalCorner.y) / distance;

        // Return point at max extension distance
        return {
          x: originalCorner.x + dirX * maxMiterExtension,
          y: originalCorner.y + dirY * maxMiterExtension
        };
      }

      return miterPoint;
    };

    // Update corners with limited miter points
    if (isStart) {
      corners[0] = limitMiterPoint(miter1, baseCorners.corner1);
      corners[1] = limitMiterPoint(miter2, baseCorners.corner2);
    } else {
      corners[3] = limitMiterPoint(miter1, baseCorners.corner4);
      corners[2] = limitMiterPoint(miter2, baseCorners.corner3);
    }

    return corners;
  };

  // Apply miter adjustment at start junction
  if (startJunction && startJunction.wallIds.length >= 2) {
    corners = adjustWallEndForMiter(true, startJunction, corners);
  }

  // Apply miter adjustment at end junction
  if (endJunction && endJunction.wallIds.length >= 2) {
    corners = adjustWallEndForMiter(false, endJunction, corners);
  }

  return corners;
}
