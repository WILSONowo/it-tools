<template>
  <n-card title="IPv4 CIDR 聚合">
    <n-form label-placement="top">
      <n-form-item label="IP 或 CIDR(每行一个)" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="192.168.1.0/24&#10;192.168.2.0/24&#10;192.168.1.55&#10;10.0.0.0/8"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin: 16px 0 0">
      <n-button type="primary" @click="aggregate">聚合</n-button>
    </n-space>

    <n-text depth="2" style="display: block; margin-top: 16px">聚合结果</n-text>
    <div style="margin-top: 8px">
      <n-input
        :value="output"
        type="textarea"
        :autosize="{ minRows: 4 }"
        readonly
        spellcheck="false"
        style="font-family: monospace"
        placeholder="聚合后的 CIDR 块将显示在这里"
      />
    </div>
    <n-space v-if="output" justify="center" style="margin-top: 12px">
      <n-tag :bordered="false" type="success">{{ outputCount }} 块 / 原始 {{ originalCount }} 项</n-tag>
      <n-button secondary @click="copy">复制</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { aggregateIpv4 } from './cidr-aggregator.service';

const input = ref('192.168.1.0/24\n192.168.2.0/24\n192.168.3.55');
const output = ref('');
const originalCount = ref(0);
const outputCount = ref(0);
const feedback = ref('');
const status = ref<string | undefined>(undefined);

function aggregate() {
  const lines = input.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return;
  originalCount.value = lines.length;
  try {
    output.value = aggregateIpv4(lines).join('\n');
    outputCount.value = output.value.split('\n').filter(Boolean).length;
    feedback.value = '';
    status.value = undefined;
  } catch (e) {
    output.value = '';
    feedback.value = (e as Error).message;
    status.value = 'error';
  }
}

aggregate();

const { copy } = useCopy({ source: output, text: '聚合后的 CIDR 已复制到剪贴板' });
</script>
