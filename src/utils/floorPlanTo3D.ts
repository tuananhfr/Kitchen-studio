/**
 * Convert 2D Floor Plan to 3D Geometry
 */

import type { FloorPlan, Wall, Door, Window } from "../types";
import { getFloorPolygon } from "./floorPolygon";

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
    type: "door" | "window";
    position: [number, number, number];
    dimensions: [number, number, number];
  }>;
}

/**
 * Door 3D data
 */
export interface Door3D {
  id: string;
  wallId: string;
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
  wallId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: [number, number, number]; // Width, Height, Depth
  sillHeight: number;
}

/**
 * Complete 3D Scene data
 */
export interface Scene3D {
  floor:
    | {
        polygon: Array<[number, number]>; // 2D polygon points (X, Z)
        position: [number, number, number];
      }
    | {
        dimensions: [number, number]; // Fallback for simple rectangular floor
        position: [number, number, number];
      };
  footprint: Array<[number, number]> | null; // Inner edge polygon for footprint
  ceiling: {
    dimensions: [number, number];
    position: [number, number, number];
  };
  walls: Wall3D[];
  walls2D: Wall[]; // Original 2D walls for junction calculation
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
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  floorPlan.walls.forEach((wall) => {
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
  const walls3D = floorPlan.walls.map((wall) =>
    convertWallTo3D(wall, floorPlan)
  );

  // Log summary of ALL 3D walls
  console.log("🏗️ ===== 3D WALLS SUMMARY =====");
  console.table(
    floorPlan.walls.map((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const perpX = -dy / length;
      const perpY = dx / length;
      const halfThickness = wall.thickness / 2;

      return {
        "Wall ID": wall.id.substring(0, 8),
        "Start X": wall.start.x.toFixed(1),
        "Start Y(2D)/Z(3D)": wall.start.y.toFixed(1),
        "End X": wall.end.x.toFixed(1),
        "End Y(2D)/Z(3D)": wall.end.y.toFixed(1),
        Length: length.toFixed(1),
        Thickness: wall.thickness,
        "Corner1 X": (wall.start.x + perpX * halfThickness).toFixed(1),
        "Corner1 Z": (wall.start.y + perpY * halfThickness).toFixed(1),
        "Corner2 X": (wall.start.x - perpX * halfThickness).toFixed(1),
        "Corner2 Z": (wall.start.y - perpY * halfThickness).toFixed(1),
        "Corner3 X": (wall.end.x - perpX * halfThickness).toFixed(1),
        "Corner3 Z": (wall.end.y - perpY * halfThickness).toFixed(1),
        "Corner4 X": (wall.end.x + perpX * halfThickness).toFixed(1),
        "Corner4 Z": (wall.end.y + perpY * halfThickness).toFixed(1),
      };
    })
  );

  // Convert doors
  const doors3D = floorPlan.doors.map((door) =>
    convertDoorTo3D(door, floorPlan)
  );

  // Convert windows
  const windows3D = floorPlan.windows.map((window) =>
    convertWindowTo3D(window, floorPlan)
  );

  // Calculate floor polygon using inner edge intersections (same logic as 2D)
  // Use small positive inset to shrink floor inside footprint (footprint is the border)
  const floorPolygon2D = getFloorPolygon(floorPlan.walls, 0);

  // Convert floor polygon to 3D format (X, Z coordinates)
  let floorData: Scene3D["floor"];
  let footprintPolygon: Array<[number, number]> | null = null;

  if (floorPolygon2D && floorPolygon2D.length >= 3) {
    // Use polygon-based floor
    // Flip Z axis to match 3D coordinate system (2D Y → 3D -Z)
    const polygonPoints = floorPolygon2D.map(
      (p) => [p.x, -p.y] as [number, number]
    );
    floorData = {
      polygon: polygonPoints,
      position: [0, 0, 0] as [number, number, number],
    };
    footprintPolygon = polygonPoints;
  } else {
    // Fallback to rectangular floor
    floorData = {
      dimensions: [floorWidth, floorDepth] as [number, number],
      position: [centerX, 0, centerY] as [number, number, number],
    };
  }

  return {
    floor: floorData,
    footprint: footprintPolygon, // Inner edge polygon for footprint rendering
    ceiling: {
      dimensions: [floorWidth, floorDepth],
      position: [centerX, floorPlan.dimensions.height, centerY],
    },
    walls: walls3D,
    walls2D: floorPlan.walls, // Pass original 2D walls for junction calculation
    doors: doors3D,
    windows: windows3D,
    bounds: { minX, maxX, minY, maxY },
  };
}

/**
 * Convert single wall to 3D - render as-is without junction adjustment
 * Match 2D rendering: walls use full centerline length
 */
function convertWallTo3D(wall: Wall, _floorPlan: FloorPlan): Wall3D {
  // Calculate wall direction and length
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Wall center position (use original endpoints - no adjustment)
  const centerX = (wall.start.x + wall.end.x) / 2;
  const centerY = wall.height / 2;
  const centerZ = (wall.start.y + wall.end.y) / 2;

  // Rotation around Y axis
  const angle = Math.atan2(dy, dx);

  // Convert cutouts
  const cutouts = wall.cutouts.map((cutout) => {
    // Position along wall
    const cutoutX = wall.start.x + dx * cutout.position;
    const cutoutZ = wall.start.y + dy * cutout.position;

    // For doors, cutout starts from floor (y=0) to door top
    let cutoutY: number;
    let cutoutHeight: number;

    if (cutout.type === "door") {
      // Door cutout from floor to top of door
      cutoutHeight = cutout.height;
      cutoutY = cutout.height / 2; // Center at half height
    } else {
      cutoutY = cutout.offsetFromFloor + cutout.height / 2;
      cutoutHeight = cutout.height;
    }

    return {
      id: cutout.id,
      type: cutout.type,
      position: [cutoutX, cutoutY, cutoutZ] as [number, number, number],
      dimensions: [cutout.width, cutoutHeight, wall.thickness] as [
        number,
        number,
        number
      ],
    };
  });

  return {
    id: wall.id,
    position: [centerX, centerY, centerZ],
    dimensions: [length, wall.height, wall.thickness],
    rotation: [0, angle, 0],
    cutouts,
  };
}

/**
 * Convert door to 3D
 * Door uses exact same rotation as its parent wall
 */
function convertDoorTo3D(door: Door, floorPlan: FloorPlan): Door3D {
  const wall = floorPlan.walls.find((w) => w.id === door.wallId);
  if (!wall) {
    throw new Error(`Wall ${door.wallId} not found for door ${door.id}`);
  }

  // First, convert wall to get its rotation
  const wall3D = convertWallTo3D(wall, floorPlan);

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  // Position on wall centerline
  const footprintHeight = 0.5;
  const posX = wall.start.x + dx * door.position;
  const posY = footprintHeight + door.height / 2; // Door starts above footprint
  const posZ = wall.start.y + dy * door.position;

  // Door uses EXACT same rotation as wall (not recalculated)
  return {
    id: door.id,
    wallId: door.wallId,
    position: [posX, posY, posZ],
    rotation: wall3D.rotation, // Use wall's rotation directly
    dimensions: [door.width, door.height, door.thickness],
    swingAngle: door.swingAngle,
    doorType: door.doorType,
  };
}

/**
 * Convert window to 3D
 * Window uses exact same rotation as its parent wall
 */
function convertWindowTo3D(window: Window, floorPlan: FloorPlan): Window3D {
  const wall = floorPlan.walls.find((w) => w.id === window.wallId);
  if (!wall) {
    throw new Error(`Wall ${window.wallId} not found for window ${window.id}`);
  }

  // First, convert wall to get its rotation
  const wall3D = convertWallTo3D(wall, floorPlan);

  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;

  // Position on wall centerline
  const footprintHeight = 0.5;
  const posX = wall.start.x + dx * window.position;
  const posY = footprintHeight + window.sillHeight + window.height / 2; // Window starts above footprint
  const posZ = wall.start.y + dy * window.position;

  // Window uses EXACT same rotation as wall (not recalculated)
  return {
    id: window.id,
    wallId: window.wallId,
    position: [posX, posY, posZ],
    rotation: wall3D.rotation, // Use wall's rotation directly
    dimensions: [window.width, window.height, window.depth],
    sillHeight: window.sillHeight,
  };
}
