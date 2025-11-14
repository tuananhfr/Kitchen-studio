/**
 * Furniture and Interior Design type definitions
 */

import {
  Point3D,
  Rotation3D,
  Scale3D,
  Dimensions3D,
  BaseEntity,
  BoundingBox3D,
  Color
} from './common.types';
import { MaterialReference } from './floorPlan.types';

// ========== Furniture Categories ==========

/**
 * Furniture category types
 */
export type FurnitureCategory =
  | 'cabinet' // Tủ bếp
  | 'appliance' // Thiết bị (bếp nấu, tủ lạnh, lò nướng)
  | 'counter' // Quầy bar, bàn đảo
  | 'table' // Bàn ăn
  | 'chair' // Ghế
  | 'lighting' // Đèn
  | 'sink' // Bồn rửa
  | 'storage' // Kệ, tủ lưu trữ
  | 'decoration' // Phụ kiện trang trí
  | 'other'; // Khác

/**
 * Category metadata
 */
export interface CategoryInfo {
  id: FurnitureCategory;
  name: string;
  icon: string; // Bootstrap icon class
  description?: string;
}

// ========== Material Properties ==========

/**
 * Material customization options
 */
export interface MaterialCustomization {
  color?: boolean; // Can change color
  texture?: boolean; // Can change texture
  roughness?: boolean; // Can adjust roughness
  metalness?: boolean; // Can adjust metalness
}

/**
 * Material properties for 3D rendering
 */
export interface MaterialProperties {
  type: 'standard' | 'physical' | 'basic' | 'phong' | 'lambert';
  color?: Color;
  texture?: string; // Texture URL or path
  normalMap?: string;
  roughnessMap?: string;
  metalnessMap?: string;

  // PBR properties
  roughness?: number; // 0-1
  metalness?: number; // 0-1
  opacity?: number; // 0-1
  transparent?: boolean;

  // Texture tiling
  textureRepeat?: { x: number; y: number };
}

/**
 * Multi-material object (different materials for different parts)
 */
export interface MultiMaterial {
  body?: MaterialProperties;
  top?: MaterialProperties;
  legs?: MaterialProperties;
  handles?: MaterialProperties;
  glass?: MaterialProperties;
  [key: string]: MaterialProperties | undefined;
}

// ========== Furniture Item ==========

/**
 * Furniture placement constraints
 */
export interface PlacementConstraints {
  snapToWall?: boolean; // Must be placed against wall
  snapToFloor?: boolean; // Must be on floor
  snapToGrid?: boolean; // Snap to grid
  allowRotation?: boolean; // Can be rotated
  allowScale?: boolean; // Can be scaled
  minDistanceFromWall?: number;
  maxDistanceFromWall?: number;
}

/**
 * Furniture animation (for doors, drawers, etc.)
 */
export interface FurnitureAnimation {
  name: string;
  type: 'rotate' | 'translate' | 'scale';
  target: string; // Object name in 3D model
  duration: number; // In seconds
  loop?: boolean;
}

/**
 * Furniture interaction (clickable parts)
 */
export interface FurnitureInteraction {
  type: 'door' | 'drawer' | 'button' | 'switch';
  target: string; // Object name in 3D model
  animation?: FurnitureAnimation;
  callback?: string; // Function name to call
}

/**
 * Furniture item (3D object in scene)
 */
export interface FurnitureItem extends BaseEntity {
  // Category
  category: FurnitureCategory;

  // Display info
  displayName: string;
  description?: string;
  thumbnail?: string; // Thumbnail image URL

  // 3D Model
  modelPath?: string; // Path to .glb/.gltf file
  modelType?: 'glb' | 'gltf' | 'primitive'; // Primitive for simple geometries

  // Transform
  position: Point3D;
  rotation: Rotation3D;
  scale: Scale3D;

  // Dimensions (in cm)
  dimensions: Dimensions3D;

  // Bounding box (for collision detection)
  boundingBox?: BoundingBox3D;

  // Materials
  materials: MultiMaterial;
  customizable?: {
    [key in keyof MultiMaterial]?: MaterialCustomization;
  };

  // Placement
  constraints?: PlacementConstraints;

  // Interaction
  interactions?: FurnitureInteraction[];

  // Physics
  mass?: number; // For physics simulation (optional)
  isStatic?: boolean; // Cannot be moved after placed

  // Metadata
  manufacturer?: string;
  price?: number;
  sku?: string;
  tags?: string[];

  // State
  isSelected?: boolean;
  isLocked?: boolean; // Cannot be moved/deleted
  isVisible?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// ========== Furniture Library ==========

/**
 * Furniture template (library item before instantiation)
 */
export interface FurnitureTemplate {
  id: string;
  category: FurnitureCategory;
  name: string;
  description?: string;
  thumbnail: string;
  modelPath?: string;
  modelType?: 'glb' | 'gltf' | 'primitive';

  // Default dimensions
  defaultDimensions: Dimensions3D;

  // Default materials
  defaultMaterials: MultiMaterial;

  // Customization options
  customizable?: {
    dimensions?: ('width' | 'height' | 'depth')[];
    materials?: {
      [key in keyof MultiMaterial]?: MaterialCustomization;
    };
  };

  // Default constraints
  constraints?: PlacementConstraints;

  // Metadata
  manufacturer?: string;
  price?: number;
  sku?: string;
  tags?: string[];
}

/**
 * Furniture library (collection of templates)
 */
export interface FurnitureLibrary {
  id: string;
  name: string;
  description?: string;
  categories: FurnitureCategory[];
  items: FurnitureTemplate[];
}

// ========== Furniture Operations ==========

/**
 * Furniture placement result
 */
export interface PlacementResult {
  success: boolean;
  position?: Point3D;
  rotation?: Rotation3D;
  error?: string;
  warnings?: string[];
}

/**
 * Collision detection result
 */
export interface CollisionResult {
  hasCollision: boolean;
  collidingWith?: string[]; // IDs of colliding objects
  penetrationDepth?: number;
}

/**
 * Snap point for furniture
 */
export interface SnapPoint {
  position: Point3D;
  normal: Point3D; // Surface normal
  type: 'wall' | 'floor' | 'ceiling' | 'furniture' | 'grid';
  distance: number; // Distance from cursor
}

// ========== Furniture Groups ==========

/**
 * Furniture group (multiple items grouped together)
 */
export interface FurnitureGroup extends BaseEntity {
  itemIds: string[];
  position: Point3D; // Group center
  rotation: Rotation3D;
  boundingBox: BoundingBox3D;
  isLocked?: boolean;
}

// ========== Presets ==========

/**
 * Kitchen layout preset
 */
export interface KitchenPreset {
  id: string;
  name: string;
  description?: string;
  thumbnail: string;
  layout: 'L-shape' | 'U-shape' | 'galley' | 'island' | 'single-wall';
  furniture: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>[];
}
