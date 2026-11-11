<template>
  <div style="width: 100%">
    <n-card>
      <!-- 上部:左右两栏输入 -->
      <n-grid y-gap="16" cols="1 800:2" x-gap="16" responsive="screen">
        <n-gi>
          <n-form-item label="输入内容" label-placement="top">
            <n-input
              v-model:value="inputContent"
              type="textarea"
              placeholder="请输入文本内容"
              :autosize="{ minRows: 8, maxRows: 16 }"
              spellcheck="false"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="输入密钥" label-placement="top">
            <n-input
              v-model:value="inputKey"
              type="textarea"
              placeholder="-----BEGIN PUBLIC KEY----- 或 -----BEGIN PRIVATE KEY-----"
              :autosize="{ minRows: 8, maxRows: 16 }"
              spellcheck="false"
              style="font-family: monospace; font-size: 12px"
            />
          </n-form-item>
        </n-gi>
      </n-grid>

      <!-- 参数行 -->
      <n-grid y-gap="16" cols="2 800:4" x-gap="12" responsive="screen" style="margin-top: 16px">
        <n-gi>
          <n-form-item label="密钥类型" label-placement="top">
            <n-select v-model:value="keyType" :options="keyTypeOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="填充方式" label-placement="top">
            <n-select v-model:value="padding" :options="paddingOptions" />
          </n-form-item>
        </n-gi>
        <n-gi v-if="padding === 'RSA-OAEP'">
          <n-form-item label="OAEP Hash" label-placement="top">
            <n-select v-model:value="oaepHash" :options="hashOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="密文格式" label-placement="top">
            <n-select v-model:value="outputFormat" :options="formatOptions" />
          </n-form-item>
        </n-gi>
      </n-grid>

      <!-- 按钮行 -->
      <n-space justify="center" style="margin: 16px 0">
        <n-button type="primary" @click="doRsaEncrypt">RSA 加密</n-button>
        <n-button type="primary" @click="doRsaDecrypt">RSA 解密</n-button>
        <n-button secondary :disabled="!result" @click="copyResult">复制</n-button>
        <n-button secondary @click="clearAll">清空</n-button>
      </n-space>

      <n-alert v-if="error" type="error" :show-icon="false" style="margin-bottom: 12px">{{ error }}</n-alert>

      <!-- 输出结果 -->
      <n-form-item label="输出结果" label-placement="top">
        <n-input
          :value="result"
          type="textarea"
          readonly
          placeholder="结果将显示在这里"
          :autosize="{ minRows: 5, maxRows: 14 }"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  type CipherEncoding,
  type OaepHash,
  type RsaPadding,
  oaepHashes,
  rsaDecrypt,
  rsaEncrypt,
} from './rsa-encrypt-decrypt.service';

const inputContent = ref('');
const inputKey = ref('');
const keyType = ref<'public' | 'private'>('public');
const padding = ref<RsaPadding>('RSAES-PKCS1-V1_5');
const oaepHash = ref<OaepHash>('SHA256');
const outputFormat = ref<CipherEncoding>('base64');
const result = ref('');
const error = ref('');

const keyTypeOptions = [
  { label: '公钥', value: 'public' },
  { label: '私钥', value: 'private' },
];
const paddingOptions = [
  { label: 'PKCS1Padding', value: 'RSAES-PKCS1-V1_5' },
  { label: 'OAEP', value: 'RSA-OAEP' },
];
const hashOptions = oaepHashes.map((label) => ({ label, value: label }));
const formatOptions = [
  { label: 'base64', value: 'base64' },
  { label: 'hex', value: 'hex' },
];

function doRsaEncrypt() {
  error.value = '';
  result.value = '';
  try {
    if (keyType.value !== 'public') {
      throw new Error('RSA 加密请选择"公钥"密钥类型并粘贴公钥');
    }
    result.value = rsaEncrypt({
      publicKeyPem: inputKey.value,
      plainText: inputContent.value,
      padding: padding.value,
      oaepHash: oaepHash.value,
      encoding: outputFormat.value,
    });
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function doRsaDecrypt() {
  error.value = '';
  result.value = '';
  try {
    if (keyType.value !== 'private') {
      throw new Error('RSA 解密请选择"私钥"密钥类型并粘贴私钥');
    }
    result.value = rsaDecrypt({
      privateKeyPem: inputKey.value,
      cipherText: inputContent.value,
      padding: padding.value,
      oaepHash: oaepHash.value,
      encoding: outputFormat.value,
    });
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function clearAll() {
  inputContent.value = '';
  inputKey.value = '';
  result.value = '';
  error.value = '';
}

const { copy: copyText } = useCopy({ source: result, text: '已复制到剪贴板' });
function copyResult() {
  if (!result.value) return;
  copyText();
}
</script>
