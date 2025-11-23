/**
 * Geometry utility functions for 2D calculations
 */

import type { Point2D, Wall } from '../types';

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    // Line segment is a point
    const pdx = point.x - lineStart.x;
    const pdy = point.y - lineStart.y;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  }

  // Calculate projection of point onto line
  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]

  // Find closest point on line segment
  const closestX = lineStart.x + t * dx;
  const closestY = lineStart.y + t * dy;

  // Calculate distance
  const distX = point.x - closestX;
  const distY = point.y - closestY;

  return Math.sqrt(distX * distX + distY * distY);
}

/**
 * Find closest wall to a point
 */
export function findClosestWall(
  point: Point2D,
  walls: Wall[],
  maxDistance: number = 50
): { wall: Wall; distance: number; position: number } | null {
  let closestWall: Wall | null = null;
  let minDistance = maxDistance;
  let closestPosition = 0;

  for (const wall of walls) {
    const distance = distanceToLineSegment(point, wall.start, wall.end);

    if (distance < minDistance) {
      minDistance = distance;
      closestWall = wall;

      // Calculate position along wall (0 to 1)
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const lengthSquared = dx * dx + dy * dy;

      if (lengthSquared > 0) {
        let t = ((point.x - wall.start.x) * dx + (point.y - wall.start.y) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        closestPosition = t;
      }
    }
  }

  if (closestWall) {
    return {
      wall: closestWall,
      distance: minDistance,
      position: closestPosition
    };
  }

  return null;
}

/**
 * Calculate point on wall at given position (0-1)
 */
export function getPointOnWall(wall: Wall, position: number): Point2D {
  return {
    x: wall.start.x + (wall.end.x - wall.start.x) * position,
    y: wall.start.y + (wall.end.y - wall.start.y) * position
  };
}

/**
 * Calculate wall length
 */
export function getWallLength(wall: Wall): number {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate wall angle in degrees
 */
export function getWallAngle(wall: Wall): number {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Check if position on wall is valid for door/window placement
 * (not too close to endpoints or other cutouts)
 */
export function isValidPlacementPosition(
  wall: Wall,
  position: number,
  width: number,
  minMargin: number = 20
): boolean {
  const wallLength = getWallLength(wall);
  const halfWidth = width / 2;

  // Check distance from endpoints
  const distanceFromStart = position * wallLength;
  const distanceFromEnd = (1 - position) * wallLength;

  if (distanceFromStart < halfWidth + minMargin || distanceFromEnd < halfWidth + minMargin) {
    return false;
  }

  // Check overlap with existing cutouts
  for (const cutout of wall.cutouts) {
    const cutoutHalfWidth = cutout.width / 2;
    const distanceBetween = Math.abs((position - cutout.position) * wallLength);

    if (distanceBetween < halfWidth + cutoutHalfWidth + minMargin) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate distance between two points
 */
export function distanceBetweenPoints(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find nearest wall endpoint to snap to
 * Returns the snapped point if within snapDistance, otherwise returns original point
 */
export function findSnapPoint(
  point: Point2D,
  walls: Wall[],
  snapDistance: number = 20
): { point: Point2D; snapped: boolean; wallId?: string; isStart?: boolean } {
  let closestPoint: Point2D | null = null;
  let minDistance = snapDistance;
  let closestWallId: string | undefined;
  let isStartPoint: boolean | undefined;

  // Check all wall endpoints
  for (const wall of walls) {
    // Check start point
    const distToStart = distanceBetweenPoints(point, wall.start);
    if (distToStart < minDistance) {
      minDistance = distToStart;
      closestPoint = wall.start;
      closestWallId = wall.id;
      isStartPoint = true;
    }

    // Check end point
    const distToEnd = distanceBetweenPoints(point, wall.end);
    if (distToEnd < minDistance) {
      minDistance = distToEnd;
      closestPoint = wall.end;
      closestWallId = wall.id;
      isStartPoint = false;
    }
  }

  if (closestPoint) {
    return {
      point: closestPoint,
      snapped: true,
      wallId: closestWallId,
      isStart: isStartPoint
    };
  }

  return {
    point,
    snapped: false
  };
}
