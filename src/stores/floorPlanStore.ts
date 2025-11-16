/**
 * Floor Plan Store - Manages 2D floor plan state
 * Uses Zustand with Immer for immutable state updates
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  FloorPlan,
  Wall,
  Door,
  Window,
  FloorPlanMetadata,
  RoomDimensions
} from '../types/floorPlan.types';
import type {
  FloorPlanStore,
  FloorPlanState
} from '../types/store.types';
import type { Tool2D, Point2D, MeasurementUnit } from '../types/common.types';

/**
 * Initial state
 */
const initialState: FloorPlanState = {
  floorPlan: null,
  selectedItemId: null,
  selectedItemType: null,
  currentTool: 'select',
  isDrawing: false,
  drawingStartPoint: null,
  drawingEndPoint: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50
};

/**
 * Create a new floor plan
 */
const createEmptyFloorPlan = (
  name: string,
  width: number,
  length: number,
  height: number,
  unit: MeasurementUnit = 'cm'
): FloorPlan => {
  const now = new Date().toISOString();

  const metadata: FloorPlanMetadata = {
    id: uuidv4(),
    name,
    description: '',
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
    tags: []
  };

  const dimensions: RoomDimensions = {
    width,
    length,
    height,
    unit
  };

  return {
    metadata,
    dimensions,
    shape: 'rectangle',
    walls: [],
    doors: [],
    windows: [],
    gridSize: 10,
    snapToGrid: true
  };
};

/**
 * Floor Plan Store
 */
