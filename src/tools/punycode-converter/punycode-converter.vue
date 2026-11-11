<template>
  <n-card title="Punycode / IDN 域名转换">
    <n-form label-placement="top">
      <n-form-item label="域名" label-placement="top">
        <n-input v-model:value="input" placeholder="例子: 例子.测试 或 xn--fsqu00a.xn--0zwm56d" spellcheck="false" />
      </n-form-item>
      <n-space justify="center" style="margin: 16px 0 0">
        <n-button type="primary" @click="toPunycode">→ Punycode (xn--)</n-button>
        <n-button type="primary" @click="toUnicode">→ Unicode</n-button>
      </n-space>
    </n-form>
    <n-form-item label="结果" label-placement="top" style="margin: 16px 0 0">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 4 }"
        spellcheck="false"
        style="font-family: monospace; font-size: 14px"
      />
    </n-form-item>
    <n-text v-if="error" depth="3" type="error" style="display: block; margin-top: 8px">{{ error }}</n-text>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import punycode from 'punycode';

const input = ref('例子.测试');
const output = ref('');
const error = ref('');

function toPunycode() {
  try {
    output.value = punycode.toASCII(input.value.trim());
    error.value = '';
  } catch (e) {
    output.value = '';
    error.value = (e as Error).message;
  }
}

function toUnicode() {
  try {
    output.value = punycode.toUnicode(input.value.trim());
    error.value = '';
  } catch (e) {
    output.value = '';
    error.value = (e as Error).message;
  }
}

toPunycode();
</script>
