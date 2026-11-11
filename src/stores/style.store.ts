import { useMediaQuery, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { watch, type Ref } from 'vue';

export const useStyleStore = defineStore('style', {
  state: () => {
    const isDarkTheme = useStorage('isDarkTheme', true) as Ref<boolean>;
    const isSmallScreen = useMediaQuery('(max-width: 700px)');
    const isMenuCollapsed = useStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;
    // On small screens the menu is an overlay: always start closed, whatever was stored.
    if (isSmallScreen.value) {
      isMenuCollapsed.value = true;
    }

    watch(isSmallScreen, (v) => (isMenuCollapsed.value = v));

    return {
      isDarkTheme,
      isMenuCollapsed,
      isSmallScreen,
    };
  },
});
