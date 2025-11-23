/**
 * Wall Union - Merge all walls into a single unified polygon
 * Creates a single continuous outline for all connected walls
 */

import type { Point2D, Wall } from '../types';
import { calculateWallCorners } from './wallJunctions';
import { calculateMiteredWallCorners } from './wallMiter';
import { distanceBetweenPoints } from './geometryUtils';

/**
 * Edge in the wall polygon graph
 */
interface Edge {
  start: Point2D;
  end: Point2D;
  wallId: string;
  isOuter: boolean; // true for outer edges, false for inner edges
}

/**
 * Calculate unified wall polygon from all walls with mitered corners
 * Returns a single polygon that represents all walls merged together
 */
export function calculateUnifiedWallPolygon(walls: Wall[]): Point2D[] {
  if (walls.length === 0) return [];

  if (walls.length === 1) {
    // Single wall - return its 4 corners
    const corners = calculateWallCorners(walls[0]);
    return [corners.corner1, corners.corner2, corners.corner3, corners.corner4];
  }

  // Use mitered corners for better junction handling
  const miteredWalls = calculateMiteredWallCorners(walls);

  // Strategy: Trace the outer boundary of all walls
  // 1. Collect all wall edges (using mitered corners)
  // 2. Build a graph of connected edges
  // 3. Find the outer perimeter by tracing counter-clockwise

  const edges: Edge[] = [];

  // Generate edges for each wall (with mitered corners)
  miteredWalls.forEach(({ wallId, corners }) => {
    // Create edges between consecutive corners
    for (let i = 0; i < corners.length; i++) {
      const start = corners[i];
      const end = corners[(i + 1) % corners.length];

      edges.push({
        start,
        end,
        wallId,
        isOuter: true
      });
    }
  });

  // Find outer perimeter by removing internal edges
  const outerEdges = findOuterEdges(edges);

  // Trace the perimeter to get ordered polygon points
  const polygon = tracePerimeter(outerEdges);

  return polygon;
}

/**
 * Find outer edges by removing edges that are shared between walls (internal edges)
 */
function findOuterEdges(edges: Edge[]): Edge[] {
  const tolerance = 2; // Points within 2 units are considered the same
  const outerEdges: Edge[] = [];

  for (let i = 0; i < edges.length; i++) {
    const edge1 = edges[i];
    let hasOpposite = false;

    // Check if this edge has an opposite edge (going the other direction)
    for (let j = 0; j < edges.length; j++) {
      if (i === j) continue;

      const edge2 = edges[j];

      // Check if edge2 is opposite of edge1
      // (edge1.start ≈ edge2.end && edge1.end ≈ edge2.start)
      const startMatch = distanceBetweenPoints(edge1.start, edge2.end) < tolerance;
      const endMatch = distanceBetweenPoints(edge1.end, edge2.start) < tolerance;

      if (startMatch && endMatch) {
        hasOpposite = true;
        break;
      }
    }

    // If no opposite edge found, this is an outer edge
    if (!hasOpposite) {
      outerEdges.push(edge1);
    }
  }

  return outerEdges;
}

/**
 * Trace the perimeter by connecting edges in order
 */
function tracePerimeter(edges: Edge[]): Point2D[] {
  if (edges.length === 0) return [];

  const polygon: Point2D[] = [];
  const remainingEdges = [...edges];
  const tolerance = 2;

  // Start with the first edge
  let currentEdge = remainingEdges[0];
  polygon.push(currentEdge.start);
  polygon.push(currentEdge.end);
  remainingEdges.splice(0, 1);

  // Keep connecting edges until we return to start
  let maxIterations = edges.length * 2; // Prevent infinite loop
  let iterations = 0;

  while (remainingEdges.length > 0 && iterations < maxIterations) {
    iterations++;

    const currentEnd = polygon[polygon.length - 1];

    // Find next edge that starts near current end
    let nextEdgeIndex = -1;
    let minDistance = tolerance;

    for (let i = 0; i < remainingEdges.length; i++) {
      const dist = distanceBetweenPoints(currentEnd, remainingEdges[i].start);
      if (dist < minDistance) {
        minDistance = dist;
        nextEdgeIndex = i;
      }
    }

    if (nextEdgeIndex === -1) {
      // No connecting edge found - try to find edge that ends near current end
      for (let i = 0; i < remainingEdges.length; i++) {
        const dist = distanceBetweenPoints(currentEnd, remainingEdges[i].end);
        if (dist < minDistance) {
          // Reverse this edge
          const edge = remainingEdges[i];
          remainingEdges[i] = {
            ...edge,
            start: edge.end,
            end: edge.start
          };
          minDistance = dist;
          nextEdgeIndex = i;
        }
      }
    }

    if (nextEdgeIndex === -1) {
      // Still no edge found - break to prevent infinite loop
      break;
    }

    const nextEdge = remainingEdges[nextEdgeIndex];

    // Check if we're back at the start
    if (distanceBetweenPoints(nextEdge.end, polygon[0]) < tolerance) {
      // Complete the loop
      break;
    }

    polygon.push(nextEdge.end);
    remainingEdges.splice(nextEdgeIndex, 1);
  }

  return polygon;
}

/**
 * Simplify polygon by removing collinear points
 */
export function simplifyPolygon(polygon: Point2D[], tolerance: number = 1): Point2D[] {
  if (polygon.length < 3) return polygon;

  const simplified: Point2D[] = [polygon[0]];

  for (let i = 1; i < polygon.length - 1; i++) {
    const prev = polygon[i - 1];
    const curr = polygon[i];
    const next = polygon[i + 1];

    // Check if current point is collinear with prev and next
    const isCollinear = checkCollinear(prev, curr, next, tolerance);

    if (!isCollinear) {
      simplified.push(curr);
    }
  }

  // Always add the last point
  simplified.push(polygon[polygon.length - 1]);

  return simplified;
}

/**
 * Check if three points are collinear (on the same line)
 */
function checkCollinear(p1: Point2D, p2: Point2D, p3: Point2D, tolerance: number): boolean {
  // Calculate cross product
  const cross = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  return Math.abs(cross) < tolerance;
}
