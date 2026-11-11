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
          <n-form-item label="十六进制字节(空格分隔或连续书写)">
            <n-input
              v-model:value="hexInput"
              placeholder="如 12 34 56 78 或 0x12345678"
              style="font-family: monospace"
            />
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
import { bytesToEndianIntegers, integerToEndianBytes } from './endian-converter.service';

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

function intToBytes() {
  try {
    const result = integerToEndianBytes(intInput.value, width.value);
    bigEndian.value = result.bigEndian;
    littleEndian.value = result.littleEndian;
    intError.value = '';
  } catch (e) {
    bigEndian.value = '';
    littleEndian.value = '';
    intError.value = (e as Error).message;
  }
}

function bytesToInt() {
  try {
    const result = bytesToEndianIntegers(hexInput.value);
    beNum.value = result.bigEndian;
    leNum.value = result.littleEndian;
    hexError.value = '';
  } catch (e) {
    beNum.value = '';
    leNum.value = '';
    hexError.value = (e as Error).message;
  }
}
</script>
