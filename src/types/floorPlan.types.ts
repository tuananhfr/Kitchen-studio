/**
 * Floor Plan type definitions
 * Includes Wall, Door, Window, and FloorPlan structures
 */

import {
  Point2D,
  Dimensions3D,
  BaseEntity,
  MeasurementUnit,
  Color
} from './common.types';

// ========== Material Reference ==========

/**
 * Material reference for walls/surfaces
 */
export interface MaterialReference {
  id: string;
  name: string;
  type: 'color' | 'texture' | 'preset';
  value: string; // Hex color or texture URL or preset name
}

// ========== Wall Types ==========

/**
 * Wall endpoint with optional snap information
 */
export interface WallPoint extends Point2D {
  snapToGrid?: boolean;
  connectedWallIds?: string[]; // IDs of walls connected to this point
}

/**
 * Wall entity
 */
export interface Wall extends BaseEntity {
  type: 'wall';
  start: WallPoint;
  end: WallPoint;
  thickness: number; // In current unit
  height: number; // In current unit
  material?: MaterialReference;

  // Cutouts for doors and windows
  cutouts: Cutout[];

  // Visual properties
  color?: Color;
  opacity?: number; // 0-1

  // Additional properties
  isLoadBearing?: boolean;
  isExterior?: boolean;
}

/**
 * Cutout in wall for door or window
 */
export interface Cutout {
  id: string;
  type: 'door' | 'window';
  position: number; // Distance from wall start (0-1 normalized)
  width: number;
  height: number;
  offsetFromFloor: number; // For windows
}

// ========== Door Types ==========

/**
 * Door swing direction
 */
export type DoorSwing = 'inward' | 'outward' | 'left' | 'right';

/**
 * Door opening type
 */
export type DoorType = 'single' | 'double' | 'sliding' | 'bifold' | 'pocket';

/**
 * Door entity
 */
export interface Door extends BaseEntity {
  type: 'door';
  wallId: string; // ID of wall this door belongs to
  position: number; // Position along wall (0-1 normalized)

  // Dimensions
  width: number;
  height: number;
  thickness: number;

  // Door properties
  doorType: DoorType;
  swing?: DoorSwing; // For hinged doors
  swingAngle: number; // Opening angle in degrees (0-180)

  // Material and appearance
  material?: MaterialReference;
  color?: Color;
  hasHandle?: boolean;
  handleType?: 'knob' | 'lever' | 'pull';

  // 3D model reference (optional)
  modelPath?: string;
}

// ========== Window Types ==========

/**
 * Window opening type
 */
export type WindowType =
  | 'fixed'
  | 'casement'
  | 'sliding'
  | 'double-hung'
  | 'awning'
  | 'bay'
  | 'bow';

/**
 * Window entity
 */
export interface Window extends BaseEntity {
  type: 'window';
  wallId: string; // ID of wall this window belongs to
  position: number; // Position along wall (0-1 normalized)

  // Dimensions
  width: number;
  height: number;
  depth: number; // Window frame depth

  // Positioning
  sillHeight: number; // Height from floor to bottom of window

  // Window properties
  windowType: WindowType;

  // Frame and glass
  frameMaterial?: MaterialReference;
  frameColor?: Color;
  frameThickness?: number;
  glassType?: 'clear' | 'frosted' | 'tinted';
  glassOpacity?: number; // 0-1

  // Features
  hasSill?: boolean;
  sillDepth?: number;
  hasShutters?: boolean;
  hasCurtains?: boolean;

  // 3D model reference (optional)
  modelPath?: string;
}

// ========== Floor Plan ==========

/**
 * Floor plan shape
 */
export type FloorPlanShape = 'rectangle' | 'L-shape' | 'U-shape' | 'custom';

/**
 * Floor plan metadata
 */
export interface FloorPlanMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: string; // Format version for future compatibility
  author?: string;
  tags?: string[];
}

/**
 * Room dimensions
 */
export interface RoomDimensions {
  width: number; // Main width
  length: number; // Main length
  height: number; // Ceiling height
  unit: MeasurementUnit;
}

/**
 * Complete Floor Plan structure
 */
export interface FloorPlan {
  // Metadata
  metadata: FloorPlanMetadata;

  // Dimensions
  dimensions: RoomDimensions;

  // Shape
  shape: FloorPlanShape;

  // Entities
  walls: Wall[];
  doors: Door[];
  windows: Window[];

  // Floor and ceiling materials
  floorMaterial?: MaterialReference;
  ceilingMaterial?: MaterialReference;

  // Grid settings (for editor)
  gridSize?: number;
  snapToGrid?: boolean;

  // Bounding box (calculated from walls)
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

// ========== Floor Plan Operations ==========

/**
 * Wall measurement
 */
export interface WallMeasurement {
  wallId: string;
  length: number;
  angle: number; // Angle from horizontal in degrees
}

/**
 * Room area calculation
 */
export interface RoomArea {
  total: number; // Total floor area
  usable: number; // Usable area (excluding walls)
  unit: MeasurementUnit;
}

/**
 * Floor plan validation errors
 */
export interface FloorPlanValidationError {
  type: 'warning' | 'error';
  code: string;
  message: string;
  entityId?: string;
  entityType?: 'wall' | 'door' | 'window';
}

/**
 * Floor plan statistics
 */
export interface FloorPlanStats {
  wallCount: number;
  doorCount: number;
  windowCount: number;
  totalWallLength: number;
  area: RoomArea;
  perimeter: number;
}

// ========== Export Types ==========

/**
 * Simplified floor plan for export
 */
export interface FloorPlanExport {
  metadata: FloorPlanMetadata;
  dimensions: RoomDimensions;
  shape: FloorPlanShape;
  walls: Omit<Wall, 'createdAt' | 'updatedAt'>[];
  doors: Omit<Door, 'createdAt' | 'updatedAt'>[];
  windows: Omit<Window, 'createdAt' | 'updatedAt'>[];
  stats?: FloorPlanStats;
}
