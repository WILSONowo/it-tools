<template>
  <editor v-model:html="html" />
  <n-space align="center" style="margin: 12px 0">
    <n-switch v-model:value="showCode" />
    <span>显示 HTML 源码</span>
  </n-space>
  <textarea-copyable v-if="showCode" :value="formattedHtml" language="html" />
</template>

<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { refDebounced, useStorage } from '@vueuse/core';
import { ref, watch } from 'vue';
import Editor from './editor/editor.vue';
import { formatHtml } from './html-formatter.service';

const html = useStorage('html-wysiwyg-editor--html', '<h1>Hey!</h1><p>Welcome to this html wysiwyg editor</p>');

const showCode = ref(true);
const debouncedHtml = refDebounced(html, 300);
const formattedHtml = ref('');

// prettier is only loaded (dynamic import) when the code view is shown, and formatting is debounced
watch(
  [debouncedHtml, showCode],
  async ([value, show]) => {
    if (!show) {
      return;
    }
    if (formattedHtml.value === '') {
      // show the raw HTML while prettier is loading
      formattedHtml.value = value;
    }
    const formatted = await formatHtml(value);
    if (value === debouncedHtml.value) {
      formattedHtml.value = formatted;
    }
  },
  { immediate: true },
);
</script>

<style lang="less" scoped></style>
