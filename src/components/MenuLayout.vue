<template>
  <n-layout has-sider>
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="240"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
    >
      <slot name="sider" />
    </n-layout-sider>
    <n-layout ref="contentRef" class="content">
      <slot name="content" />
      <div v-show="isSmallScreen && !isMenuCollapsed" class="overlay" @click="isMenuCollapsed = true" />
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';
import type { LayoutInst } from 'naive-ui';
import { toRefs, computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const route = useRoute();
const contentRef = ref<LayoutInst | null>(null);

// The page scrolls inside the content layout (not the window), so the router's
// scrollBehavior can't reset it. On every navigation: scroll back to the top and,
// on small screens, close the menu overlay.
watch(
  () => route.path,
  () => {
    contentRef.value?.scrollTo({ top: 0 });
    if (isSmallScreen.value) {
      isMenuCollapsed.value = true;
    }
  },
);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
</script>

<style lang="less" scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  cursor: pointer;
}

.content {
  // background-color: #f1f5f9;
  ::v-deep(.n-layout-scroll-container) {
    padding: 26px;
  }
}

.n-layout {
  height: 100vh;
}
</style>
