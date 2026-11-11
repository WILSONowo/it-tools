<template>
  <div style="max-width: 480px; margin: 0 auto">
    <n-card>
      <div class="duration">{{ formatMs(counter) }}</div>
    </n-card>
    <n-space justify="center" style="margin-top: 16px">
      <n-button v-if="!isRunning" type="primary" @click="resume">开始</n-button>
      <n-button v-else type="primary" @click="pause">停止</n-button>
      <n-button secondary @click="counter = 0">重置</n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { useRafFn } from '@vueuse/core';
import { ref } from 'vue';
import { formatMs } from './chronometer.service';

const isRunning = ref(false);
const counter = ref(0);

let previousRafDate = Date.now();
const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  () => {
    const deltaMs = Date.now() - previousRafDate;
    previousRafDate = Date.now();
    counter.value += deltaMs;
  },
  { immediate: false },
);

function resume() {
  previousRafDate = Date.now();
  resumeRaf();
  isRunning.value = true;
}

function pause() {
  pauseRaf();
  isRunning.value = false;
}
</script>

<style lang="less" scoped>
.duration {
  text-align: center;
  font-size: 56px;
  font-family: monospace;
  margin: 28px 0;
}
</style>
