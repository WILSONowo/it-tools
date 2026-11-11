<template>
  <n-grid y-gap="16" cols="1 1100:2" x-gap="16" responsive="screen" style="width: 100%">
    <n-gi>
      <n-card title="加密">
        <n-form-item label="输入文本" label-placement="top">
          <n-input
            v-model:value="cypherInput"
            type="textarea"
            placeholder="要加密的字符串"
            :autosize="{ minRows: 7, maxRows: 14 }"
          />
        </n-form-item>
        <n-grid y-gap="16" cols="1 500:3" x-gap="12" responsive="screen" style="margin-top: 12px">
          <n-gi span="1">
            <n-form-item label="输入密钥" label-placement="top">
              <n-input v-model:value="cypherSecret" placeholder="密钥" />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="加密算法" label-placement="top">
              <n-select
                v-model:value="cypherAlgo"
                :options="Object.keys(algos).map((label) => ({ label, value: label }))"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="加密结果" label-placement="top" style="margin: 12px 0 0">
          <n-input
            :value="cypherOutput"
            type="textarea"
            placeholder="加密结果"
            :autosize="{ minRows: 3 }"
            readonly
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </n-form-item>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="解密">
        <n-form-item label="加密文本" label-placement="top">
          <n-input
            v-model:value="decryptInput"
            type="textarea"
            placeholder="要解密的字符串"
            :autosize="{ minRows: 7, maxRows: 14 }"
          />
        </n-form-item>
        <n-grid y-gap="16" cols="1 500:3" x-gap="12" responsive="screen" style="margin-top: 12px">
          <n-gi span="1">
            <n-form-item label="输入密钥" label-placement="top">
              <n-input v-model:value="decryptSecret" placeholder="密钥" />
            </n-form-item>
          </n-gi>
          <n-gi span="2">
            <n-form-item label="加密算法" label-placement="top">
              <n-select
                v-model:value="decryptAlgo"
                :options="Object.keys(algos).map((label) => ({ label, value: label }))"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-alert v-if="decryptResult.error" type="error" :show-icon="false" style="margin-top: 12px">
          {{ decryptResult.error }}
        </n-alert>
        <n-form-item label="解密结果" label-placement="top" style="margin: 12px 0 0">
          <n-input
            :value="decryptOutput"
            type="textarea"
            placeholder="解密结果"
            :autosize="{ minRows: 3 }"
            readonly
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </n-form-item>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type CipherAlgo, algos, decryptText, encryptText } from './encryption.service';

const cypherInput = ref('Lorem ipsum dolor sit amet');
const cypherAlgo = ref<CipherAlgo>('AES');
const cypherSecret = ref('my secret key');
const cypherOutput = computed(() =>
  encryptText({ algo: cypherAlgo.value, text: cypherInput.value, secret: cypherSecret.value }),
);

const decryptInput = ref('U2FsdGVkX1/EC3+6P5dbbkZ3e1kQ5o2yzuU0NHTjmrKnLBEwreV489Kr0DIB+uBs');
const decryptAlgo = ref<CipherAlgo>('AES');
const decryptSecret = ref('my secret key');
const decryptResult = computed(() =>
  decryptText({ algo: decryptAlgo.value, cipherText: decryptInput.value, secret: decryptSecret.value }),
);
const decryptOutput = computed(() => decryptResult.value.output);
</script>
