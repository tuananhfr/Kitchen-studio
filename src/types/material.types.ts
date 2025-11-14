/**
 * Material and Texture type definitions
 */

import { Color, HexColor } from './common.types';

// ========== Texture Types ==========

/**
 * Texture map types
 */
export type TextureMapType =
  | 'map' // Diffuse/Color map
  | 'normalMap' // Normal map
  | 'roughnessMap' // Roughness map
  | 'metalnessMap' // Metalness map
  | 'aoMap' // Ambient occlusion map
  | 'displacementMap' // Displacement map
  | 'emissiveMap' // Emissive map
  | 'alphaMap'; // Alpha/transparency map

/**
 * Texture configuration
 */
export interface TextureConfig {
  url: string;
  type: TextureMapType;

  // Texture transformation
  repeat?: { x: number; y: number };
  offset?: { x: number; y: number };
  rotation?: number; // In radians
  center?: { x: number; y: number };

  // Wrapping
  wrapS?: 'repeat' | 'clampToEdge' | 'mirroredRepeat';
  wrapT?: 'repeat' | 'clampToEdge' | 'mirroredRepeat';

  // Filtering
  minFilter?: 'nearest' | 'linear' | 'nearestMipmapNearest' | 'linearMipmapLinear';
  magFilter?: 'nearest' | 'linear';

  // Encoding
  encoding?: 'linear' | 'sRGB';
}

/**
 * Texture set (multiple maps for a material)
 */
export interface TextureSet {
  name: string;
  diffuse?: TextureConfig;
  normal?: TextureConfig;
  roughness?: TextureConfig;
  metalness?: TextureConfig;
  ao?: TextureConfig;
  displacement?: TextureConfig;
  emissive?: TextureConfig;
}

// ========== Material Types ==========

/**
 * Material category
 */
export type MaterialCategory =
  | 'wood'
  | 'metal'
  | 'ceramic'
  | 'stone'
  | 'glass'
  | 'plastic'
  | 'fabric'
  | 'concrete'
  | 'paint'
  | 'other';

/**
 * Three.js material type
 */
export type ThreeMaterialType =
  | 'MeshStandardMaterial'
  | 'MeshPhysicalMaterial'
  | 'MeshBasicMaterial'
  | 'MeshPhongMaterial'
  | 'MeshLambertMaterial';

/**
 * Material finish
 */
export type MaterialFinish =
  | 'matte'
  | 'glossy'
  | 'satin'
  | 'metallic'
  | 'brushed'
  | 'polished'
  | 'rough'
  | 'smooth';

/**
 * Base material properties
 */
export interface BaseMaterialProperties {
  // Material type
  type: ThreeMaterialType;

  // Color
  color?: Color;

  // PBR properties
  roughness?: number; // 0 = smooth, 1 = rough
  metalness?: number; // 0 = non-metal, 1 = metal

  // Opacity
  opacity?: number; // 0 = transparent, 1 = opaque
  transparent?: boolean;

  // Emissive (glow)
  emissive?: Color;
  emissiveIntensity?: number;

  // Reflectivity
  reflectivity?: number; // 0-1
  envMapIntensity?: number; // Environment map intensity

  // Other properties
  flatShading?: boolean;
  wireframe?: boolean;
  side?: 'front' | 'back' | 'double';
}

/**
 * Complete material definition
 */
export interface Material extends BaseMaterialProperties {
  id: string;
  name: string;
  category: MaterialCategory;
  finish?: MaterialFinish;

  // Textures
  textures?: TextureSet;

  // Physical properties (optional)
  clearcoat?: number; // 0-1
  clearcoatRoughness?: number; // 0-1
  sheen?: number; // 0-1
  transmission?: number; // 0-1 (for glass)
  thickness?: number; // For transmission
  ior?: number; // Index of refraction (1.0-2.333)

  // Metadata
  description?: string;
  thumbnail?: string; // Preview image
  tags?: string[];
  isCustom?: boolean; // User-created vs preset
}

// ========== Material Presets ==========

/**
 * Wood types
 */
export type WoodType =
  | 'oak'
  | 'walnut'
  | 'maple'
  | 'cherry'
  | 'pine'
  | 'mahogany'
  | 'birch'
  | 'bamboo'
  | 'teak';

/**
 * Metal types
 */
export type MetalType =
  | 'steel'
  | 'stainless-steel'
  | 'aluminum'
  | 'brass'
  | 'copper'
  | 'bronze'
  | 'chrome'
  | 'gold'
  | 'silver';

/**
 * Stone types
 */
export type StoneType =
  | 'marble'
  | 'granite'
  | 'quartz'
  | 'limestone'
  | 'slate'
  | 'travertine'
  | 'concrete';

/**
 * Ceramic types
 */
export type CeramicType =
  | 'porcelain'
  | 'ceramic-tile'
  | 'terracotta'
  | 'glazed'
  | 'unglazed';

/**
 * Material preset (predefined material)
 */
export interface MaterialPreset {
  id: string;
  name: string;
  category: MaterialCategory;
  subtype?: WoodType | MetalType | StoneType | CeramicType | string;
  material: Omit<Material, 'id' | 'name' | 'category'>;
  thumbnail: string;
  tags?: string[];
}

// ========== Material Library ==========

/**
 * Material library collection
 */
export interface MaterialLibrary {
  id: string;
  name: string;
  description?: string;
  presets: MaterialPreset[];
  custom: Material[];
}

// ========== Material Editor State ==========

/**
 * Material editor properties
 */
export interface MaterialEditorState {
  // Current material being edited
  currentMaterial: Material | null;

  // Applied to object
  targetObjectId: string | null;
  targetObjectType: 'furniture' | 'wall' | 'floor' | 'ceiling' | null;

  // Editor controls
  selectedPresetId: string | null;
  isCustomMode: boolean;

  // Preview
  showPreview: boolean;
  previewMode: '2d' | '3d';
}

// ========== Color Palettes ==========

/**
 * Color palette for quick selection
 */
export interface ColorPalette {
  id: string;
  name: string;
  colors: HexColor[];
  description?: string;
}

/**
 * Predefined color palettes
 */
export type PaletteType =
  | 'neutral'
  | 'warm'
  | 'cool'
  | 'earth'
  | 'pastel'
  | 'vibrant'
  | 'monochrome';

// ========== Material Operations ==========

/**
 * Material application target
 */
export interface MaterialTarget {
  objectId: string;
  objectType: 'furniture' | 'wall' | 'floor' | 'ceiling';
  partName?: string; // For multi-material objects (e.g., "body", "top")
}

/**
 * Material history entry (for undo/redo)
 */
export interface MaterialHistoryEntry {
  timestamp: string;
  target: MaterialTarget;
  previousMaterial: Material;
  newMaterial: Material;
}

/**
 * Material export data
 */
export interface MaterialExport {
  id: string;
  name: string;
  category: MaterialCategory;
  properties: BaseMaterialProperties;
  textureUrls?: Record<TextureMapType, string>;
}
