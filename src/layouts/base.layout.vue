<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Menu2, Home2 } from '@vicons/tabler';
import { toolsByCategory } from '@/tools';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import SearchBar from '../components/SearchBar.vue';
import HeroGradient from '../assets/hero-gradient.svg?component';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);
const repoUrl = config.app.repoUrl;

const toolStore = useToolStore();

const tools = computed<ToolCategory[]>(() => [
  ...(toolStore.favoriteTools.length > 0 ? [{ name: '我的收藏', components: toolStore.favoriteTools }] : []),
  ...toolsByCategory,
]);
</script>

<template>
  <menu-layout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <router-link to="/" class="hero-wrapper">
        <hero-gradient class="gradient" />
        <div class="text-wrapper">
          <div class="title">在线工具箱</div>
          <div class="divider" />
          <div class="subtitle">共 {{ toolsByCategory.flatMap((c) => c.components).length }} 个在线工具软件</div>
        </div>
      </router-link>

      <div class="sider-content">
        <n-space v-if="styleStore.isSmallScreen" justify="center">
          <navbar-buttons />
        </n-space>

        <collapsible-tool-menu :tools-by-category="tools" />

        <div class="footer">
          <div>
            在线工具箱

            <n-button text tag="a" target="_blank" rel="noopener" type="primary" depth="3" :href="repoUrl">
              v{{ version }}
            </n-button>

            <template v-if="commitSha && commitSha.length > 0">
              -
              <n-button
                text
                tag="a"
                target="_blank"
                rel="noopener"
                type="primary"
                depth="3"
                :href="`${repoUrl}/commit/${commitSha}`"
              >
                {{ commitSha }}
              </n-button>
            </template>
          </div>
          <div>
            © {{ new Date().getFullYear() }}
            <n-button text tag="a" target="_blank" rel="noopener" type="primary" href="https://github.com/CorentinTh">
              Corentin Thomasset
            </n-button>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div class="navigation">
        <n-button
          :size="styleStore.isSmallScreen ? 'medium' : 'large'"
          circle
          quaternary
          aria-label="切换菜单"
          @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
        >
          <n-icon size="25" :component="Menu2" />
        </n-button>

        <router-link to="/" #="{ navigate, href }" custom>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button
                tag="a"
                :href="href"
                :size="styleStore.isSmallScreen ? 'medium' : 'large'"
                circle
                quaternary
                aria-label="首页"
                @click="navigate"
              >
                <n-icon size="25" :component="Home2" />
              </n-button>
            </template>
            首页
          </n-tooltip>
        </router-link>

        <search-bar />

        <navbar-buttons v-if="!styleStore.isSmallScreen" />
      </div>
      <slot />
    </template>
  </menu-layout>
</template>

<style lang="less" scoped>
// ::v-deep(.n-layout-scroll-container) {
//     @percent: 4%;
//     @position: 25px;
//     @size: 50px;
//     @color: #eeeeee25;
//     background-image: radial-gradient(@color @percent, transparent @percent),
//         radial-gradient(@color @percent, transparent @percent);
//     background-position: 0 0, @position @position;
//     background-size: @size @size;
// }

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 160px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  z-index: 10;
  overflow: hidden;

  .gradient {
    margin-top: -65px;
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 16px;
    color: #fff;

    .title {
      font-size: 25px;
      font-weight: 600;
    }

    .divider {
      width: 50px;
      height: 2px;
      border-radius: 4px;
      background-color: v-bind('themeVars.primaryColor');
      margin: 0 auto 5px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
}

// ::v-deep(.n-menu-item-content-header) {
//   overflow: visible !important;
//   // overflow-x: hidden !important;
// }

.navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 5px;
  }

  .search-bar {
    // width: 100%;
    flex-grow: 1;
  }
}
</style>
