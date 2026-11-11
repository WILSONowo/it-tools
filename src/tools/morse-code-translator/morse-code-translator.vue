<template>
  <n-card title="摩斯密码翻译">
    <n-form label-placement="top">
      <n-form-item label="文本 / 摩斯码">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 5 }"
          placeholder="SOS → ... --- ..."
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>

      <n-form-item label="选项">
        <n-checkbox v-model:value="slashWords">用 / 分隔单词</n-checkbox>
      </n-form-item>

      <n-space justify="center">
        <n-button type="primary" secondary @click="encode">文本 → 摩斯</n-button>
        <n-button type="primary" secondary @click="decode">摩斯 → 文本</n-button>
        <n-button secondary :disabled="!output" @click="copy">复制结果</n-button>
        <n-button secondary :disabled="!output" @click="clear">清空</n-button>
      </n-space>
    </n-form>

    <n-alert v-if="error" type="error" :show-icon="false" style="margin: 16px 0 0">{{ error }}</n-alert>

    <n-form-item label="结果" label-placement="top" style="margin: 16px 0 0">
      <n-input
        :value="output"
        type="textarea"
        :autosize="{ minRows: 5 }"
        readonly
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { textToMorse, morseToText } from './morse-code.service';

const input = ref('SOS 123 hello world');
const slashWords = ref(true);
const output = ref('');
const error = ref('');

function encode() {
  error.value = '';
  try {
    output.value = textToMorse(input.value, slashWords.value);
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
}

function decode() {
  error.value = '';
  try {
    output.value = morseToText(input.value);
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
}

encode();

const { copy } = useCopy({ source: output, text: '结果已复制到剪贴板' });

function clear() {
  output.value = '';
  error.value = '';
}
</script>
