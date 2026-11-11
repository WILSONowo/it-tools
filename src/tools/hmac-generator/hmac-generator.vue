<template>
  <div>
    <n-form-item label="计算哈希的明文">
      <n-input v-model:value="plainText" type="textarea" placeholder="输入要计算哈希的文本..." />
    </n-form-item>
    <n-form-item label="密钥">
      <n-input v-model:value="secret" placeholder="输入密钥..." />
    </n-form-item>
    <n-space item-style="flex:1 1 0">
      <n-form-item label="哈希函数">
        <n-select
          v-model:value="hashFunction"
          placeholder="选择哈希函数..."
          :options="Object.keys(algos).map((label) => ({ label, value: label }))"
        />
      </n-form-item>
      <n-form-item label="输出编码">
        <n-select
          v-model:value="encoding"
          placeholder="选择结果编码..."
          :options="[
            {
              label: '二进制 (base 2)',
              value: 'Bin',
            },
            {
              label: '十六进制 (base 16)',
              value: 'Hex',
            },
            {
              label: 'Base64 (base 64)',
              value: 'Base64',
            },
            {
              label: 'Base64-url (base 64,使用 URL 安全字符)',
              value: 'Base64url',
            },
          ]"
        />
      </n-form-item>
    </n-space>
    <n-form-item label="文本的 HMAC">
      <n-input readonly :value="hmac" type="textarea" placeholder="HMAC 计算结果..." />
    </n-form-item>
    <n-space justify="center">
      <n-button secondary @click="copy()">复制 HMAC</n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { computedAsync } from '@vueuse/core';
import { enc, HmacMD5, HmacRIPEMD160, HmacSHA1, HmacSHA224, HmacSHA256, HmacSHA384, HmacSHA512, lib } from 'crypto-js';
import { createHMAC, createSHA3 } from 'hash-wasm';
import { ref } from 'vue';
import { convertHexToBin } from '../hash-text/hash-text.service';

// crypto-js's HmacSHA3 is HMAC over pre-standard Keccak, so SHA3 goes through hash-wasm.
async function hmacSha3(message: string, key: string): Promise<lib.WordArray> {
  const encoder = new TextEncoder();
  const hasher = await createHMAC(createSHA3(512), encoder.encode(key));
  hasher.init();
  hasher.update(encoder.encode(message));
  return enc.Hex.parse(hasher.digest('hex'));
}

const algos = {
  MD5: HmacMD5,
  RIPEMD160: HmacRIPEMD160,
  SHA1: HmacSHA1,
  'SHA3-512': hmacSha3,
  SHA224: HmacSHA224,
  SHA256: HmacSHA256,
  SHA384: HmacSHA384,
  SHA512: HmacSHA512,
} as const;

type Encoding = keyof typeof enc | 'Bin';

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const plainText = ref('');
const secret = ref('');
const hashFunction = ref<keyof typeof algos>('SHA256');
const encoding = ref<Encoding>('Hex');
const hmac = computedAsync(
  async () => formatWithEncoding(await algos[hashFunction.value](plainText.value, secret.value), encoding.value),
  '',
);
const { copy } = useCopy({ source: hmac });
</script>
