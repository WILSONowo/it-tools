<template>
  <div style="width: 100%">
    <n-card>
      <n-tabs type="line" default-value="sign">
        <!-- 签名 -->
        <n-tab-pane name="sign" tab="签名">
          <n-grid y-gap="16" cols="1 800:2" x-gap="16" responsive="screen">
            <n-gi>
              <n-form-item label="输入内容" label-placement="top">
                <n-input
                  v-model:value="signContent"
                  type="textarea"
                  placeholder="请输入内容"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  spellcheck="false"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="私钥 (PEM)" label-placement="top">
                <n-input
                  v-model:value="signKey"
                  type="textarea"
                  placeholder="-----BEGIN PRIVATE KEY-----"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  spellcheck="false"
                  style="font-family: monospace; font-size: 12px"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-space align="center" style="margin-top: 16px" :wrap="true">
            <n-form-item label="哈希算法" label-placement="left" style="margin: 0 16px 0 0">
              <n-select v-model:value="signHash" :options="hashOptions" style="width: 200px" />
            </n-form-item>
            <n-form-item label="签名格式" label-placement="left">
              <n-select v-model:value="signFormat" :options="sigFormatOptions" style="width: 140px" />
            </n-form-item>
          </n-space>

          <n-space justify="center" style="margin: 16px 0">
            <n-button type="primary" @click="doSign">签名</n-button>
            <n-button secondary @click="clearSign">清空</n-button>
          </n-space>

          <n-alert v-if="signError" type="error" :show-icon="false" style="margin-bottom: 12px">{{
            signError
          }}</n-alert>

          <n-form-item label="签名结果" label-placement="top">
            <n-input
              :value="signature"
              type="textarea"
              readonly
              placeholder="签名结果将显示在这里"
              :autosize="{ minRows: 4, maxRows: 10 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center" style="margin-top: 12px">
            <n-button secondary :disabled="!signature" @click="copySign">复制</n-button>
          </n-space>
        </n-tab-pane>

        <!-- 验证 -->
        <n-tab-pane name="verify" tab="验证">
          <n-grid y-gap="16" cols="1 1200:3" x-gap="16" responsive="screen">
            <n-gi>
              <n-form-item label="原始内容" label-placement="top">
                <n-input
                  v-model:value="verifyContent"
                  type="textarea"
                  placeholder="请输入原始内容"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  spellcheck="false"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="公钥 (PEM)" label-placement="top">
                <n-input
                  v-model:value="verifyKey"
                  type="textarea"
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  spellcheck="false"
                  style="font-family: monospace; font-size: 12px"
                />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="签名" label-placement="top">
                <n-input
                  v-model:value="verifySignature"
                  type="textarea"
                  placeholder="待验证的签名"
                  :autosize="{ minRows: 8, maxRows: 14 }"
                  spellcheck="false"
                  style="font-family: monospace; font-size: 12px"
                />
              </n-form-item>
            </n-gi>
          </n-grid>

          <n-space align="center" style="margin-top: 16px" :wrap="true">
            <n-form-item label="哈希算法" label-placement="left" style="margin: 0 16px 0 0">
              <n-select v-model:value="verifyHash" :options="hashOptions" style="width: 200px" />
            </n-form-item>
            <n-form-item label="签名格式" label-placement="left">
              <n-select v-model:value="verifyFormat" :options="sigFormatOptions" style="width: 140px" />
            </n-form-item>
          </n-space>

          <n-space justify="center" style="margin: 16px 0">
            <n-button type="primary" @click="doVerify">校验</n-button>
            <n-button secondary @click="clearVerify">清空</n-button>
          </n-space>

          <n-result v-if="verifyResult === true" status="success" title="签名有效" />
          <n-result v-else-if="verifyResult === false" status="error" :title="SIGNATURE_MISMATCH" />
          <n-alert v-else-if="verifyError" type="error" :show-icon="false">{{ verifyError }}</n-alert>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  SIGNATURE_MISMATCH,
  type SignHash,
  type SignatureEncoding,
  rsaSign,
  rsaVerify,
  signHashes,
} from './rsa-sign-verify.service';

const hashOptions = signHashes.map((label) => ({ label, value: label }));
const sigFormatOptions = [
  { label: 'base64', value: 'base64' },
  { label: 'hex', value: 'hex' },
];

const signContent = ref('');
const signKey = ref('');
const signHash = ref<SignHash>('SHA256');
const signFormat = ref<SignatureEncoding>('base64');
const signature = ref('');
const signError = ref('');

const verifyContent = ref('');
const verifyKey = ref('');
const verifySignature = ref('');
const verifyHash = ref<SignHash>('SHA256');
const verifyFormat = ref<SignatureEncoding>('base64');
const verifyResult = ref<boolean | null>(null);
const verifyError = ref('');

function doSign() {
  signError.value = '';
  signature.value = '';
  try {
    signature.value = rsaSign({
      privateKeyPem: signKey.value,
      message: signContent.value,
      hash: signHash.value,
      encoding: signFormat.value,
    });
  } catch (e) {
    signError.value = (e as Error).message;
  }
}

function doVerify() {
  verifyResult.value = null;
  verifyError.value = '';
  try {
    verifyResult.value = rsaVerify({
      publicKeyPem: verifyKey.value,
      message: verifyContent.value,
      signature: verifySignature.value,
      hash: verifyHash.value,
      encoding: verifyFormat.value,
    });
  } catch (e) {
    verifyError.value = (e as Error).message;
  }
}

function clearSign() {
  signContent.value = '';
  signKey.value = '';
  signature.value = '';
  signError.value = '';
}

function clearVerify() {
  verifyContent.value = '';
  verifyKey.value = '';
  verifySignature.value = '';
  verifyResult.value = null;
  verifyError.value = '';
}

const { copy: copyText } = useCopy({ source: signature, text: '已复制到剪贴板' });
function copySign() {
  if (!signature.value) return;
  copyText();
}
</script>
