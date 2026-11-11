<template>
  <n-card>
    <n-input v-model:value="text" type="textarea" placeholder="输入文本..." rows="5" />
    <br />
    <br />
    <n-space justify="space-around">
      <n-statistic label="字符数" :value="text.length" />
      <n-statistic label="单词数" :value="text === '' ? 0 : text.split(/\s+/).length" />
      <n-statistic label="行数" :value="text === '' ? 0 : text.split(/\r\n|\r|\n/).length" />
      <n-statistic label="字节大小" :value="formatBytes(getStringSizeInBytes(text))" />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { formatBytes } from '@/utils/convert';
import { ref } from 'vue';
import { getStringSizeInBytes } from './text-statistics.service';

const text = ref('');
</script>
