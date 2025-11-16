/**
 * Convert 2D Floor Plan to 3D Geometry
 */

import type { FloorPlan, Wall, Door, Window } from '../types';

/**
 * Wall 3D data
 */
export interface Wall3D {
  id: string;
  position: [number, number, number]; // Center position
  dimensions: [number, number, number]; // Width, Height, Depth (thickness)
  rotation: [number, number, number]; // Euler angles
  cutouts: Array<{
    id: string;
    type: 'door' | 'window';
    position: [number, number, number];
    dimensions: [number, number, number];
  }>;
}

/**
 * Door 3D data
 */
export interface Door3D {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: [number, number, number]; // Width, Height, Thickness
  swingAngle: number;
  doorType: string;
}

/**
 * Window 3D data
 */
export interface Window3D {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: [number, number, number]; // Width, Height, Depth
  sillHeight: number;
}

/**
 * Complete 3D Scene data
 */
export interface Scene3D {
  floor: {
    dimensions: [number, number];
    position: [number, number, number];
  };
  ceiling: {
    dimensions: [number, number];
    position: [number, number, number];
  };
  walls: Wall3D[];
  doors: Door3D[];
  windows: Window3D[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Convert 2D floor plan to 3D scene data
 */
export function floorPlanTo3D(floorPlan: FloorPlan): Scene3D {
  // Calculate bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  floorPlan.walls.forEach(wall => {
    minX = Math.min(minX, wall.start.x, wall.end.x);
    maxX = Math.max(maxX, wall.start.x, wall.end.x);
    minY = Math.min(minY, wall.start.y, wall.end.y);
    maxY = Math.max(maxY, wall.start.y, wall.end.y);
  });

  // Add padding
  const padding = 50;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const floorWidth = maxX - minX;
  const floorDepth = maxY - minY;

  // Convert walls
  const walls3D = floorPlan.walls.map(wall => convertWallTo3D(wall, floorPlan));

  // Convert doors
  const doors3D = floorPlan.doors.map(door => convertDoorTo3D(door, floorPlan));

  // Convert windows
  const windows3D = floorPlan.windows.map(window => convertWindowTo3D(window, floorPlan));

  return {
    floor: {
      dimensions: [floorWidth, floorDepth],
      position: [centerX, 0, centerY]
    },
    ceiling: {
      dimensions: [floorWidth, floorDepth],
      position: [centerX, floorPlan.dimensions.height, centerY]
    },
    walls: walls3D,
    doors: doors3D,
    windows: windows3D,
    bounds: { minX, maxX, minY, maxY }
  };
}

/**
 * Convert single wall to 3D
 */
function convertWallTo3D(wall: Wall, _floorPlan: FloorPlan): Wall3D {
  // Calculate wall direction and length
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Wall center position
  const centerX = (wall.start.x + wall.end.x) / 2;
  const centerY = wall.height / 2;
  const centerZ = (wall.start.y + wall.end.y) / 2;

  // Rotation around Y axis
  const angle = Math.atan2(dy, dx);

  // Convert cutouts
  const cutouts = wall.cutouts.map(cutout => {
    // Position along wall
    const cutoutX = wall.start.x + dx * cutout.position;
    const cutoutZ = wall.start.y + dy * cutout.position;
    const cutoutY = cutout.type === 'door' ? cutout.height / 2 : cutout.offsetFromFloor + cutout.height / 2;

    return {
      id: cutout.id,
      type: cutout.type,
      position: [cutoutX, cutoutY, cutoutZ] as [number, number, number],
      dimensions: [cutout.width, cutout.height, wall.thickness] as [number, number, number]
    };
  });

  return {
    id: wall.id,
    position: [centerX, centerY, centerZ],
    dimensions: [length, wall.height, wall.thickness],
    rotation: [0, angle, 0],
    cutouts
  };
}

/**
 * Convert door to 3D
 */
function convertDoorTo3D(door: Door, floorPlan: FloorPlan): Door3D {
  const wall = floorPlan.walls.find(w => w.id === door.wallId);
  if (!wall) {
    throw new Error(`Wall ${door.wallId} not found for door ${door.id}`);
  }

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  // Position on wall
  const posX = wall.start.x + dx * door.position;
  const posY = door.height / 2;
  const posZ = wall.start.y + dy * door.position;

  // Rotation (same as wall)
  const angle = Math.atan2(dy, dx);

  return {
    id: door.id,
    position: [posX, posY, posZ],
    rotation: [0, angle, 0],
    dimensions: [door.width, door.height, door.thickness],
    swingAngle: door.swingAngle,
    doorType: door.doorType
  };
}

/**
 * Convert window to 3D
 */
function convertWindowTo3D(window: Window, floorPlan: FloorPlan): Window3D {
  const wall = floorPlan.walls.find(w => w.id === window.wallId);
  if (!wall) {
    throw new Error(`Wall ${window.wallId} not found for window ${window.id}`);
  }

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  // Position on wall
  const posX = wall.start.x + dx * window.position;
  const posY = window.sillHeight + window.height / 2;
  const posZ = wall.start.y + dy * window.position;

  // Rotation (same as wall)
  const angle = Math.atan2(dy, dx);

  return {
    id: window.id,
    position: [posX, posY, posZ],
    rotation: [0, angle, 0],
    dimensions: [window.width, window.height, window.depth],
    sillHeight: window.sillHeight
  };
}
