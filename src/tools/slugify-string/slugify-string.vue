<template>
  <div>
    <n-form label-placement="left" label-width="180" :show-feedback="false">
      <n-form-item label="要 Slug 化的字符串">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 5 }"
          placeholder="在此输入字符串(如: My file path)"
          spellcheck="false"
        />
      </n-form-item>

      <n-form-item label="生成的 Slug">
        <n-input
          :value="slug"
          type="textarea"
          readonly
          :autosize="{ minRows: 3 }"
          placeholder="生成的 Slug 将显示在这里(如: my-file-path)"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>

    <n-space justify="center" style="margin-top: 4px">
      <n-button secondary :disabled="slug.length === 0" @click="copy">复制 Slug</n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import slugify from '@sindresorhus/slugify';
import { withDefaultOnError } from '@/utils/defaults';
import { useCopy } from '@/composable/copy';

const input = ref('');
const slug = computed(() => withDefaultOnError(() => slugify(input.value), ''));
const { copy } = useCopy({ source: slug, text: 'Slug 已复制到剪贴板' });
</script>
