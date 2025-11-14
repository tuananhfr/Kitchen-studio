/**
 * Material Store - Manages materials and textures
 * Uses Zustand with Immer for immutable state updates
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Material, MaterialPreset } from '../types/material.types';
import type { MaterialStore, MaterialState } from '../types/store.types';

/**
 * Initial state
 */
const initialState: MaterialState = {
  presets: [],
  customMaterials: [],
  selectedMaterialId: null,
  editingMaterial: null,
  appliedMaterials: {},
  history: [],
  historyIndex: -1
};

/**
 * Material Store
 */
export const useMaterialStore = create<MaterialStore>()(
  devtools(
    immer((set, get) => ({
      // State
      ...initialState,

      // ========== Preset Operations ==========

      loadPresets: (presets) => {
        set((state) => {
          state.presets = presets;
        });
      },

      getPreset: (id) => {
        const state = get();
        return state.presets.find((p) => p.id === id);
      },

      // ========== Custom Material Operations ==========

      createCustomMaterial: (materialData) => {
        const material: Material = {
          ...materialData,
          id: uuidv4(),
          isCustom: true
        };

        set((state) => {
          state.customMaterials.push(material);
        });

        return material.id;
      },

      updateCustomMaterial: (id, updates) => {
        set((state) => {
          const material = state.customMaterials.find((m) => m.id === id);
          if (material) {
            Object.assign(material, updates);
          }
        });
      },

      deleteCustomMaterial: (id) => {
        set((state) => {
          state.customMaterials = state.customMaterials.filter((m) => m.id !== id);

          // Remove from applied materials
          Object.keys(state.appliedMaterials).forEach((objectId) => {
            if (state.appliedMaterials[objectId] === id) {
              delete state.appliedMaterials[objectId];
            }
          });

          // Clear selection if deleted
          if (state.selectedMaterialId === id) {
            state.selectedMaterialId = null;
          }
        });
      },

      getCustomMaterial: (id) => {
        const state = get();
        return state.customMaterials.find((m) => m.id === id);
      },

      // ========== Material Application ==========

      applyMaterial: (objectId, materialId, partName) => {
        set((state) => {
          const key = partName ? `${objectId}:${partName}` : objectId;
          state.appliedMaterials[key] = materialId;
        });

        get().addToHistory();
      },

      removeMaterial: (objectId) => {
        set((state) => {
          // Remove all materials for this object (including parts)
          Object.keys(state.appliedMaterials).forEach((key) => {
            if (key.startsWith(objectId)) {
              delete state.appliedMaterials[key];
            }
          });
        });

        get().addToHistory();
      },

      getMaterialForObject: (objectId) => {
        const state = get();
        const materialId = state.appliedMaterials[objectId];

        if (!materialId) return undefined;

        // Check custom materials first
        const customMaterial = state.customMaterials.find((m) => m.id === materialId);
        if (customMaterial) return customMaterial;

        // Then check presets
        return state.presets.find((p) => p.id === materialId);
      },

      // ========== Selection ==========

      selectMaterial: (id) => {
        set((state) => {
          state.selectedMaterialId = id;
        });
      },

      // ========== Editing ==========

      startEditingMaterial: (material) => {
        set((state) => {
          // Create a deep copy for editing
          state.editingMaterial = JSON.parse(JSON.stringify(material));
        });
      },

      updateEditingMaterial: (updates) => {
        set((state) => {
          if (state.editingMaterial) {
            Object.assign(state.editingMaterial, updates);
          }
        });
      },

      saveEditingMaterial: () => {
        const { editingMaterial } = get();
        if (!editingMaterial) return;

        if (editingMaterial.isCustom) {
          // Update existing custom material
          const existing = get().customMaterials.find((m) => m.id === editingMaterial.id);
          if (existing) {
            get().updateCustomMaterial(editingMaterial.id, editingMaterial);
          } else {
            // Create new custom material
            get().createCustomMaterial(editingMaterial);
          }
        } else {
          // Create as new custom material (from preset)
          const newMaterial = { ...editingMaterial };
          delete (newMaterial as Partial<Material>).id; // Remove id to create new
          get().createCustomMaterial(newMaterial);
        }

        set((state) => {
          state.editingMaterial = null;
        });
      },

      cancelEditingMaterial: () => {
        set((state) => {
          state.editingMaterial = null;
        });
      },

      // ========== Search & Filter ==========

      searchMaterials: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();

        const allMaterials: (Material | MaterialPreset)[] = [
          ...state.customMaterials,
          ...state.presets
        ];

        return allMaterials.filter((material) => {
          const name = material.name.toLowerCase();
          const category = material.category.toLowerCase();
          const tags = material.tags?.join(' ').toLowerCase() ?? '';

          return (
            name.includes(lowerQuery) ||
            category.includes(lowerQuery) ||
            tags.includes(lowerQuery)
          );
        });
      },

      filterByCategory: (category) => {
        const state = get();

        const allMaterials: (Material | MaterialPreset)[] = [
          ...state.customMaterials,
          ...state.presets
        ];

        return allMaterials.filter((material) => material.category === category);
      },

      // ========== History (Undo/Redo) ==========

      addToHistory: () => {
        set((state) => {
          // Remove any future history
          state.history = state.history.slice(0, state.historyIndex + 1);

          // Add current state to history
          state.history.push(JSON.parse(JSON.stringify(state.customMaterials)));

          // Limit history size
          if (state.history.length > 50) {
            state.history = state.history.slice(-50);
          }

          state.historyIndex = state.history.length - 1;
        });
      },

      undo: () => {
        const state = get();
        if (state.canUndo()) {
          set((s) => {
            s.historyIndex--;
            s.customMaterials = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.canRedo()) {
          set((s) => {
            s.historyIndex++;
            s.customMaterials = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
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
    { name: 'MaterialStore' }
  )
);
