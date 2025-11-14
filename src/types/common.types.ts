/**
 * Common type definitions used across the application
 */

// ========== Basic Geometric Types ==========

/**
 * 2D Point coordinates
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * 3D Point coordinates
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D Vector (same as Point3D but semantically different)
 */
export type Vector3D = Point3D;

/**
 * 2D Dimensions
 */
export interface Dimensions2D {
  width: number;
  height: number;
}

/**
 * 3D Dimensions
 */
export interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

/**
 * Rotation angles in radians
 */
export interface Rotation3D {
  x: number; // Pitch
  y: number; // Yaw
  z: number; // Roll
}

/**
 * Scale factors
 */
export interface Scale3D {
  x: number;
  y: number;
  z: number;
}

// ========== Transform ==========

/**
 * 3D Transform (position, rotation, scale)
 */
export interface Transform3D {
  position: Point3D;
  rotation: Rotation3D;
  scale: Scale3D;
}

// ========== Bounding Box ==========

/**
 * 2D Bounding Box
 */
export interface BoundingBox2D {
  min: Point2D;
  max: Point2D;
}

/**
 * 3D Bounding Box
 */
export interface BoundingBox3D {
  min: Point3D;
  max: Point3D;
}

// ========== Measurement Units ==========

/**
 * Supported measurement units
 */
export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'inch' | 'ft';

/**
 * Default unit for the application
 */
export const DEFAULT_UNIT: MeasurementUnit = 'cm';

// ========== Color ==========

/**
 * RGB Color (0-255 range)
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * RGBA Color with alpha channel
 */
export interface RGBAColor extends RGBColor {
  a: number; // 0-1 range
}

/**
 * Hex color string (e.g., "#FF5733")
 */
export type HexColor = string;

/**
 * Color can be hex string or RGB object
 */
export type Color = HexColor | RGBColor | RGBAColor;

// ========== Common Entity Properties ==========

/**
 * Base entity with unique identifier
 */
export interface BaseEntity {
  id: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Entity with metadata
 */
export interface EntityWithMetadata extends BaseEntity {
  metadata?: Record<string, unknown>;
}

// ========== Selection & Interaction ==========

/**
 * Selection state
 */
export interface SelectionState {
  selectedId: string | null;
  hoveredId: string | null;
}

/**
 * Tool types for 2D editor
 */
export type Tool2D = 'select' | 'wall' | 'door' | 'window' | 'measure' | 'pan';

/**
 * View mode (2D or 3D)
 */
export type ViewMode = '2d' | '3d';

// ========== Export/Import ==========

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'png' | 'jpg' | 'pdf' | 'glb' | 'gltf';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  quality?: number; // For image formats (0-1)
  resolution?: Dimensions2D; // For image formats
  includeMetadata?: boolean;
}

// ========== Validation ==========

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ========== API Response ==========

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
