/**
 * UI Store - Manages UI state and settings
 * Uses Zustand with Immer for immutable state updates
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { UIStore, UIState, CameraState, Notification } from '../types/store.types';
import type { ViewMode } from '../types/common.types';

/**
 * Initial state
 */
const initialState: UIState = {
  // View mode
  viewMode: '2d',

  // Panels
  leftSidebar: {
    isOpen: true,
    width: 250,
    pinnedopen: false
  },
  rightPanel: {
    isOpen: true,
    width: 300,
    pinnedopen: false
  },
  bottomToolbar: {
    isOpen: true,
    pinnedopen: false
  },

  // 2D Editor settings
  showGrid: true,
  snapToGrid: true,
  gridSize: 10, // cm
  gridColor: '#cccccc',
  showMeasurements: true,
  showDimensions: true,
  unit: 'cm',

  // 3D Viewer settings
  showAxes: false,
  showFloor: true,
  showCeiling: true,
  showWalls: true,
  showShadows: true,
  showWireframe: false,
  cameraMode: 'perspective',
  cameraState: {
    position: { x: 500, y: 500, z: 500 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1
  },

  // Performance
  enableAntialiasing: true,
  shadowMapSize: 2048,
  pixelRatio: Math.min(window.devicePixelRatio, 2),

  // Modals
  activeModal: null,
  modalData: null,

  // Loading
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,

  // Notifications
  notifications: []
};

/**
 * UI Store
 */
export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        ...initialState,

        // ========== View Mode ==========

        setViewMode: (mode: ViewMode) => {
          set((state) => {
            state.viewMode = mode;
          });
        },

        toggleViewMode: () => {
          set((state) => {
            state.viewMode = state.viewMode === '2d' ? '3d' : '2d';
          });
        },

        // ========== Panels ==========

        toggleLeftSidebar: () => {
          set((state) => {
            state.leftSidebar.isOpen = !state.leftSidebar.isOpen;
          });
        },

        toggleRightPanel: () => {
          set((state) => {
            state.rightPanel.isOpen = !state.rightPanel.isOpen;
          });
        },

        toggleBottomToolbar: () => {
          set((state) => {
            state.bottomToolbar.isOpen = !state.bottomToolbar.isOpen;
          });
        },

        setLeftSidebarOpen: (isOpen) => {
          set((state) => {
            state.leftSidebar.isOpen = isOpen;
          });
        },

        setRightPanelOpen: (isOpen) => {
          set((state) => {
            state.rightPanel.isOpen = isOpen;
          });
        },

        setBottomToolbarOpen: (isOpen) => {
          set((state) => {
            state.bottomToolbar.isOpen = isOpen;
          });
        },

        // ========== 2D Settings ==========

        toggleGrid: () => {
          set((state) => {
            state.showGrid = !state.showGrid;
          });
        },

        setShowGrid: (show) => {
          set((state) => {
            state.showGrid = show;
          });
        },

        toggleSnap: () => {
          set((state) => {
            state.snapToGrid = !state.snapToGrid;
          });
        },

        setSnapToGrid: (snap) => {
          set((state) => {
            state.snapToGrid = snap;
          });
        },

        setGridSize: (size) => {
          set((state) => {
            state.gridSize = size;
          });
        },

        toggleMeasurements: () => {
          set((state) => {
            state.showMeasurements = !state.showMeasurements;
          });
        },

        toggleDimensions: () => {
          set((state) => {
            state.showDimensions = !state.showDimensions;
          });
        },

        setUnit: (unit) => {
          set((state) => {
            state.unit = unit;
          });
        },

        // ========== 3D Settings ==========

        toggleAxes: () => {
          set((state) => {
            state.showAxes = !state.showAxes;
          });
        },

        toggleFloor: () => {
          set((state) => {
            state.showFloor = !state.showFloor;
          });
        },

        toggleCeiling: () => {
          set((state) => {
            state.showCeiling = !state.showCeiling;
          });
        },

        toggleWalls: () => {
          set((state) => {
            state.showWalls = !state.showWalls;
          });
        },

        toggleShadows: () => {
          set((state) => {
            state.showShadows = !state.showShadows;
          });
        },

        toggleWireframe: () => {
          set((state) => {
            state.showWireframe = !state.showWireframe;
          });
        },

        setCameraMode: (mode) => {
          set((state) => {
            state.cameraMode = mode;
          });
        },

        updateCameraState: (updates: Partial<CameraState>) => {
          set((state) => {
            state.cameraState = {
              ...state.cameraState,
              ...updates
            };
          });
        },

        // ========== Performance ==========

        setAntialiasing: (enabled) => {
          set((state) => {
            state.enableAntialiasing = enabled;
          });
        },

        setShadowMapSize: (size) => {
          set((state) => {
            state.shadowMapSize = size;
          });
        },

        setPixelRatio: (ratio) => {
          set((state) => {
            state.pixelRatio = ratio;
          });
        },

        // ========== Modals ==========

        openModal: (modalId, data) => {
          set((state) => {
            state.activeModal = modalId;
            state.modalData = data;
          });
        },

        closeModal: () => {
          set((state) => {
            state.activeModal = null;
            state.modalData = null;
          });
        },

        // ========== Loading ==========

        setLoading: (isLoading, message = '', progress = 0) => {
          set((state) => {
            state.isLoading = isLoading;
            state.loadingMessage = message;
            state.loadingProgress = progress;
          });
        },

        updateLoadingProgress: (progress) => {
          set((state) => {
            state.loadingProgress = Math.min(100, Math.max(0, progress));
          });
        },

        // ========== Notifications ==========

        addNotification: (notification) => {
          const id = uuidv4();
          const now = new Date().toISOString();

          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: now
          };

          set((state) => {
            state.notifications.push(newNotification);
          });

          // Auto-dismiss if duration is set
          if (notification.duration) {
            setTimeout(() => {
              get().removeNotification(id);
            }, notification.duration);
          }
        },

        removeNotification: (id) => {
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          });
        },

        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },

        // ========== Responsive (placeholder for future use) ==========

        setIsMobile: (isMobile) => {
          set((state) => {
            // Can be used to adjust UI for mobile
            if (isMobile) {
              state.leftSidebar.isOpen = false;
              state.rightPanel.isOpen = false;
            }
          });
        },

        setIsTablet: (isTablet) => {
          set((state) => {
            // Can be used to adjust UI for tablet
            if (isTablet) {
              state.leftSidebar.isOpen = false;
            }
          });
        }
      })),
      {
        name: 'ui-storage', // LocalStorage key
        partialize: (state) => ({
          // Only persist these settings
          showGrid: state.showGrid,
          snapToGrid: state.snapToGrid,
          gridSize: state.gridSize,
          unit: state.unit,
          showAxes: state.showAxes,
          showShadows: state.showShadows,
          cameraMode: state.cameraMode,
          enableAntialiasing: state.enableAntialiasing,
          shadowMapSize: state.shadowMapSize
        })
      }
    ),
    { name: 'UIStore' }
  )
);
