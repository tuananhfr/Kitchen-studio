/**
 * Furniture Store - Manages 3D furniture items
 * Uses Zustand with Immer for immutable state updates
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FurnitureItem, FurnitureGroup } from '../types/furniture.types';
import type { FurnitureStore, FurnitureState } from '../types/store.types';

/**
 * Initial state
 */
const initialState: FurnitureState = {
  items: [],
  groups: [],
  selectedItemId: null,
  selectedGroupId: null,
  multiSelection: [],
  clipboard: null,
  transformMode: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 50
};

/**
 * Furniture Store
 */
export const useFurnitureStore = create<FurnitureStore>()(
  devtools(
    immer((set, get) => ({
      // State
      ...initialState,

      // ========== Item Operations ==========

      addItem: (itemData) => {
        const now = new Date().toISOString();
        const item: FurnitureItem = {
          ...itemData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          isSelected: false,
          isLocked: false,
          isVisible: true,
          castShadow: true,
          receiveShadow: true
        };

        set((state) => {
          state.items.push(item);
        });

        get().addToHistory();
        return item.id;
      },

      updateItem: (id, updates) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item && !item.isLocked) {
            Object.assign(item, updates);
            item.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      deleteItem: (id) => {
        set((state) => {
          state.items = state.items.filter((i) => i.id !== id);

          // Remove from selection
          if (state.selectedItemId === id) {
            state.selectedItemId = null;
          }
          state.multiSelection = state.multiSelection.filter((itemId) => itemId !== id);

          // Remove from groups
          state.groups.forEach((group) => {
            group.itemIds = group.itemIds.filter((itemId) => itemId !== id);
          });

          // Remove empty groups
          state.groups = state.groups.filter((group) => group.itemIds.length > 0);
        });

        get().addToHistory();
      },

      deleteMultiple: (ids) => {
        set((state) => {
          state.items = state.items.filter((i) => !ids.includes(i.id));

          // Clear selection
          if (ids.includes(state.selectedItemId ?? '')) {
            state.selectedItemId = null;
          }
          state.multiSelection = state.multiSelection.filter((id) => !ids.includes(id));

          // Remove from groups
          state.groups.forEach((group) => {
            group.itemIds = group.itemIds.filter((itemId) => !ids.includes(itemId));
          });

          // Remove empty groups
          state.groups = state.groups.filter((group) => group.itemIds.length > 0);
        });

        get().addToHistory();
      },

      getItem: (id) => {
        const state = get();
        return state.items.find((i) => i.id === id);
      },

      duplicateItem: (id, offset = { x: 50, y: 0, z: 50 }) => {
        const item = get().getItem(id);
        if (!item) return null;

        const duplicated = {
          ...item,
          name: `${item.name} (Copy)`,
          position: {
            x: item.position.x + offset.x,
            y: item.position.y + offset.y,
            z: item.position.z + offset.z
          }
        };

        // Remove id, createdAt, updatedAt (will be auto-generated)
        const { id: _, createdAt: __, updatedAt: ___, ...itemData } = duplicated;

        return get().addItem(itemData);
      },

      clearAll: () => {
        set((state) => {
          state.items = [];
          state.groups = [];
          state.selectedItemId = null;
          state.selectedGroupId = null;
          state.multiSelection = [];
          state.clipboard = null;
        });

        get().addToHistory();
      },

      // ========== Transform Operations ==========

      moveItem: (id, position) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item && !item.isLocked) {
            item.position = position;
            item.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      rotateItem: (id, rotation) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item && !item.isLocked && item.constraints?.allowRotation !== false) {
            item.rotation = rotation;
            item.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      scaleItem: (id, scale) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item && !item.isLocked && item.constraints?.allowScale !== false) {
            item.scale = scale;
            item.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      // ========== Selection ==========

      setSelectedItem: (id) => {
        set((state) => {
          // Deselect all
          state.items.forEach((item) => {
            item.isSelected = false;
          });

          // Select new item
          if (id) {
            const item = state.items.find((i) => i.id === id);
            if (item) {
              item.isSelected = true;
            }
          }

          state.selectedItemId = id;
          state.multiSelection = id ? [id] : [];
        });
      },

      addToSelection: (id) => {
        set((state) => {
          if (!state.multiSelection.includes(id)) {
            state.multiSelection.push(id);

            const item = state.items.find((i) => i.id === id);
            if (item) {
              item.isSelected = true;
            }
          }
        });
      },

      removeFromSelection: (id) => {
        set((state) => {
          state.multiSelection = state.multiSelection.filter((itemId) => itemId !== id);

          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isSelected = false;
          }

          // Update selectedItemId
          if (state.selectedItemId === id) {
            state.selectedItemId = state.multiSelection[0] ?? null;
          }
        });
      },

      clearSelection: () => {
        set((state) => {
          state.items.forEach((item) => {
            item.isSelected = false;
          });
          state.selectedItemId = null;
          state.multiSelection = [];
        });
      },

      selectAll: () => {
        set((state) => {
          state.items.forEach((item) => {
            item.isSelected = true;
          });
          state.multiSelection = state.items.map((item) => item.id);
          state.selectedItemId = state.items[0]?.id ?? null;
        });
      },

      // ========== Group Operations ==========

      createGroup: (itemIds, name) => {
        const now = new Date().toISOString();
        const groupId = uuidv4();

        set((state) => {
          const group: FurnitureGroup = {
            id: groupId,
            name: name ?? `Group ${state.groups.length + 1}`,
            itemIds,
            position: { x: 0, y: 0, z: 0 }, // Will be calculated
            rotation: { x: 0, y: 0, z: 0 },
            boundingBox: {
              min: { x: 0, y: 0, z: 0 },
              max: { x: 0, y: 0, z: 0 }
            },
            createdAt: now,
            updatedAt: now,
            isLocked: false
          };

          // Calculate group center and bounding box
          const groupItems = state.items.filter((item) => itemIds.includes(item.id));
          if (groupItems.length > 0) {
            // Calculate center
            const center = groupItems.reduce(
              (acc, item) => ({
                x: acc.x + item.position.x,
                y: acc.y + item.position.y,
                z: acc.z + item.position.z
              }),
              { x: 0, y: 0, z: 0 }
            );
            group.position = {
              x: center.x / groupItems.length,
              y: center.y / groupItems.length,
              z: center.z / groupItems.length
            };

            // Calculate bounding box
            const min = { x: Infinity, y: Infinity, z: Infinity };
            const max = { x: -Infinity, y: -Infinity, z: -Infinity };

            groupItems.forEach((item) => {
              if (item.boundingBox) {
                min.x = Math.min(min.x, item.boundingBox.min.x);
                min.y = Math.min(min.y, item.boundingBox.min.y);
                min.z = Math.min(min.z, item.boundingBox.min.z);
                max.x = Math.max(max.x, item.boundingBox.max.x);
                max.y = Math.max(max.y, item.boundingBox.max.y);
                max.z = Math.max(max.z, item.boundingBox.max.z);
              }
            });

            group.boundingBox = { min, max };
          }

          state.groups.push(group);
        });

        get().addToHistory();
        return groupId;
      },

      updateGroup: (id, updates) => {
        set((state) => {
          const group = state.groups.find((g) => g.id === id);
          if (group && !group.isLocked) {
            Object.assign(group, updates);
            group.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      deleteGroup: (id, deleteItems = false) => {
        set((state) => {
          const group = state.groups.find((g) => g.id === id);
          if (group) {
            if (deleteItems) {
              // Delete all items in group
              state.items = state.items.filter((item) => !group.itemIds.includes(item.id));
            }

            // Delete group
            state.groups = state.groups.filter((g) => g.id !== id);

            if (state.selectedGroupId === id) {
              state.selectedGroupId = null;
            }
          }
        });

        get().addToHistory();
      },

      addToGroup: (groupId, itemId) => {
        set((state) => {
          const group = state.groups.find((g) => g.id === groupId);
          if (group && !group.itemIds.includes(itemId)) {
            group.itemIds.push(itemId);
            group.updatedAt = new Date().toISOString();
          }
        });

        get().addToHistory();
      },

      removeFromGroup: (groupId, itemId) => {
        set((state) => {
          const group = state.groups.find((g) => g.id === groupId);
          if (group) {
            group.itemIds = group.itemIds.filter((id) => id !== itemId);
            group.updatedAt = new Date().toISOString();

            // Delete group if empty
            if (group.itemIds.length === 0) {
              state.groups = state.groups.filter((g) => g.id !== groupId);
            }
          }
        });

        get().addToHistory();
      },

      // ========== Clipboard ==========

      copy: (id) => {
        const item = get().getItem(id);
        if (item) {
          set((state) => {
            state.clipboard = JSON.parse(JSON.stringify(item));
          });
        }
      },

      paste: (position) => {
        const clipboard = get().clipboard;
        if (!clipboard) return null;

        const offset = position
          ? {
              x: position.x - clipboard.position.x,
              y: position.y - clipboard.position.y,
              z: position.z - clipboard.position.z
            }
          : { x: 50, y: 0, z: 50 };

        const pasted = {
          ...clipboard,
          name: `${clipboard.name} (Pasted)`,
          position: {
            x: clipboard.position.x + offset.x,
            y: clipboard.position.y + offset.y,
            z: clipboard.position.z + offset.z
          }
        };

        const { id: _, createdAt: __, updatedAt: ___, ...itemData } = pasted;
        return get().addItem(itemData);
      },

      cut: (id) => {
        get().copy(id);
        get().deleteItem(id);
      },

      // ========== Transform Mode ==========

      setTransformMode: (mode) => {
        set((state) => {
          state.transformMode = mode;
        });
      },

      // ========== Lock/Unlock ==========

      lockItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isLocked = true;
          }
        });
      },

      unlockItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isLocked = false;
          }
        });
      },

      toggleLock: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isLocked = !item.isLocked;
          }
        });
      },

      // ========== Visibility ==========

      showItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isVisible = true;
          }
        });
      },

      hideItem: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isVisible = false;
          }
        });
      },

      toggleVisibility: (id) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            item.isVisible = !item.isVisible;
          }
        });
      },

      // ========== History (Undo/Redo) ==========

      addToHistory: () => {
        set((state) => {
          // Remove any future history
          state.history = state.history.slice(0, state.historyIndex + 1);

          // Add current state to history
          state.history.push(JSON.parse(JSON.stringify(state.items)));

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
            s.items = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.canRedo()) {
          set((s) => {
            s.historyIndex++;
            s.items = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
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
    { name: 'FurnitureStore' }
  )
);
