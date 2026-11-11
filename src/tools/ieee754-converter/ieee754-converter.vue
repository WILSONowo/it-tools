<template>
  <n-card title="IEEE 754 浮点转换">
    <n-form label-placement="top">
      <n-form-item label="数值">
        <n-input
          v-model:value="valueInput"
          placeholder="如 3.14、-0、1e10、NaN、Infinity"
          style="font-family: monospace"
        />
      </n-form-item>
      <n-space justify="center" style="margin: 8px 0 14px">
        <n-button type="primary" @click="parse">转换</n-button>
        <n-button
          secondary
          @click="
            valueInput = '3.14';
            parse();
          "
          >示例</n-button
        >
      </n-space>
    </n-form>

    <n-alert v-if="error" type="error" :show-icon="false" style="margin-bottom: 10px">{{ error }}</n-alert>

    <template v-if="result.length">
      <n-grid cols="1 700:2" x-gap="16" y-gap="16" responsive="screen">
        <n-gi v-for="item in result" :key="item.name">
          <n-card :title="item.name" size="small">
            <div style="line-height: 1.9">
              <div>
                <b>实际存储值:</b>
                <span style="font-family: monospace; word-break: break-all">{{ item.storedValue }}</span>
                <n-tag v-if="item.overflow" size="small" type="warning" :bordered="false" style="margin-left: 6px">
                  超出范围,溢出为 Infinity
                </n-tag>
              </div>
              <div>
                <b>二进制:</b> <span style="font-family: monospace; word-break: break-all">{{ item.bits }}</span>
              </div>
              <div>
                <b>十六进制:</b> <span style="font-family: monospace">{{ item.hex }}</span>
              </div>
              <div><b>符号位:</b> {{ item.sign }}</div>
              <div><b>指数:</b> {{ item.exponentBits }}<sub>(2)</sub> = {{ item.exponent }}</div>
              <div>
                <b>尾数:</b> <span style="font-family: monospace; word-break: break-all">{{ item.mantissaBits }}</span>
              </div>
            </div>
          </n-card>
        </n-gi>
      </n-grid>
      <n-text depth="3" style="display: block; margin-top: 8px"
        >特殊值说明:全 0 尾数+指数为 0 表示 ±0;指数全 1、尾数全 0 表示 ±Infinity;指数全 1、尾数非 0 表示 NaN。</n-text
      >
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { encodeIeee754, type Ieee754Encoding, parseFloatInput } from './ieee754-converter.service';

const valueInput = ref('3.14');
const result = ref<(Ieee754Encoding & { name: string })[]>([]);
const error = ref('');

function parse() {
  error.value = '';
  const v = parseFloatInput(valueInput.value);
  if (v === null) {
    error.value = '请输入有效数字(也支持 NaN、Infinity、-Infinity、-0)';
    result.value = [];
    return;
  }
  result.value = [
    { name: '单精度 float32', ...encodeIeee754(v, false) },
    { name: '双精度 float64', ...encodeIeee754(v, true) },
  ];
}

parse();
</script>
