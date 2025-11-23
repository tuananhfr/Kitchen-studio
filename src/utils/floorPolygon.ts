/**
 * Floor Polygon Calculation
 * Tạo polygon cho sàn từ inner edges của walls
 */

import type { Wall, Point2D } from '../types';
import { detectJunctions, getAdjustedWallCorners } from './wallJunctions';

/**
 * Calculate center point of all walls (để xác định hướng inner)
 */
function calculateWallsCenter(walls: Wall[]): Point2D {
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
 * Determine which edge of wall is inner edge (hướng vào phòng)
 * Returns true if corner index 1,2 is inner edge
 */
function getInnerEdgeIndices(
  wallCorners: Point2D[],
  roomCenter: Point2D
): [number, number] {
  // Wall có 4 corners: [0, 1, 2, 3]
  // Có 2 cặp edges song song:
  // - Edge A: corners [0, 3] (một bên)
  // - Edge B: corners [1, 2] (bên kia)

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
 * Calculate intersection point of two lines
 */
function lineIntersection(
  line1Start: Point2D,
  line1End: Point2D,
  line2Start: Point2D,
  line2End: Point2D
): Point2D | null {
  const dx1 = line1End.x - line1Start.x;
  const dy1 = line1End.y - line1Start.y;
  const dx2 = line2End.x - line2Start.x;
  const dy2 = line2End.y - line2Start.y;

  const denominator = dx1 * dy2 - dy1 * dx2;

  // Lines are parallel
  if (Math.abs(denominator) < 0.0001) {
    return null;
  }

  const t = ((line2Start.x - line1Start.x) * dy2 - (line2Start.y - line1Start.y) * dx2) / denominator;

  return {
    x: line1Start.x + t * dx1,
    y: line1Start.y + t * dy1
  };
}

/**
 * Inset polygon towards center by a distance
 * Floor không dính vào tường
 */
function insetPolygon(polygon: Point2D[], center: Point2D, insetDistance: number): Point2D[] {
  return polygon.map(point => {
    // Calculate direction from point to center
    const dx = center.x - point.x;
    const dy = center.y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return point;
    }

    // Normalize direction and move point towards center
    const moveX = (dx / distance) * insetDistance;
    const moveY = (dy / distance) * insetDistance;

    return {
      x: point.x + moveX,
      y: point.y + moveY
    };
  });
}

/**
 * Get floor polygon from walls' inner edges using line intersections
 * Floor polygon is created by finding intersections of inner edges
 * Use small positive inset to shrink floor slightly inside footprint
 */
export function getFloorPolygon(walls: Wall[], insetDistance: number = 2): Point2D[] | null {
  if (walls.length < 2) {
    return null; // Cần ít nhất 2 walls
  }

  // Calculate room center
  const roomCenter = calculateWallsCenter(walls);

  // Detect junctions
  const junctions = detectJunctions(walls);

  // Get inner edges for each wall (as line segments)
  interface WallInnerEdge {
    wall: Wall;
    start: Point2D;
    end: Point2D;
    angle: number; // Angle from center for sorting
  }

  const innerEdges: WallInnerEdge[] = [];

  walls.forEach(wall => {
    // Get adjusted corners
    const corners = getAdjustedWallCorners(wall, walls, junctions);

    if (!corners || corners.length !== 4) {
      return;
    }

    // Get inner edge indices
    const [idx1, idx2] = getInnerEdgeIndices(corners, roomCenter);

    // Inner edge as line segment
    const edgeStart = corners[idx1];
    const edgeEnd = corners[idx2];

    // Calculate angle of edge midpoint from center
    const midX = (edgeStart.x + edgeEnd.x) / 2;
    const midY = (edgeStart.y + edgeEnd.y) / 2;
    const angle = Math.atan2(midY - roomCenter.y, midX - roomCenter.x);

    innerEdges.push({
      wall,
      start: edgeStart,
      end: edgeEnd,
      angle
    });
  });

  if (innerEdges.length < 3) {
    return null;
  }

  // Sort edges by angle (clockwise around center)
  innerEdges.sort((a, b) => a.angle - b.angle);

  // Find intersections between consecutive inner edges
  const floorCorners: Point2D[] = [];

  for (let i = 0; i < innerEdges.length; i++) {
    const currentEdge = innerEdges[i];
    const nextEdge = innerEdges[(i + 1) % innerEdges.length];

    // Extend lines infinitely and find intersection
    const intersection = lineIntersection(
      currentEdge.start,
      currentEdge.end,
      nextEdge.start,
      nextEdge.end
    );

    if (intersection) {
      floorCorners.push(intersection);
    } else {
      // If parallel, use the connecting point
      // Use the endpoint of current edge closest to next edge start
      const dist1 = Math.sqrt(
        Math.pow(currentEdge.start.x - nextEdge.start.x, 2) +
        Math.pow(currentEdge.start.y - nextEdge.start.y, 2)
      );
      const dist2 = Math.sqrt(
        Math.pow(currentEdge.end.x - nextEdge.start.x, 2) +
        Math.pow(currentEdge.end.y - nextEdge.start.y, 2)
      );

      floorCorners.push(dist1 < dist2 ? currentEdge.start : currentEdge.end);
    }
  }

  if (floorCorners.length < 3) {
    return null;
  }

  // Apply inset if needed
  if (insetDistance !== 0) {
    return insetPolygon(floorCorners, roomCenter, insetDistance);
  }

  return floorCorners;
}
