<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import { darkTheme, NGlobalStyle, NMessageProvider, NNotificationProvider } from 'naive-ui';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import BaseLayout from './layouts/base.layout.vue';
import ToolLayout from './layouts/tool.layout.vue';
import { useStyleStore } from './stores/style.store';

const route = useRoute();
// BaseLayout (sidebar, search, footer) stays mounted across navigations; only the tool
// header/explain wrapper is toggled, so moving between home and tools doesn't rebuild the menu.
const isTool = computed(() => Boolean(route?.meta?.isTool));
const styleStore = useStyleStore();

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-message-provider placement="bottom">
      <n-notification-provider placement="bottom-right">
        <base-layout>
          <tool-layout v-if="isTool">
            <router-view />
          </tool-layout>
          <router-view v-else />
        </base-layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
