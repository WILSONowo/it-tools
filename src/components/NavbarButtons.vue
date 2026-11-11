<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        size="large"
        circle
        quaternary
        tag="a"
        href="https://github.com/CorentinTh/it-tools"
        rel="noopener"
        target="_blank"
        aria-label="IT-Tools GitHub 仓库"
      >
        <n-icon size="25" :component="BrandGithub" />
      </n-button>
    </template>
    GitHub 仓库
  </n-tooltip>

  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button
        size="large"
        circle
        quaternary
        tag="a"
        href="https://www.neko-arc.top/"
        rel="noopener"
        target="_blank"
        aria-label="主页"
      >
        <n-icon size="25" :component="User" />
      </n-button>
    </template>
    主页
  </n-tooltip>

  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button size="large" circle quaternary aria-label="切换深/浅色模式" @click="isDarkTheme = !isDarkTheme">
        <n-icon v-if="isDarkTheme" size="25" :component="Sun" />
        <n-icon v-else size="25" :component="Moon" />
      </n-button>
    </template>
    <span v-if="isDarkTheme">浅色模式</span>
    <span v-else>深色模式</span>
  </n-tooltip>
</template>

<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';
import { BrandGithub, Moon, Sun, User } from '@vicons/tabler';
import { toRefs } from 'vue';

const styleStore = useStyleStore();
const { isDarkTheme } = toRefs(styleStore);
</script>

<style lang="less" scoped>
.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
