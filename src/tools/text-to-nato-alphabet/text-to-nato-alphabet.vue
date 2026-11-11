<template>
  <div>
    <n-form label-placement="top">
      <n-form-item label="要转换为北约音标字母的文本">
        <n-input v-model:value="input" placeholder="在此输入文本..." clearable />
      </n-form-item>

      <n-form-item v-if="natoText" label="文本对应的北约音标字母" style="margin-top: 16px">
        <n-input
          :value="natoText"
          type="textarea"
          readonly
          :autosize="{ minRows: 3, maxRows: 10 }"
          placeholder="转换结果将显示在此处..."
          spellcheck="false"
          style="font-family: monospace; font-size: 13px"
        />
      </n-form-item>
      <n-empty v-else description="输入文本后自动转换为北约音标字母" style="padding: 16px 0" />

      <n-space v-if="natoText" justify="center" style="margin-top: 12px">
        <n-button type="primary" secondary autofocus @click="copy">复制北约音标字符串</n-button>
      </n-space>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { computed, ref } from 'vue';
import { textToNatoAlphabet } from './text-to-nato-alphabet.service';

const input = ref('');
const natoText = computed(() => textToNatoAlphabet({ text: input.value }));
const { copy } = useCopy({ source: natoText, text: '北约音标字符串已复制。' });
</script>

<style lang="less" scoped></style>
