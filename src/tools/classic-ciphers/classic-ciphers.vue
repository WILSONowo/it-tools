<template>
  <n-card title="古典密码 Caesar / Vigenère">
    <n-tabs type="line" default-value="caesar">
      <n-tab-pane name="caesar" tab="凯撒 Caesar">
        <n-form label-placement="top">
          <n-form-item label="明文 / 密文">
            <n-input
              v-model:value="caesarInput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              placeholder="HELLO WORLD"
              spellcheck="false"
            />
          </n-form-item>
        </n-form>
        <n-form label-placement="left" label-width="64" style="margin-top: 16px">
          <n-form-item label="偏移量">
            <n-input-number v-model:value="caesarShift" :min="-25" :max="25" style="width: 120px" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 16px 0">
          <n-button type="primary" @click="caesarEncrypt">加密</n-button>
          <n-button type="primary" @click="caesarDecrypt">解密</n-button>
        </n-space>
        <n-form label-placement="top">
          <n-form-item label="结果">
            <n-input
              :value="caesarOutput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              readonly
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-divider>暴力破解(尝试全部 26 个偏移)</n-divider>
        <n-space justify="center">
          <n-button secondary @click="caesarBrute">尝试全部偏移</n-button>
        </n-space>
        <n-input
          v-if="bruteResult.length > 0"
          :value="bruteResult"
          type="textarea"
          :autosize="{ minRows: 6 }"
          readonly
          spellcheck="false"
          style="font-family: monospace; margin-top: 12px; font-size: 12px"
        />
      </n-tab-pane>

      <n-tab-pane name="vigenere" tab="维吉尼亚 Vigenère">
        <n-form label-placement="top">
          <n-form-item label="明文 / 密文">
            <n-input
              v-model:value="vigInput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              placeholder="ATTACKATDAWN"
              spellcheck="false"
            />
          </n-form-item>
        </n-form>
        <n-form label-placement="left" label-width="64" style="margin-top: 16px">
          <n-form-item label="密钥">
            <n-input v-model:value="vigKey" placeholder="LEMON" style="width: 200px" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 16px 0">
          <n-button type="primary" @click="vigEncrypt">加密</n-button>
          <n-button type="primary" @click="vigDecrypt">解密</n-button>
        </n-space>
        <n-form label-placement="top">
          <n-form-item label="结果">
            <n-input
              :value="vigOutput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              readonly
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const caesarInput = ref('HELLO WORLD');
const caesarShift = ref(3);
const caesarOutput = ref('');
const bruteResult = ref('');

const vigInput = ref('ATTACKATDAWN');
const vigKey = ref('LEMON');
const vigOutput = ref('');

function shiftChar(char: string, shift: number): string {
  const code = char.charCodeAt(0);
  const isUpper = code >= 65 && code <= 90;
  const isLower = code >= 97 && code <= 122;
  if (!isUpper && !isLower) return char;
  const base = isUpper ? 65 : 97;
  return String.fromCharCode(((code - base + shift + 26) % 26) + base);
}

function caesarShiftText(text: string, shift: number): string {
  return text
    .split('')
    .map((char) => shiftChar(char, shift))
    .join('');
}

function caesarEncrypt() {
  bruteResult.value = '';
  caesarOutput.value = caesarShiftText(caesarInput.value, caesarShift.value);
}

function caesarDecrypt() {
  bruteResult.value = '';
  caesarOutput.value = caesarShiftText(caesarInput.value, -caesarShift.value);
}

function caesarBrute() {
  const text = caesarInput.value;
  const lines: string[] = [];
  for (let shift = 1; shift <= 25; shift++) {
    lines.push(`偏移 ${shift.toString().padStart(2, ' ')}: ${caesarShiftText(text, -shift)}`);
  }
  bruteResult.value = lines.join('\n');
}

function vigClean(text: string, key: string): { text: string; ok: boolean; error?: string } {
  if (key.trim() === '') return { text: '', ok: false, error: '请输入密钥' };
  if (!/^[a-zA-Z]+$/.test(key.trim())) return { text: '', ok: false, error: '密钥只能包含字母' };
  const keyUpper = key.toUpperCase();
  const shifts = keyUpper.split('').map((char) => char.charCodeAt(0) - 65);
  let keyIndex = 0;
  const result = text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (!isUpper && !isLower) return char;
      const shift = shifts[keyIndex % shifts.length];
      keyIndex++;
      return shiftChar(char, shift);
    })
    .join('');
  return { text: result, ok: true };
}

function vigEncrypt() {
  const { text, ok, error } = vigClean(vigInput.value, vigKey.value);
  if (!ok) {
    vigOutput.value = '';
    return;
  }
  vigOutput.value = text;
}

function vigDecrypt() {
  const cleaned = vigClean(vigInput.value, vigKey.value);
  if (!cleaned.ok) {
    vigOutput.value = '';
    return;
  }
  const keyUpper = vigKey.value.toUpperCase();
  const shifts = keyUpper.split('').map((char) => char.charCodeAt(0) - 65);
  let keyIndex = 0;
  vigOutput.value = vigInput.value
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (!isUpper && !isLower) return char;
      const shift = shifts[keyIndex % shifts.length];
      keyIndex++;
      return shiftChar(char, -shift);
    })
    .join('');
}

caesarEncrypt();
vigEncrypt();
</script>
