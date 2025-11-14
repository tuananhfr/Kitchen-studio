/**
 * Application configuration constants
 */

// Grid settings
export const GRID_CONFIG = {
  DEFAULT_SIZE: 10, // cm
  MIN_SIZE: 5,
  MAX_SIZE: 100,
  COLOR: '#d0d0d0',
  COLOR_SECONDARY: '#e8e8e8'
};

// Snap settings
export const SNAP_CONFIG = {
  THRESHOLD: 10, // pixels
  ENABLED_BY_DEFAULT: true
};

// Wall defaults
export const WALL_DEFAULTS = {
  THICKNESS: 20, // cm
  HEIGHT: 240, // cm
  COLOR: '#333333'
};

// Door defaults
export const DOOR_DEFAULTS = {
  WIDTH: 80, // cm
  HEIGHT: 200, // cm
  THICKNESS: 5, // cm
  SWING_ANGLE: 90, // degrees
  TYPE: 'single' as const
};

// Window defaults
export const WINDOW_DEFAULTS = {
  WIDTH: 100, // cm
  HEIGHT: 120, // cm
  SILL_HEIGHT: 90, // cm
  DEPTH: 10, // cm
  TYPE: 'casement' as const
};

// Camera defaults (3D)
export const CAMERA_DEFAULTS = {
  POSITION: { x: 500, y: 500, z: 500 },
  TARGET: { x: 0, y: 0, z: 0 },
  FOV: 50,
  NEAR: 0.1,
  FAR: 10000
};

// Lighting defaults (3D)
export const LIGHTING_DEFAULTS = {
  AMBIENT_INTENSITY: 0.5,
  DIRECTIONAL_INTENSITY: 0.8,
  DIRECTIONAL_POSITION: { x: 10, y: 20, z: 10 }
};

// Performance settings
export const PERFORMANCE_CONFIG = {
  SHADOW_MAP_SIZE: 2048,
  MAX_PIXEL_RATIO: 2,
  ENABLE_ANTIALIASING: true
};

// Export formats
export const EXPORT_FORMATS = {
  IMAGE: ['png', 'jpg'],
  MODEL: ['glb', 'gltf'],
  DOCUMENT: ['pdf', 'json']
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  PROJECT: 'kitchen-studio-project',
  UI_SETTINGS: 'ui-storage',
  RECENT_PROJECTS: 'kitchen-studio-recent'
} as const;

// Measurement units
export const UNITS = {
  MM: 'mm',
  CM: 'cm',
  M: 'm',
  INCH: 'inch',
  FT: 'ft'
} as const;

// Unit conversion (to cm)
export const UNIT_TO_CM = {
  mm: 0.1,
  cm: 1,
  m: 100,
  inch: 2.54,
  ft: 30.48
};
