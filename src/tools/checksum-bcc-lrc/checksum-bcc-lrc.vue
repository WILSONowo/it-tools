<template>
  <n-card title="校验计算 BCC / XOR / LRC / CRC">
    <n-form label-placement="top">
      <n-form-item label="数据(HEX,可用空格/逗号分隔,也可连续书写)" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="hexInput"
          type="textarea"
          :autosize="{ minRows: 3 }"
          placeholder="01 03 00 00 00 0A"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" align="center" style="margin: 16px 0 0">
      <n-button secondary @click="hexInput = ''">清空</n-button>
      <n-checkbox v-model:checked="crcLowByteFirst" style="margin-left: 8px">
        CRC-16 低字节在前(仅影响 CRC-16 的显示顺序)
      </n-checkbox>
    </n-space>
    <n-text depth="2" style="display: block; margin: 16px 0 8px">校验结果</n-text>
    <n-table size="small">
      <thead>
        <tr>
          <th>算法</th>
          <th>结果 (HEX)</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <td style="white-space: nowrap">{{ row.name }}</td>
          <td style="font-family: monospace">{{ row.value }}</td>
          <td style="opacity: 0.75; font-size: 12px">{{ row.note }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { computeChecksums, parseHexBytes } from './checksum.service';

const hexInput = ref('01 03 00 00 00 0A');
const crcLowByteFirst = ref(true);

const parsed = computed(() => parseHexBytes(hexInput.value));

const status = computed(() => (parsed.value.error ? 'error' : undefined));
const feedback = computed(() => parsed.value.error ?? '');

const rows = computed(() => {
  const data = parsed.value.bytes;
  if (!data || data.length === 0) return [];
  return computeChecksums(data, { crcLowByteFirst: crcLowByteFirst.value });
});
</script>
