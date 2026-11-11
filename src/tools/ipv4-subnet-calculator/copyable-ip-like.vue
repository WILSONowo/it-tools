<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <span class="ip" @click="handleClick">{{ ip }}</span>
    </template>
    {{ tooltipText }}
  </n-tooltip>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { copyToClipboard } from '@/utils/clipboard';

const props = withDefaults(defineProps<{ ip?: string }>(), { ip: '' });
const { ip } = toRefs(props);

const initialText = '复制到剪贴板';
const tooltipText = ref(initialText);

async function handleClick() {
  tooltipText.value = (await copyToClipboard(ip.value)) ? '已复制!' : '复制失败,请手动复制';

  setTimeout(() => (tooltipText.value = initialText), 1000);
}
</script>

<style scoped lang="less">
.ip {
  font-family: monospace;
  cursor: pointer;
}
</style>
