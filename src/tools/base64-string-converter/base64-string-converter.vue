<template>
  <n-grid y-gap="16" cols="1 800:2" x-gap="16" responsive="screen">
    <n-gi>
      <n-card title="字符串转 Base64">
        <n-form label-placement="top">
          <n-form-item label="待编码的字符串">
            <n-input
              v-model:value="textInput"
              type="textarea"
              placeholder="在此输入字符串..."
              :autosize="{ minRows: 4 }"
              spellcheck="false"
            />
          </n-form-item>

          <n-form-item label="URL 安全(用 - _ 替代 + /,去掉 =)" label-placement="left" style="margin: 0">
            <n-switch v-model:value="urlSafe" />
          </n-form-item>

          <n-form-item label="字符串的 Base64" label-placement="top" style="margin-top: 16px">
            <n-input
              :value="base64Output"
              type="textarea"
              readonly
              placeholder="输入字符串的 Base64 编码将显示在这里"
              :autosize="{ minRows: 4 }"
              spellcheck="false"
              style="font-family: monospace; font-size: 13px"
            />
          </n-form-item>
        </n-form>

        <n-space justify="center" style="margin-top: 16px">
          <n-button secondary @click="copyTextBase64()">复制 Base64</n-button>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="Base64 转字符串">
        <n-form label-placement="top">
          <n-form-item label="URL 安全(接受 - _ 与缺省的 =)" label-placement="left" style="margin: 0">
            <n-switch v-model:value="urlSafe" />
          </n-form-item>

          <n-form-item label="待解码的 Base64 字符串" style="margin: 0" v-bind="b64Validation.attrs">
            <n-input
              v-model:value="base64Input"
              type="textarea"
              placeholder="待解码的 Base64 字符串..."
              :autosize="{ minRows: 4 }"
              spellcheck="false"
              style="font-family: monospace; font-size: 13px"
            />
          </n-form-item>

          <n-form-item label="解码后的字符串" label-placement="top" style="margin-top: 16px">
            <n-input
              :value="textOutput"
              type="textarea"
              readonly
              placeholder="解码结果将显示在这里"
              :autosize="{ minRows: 4 }"
              spellcheck="false"
            />
          </n-form-item>
        </n-form>

        <n-space justify="center" style="margin-top: 16px">
          <n-button secondary @click="copyText()">复制解码结果</n-button>
        </n-space>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { computed, ref } from 'vue';
import { decodeBase64, encodeBase64, isValidBase64Input } from './base64-string-converter.service';

const urlSafe = ref(false);

const textInput = ref('');
const base64Output = computed(() => encodeBase64(textInput.value, { urlSafe: urlSafe.value }));
const { copy: copyTextBase64 } = useCopy({ source: base64Output, text: 'Base64 字符串已复制到剪贴板' });

const base64Input = ref('');
const textOutput = computed(() =>
  withDefaultOnError(() => decodeBase64(base64Input.value, { urlSafe: urlSafe.value }), ''),
);
const { copy: copyText } = useCopy({ source: textOutput, text: '字符串已复制到剪贴板' });
const b64Validation = useValidation({
  source: base64Input,
  watch: [urlSafe],
  rules: [
    { message: '无效的 Base64 字符串', validator: (value) => isValidBase64Input(value, { urlSafe: urlSafe.value }) },
  ],
});
</script>
