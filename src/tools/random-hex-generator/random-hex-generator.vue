<template>
  <n-card title="随机 HEX 字符串生成器">
    <n-form label-placement="left" label-width="150">
      <n-space>
        <n-form-item label="大小写">
          <n-radio-group v-model:value="casing">
            <n-radio-button value="lower">小写</n-radio-button>
            <n-radio-button value="upper">大写</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="长度">
          <n-input-number v-model:value="length" :min="1" :max="10000" style="width: 140px" />
        </n-form-item>
        <n-form-item label="生成数量">
          <n-input-number v-model:value="count" :min="1" :max="1000" style="width: 140px" />
        </n-form-item>
      </n-space>
    </n-form>

    <n-input
      :value="output"
      type="textarea"
      :autosize="{ minRows: 5, maxRows: 16 }"
      readonly
      placeholder="生成结果..."
      style="font-family: monospace"
      spellcheck="false"
    />

    <n-space justify="center" style="margin-top: 16px">
      <n-button type="primary" secondary @click="generate">生成</n-button>
      <n-button secondary :disabled="!output" @click="downloadHex">下载为 HEX</n-button>
      <n-button secondary :disabled="!output" @click="downloadBin">下载为 BIN</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制</n-button>
      <n-button secondary @click="output = ''">清空</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { randomString } from '@/utils/random';
import { useCopy } from '@/composable/copy';

const casing = ref<'lower' | 'upper'>('lower');
const length = ref(64);
const count = ref(10);
const output = ref('');

const message = useMessage();
const CHARS = '0123456789abcdef';

function generate() {
  const lines: string[] = [];
  for (let i = 0; i < count.value; i++) {
    const s = randomString(CHARS, length.value);
    lines.push(casing.value === 'upper' ? s.toUpperCase() : s);
  }
  output.value = lines.join('\n');
}

const { copy: copyText } = useCopy({ source: output });
function copy() {
  if (!output.value) return;
  copyText();
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

function downloadHex() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'random-hex.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadBin() {
  if (!output.value) return;
  const hex = output.value.replace(/\n/g, '');
  if (hex.length % 2 !== 0) {
    message.warning('HEX 长度为奇数,无法转为二进制');
    return;
  }
  const bytes = hexToBytes(hex);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'random-hex.bin';
  a.click();
  URL.revokeObjectURL(a.href);
}

generate();
</script>
