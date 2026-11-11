<template>
  <n-card title="字符串 ↔ Unicode 转义">
    <n-tabs type="line" default-value="str2u">
      <n-tab-pane name="str2u" tab="字符串 → Unicode">
        <n-form label-placement="left" label-width="160" :show-feedback="false">
          <n-form-item label="输入字符串">
            <n-input
              v-model:value="plainInput"
              type="textarea"
              :autosize="{ minRows: 5 }"
              placeholder="Hello 世界 😀"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-form-item label="编码格式">
            <n-radio-group v-model:value="format">
              <n-radio-button value="bmp">\uXXXX (BMP)</n-radio-button>
              <n-radio-button value="astral">\u{XXXXXX}</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="Unicode 转义">
            <n-input
              :value="unicodeOutput"
              type="textarea"
              readonly
              :autosize="{ minRows: 4 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 8px 0 4px">
          <n-button type="primary" @click="toUnicode">编码</n-button>
          <n-button secondary :disabled="!unicodeOutput" @click="copyEncoded">复制</n-button>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="u2str" tab="Unicode → 字符串">
        <n-form label-placement="left" label-width="160" :show-feedback="false">
          <n-form-item label="Unicode 转义">
            <n-input
              v-model:value="unicodeInput"
              type="textarea"
              :autosize="{ minRows: 5 }"
              placeholder="\u0048\u0065\u006c\u006c\u006f \u4e16\u754c \ud83d\ude00"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-form-item label="解码结果" :feedback="decodeFeedback" :validation-status="decodeStatus">
            <n-input
              :value="plainOutput"
              type="textarea"
              readonly
              :autosize="{ minRows: 4 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 8px 0 4px">
          <n-button type="primary" @click="fromUnicode">解码</n-button>
          <n-button secondary :disabled="!plainOutput" @click="copyDecoded">复制</n-button>
        </n-space>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';

const plainInput = ref('Hello 世界 😀');
const format = ref<'bmp' | 'astral'>('astral');
const unicodeOutput = ref('');
const unicodeInput = ref('\\u0048\\u0065\\u006c\\u006c\\u006f \\u4e16\\u754c \\ud83d\\ude00');
const plainOutput = ref('');
const decodeFeedback = ref('');
const decodeStatus = ref<string | undefined>(undefined);

function codePointToEscape(codePoint: number): string {
  return format.value === 'bmp' ? `\\u${codePoint.toString(16).padStart(4, '0')}` : `\\u{${codePoint.toString(16)}}`;
}

function toUnicode() {
  let result = '';
  for (const char of plainInput.value) {
    const codePoint = char.codePointAt(0) ?? 0;
    if (format.value === 'bmp' && codePoint > 0xffff) {
      // surrogate pair, e.g. 😀 -> \ud83d\ude00
      const code = char.charCodeAt(0).toString(16).padStart(4, '0');
      const high = char.charCodeAt(1).toString(16).padStart(4, '0');
      result += `\\u${code}\\u${high}`;
    } else {
      result += codePointToEscape(codePoint);
    }
  }
  unicodeOutput.value = result;
}

function fromUnicode() {
  try {
    plainOutput.value = decodeUnicodeEscapes(unicodeInput.value);
    decodeFeedback.value = '';
    decodeStatus.value = undefined;
  } catch (e) {
    plainOutput.value = '';
    decodeFeedback.value = (e as Error).message;
    decodeStatus.value = 'error';
  }
}

function decodeUnicodeEscapes(source: string): string {
  return source.replace(
    /\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g,
    (match, braced: string | undefined, plain: string | undefined) => {
      const hex = braced ?? plain;
      if (!hex) return match;
      const codePoint = parseInt(hex, 16);
      if (codePoint > 0x10ffff) throw new Error('无效 code point');
      return String.fromCodePoint(codePoint);
    },
  );
}

toUnicode();
fromUnicode();

const { copy: copyEncoded } = useCopy({ source: unicodeOutput, text: 'Encoded copied to the clipboard' });
const { copy: copyDecoded } = useCopy({ source: plainOutput, text: 'Decoded copied to the clipboard' });
</script>
