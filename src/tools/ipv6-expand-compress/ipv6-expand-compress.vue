<template>
  <n-card title="IPv6 压缩 / 展开">
    <n-form label-placement="top">
      <n-form-item label="IPv6 地址" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          placeholder="2001:db8::1 或 2001:0db8:0000:0000:0000:0000:0000:0001"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
      <n-space justify="center">
        <n-button type="primary" secondary @click="expand">展开 (全格式)</n-button>
        <n-button type="primary" secondary @click="compress">压缩 (最短)</n-button>
        <n-button secondary :disabled="!output" @click="copy">复制</n-button>
        <n-button secondary :disabled="!output" @click="clear">清空</n-button>
      </n-space>
    </n-form>
    <n-form-item label="结果" label-placement="top" style="margin: 16px 0 0">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 3 }"
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';

const input = ref('2001:db8::1');
const output = ref('');
const feedback = ref('');
const status = ref<string | undefined>(undefined);

function expand() {
  const clean = input.value.trim();
  if (clean === '') return;
  const parsed = parseGroups(clean);
  if (parsed === null) {
    feedback.value = '无效的 IPv6 地址';
    status.value = 'error';
    output.value = '';
    return;
  }
  feedback.value = '';
  status.value = undefined;
  output.value = parsed.map((g) => g.toString(16).padStart(4, '0')).join(':');
}

function compress() {
  const clean = input.value.trim();
  if (clean === '') return;
  const parsed = parseGroups(clean);
  if (parsed === null) {
    feedback.value = '无效的 IPv6 地址';
    status.value = 'error';
    output.value = '';
    return;
  }
  feedback.value = '';
  status.value = undefined;
  output.value = compressGroups(parsed);
}

const { copy } = useCopy({ source: output, text: '结果已复制到剪贴板' });

function clear() {
  output.value = '';
  feedback.value = '';
  status.value = undefined;
}

function parseGroups(value: string): number[] | null {
  if (value.includes('.')) {
    const lastColon = value.lastIndexOf(':');
    const head = value.slice(0, lastColon);
    const v4 = value.slice(lastColon + 1).split('.');
    if (v4.length !== 4) return null;
    const v4Num: number[] = [];
    for (const part of v4) {
      const n = Number(part);
      if (!/^\d{1,3}$/.test(part) || n > 255) return null;
      v4Num.push(n);
    }
    const tail = [v4Num[0] * 256 + v4Num[1], v4Num[2] * 256 + v4Num[3]];
    const headGroups = parseGroups(`${head}::`);
    if (headGroups === null) return null;
    return [...headGroups.slice(0, 6), ...tail];
  }

  const doubleColon = value.indexOf('::');
  if (doubleColon === -1) {
    const parts = value.split(':');
    if (parts.length !== 8) return null;
    const groups: number[] = [];
    for (const part of parts) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
      groups.push(parseInt(part, 16));
    }
    return groups;
  }

  const head = value.slice(0, doubleColon);
  const tail = value.slice(doubleColon + 2);
  const headParts = head === '' ? [] : head.split(':');
  const tailParts = tail === '' ? [] : tail.split(':');
  if (headParts.length + tailParts.length >= 8) return null;

  const groups: number[] = [];
  for (const part of headParts) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    groups.push(parseInt(part, 16));
  }
  while (groups.length < 8 - tailParts.length) groups.push(0);
  for (const part of tailParts) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    groups.push(parseInt(part, 16));
  }
  return groups;
}

function compressGroups(groups: number[]): string {
  let longestStart = -1;
  let longestLen = 0;
  let curStart = -1;
  let curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === 0) {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > longestLen) {
        longestLen = curLen;
        longestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  if (longestLen >= 2) {
    const head = groups
      .slice(0, longestStart)
      .map((g) => g.toString(16))
      .join(':');
    const tail = groups
      .slice(longestStart + longestLen)
      .map((g) => g.toString(16))
      .join(':');
    return `${head}::${tail}`;
  }
  return groups.map((g) => g.toString(16)).join(':');
}

expand();
</script>
