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
        <n-alert v-if="vigError" type="error" :show-icon="false" style="margin-bottom: 12px">{{ vigError }}</n-alert>
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
import { caesarBruteForce, caesarShift as caesarShiftText, vigenere } from './classic-ciphers.service';

const caesarInput = ref('HELLO WORLD');
const caesarShift = ref<number | null>(3);
const caesarOutput = ref('');
const bruteResult = ref('');

const vigInput = ref('ATTACKATDAWN');
const vigKey = ref('LEMON');
const vigOutput = ref('');
const vigError = ref('');

function caesarEncrypt() {
  bruteResult.value = '';
  caesarOutput.value = caesarShiftText(caesarInput.value, caesarShift.value);
}

function caesarDecrypt() {
  bruteResult.value = '';
  caesarOutput.value = caesarShiftText(caesarInput.value, -(caesarShift.value ?? 0));
}

function caesarBrute() {
  bruteResult.value = caesarBruteForce(caesarInput.value);
}

function runVigenere(mode: 'encrypt' | 'decrypt') {
  const { output, error } = vigenere({ text: vigInput.value, key: vigKey.value, mode });
  vigOutput.value = output;
  vigError.value = error ?? '';
}

function vigEncrypt() {
  runVigenere('encrypt');
}

function vigDecrypt() {
  runVigenere('decrypt');
}

caesarEncrypt();
vigEncrypt();
</script>
