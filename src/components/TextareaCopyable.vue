<template>
  <div style="overflow-x: hidden; width: 100%">
    <n-card class="result-card">
      <n-scrollbar
        x-scrollable
        trigger="none"
        :style="height ? `min-height: ${height - 40 /* card padding */ + 10 /* negative margin compensation */}px` : ''"
      >
        <n-config-provider :hljs="hljs">
          <n-code :code="value" :language="language" :trim="false" data-test-id="area-content" />
        </n-config-provider>
      </n-scrollbar>
      <n-tooltip v-if="value" trigger="hover">
        <template #trigger>
          <div class="copy-button" :class="[copyPlacement]">
            <n-button circle secondary size="large" @click="onCopyClicked">
              <n-icon size="22" :component="Copy" />
            </n-button>
          </div>
        </template>
        <span>{{ tooltipText }}</span>
      </n-tooltip>
    </n-card>
    <n-space v-if="copyPlacement === 'outside'" justify="center" mt-4>
      <n-button secondary @click="onCopyClicked"> {{ tooltipText }} </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { Copy } from '@vicons/tabler';
import { useElementSize } from '@vueuse/core';
import hljs from 'highlight.js/lib/core';
import jsonHljs from 'highlight.js/lib/languages/json';
import sqlHljs from 'highlight.js/lib/languages/sql';
import xmlHljs from 'highlight.js/lib/languages/xml';
import yamlHljs from 'highlight.js/lib/languages/yaml';
import { ref, toRefs } from 'vue';
import { copyToClipboard } from '@/utils/clipboard';

hljs.registerLanguage('sql', sqlHljs);
hljs.registerLanguage('json', jsonHljs);
hljs.registerLanguage('html', xmlHljs);
hljs.registerLanguage('yaml', yamlHljs);

const props = withDefaults(
  defineProps<{
    value: string;
    followHeightOf?: HTMLElement | null;
    language?: string;
    copyPlacement?: 'top-right' | 'bottom-right' | 'outside' | 'none';
    copyMessage?: string;
  }>(),
  {
    followHeightOf: null,
    language: 'txt',
    copyPlacement: 'top-right',
    copyMessage: '复制到剪贴板',
  },
);
const { value, language, followHeightOf, copyPlacement, copyMessage } = toRefs(props);
// followHeightOf is a ref (from toRefs); useElementSize handles a null element.
const { height } = useElementSize(followHeightOf);

const tooltipText = ref(copyMessage.value);

async function onCopyClicked() {
  const ok = await copyToClipboard(value.value ?? '');
  tooltipText.value = ok ? '已复制' : '复制失败,请手动复制';

  setTimeout(() => {
    tooltipText.value = copyMessage.value;
  }, 2000);
}
</script>

<style lang="less" scoped>
::v-deep(.n-scrollbar) {
  padding-bottom: 10px;
  margin-bottom: -10px;
}
.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    opacity: 1;

    &.top-right {
      top: 10px;
      right: 10px;
    }

    &.bottom-right {
      bottom: 10px;
      right: 10px;
    }
    &.outside,
    &.none {
      display: none;
    }
  }
}
</style>
