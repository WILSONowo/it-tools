<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';
import { computed } from 'vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';
import { parseExplain, renderExplainText } from './explain';

const route = useRoute();

const head = computed<HeadObject>(() => ({
  title: `${route.meta.name} - 在线工具箱`,
  meta: [
    {
      name: 'description',
      content: route.meta?.description as string,
    },
    {
      name: 'keywords',
      content: ((route.meta.keywords ?? []) as string[]).join(','),
    },
  ],
}));
useHead(head);

const explains = computed<string[]>(() => (route.meta.explain as string[] | undefined) ?? []);

const displayItems = computed(() => parseExplain(explains.value));
const rich = renderExplainText;
</script>

<template>
  <!-- Rendered inside the persistent BaseLayout from App.vue -->
  <div class="tool-layout">
    <div class="tool-header">
      <n-space align="center" justify="space-between" :wrap="false">
        <n-h1>
          {{ route.meta.name }}
        </n-h1>

        <div>
          <favorite-button :tool="{ name: route.meta.name, path: route.path } as Tool" />
        </div>
      </n-space>

      <div class="separator" />

      <div class="description">
        {{ route.meta.description }}
      </div>
    </div>
  </div>

  <div class="tool-content">
    <slot />
  </div>

  <div v-if="displayItems.length > 0" class="tool-explain">
    <n-collapse>
      <n-collapse-item title="说明" name="explain">
        <template v-for="(item, i) in displayItems" :key="i">
          <div v-if="item.type === 'heading'" class="explain-heading">{{ item.text }}</div>
          <table v-else-if="item.type === 'table'" class="explain-table">
            <tbody>
              <tr v-for="(row, ri) in item.rows" :key="'r' + ri">
                <!-- eslint-disable-next-line vue/no-v-html -- renderExplainText escapes HTML first -->
                <component :is="ri === 0 ? 'th' : 'td'" v-for="(cell, ci) in row" :key="ci" v-html="rich(cell)" />
              </tr>
            </tbody>
          </table>
          <!-- eslint-disable-next-line vue/no-v-html -- renderExplainText escapes HTML first -->
          <div v-else-if="item.type === 'li'" class="explain-para explain-li" v-html="'• ' + rich(item.text)"></div>
          <!-- eslint-disable-next-line vue/no-v-html -- renderExplainText escapes HTML first -->
          <div v-else class="explain-para" v-html="rich(item.text)"></div>
        </template>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<style lang="less" scoped>
.tool-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  width: 86%;
  max-width: 1400px;
  margin: 0 auto;

  ::v-deep(& > *) {
    flex: 1 1 100%;
  }
}
.tool-layout {
  width: 86%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;

  .tool-header {
    padding: 40px 0;
    width: 100%;

    .n-h1 {
      opacity: 0.9;
      font-size: 40px;
      font-weight: 400;
      margin: 0;
      line-height: 1;
    }

    .separator {
      width: 200px;
      height: 2px;
      background: rgb(161, 161, 161);
      opacity: 0.2;

      margin: 10px 0;
    }

    .description {
      margin: 0;

      opacity: 0.7;
    }
  }
}
</style>

<!-- 工具内容区全局排版修正:统一增大表单行间距 -->
<style lang="less">
.tool-content {
  // n-form-item 纵向间距(参数与参数之间、输入与结果之间不再贴死)
  .n-form-item {
    margin-bottom: 24px !important;
  }
}

.tool-explain {
  width: 86%;
  max-width: 1400px;
  margin: 24px auto 40px;

  .explain-para {
    line-height: 1.8;
    color: rgba(128, 128, 128, 0.92);
    margin-bottom: 4px;
    white-space: pre-wrap;
  }

  .explain-li {
    margin-left: 8px;
  }

  .explain-heading {
    font-weight: 700;
    margin: 10px 0 6px;
    color: rgba(128, 128, 128, 1);
  }

  .explain-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 13px;

    th,
    td {
      border: 1px solid rgba(128, 128, 128, 0.25);
      padding: 6px 10px;
      text-align: left;
    }

    th {
      background: rgba(128, 128, 128, 0.12);
    }
  }
}
</style>