export const useFloorPlanStore = create<FloorPlanStore>()(
  devtools(
    immer((set, get) => ({
      // State
      ...initialState,

      // ========== Floor Plan Operations ==========

      createFloorPlan: (name, width, length, height) => {
        const floorPlan = createEmptyFloorPlan(name, width, length, height);
        set((state) => {
          state.floorPlan = floorPlan;
          state.history = [floorPlan];
          state.historyIndex = 0;
        });
      },

      loadFloorPlan: (floorPlan) => {
        set((state) => {
          state.floorPlan = floorPlan;
          state.history = [floorPlan];
          state.historyIndex = 0;
          state.selectedItemId = null;
          state.selectedItemType = null;
        });
      },

      clearFloorPlan: () => {
        set(initialState);
      },

      updateFloorPlanMetadata: (metadata) => {
        set((state) => {
          if (state.floorPlan) {
            state.floorPlan.metadata = {
              ...state.floorPlan.metadata,
              ...metadata,
              updatedAt: new Date().toISOString()
            };
          }
        });
      },

      // ========== Wall Operations ==========

      addWall: (wallData) => {
        set((state) => {
          if (!state.floorPlan) return;

          const now = new Date().toISOString();
          const wall: Wall = {
            ...wallData,
            id: uuidv4(),
            type: 'wall',
            createdAt: now,
            updatedAt: now,
            cutouts: []
          };

          state.floorPlan.walls.push(wall);
          state.floorPlan.metadata.updatedAt = now;
        });

        get().addToHistory();
      },

      updateWall: (id, updates) => {
        set((state) => {
          if (!state.floorPlan) return;

          const wall = state.floorPlan.walls.find((w) => w.id === id);
          if (wall) {
            Object.assign(wall, updates);
            wall.updatedAt = new Date().toISOString();
            state.floorPlan.metadata.updatedAt = wall.updatedAt;
          }
        });

        get().addToHistory();
      },

      deleteWall: (id) => {
        set((state) => {
          if (!state.floorPlan) return;

          // Remove wall
          state.floorPlan.walls = state.floorPlan.walls.filter((w) => w.id !== id);

          // Remove associated doors and windows
          state.floorPlan.doors = state.floorPlan.doors.filter((d) => d.wallId !== id);
          state.floorPlan.windows = state.floorPlan.windows.filter((w) => w.wallId !== id);

          state.floorPlan.metadata.updatedAt = new Date().toISOString();

          // Clear selection if deleted item was selected
          if (state.selectedItemId === id) {
            state.selectedItemId = null;
            state.selectedItemType = null;
          }
        });

        get().addToHistory();
      },

      getWall: (id) => {
        const state = get();
        return state.floorPlan?.walls.find((w) => w.id === id);
      },

      // ========== Door Operations ==========

      addDoor: (doorData) => {
        set((state) => {
          if (!state.floorPlan) return;

          const now = new Date().toISOString();
          const door: Door = {
            ...doorData,
            id: uuidv4(),
            type: 'door',
            createdAt: now,
            updatedAt: now
          };

          state.floorPlan.doors.push(door);

          // Add cutout to wall
          const wall = state.floorPlan.walls.find((w) => w.id === door.wallId);
          if (wall) {
            wall.cutouts.push({
              id: door.id,
              type: 'door',
              position: door.position,
              width: door.width,
              height: door.height,
              offsetFromFloor: 0
            });
          }

          state.floorPlan.metadata.updatedAt = now;
        });

        get().addToHistory();
      },

      updateDoor: (id, updates) => {
        set((state) => {
          if (!state.floorPlan) return;

          const door = state.floorPlan.doors.find((d) => d.id === id);
          if (door) {
            const oldWallId = door.wallId;
            Object.assign(door, updates);
            door.updatedAt = new Date().toISOString();

            // Update cutout in wall
            const wall = state.floorPlan.walls.find((w) => w.id === door.wallId);
            if (wall) {
              const cutout = wall.cutouts.find((c) => c.id === id);
              if (cutout) {
                cutout.position = door.position;
                cutout.width = door.width;
                cutout.height = door.height;
              }

              // If wall changed, move cutout
              if (oldWallId !== door.wallId) {
                const oldWall = state.floorPlan.walls.find((w) => w.id === oldWallId);
                if (oldWall) {
                  oldWall.cutouts = oldWall.cutouts.filter((c) => c.id !== id);
                }
                wall.cutouts.push({
                  id: door.id,
                  type: 'door',
                  position: door.position,
                  width: door.width,
                  height: door.height,
                  offsetFromFloor: 0
                });
              }
            }

            state.floorPlan.metadata.updatedAt = door.updatedAt;
          }
        });

        get().addToHistory();
      },

      deleteDoor: (id) => {
        set((state) => {
          if (!state.floorPlan) return;

          const door = state.floorPlan.doors.find((d) => d.id === id);
          if (door) {
            // Remove cutout from wall
            const wall = state.floorPlan.walls.find((w) => w.id === door.wallId);
            if (wall) {
              wall.cutouts = wall.cutouts.filter((c) => c.id !== id);
            }
          }

          state.floorPlan.doors = state.floorPlan.doors.filter((d) => d.id !== id);
          state.floorPlan.metadata.updatedAt = new Date().toISOString();

          if (state.selectedItemId === id) {
            state.selectedItemId = null;
            state.selectedItemType = null;
          }
        });

        get().addToHistory();
      },

      getDoor: (id) => {
        const state = get();
        return state.floorPlan?.doors.find((d) => d.id === id);
      },

      // ========== Window Operations ==========

      addWindow: (windowData) => {
        set((state) => {
          if (!state.floorPlan) return;

          const now = new Date().toISOString();
          const window: Window = {
            ...windowData,
            id: uuidv4(),
            type: 'window',
            createdAt: now,
            updatedAt: now
          };

          state.floorPlan.windows.push(window);

          // Add cutout to wall
          const wall = state.floorPlan.walls.find((w) => w.id === window.wallId);
          if (wall) {
            wall.cutouts.push({
              id: window.id,
              type: 'window',
              position: window.position,
              width: window.width,
              height: window.height,
              offsetFromFloor: window.sillHeight
            });
          }

          state.floorPlan.metadata.updatedAt = now;
        });

        get().addToHistory();
      },

      updateWindow: (id, updates) => {
        set((state) => {
          if (!state.floorPlan) return;

          const window = state.floorPlan.windows.find((w) => w.id === id);
          if (window) {
            const oldWallId = window.wallId;
            Object.assign(window, updates);
            window.updatedAt = new Date().toISOString();

            // Update cutout in wall
            const wall = state.floorPlan.walls.find((w) => w.id === window.wallId);
            if (wall) {
              const cutout = wall.cutouts.find((c) => c.id === id);
              if (cutout) {
                cutout.position = window.position;
                cutout.width = window.width;
                cutout.height = window.height;
                cutout.offsetFromFloor = window.sillHeight;
              }

              // If wall changed, move cutout
              if (oldWallId !== window.wallId) {
                const oldWall = state.floorPlan.walls.find((w) => w.id === oldWallId);
                if (oldWall) {
                  oldWall.cutouts = oldWall.cutouts.filter((c) => c.id !== id);
                }
                wall.cutouts.push({
                  id: window.id,
                  type: 'window',
                  position: window.position,
                  width: window.width,
                  height: window.height,
                  offsetFromFloor: window.sillHeight
                });
              }
            }

            state.floorPlan.metadata.updatedAt = window.updatedAt;
          }
        });

        get().addToHistory();
      },

      deleteWindow: (id) => {
        set((state) => {
          if (!state.floorPlan) return;

          const window = state.floorPlan.windows.find((w) => w.id === id);
          if (window) {
            // Remove cutout from wall
            const wall = state.floorPlan.walls.find((w) => w.id === window.wallId);
            if (wall) {
              wall.cutouts = wall.cutouts.filter((c) => c.id !== id);
            }
          }

          state.floorPlan.windows = state.floorPlan.windows.filter((w) => w.id !== id);
          state.floorPlan.metadata.updatedAt = new Date().toISOString();

          if (state.selectedItemId === id) {
            state.selectedItemId = null;
            state.selectedItemType = null;
          }
        });

        get().addToHistory();
      },

      getWindow: (id) => {
        const state = get();
        return state.floorPlan?.windows.find((w) => w.id === id);
      },

      // ========== Selection ==========

      setSelectedItem: (id, type) => {
        set((state) => {
          state.selectedItemId = id;
          state.selectedItemType = type;
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selectedItemId = null;
          state.selectedItemType = null;
        });
      },

      // ========== Tool ==========

      setCurrentTool: (tool: Tool2D) => {
        set((state) => {
          state.currentTool = tool;
          // Clear selection when switching tools
          if (tool !== 'select') {
            state.selectedItemId = null;
            state.selectedItemType = null;
          }
        });
      },

      // ========== Drawing State ==========

      startDrawing: (point: Point2D) => {
        set((state) => {
          state.isDrawing = true;
          state.drawingStartPoint = point;
          state.drawingEndPoint = point;
        });
      },

      updateDrawing: (point: Point2D) => {
        set((state) => {
          if (state.isDrawing) {
            state.drawingEndPoint = point;
          }
        });
      },

      finishDrawing: () => {
        const state = get();
        if (state.isDrawing && state.drawingStartPoint && state.drawingEndPoint) {
          // Create wall from drawing
          if (state.currentTool === 'wall') {
            get().addWall({
              type: 'wall',
              name: `Wall ${state.floorPlan?.walls.length ?? 0 + 1}`,
              start: { ...state.drawingStartPoint },
              end: { ...state.drawingEndPoint },
              thickness: 20, // Default 20cm
              height: state.floorPlan?.dimensions.height ?? 240, // Default or room height
              cutouts: []
            });
          }
        }

        set((state) => {
          state.isDrawing = false;
          state.drawingStartPoint = null;
          state.drawingEndPoint = null;
        });
      },

      cancelDrawing: () => {
        set((state) => {
          state.isDrawing = false;
          state.drawingStartPoint = null;
          state.drawingEndPoint = null;
        });
      },

      // ========== History (Undo/Redo) ==========

      addToHistory: () => {
        set((state) => {
          if (!state.floorPlan) return;

          // Remove any future history
          state.history = state.history.slice(0, state.historyIndex + 1);

          // Add current state to history
          state.history.push(JSON.parse(JSON.stringify(state.floorPlan)));

          // Limit history size
          if (state.history.length > state.maxHistorySize) {
            state.history = state.history.slice(-state.maxHistorySize);
          }

          state.historyIndex = state.history.length - 1;
        });
      },

      undo: () => {
        const state = get();
        if (state.canUndo()) {
          set((s) => {
            s.historyIndex--;
            s.floorPlan = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.canRedo()) {
          set((s) => {
            s.historyIndex++;
            s.floorPlan = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
          });
        }
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      }
    })),
    { name: 'FloorPlanStore' }
  )
);
