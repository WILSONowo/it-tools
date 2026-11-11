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
        <n-gi v-else>
          <n-form-item label="输出格式" label-placement="top">
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
import { useClipboard } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import forge from 'node-forge';

const { pki, util } = forge;

const inputContent = ref('');
const inputKey = ref('');
const keyType = ref<'public' | 'private'>('public');
const padding = ref<'RSAES-PKCS1-V1_5' | 'RSA-OAEP'>('RSAES-PKCS1-V1_5');
const oaepHash = ref('SHA256');
const outputFormat = ref<'base64' | 'hex'>('base64');
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
const hashOptions = ['SHA1', 'SHA256', 'SHA384', 'SHA512'].map((label) => ({ label, value: label }));
const formatOptions = [
  { label: 'base64', value: 'base64' },
  { label: 'hex', value: 'hex' },
];

const message = useMessage();

function scheme(): 'RSAES-PKCS1-V1_5' | 'RSA-OAEP' {
  return padding.value;
}

function encodeOutput(bytes: string): string {
  if (outputFormat.value === 'hex') return util.bytesToHex(bytes);
  return util.encode64(bytes);
}

function parseKey(pemOrHex: string): forge.pki.rsa.PublicKey | forge.pki.rsa.PrivateKey {
  const text = pemOrHex.trim();
  if (text.startsWith('-----BEGIN')) {
    return keyType.value === 'public' ? pki.publicKeyFromPem(text) : pki.privateKeyFromPem(text);
  }
  throw new Error('当前仅支持 PEM 格式密钥');
}

function doRsaEncrypt() {
  error.value = '';
  result.value = '';
  try {
    const key = parseKey(inputKey.value);
    if (keyType.value !== 'public') {
      throw new Error('RSA 加密请选择"公钥"密钥类型并粘贴公钥');
    }
    const pub = key as forge.pki.rsa.PublicKey;
    const bytes = pub.encrypt(util.encodeUtf8(inputContent.value), scheme());
    result.value = encodeOutput(bytes);
  } catch (e) {
    error.value = (e as Error).message;
  }
}

function doRsaDecrypt() {
  error.value = '';
  result.value = '';
  try {
    const key = parseKey(inputKey.value);
    if (keyType.value !== 'private') {
      throw new Error('RSA 解密请选择"私钥"密钥类型并粘贴私钥');
    }
    const priv = key as forge.pki.rsa.PrivateKey;
    let cipherBytes: string;
    if (outputFormat.value === 'hex') cipherBytes = util.hexToBytes(inputContent.value.trim());
    else if (outputFormat.value === 'base64') cipherBytes = util.decode64(inputContent.value.trim());
    else cipherBytes = util.encodeUtf8(inputContent.value);
    const bytes = priv.decrypt(cipherBytes, scheme());
    result.value = util.decodeUtf8(bytes);
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

const { copy: copyText } = useClipboard({ source: result });
function copyResult() {
  if (!result.value) return;
  copyText();
  message.success('已复制到剪贴板');
}
</script>
