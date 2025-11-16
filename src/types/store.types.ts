/**
 * Zustand Store type definitions
 * Includes state and action types for all stores
 */

import type { FloorPlan, Wall, Door, Window } from './floorPlan.types';
import type { FurnitureItem, FurnitureGroup } from './furniture.types';
import type { Material, MaterialPreset } from './material.types';
import type { ViewMode, Tool2D, Point2D, Point3D } from './common.types';

// ========== Floor Plan Store ==========

/**
 * Floor Plan Store State
 */
export interface FloorPlanState {
  // Current floor plan
  floorPlan: FloorPlan | null;

  // Selection
  selectedItemId: string | null;
  selectedItemType: 'wall' | 'door' | 'window' | null;

  // Current tool
  currentTool: Tool2D;

  // Temporary drawing state (for wall tool)
  isDrawing: boolean;
  drawingStartPoint: Point2D | null;
  drawingEndPoint: Point2D | null;

  // History for undo/redo
  history: FloorPlan[];
  historyIndex: number;
  maxHistorySize: number;
}

/**
 * Floor Plan Store Actions
 */
export interface FloorPlanActions {
  // Floor plan operations
  createFloorPlan: (name: string, width: number, length: number, height: number) => void;
  loadFloorPlan: (floorPlan: FloorPlan) => void;
  clearFloorPlan: () => void;
  updateFloorPlanMetadata: (metadata: Partial<FloorPlan['metadata']>) => void;

