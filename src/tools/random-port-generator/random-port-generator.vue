<template>
  <n-card title="随机端口生成器">
    <n-form label-placement="left" label-width="120">
      <n-form-item label="随机端口">
        <div class="port">{{ port }}</div>
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin-top: 4px">
      <n-button type="primary" @click="refreshPort">刷新</n-button>
      <n-button secondary :disabled="!port" @click="copy">复制</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { generatePort } from './random-port-generator.model';

const [port, refreshPort] = computedRefreshable(() => String(generatePort()));

const { copy } = useCopy({ source: port, text: '端口已复制到剪贴板' });
</script>

<style lang="less" scoped>
.port {
  display: inline-block;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 32px;
  line-height: 1.4;
  color: var(--primary-color, inherit);
  background: rgba(128, 128, 128, 0.08);
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  padding: 4px 20px;
}
</style>
