<template>
  <n-card title="生成哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="input"
          placeholder="输入要哈希的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'input',
          }"
        />
      </n-form-item>
      <n-grid y-gap="16" cols="1 600:2" x-gap="12" responsive="screen" style="margin-top: 16px">
        <n-gi>
          <n-form-item label="迭代次数" label-placement="left" label-width="100">
            <n-input-number v-model:value="iterations" placeholder="迭代次数..." :min="1" style="width: 100%" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="内存 (KiB)" label-placement="left" label-width="100">
            <n-input-number
              v-model:value="memorySize"
              placeholder="内存大小..."
              :min="8"
              :max="ARGON2_MAX_MEMORY_KIB"
              style="width: 100%"
            />
          </n-form-item>
        </n-gi>
      </n-grid>
      <n-alert v-if="hashError" type="error" :show-icon="false" style="margin-top: 8px">{{ hashError }}</n-alert>
      <n-form-item label="哈希结果" label-placement="top" style="margin-top: 16px">
        <n-input
          :value="hashed"
          :loading="hashing"
          readonly
          type="textarea"
          :autosize="{ minRows: 3 }"
          style="font-family: 'Consolas', monospace; font-size: 14px"
          placeholder="在上方输入字符串以生成哈希..."
          :input-props="{
            'data-test-id': 'hash',
          }"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin-top: 16px">
      <n-button secondary :disabled="!hashed" @click="copy"> 复制哈希 </n-button>
    </n-space>
  </n-card>

  <n-card title="字符串与哈希比对">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="compareString"
          placeholder="输入要比对的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'compare-string',
          }"
        />
      </n-form-item>
      <n-form-item label="哈希" label-placement="top" style="margin-top: 16px">
        <n-input
          v-model:value="compareHash"
          placeholder="输入要比对的哈希..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'compare-hash',
          }"
        />
      </n-form-item>
      <n-alert v-if="compareError" type="error" :show-icon="false" style="margin-top: 8px">{{ compareError }}</n-alert>
      <n-form-item label="是否匹配" label-placement="top" style="margin-top: 16px" :show-feedback="false">
        <span data-test-id="do-they-match">
          <n-tag v-if="comparing" :bordered="false" round>计算中...</n-tag>
          <n-tag v-else-if="compareMatch" :bordered="false" type="success" round>匹配</n-tag>
          <n-tag v-else :bordered="false" type="error" round>不匹配</n-tag>
        </span>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';
import { ARGON2_MAX_MEMORY_KIB, argon2Compare, argon2Hash } from './argon2.service';

const DEBOUNCE_MS = 300;

const input = ref('');
const iterations = ref<number | null>(32);
const memorySize = ref<number | null>(512);
const hashLength = ref<number | null>(32);

const hashed = ref('');
const hashError = ref('');
const hashing = ref(false);
const { copy } = useCopy({ source: hashed, text: '哈希字符串已复制到剪贴板' });

// runId 用于丢弃过期的异步结果;参数变化后先清空旧结果,避免显示与当前参数不符的哈希
let hashRunId = 0;
watchDebounced(
  [input, iterations, memorySize, hashLength],
  async () => {
    const runId = ++hashRunId;
    hashed.value = '';
    hashError.value = '';
    hashing.value = true;
    const result = await argon2Hash({
      password: input.value,
      iterations: iterations.value,
      memorySize: memorySize.value,
      hashLength: hashLength.value,
    });
    if (runId !== hashRunId) return;
    hashed.value = result.hash;
    hashError.value = result.error ?? '';
    hashing.value = false;
  },
  { debounce: DEBOUNCE_MS, immediate: true },
);

const compareString = ref('');
const compareHash = ref('');
const compareMatch = ref(false);
const compareError = ref('');
const comparing = ref(false);

let compareRunId = 0;
watchDebounced(
  [compareString, compareHash],
  async () => {
    const runId = ++compareRunId;
    compareMatch.value = false;
    compareError.value = '';
    comparing.value = true;
    const result = await argon2Compare({ password: compareString.value, hash: compareHash.value });
    if (runId !== compareRunId) return;
    compareMatch.value = result.match;
    compareError.value = result.error ?? '';
    comparing.value = false;
  },
  { debounce: DEBOUNCE_MS, immediate: true },
);
</script>