  // Wall operations
  addWall: (wall: Omit<Wall, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  deleteWall: (id: string) => void;
  getWall: (id: string) => Wall | undefined;

  // Door operations
  addDoor: (door: Omit<Door, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  deleteDoor: (id: string) => void;
  getDoor: (id: string) => Door | undefined;

  // Window operations
  addWindow: (window: Omit<Window, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  deleteWindow: (id: string) => void;
  getWindow: (id: string) => Window | undefined;

  // Selection
  setSelectedItem: (id: string | null, type: 'wall' | 'door' | 'window' | null) => void;
  clearSelection: () => void;

  // Tool
  setCurrentTool: (tool: Tool2D) => void;

  // Drawing state
  startDrawing: (point: Point2D) => void;
  updateDrawing: (point: Point2D) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
}

/**
 * Complete Floor Plan Store
 */
export type FloorPlanStore = FloorPlanState & FloorPlanActions;

// ========== Furniture Store ==========

/**
 * Furniture Store State
 */
export interface FurnitureState {
  // All furniture items in scene
  items: FurnitureItem[];

  // Groups
  groups: FurnitureGroup[];

  // Selection
  selectedItemId: string | null;
  selectedGroupId: string | null;

  // Multi-selection
  multiSelection: string[];

  // Clipboard (for copy/paste)
  clipboard: FurnitureItem | null;

  // Transform mode
  transformMode: 'translate' | 'rotate' | 'scale' | null;

  // History
  history: FurnitureItem[][];
  historyIndex: number;
  maxHistorySize: number;
}

/**
 * Furniture Store Actions
 */
export interface FurnitureActions {
  // Item operations
  addItem: (item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteItem: (id: string) => void;
  deleteMultiple: (ids: string[]) => void;
  getItem: (id: string) => FurnitureItem | undefined;
  duplicateItem: (id: string, offset?: Point3D) => string | null;
  clearAll: () => void;

  // Transform operations
  moveItem: (id: string, position: Point3D) => void;
  rotateItem: (id: string, rotation: Point3D) => void;
  scaleItem: (id: string, scale: Point3D) => void;

  // Selection
  setSelectedItem: (id: string | null) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Group operations
  createGroup: (itemIds: string[], name?: string) => string;
  updateGroup: (id: string, updates: Partial<FurnitureGroup>) => void;
  deleteGroup: (id: string, deleteItems?: boolean) => void;
  addToGroup: (groupId: string, itemId: string) => void;
  removeFromGroup: (groupId: string, itemId: string) => void;

  // Clipboard
  copy: (id: string) => void;
  paste: (position?: Point3D) => string | null;
  cut: (id: string) => void;

  // Transform mode
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale' | null) => void;

  // Lock/unlock
  lockItem: (id: string) => void;
  unlockItem: (id: string) => void;
  toggleLock: (id: string) => void;

  // Visibility
  showItem: (id: string) => void;
  hideItem: (id: string) => void;
  toggleVisibility: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
}

/**
 * Complete Furniture Store
 */
export type FurnitureStore = FurnitureState & FurnitureActions;

// ========== Material Store ==========

/**
 * Material Store State
 */
export interface MaterialState {
  // Presets
  presets: MaterialPreset[];

  // Custom materials
  customMaterials: Material[];

  // Currently selected material
  selectedMaterialId: string | null;

  // Material being edited
  editingMaterial: Material | null;

  // Applied materials (objectId -> materialId mapping)
  appliedMaterials: Record<string, string>;

  // History
  history: Material[][];
  historyIndex: number;
}

/**
 * Material Store Actions
 */
export interface MaterialActions {
  // Preset operations
  loadPresets: (presets: MaterialPreset[]) => void;
  getPreset: (id: string) => MaterialPreset | undefined;

  // Custom material operations
  createCustomMaterial: (material: Omit<Material, 'id'>) => string;
  updateCustomMaterial: (id: string, updates: Partial<Material>) => void;
  deleteCustomMaterial: (id: string) => void;
  getCustomMaterial: (id: string) => Material | undefined;

  // Material application
  applyMaterial: (objectId: string, materialId: string, partName?: string) => void;
  removeMaterial: (objectId: string) => void;
  getMaterialForObject: (objectId: string) => Material | MaterialPreset | undefined;

  // Selection
  selectMaterial: (id: string | null) => void;

  // Editing
  startEditingMaterial: (material: Material) => void;
  updateEditingMaterial: (updates: Partial<Material>) => void;
  saveEditingMaterial: () => void;
  cancelEditingMaterial: () => void;

  // Search
  searchMaterials: (query: string) => (Material | MaterialPreset)[];
  filterByCategory: (category: string) => (Material | MaterialPreset)[];

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  addToHistory: () => void;
}

/**
 * Complete Material Store
 */
export type MaterialStore = MaterialState & MaterialActions;

// ========== UI Store ==========

/**
 * Camera state
 */
export interface CameraState {
  position: Point3D;
  target: Point3D;
  zoom: number;
}

/**
 * Panel state
 */
export interface PanelState {
  isOpen: boolean;
  width?: number;
  pinnedopen?: boolean;
}

/**
 * UI Store State
 */
export interface UIState {
  // View mode
  viewMode: ViewMode;

  // Panels
  leftSidebar: PanelState;
  rightPanel: PanelState;
  bottomToolbar: PanelState;

  // 2D Editor settings
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  gridColor: string;
  showMeasurements: boolean;
  showDimensions: boolean;
  unit: 'mm' | 'cm' | 'm' | 'inch' | 'ft';

  // 3D Viewer settings
  showAxes: boolean;
  showFloor: boolean;
  showCeiling: boolean;
  showWalls: boolean;
  showShadows: boolean;
  showWireframe: boolean;
  cameraMode: 'perspective' | 'orthographic' | 'first-person';
  cameraState: CameraState;

  // Performance
  enableAntialiasing: boolean;
  shadowMapSize: number;
  pixelRatio: number;

  // Modals
  activeModal: string | null;
  modalData: unknown;

  // Loading
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number; // 0-100

  // Notifications
  notifications: Notification[];
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // Auto-dismiss duration in ms
  timestamp: string;
}

/**
 * UI Store Actions
 */
export interface UIActions {
  // View mode
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;

  // Panels
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  toggleBottomToolbar: () => void;
  setLeftSidebarOpen: (isOpen: boolean) => void;
  setRightPanelOpen: (isOpen: boolean) => void;
  setBottomToolbarOpen: (isOpen: boolean) => void;

  // 2D settings
  toggleGrid: () => void;
  setShowGrid: (show: boolean) => void;
  toggleSnap: () => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  toggleMeasurements: () => void;
  toggleDimensions: () => void;
  setUnit: (unit: 'mm' | 'cm' | 'm' | 'inch' | 'ft') => void;

  // 3D settings
  toggleAxes: () => void;
  toggleFloor: () => void;
  toggleCeiling: () => void;
  toggleWalls: () => void;
  toggleShadows: () => void;
  toggleWireframe: () => void;
  setCameraMode: (mode: 'perspective' | 'orthographic' | 'first-person') => void;
  updateCameraState: (state: Partial<CameraState>) => void;

  // Performance
  setAntialiasing: (enabled: boolean) => void;
  setShadowMapSize: (size: number) => void;
  setPixelRatio: (ratio: number) => void;

  // Modals
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  // Loading
  setLoading: (isLoading: boolean, message?: string, progress?: number) => void;
  updateLoadingProgress: (progress: number) => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Responsive
  setIsMobile: (isMobile: boolean) => void;
  setIsTablet: (isTablet: boolean) => void;
}

/**
 * Complete UI Store
 */
export type UIStore = UIState & UIActions;

// ========== Combined Store Type ==========

/**
 * Root store (if using combined store pattern)
 */
export interface RootStore {
  floorPlan: FloorPlanStore;
  furniture: FurnitureStore;
  material: MaterialStore;
  ui: UIStore;
}
