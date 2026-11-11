<template>
  <n-card title="校验计算 BCC / XOR / LRC / CRC-8">
    <n-form label-placement="top">
      <n-form-item label="数据(HEX, 空格分隔)" :feedback="feedback" :validation-status="status">
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
    <n-space justify="center" style="margin: 16px 0 0">
      <n-button type="primary" @click="refresh">计算</n-button>
      <n-button secondary @click="hexInput = ''">清空</n-button>
      <n-checkbox v-model:checked="littleEndian" style="margin-left: 8px">小端(LSB first)</n-checkbox>
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

const hexInput = ref('01 03 00 00 00 0A');
const littleEndian = ref(false);

const bytes = computed(() => {
  const cleaned = hexInput.value.replace(/,/g, ' ').trim();
  if (cleaned === '') return null;
  const parts = cleaned.split(/\s+/);
  const result: number[] = [];
  for (const part of parts) {
    const value = parseInt(part, 16);
    if (Number.isNaN(value) || value < 0 || value > 255) return null;
    result.push(value);
  }
  return result;
});

const status = computed(() => (bytes.value === null && hexInput.value.trim() !== '' ? 'error' : undefined));
const feedback = computed(() =>
  bytes.value === null && hexInput.value.trim() !== '' ? '输入必须是十六进制字节(00-FF), 用空格分隔' : '',
);

const sorted = computed(() => (littleEndian.value && bytes.value ? [...bytes.value].reverse() : bytes.value));

const rows = computed(() => {
  const data = sorted.value;
  if (!data || data.length === 0) return [];
  const hex = (value: number) => value.toString(16).toUpperCase().padStart(2, '0');

  const xor = data.reduce((acc, byte) => acc ^ byte, 0);
  const sum = data.reduce((acc, byte) => (acc + byte) & 0xff, 0);
  const sumComplement = ~sum & 0xff;
  const lrc = (sumComplement + 1) & 0xff;
  let crc8 = 0;
  for (const byte of data) {
    crc8 ^= byte;
    for (let i = 0; i < 8; i++) {
      crc8 = crc8 & 0x80 ? ((crc8 << 1) ^ 0x07) & 0xff : (crc8 << 1) & 0xff;
    }
  }

  return [
    { name: 'XOR (BCC)', value: hex(xor), note: '逐字节异或' },
    { name: '求和 (mod 256)', value: hex(sum), note: '逐字节求和取低 8 位' },
    { name: '和取反', value: hex(sumComplement), note: '对总和取反(~sum)' },
    { name: 'LRC (2 的补码)', value: hex(lrc), note: '(~sum + 1) 纵向冗余校验' },
    { name: 'CRC-8 (多项式 0x07)', value: hex(crc8), note: '初始值 0, 多项式 x8+x2+x+1' },
  ];
});

function refresh() {
  void rows.value;
}
refresh();
</script>
