/**
 * useWallMerge Hook
 * Merges connected walls into unified polygons
 * After merging, connected walls appear as a single continuous shape
 */

import { useMemo } from 'react';
import type { Wall, Point2D } from '../types';
import { calculateMiteredWallCorners } from '../utils/wallMiter';
import { distanceBetweenPoints } from '../utils/geometryUtils';

/**
 * Merged wall group - represents connected walls as one shape
 */
export interface MergedWallGroup {
  id: string;
  wallIds: string[];
  polygon: Point2D[];
}

/**
 * Find all connected wall groups
 */
function findConnectedGroups(walls: Wall[]): Wall[][] {
  if (walls.length === 0) return [];

  const groups: Wall[][] = [];
  const visited = new Set<string>();

  // Helper: Find all walls connected to given wall
  function findConnected(wall: Wall, group: Wall[]) {
    if (visited.has(wall.id)) return;
    visited.add(wall.id);
    group.push(wall);

    // Find walls that share endpoints with current wall
    for (const other of walls) {
      if (visited.has(other.id)) continue;

      const startToStart = distanceBetweenPoints(wall.start, other.start);
      const startToEnd = distanceBetweenPoints(wall.start, other.end);
      const endToStart = distanceBetweenPoints(wall.end, other.start);
      const endToEnd = distanceBetweenPoints(wall.end, other.end);

      const tolerance = 2;
      const isConnected =
        startToStart < tolerance ||
        startToEnd < tolerance ||
        endToStart < tolerance ||
        endToEnd < tolerance;

      if (isConnected) {
        findConnected(other, group);
      }
    }
  }

  // Create groups
  for (const wall of walls) {
    if (!visited.has(wall.id)) {
      const group: Wall[] = [];
      findConnected(wall, group);
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Merge a group of connected walls into a single polygon
 */
function mergeWallGroup(walls: Wall[]): Point2D[] {
  if (walls.length === 0) return [];
  if (walls.length === 1) {
    // Single wall - return its beveled corners
    const beveled = calculateMiteredWallCorners(walls);
    return beveled[0]?.corners || [];
  }

  // Get beveled corners for all walls
  const beveledWalls = calculateMiteredWallCorners(walls);

  // Collect all unique points from all wall corners
  const allPoints: Point2D[] = [];
  const pointSet = new Set<string>();

  for (const { corners } of beveledWalls) {
    for (const corner of corners) {
      const key = `${Math.round(corner.x)},${Math.round(corner.y)}`;
      if (!pointSet.has(key)) {
        pointSet.add(key);
        allPoints.push(corner);
      }
    }
  }

  // Sort points to form a polygon (convex hull or boundary tracing)
  // For now, use a simple approach: trace the outer boundary
  const polygon = traceOuterBoundary(beveledWalls);

  return polygon;
}

/**
 * Trace the outer boundary of beveled walls
 */
function traceOuterBoundary(beveledWalls: Array<{ wallId: string; corners: Point2D[] }>): Point2D[] {
  const allEdges: Array<{ start: Point2D; end: Point2D; wallId: string }> = [];

  // Collect all edges from all walls
  for (const { wallId, corners } of beveledWalls) {
    for (let i = 0; i < corners.length; i++) {
      const start = corners[i];
      const end = corners[(i + 1) % corners.length];
      allEdges.push({ start, end, wallId });
    }
  }

  // Find outer edges (edges that don't have an opposite)
  const outerEdges: typeof allEdges = [];
  const tolerance = 2;

  for (let i = 0; i < allEdges.length; i++) {
    const edge = allEdges[i];
    let hasOpposite = false;

    // Check if there's an edge going the opposite direction
    for (let j = 0; j < allEdges.length; j++) {
      if (i === j) continue;

      const other = allEdges[j];
      const startMatch = distanceBetweenPoints(edge.start, other.end) < tolerance;
      const endMatch = distanceBetweenPoints(edge.end, other.start) < tolerance;

      if (startMatch && endMatch) {
        hasOpposite = true;
        break;
      }
    }

    if (!hasOpposite) {
      outerEdges.push(edge);
    }
  }

  // Trace the boundary by connecting edges
  if (outerEdges.length === 0) return [];

  const polygon: Point2D[] = [];
  const remainingEdges = [...outerEdges];

  let currentEdge = remainingEdges[0];
  polygon.push(currentEdge.start);
  polygon.push(currentEdge.end);
  remainingEdges.splice(0, 1);

  let maxIterations = outerEdges.length * 2;
  let iterations = 0;

  while (remainingEdges.length > 0 && iterations < maxIterations) {
    iterations++;
    const currentEnd = polygon[polygon.length - 1];

    // Find next edge
    let nextIndex = -1;
    let minDist = tolerance;

    for (let i = 0; i < remainingEdges.length; i++) {
      const dist = distanceBetweenPoints(currentEnd, remainingEdges[i].start);
      if (dist < minDist) {
        minDist = dist;
        nextIndex = i;
      }
    }

    if (nextIndex === -1) break;

    const nextEdge = remainingEdges[nextIndex];

    // Check if we're back at start
    if (distanceBetweenPoints(nextEdge.end, polygon[0]) < tolerance) {
      break;
    }

    polygon.push(nextEdge.end);
    remainingEdges.splice(nextIndex, 1);
  }

  return polygon;
}

/**
 * Hook: Merge connected walls into unified polygons
 */
export function useWallMerge(walls: Wall[]): MergedWallGroup[] {
  return useMemo(() => {
    if (walls.length === 0) return [];

    // Find connected groups
    const groups = findConnectedGroups(walls);

    // Merge each group into a polygon
    return groups.map((group, index) => ({
      id: `merged-group-${index}`,
      wallIds: group.map(w => w.id),
      polygon: mergeWallGroup(group)
    }));
  }, [walls]);
}
