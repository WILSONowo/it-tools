<template>
  <n-card title="哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="input"
          placeholder="要使用 bcrypt 哈希的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-alert v-if="inputTruncated" type="warning" :show-icon="false" style="margin-top: 8px">
        输入超过 72 字节(UTF-8),bcrypt 只会使用前 72 个字节,超出部分不影响哈希结果。
      </n-alert>
      <n-form-item label="成本因子 (cost)" label-placement="left" label-width="120" style="margin-top: 16px">
        <n-input-number
          v-model:value="cost"
          placeholder="成本因子..."
          :max="BCRYPT_MAX_COST"
          :min="BCRYPT_MIN_COST"
          style="width: 200px"
        />
        <n-text depth="3" style="margin-left: 12px">计算量为 2^cost,每加 1 耗时翻倍</n-text>
      </n-form-item>
      <n-alert v-if="normalizeCost(cost) > 15" type="warning" :show-icon="false" style="margin-bottom: 8px">
        成本因子较大,在浏览器中计算可能需要数秒到数小时。
      </n-alert>
      <n-form-item label="哈希结果" label-placement="top" style="margin-top: 16px">
        <n-input
          :value="hashed"
          :loading="hashing"
          :placeholder="hashing ? `计算中... ${hashProgress}%` : ''"
          readonly
          type="textarea"
          :autosize="{ minRows: 2 }"
          style="font-family: 'Consolas', monospace; font-size: 14px"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin-top: 16px">
      <n-button secondary :disabled="!hashed" @click="copy"> 复制哈希 </n-button>
    </n-space>
  </n-card>

  <n-card title="比对字符串与哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="compareString"
          placeholder="用于比对的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-form-item label="哈希" label-placement="top" style="margin-top: 16px">
        <n-input
          v-model:value="compareHash"
          placeholder="用于比对的哈希..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-form-item label="是否匹配" label-placement="top" style="margin-top: 16px" :show-feedback="false">
        <n-tag v-if="comparing" :bordered="false" round>计算中...</n-tag>
        <n-tag v-else-if="compareMatch" :bordered="false" type="success" round>是</n-tag>
        <n-tag v-else :bordered="false" type="error" round>否</n-tag>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { useCopy } from '@/composable/copy';
import {
  BCRYPT_DEFAULT_COST,
  BCRYPT_MAX_COST,
  BCRYPT_MIN_COST,
  bcryptCompare,
  bcryptHash,
  isTruncatedByBcrypt,
  normalizeCost,
} from './bcrypt.service';

const DEBOUNCE_MS = 300;

const input = ref('');
const cost = ref<number | null>(BCRYPT_DEFAULT_COST);
const hashed = ref('');
const hashing = ref(false);
const hashProgress = ref(0);
const inputTruncated = computed(() => isTruncatedByBcrypt(input.value));
const { copy } = useCopy({ source: hashed, text: '哈希字符串已复制到剪贴板' });

// 用递增的 runId 丢弃过期结果,避免慢的旧计算覆盖新输入的结果
let hashRunId = 0;
watchDebounced(
  [input, cost],
  async () => {
    const runId = ++hashRunId;
    hashed.value = '';
    hashing.value = true;
    hashProgress.value = 0;
    try {
      const result = await bcryptHash(input.value, cost.value, (p) => {
        if (runId === hashRunId) hashProgress.value = Math.round(p * 100);
      });
      if (runId === hashRunId) hashed.value = result;
    } catch (_) {
      if (runId === hashRunId) hashed.value = '';
    } finally {
      if (runId === hashRunId) hashing.value = false;
    }
  },
  { debounce: DEBOUNCE_MS, immediate: true },
);

const compareString = ref('');
const compareHash = ref('');
const compareMatch = ref(false);
const comparing = ref(false);

let compareRunId = 0;
watchDebounced(
  [compareString, compareHash],
  async () => {
    const runId = ++compareRunId;
    comparing.value = true;
    try {
      const match = await bcryptCompare(compareString.value, compareHash.value);
      if (runId === compareRunId) compareMatch.value = match;
    } catch (_) {
      if (runId === compareRunId) compareMatch.value = false;
    } finally {
      if (runId === compareRunId) comparing.value = false;
    }
  },
  { debounce: DEBOUNCE_MS, immediate: true },
);
</script>
