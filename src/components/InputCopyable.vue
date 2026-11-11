<template>
  <n-input v-model:value="value">
    <template #suffix>
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button quaternary circle @click="onCopyClicked">
            <n-icon :component="ContentCopyFilled" />
          </n-button>
        </template>
        {{ tooltipText }}
      </n-tooltip>
    </template>
  </n-input>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { ContentCopyFilled } from '@vicons/material';
import { ref } from 'vue';
import { copyToClipboard } from '@/utils/clipboard';

const props = defineProps<{ value: string }>();
const emit = defineEmits(['update:value']);

const value = useVModel(props, 'value', emit);
const tooltipText = ref('复制到剪贴板');

async function onCopyClicked() {
  const ok = await copyToClipboard(value.value ?? '');
  tooltipText.value = ok ? '已复制' : '复制失败,请手动复制';

  setTimeout(() => {
    tooltipText.value = '复制到剪贴板';
  }, 2000);
}
</script>

<style scoped>
::v-deep(.n-input-wrapper) {
  padding-right: 5px;
}
</style>
