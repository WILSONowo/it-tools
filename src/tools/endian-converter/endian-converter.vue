<template>
  <n-card title="大小端字节序转换">
    <n-tabs type="line" default-value="num2bytes">
      <n-tab-pane name="num2bytes" tab="整数 → 字节">
        <n-form label-placement="top">
          <n-space style="width: 100%">
            <n-form-item label="整数(十进制或 0x 十六进制)" style="flex: 1">
              <n-input
                v-model:value="intInput"
                placeholder="如 305419896 或 0x12345678"
                style="font-family: monospace"
              />
            </n-form-item>
            <n-form-item label="宽度">
              <n-select v-model:value="width" :options="widthOptions" style="width: 120px" />
            </n-form-item>
          </n-space>
          <n-space justify="center" style="margin: 8px 0 12px">
            <n-button type="primary" @click="intToBytes">转换</n-button>
          </n-space>
        </n-form>
        <n-grid cols="2" x-gap="12" responsive="screen" style="width: 100%">
          <n-gi>
            <n-form-item label="大端 (Big-Endian)">
              <n-input :value="bigEndian" readonly style="font-family: monospace" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="小端 (Little-Endian)">
              <n-input :value="littleEndian" readonly style="font-family: monospace" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-alert v-if="intError" type="error" :show-icon="false">{{ intError }}</n-alert>
      </n-tab-pane>

      <n-tab-pane name="bytes2num" tab="字节 → 整数">
        <n-form label-placement="top">
          <n-form-item label="十六进制字节(空格分隔)">
            <n-input v-model:value="hexInput" placeholder="如 12 34 56 78" style="font-family: monospace" />
          </n-form-item>
          <n-space justify="center" style="margin: 8px 0 12px">
            <n-button type="primary" @click="bytesToInt">转换</n-button>
          </n-space>
        </n-form>
        <n-grid cols="2" x-gap="12" responsive="screen" style="width: 100%">
          <n-gi>
            <n-form-item label="大端读取">
              <n-input :value="beNum" readonly style="font-family: monospace" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="小端读取">
              <n-input :value="leNum" readonly style="font-family: monospace" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-alert v-if="hexError" type="error" :show-icon="false">{{ hexError }}</n-alert>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const intInput = ref('305419896');
const width = ref(4);
const widthOptions = [
  { label: '1 字节', value: 1 },
  { label: '2 字节', value: 2 },
  { label: '4 字节', value: 4 },
  { label: '8 字节', value: 8 },
];
const bigEndian = ref('');
const littleEndian = ref('');
const intError = ref('');

const hexInput = ref('12 34 56 78');
const beNum = ref('');
const leNum = ref('');
const hexError = ref('');

function toHexBytes(value: bigint, bytes: number): string[] {
  const arr: string[] = [];
  let v = value;
  for (let i = 0; i < bytes; i++) {
    arr.unshift(
      Number(v & BigInt(0xff))
        .toString(16)
        .padStart(2, '0'),
    );
    v >>= BigInt(8);
  }
  return arr;
}

function intToBytes() {
  intError.value = '';
  let raw = intInput.value.trim();
  if (/^0x/i.test(raw)) raw = raw.slice(2);
  try {
    const v = BigInt(raw.length ? raw : '0');
    if (v < 0) throw new Error('不支持负数,请使用无符号整数');
    const bytes = width.value;
    if (v >= BigInt(2) ** BigInt(bytes * 8)) {
      intError.value = `数值超出 ${bytes} 字节无符号范围`;
      bigEndian.value = '';
      littleEndian.value = '';
      return;
    }
    const arr = toHexBytes(v, bytes);
    bigEndian.value = arr.join(' ');
    littleEndian.value = [...arr].reverse().join(' ');
  } catch (e) {
    intError.value = (e as Error).message;
  }
}

function bytesToInt() {
  hexError.value = '';
  const clean = hexInput.value.trim().split(/\s+/).filter(Boolean);
  if (!clean.every((b) => /^[0-9a-fA-F]{1,2}$/.test(b))) {
    hexError.value = '请输入合法的十六进制字节(00-FF)';
    return;
  }
  let n = BigInt(0);
  for (const b of clean) n = (n << BigInt(8)) | BigInt(parseInt(b, 16));
  beNum.value = n.toString(10);
  let m = BigInt(0);
  for (const b of [...clean].reverse()) m = (m << BigInt(8)) | BigInt(parseInt(b, 16));
  leNum.value = m.toString(10);
}
</script>
