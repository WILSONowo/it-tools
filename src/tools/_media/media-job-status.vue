<template>
  <div v-if="processing" style="margin: 8px 0">
    <n-progress
      v-if="status === 'running'"
      type="line"
      :percentage="progress"
      :show-indicator="false"
      style="margin-bottom: 6px"
    />
    <n-text depth="3" style="font-size: 13px; display: block; text-align: center">{{ text }}</n-text>
  </div>
  <n-alert v-if="error" type="error" :show-icon="false" style="margin: 10px 0; white-space: pre-wrap">{{
    error
  }}</n-alert>
</template>

<script setup lang="ts">
import type { FFmpegJobStatus } from './ffmpeg-loader';

defineProps<{
  processing: boolean;
  status: FFmpegJobStatus | null;
  progress: number;
  text: string;
  error: string;
}>();
</script>
