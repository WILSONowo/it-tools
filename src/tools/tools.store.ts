import { get, useStorage, type MaybeRef } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { isStringArray, safeJsonSerializer } from '@/utils/storage';
import { toolsWithCategory } from './index';
import type { Tool, ToolWithCategory } from './tools.types';

const LEGACY_FAVORITES_KEY = 'favoriteToolsName';
const FAVORITES_KEY = 'favoriteToolPaths';

/**
 * Favorites used to be stored by display name, so renaming a tool silently dropped it.
 * They are now stored by route path; old name-based entries are migrated once.
 */
function migrateLegacyFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (raw === null) return [];
    localStorage.removeItem(LEGACY_FAVORITES_KEY);
    const names: unknown = JSON.parse(raw);
    if (!isStringArray(names)) return [];
    return names
      .map((name) => toolsWithCategory.find((tool) => tool.name === name)?.path)
      .filter((path): path is string => Boolean(path));
  } catch {
    return [];
  }
}

export const useToolStore = defineStore('tools', {
  state: () => ({
    favoriteToolPaths: useStorage<string[]>(FAVORITES_KEY, migrateLegacyFavorites(), undefined, {
      serializer: safeJsonSerializer<string[]>(() => [], isStringArray),
    }) as Ref<string[]>,
  }),
  getters: {
    favoriteTools(state) {
      return state.favoriteToolPaths
        .map((favoritePath) => toolsWithCategory.find(({ path }) => path === favoritePath))
        .filter(Boolean) as ToolWithCategory[]; // cast because .filter(Boolean) does not remove undefined from type
    },

    tools(): ToolWithCategory[] {
      return toolsWithCategory;
    },

    newTools(): ToolWithCategory[] {
      return this.tools.filter(({ isNew }) => isNew);
    },
  },

  actions: {
    addToolToFavorites({ tool }: { tool: MaybeRef<Tool> }) {
      const path = get(tool).path;
      if (!this.favoriteToolPaths.includes(path)) {
        this.favoriteToolPaths.push(path);
      }
    },

    removeToolFromFavorites({ tool }: { tool: MaybeRef<Tool> }) {
      this.favoriteToolPaths = this.favoriteToolPaths.filter((path) => get(tool).path !== path);
    },

    isToolFavorite({ tool }: { tool: MaybeRef<Tool> }) {
      return this.favoriteToolPaths.includes(get(tool).path);
    },
  },
});
