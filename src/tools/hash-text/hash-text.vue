<template>
  <div>
    <n-card>
      <n-input v-model:value="clearText" type="textarea" placeholder="待哈希的字符串..." rows="3" />

      <n-divider />

      <n-form-item label="摘要编码">
        <n-select
          v-model:value="encoding"
          :options="[
            { label: '十六进制（基数 16）', value: 'Hex' },
            { label: 'Base64（基数 64）', value: 'Base64' },
            { label: 'Base64url（URL 安全字符）', value: 'Base64url' },
            { label: '二进制（基数 2）', value: 'Bin' },
          ]"
        />
      </n-form-item>

      <div v-for="algo in algoNames" :key="algo" style="margin: 5px 0">
        <n-input-group>
          <n-input-group-label style="flex: 0 0 120px"> {{ algo }} </n-input-group-label>
          <input-copyable :value="hashResults[algo] ?? ''" readonly />
        </n-input-group>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useQueryParam } from '@/composable/queryParams';
import { enc, lib, MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA384, SHA512 } from 'crypto-js';
import { createSHA3, createSM3 } from 'hash-wasm';
import { ref, watch } from 'vue';
import InputCopyable from '../../components/InputCopyable.vue';
import { convertHexToBin } from './hash-text.service';

// crypto-js's SHA3 is the pre-standard Keccak, not FIPS 202 SHA3; use hash-wasm for SHA3 and SM3.
const syncAlgos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  RIPEMD160,
} as const;

const asyncAlgos = {
  'SHA3-512': () => createSHA3(512),
  SM3: () => createSM3(),
} as const;

type SyncAlgoName = keyof typeof syncAlgos;
type AsyncAlgoName = keyof typeof asyncAlgos;
type Encoding = 'Hex' | 'Base64' | 'Base64url' | 'Bin';
const algoNames = ['MD5', 'SHA1', 'SHA256', 'SHA224', 'SHA512', 'SHA384', 'SHA3-512', 'RIPEMD160', 'SM3'] as const;
const encoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });
const clearText = ref('');

function formatWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }
  return words.toString(enc[encoding]);
}

const hashResults = ref<Record<string, string>>({});

function computeSync() {
  const out: Record<string, string> = {};
  for (const algo of Object.keys(syncAlgos) as SyncAlgoName[]) {
    out[algo] = formatWithEncoding(syncAlgos[algo](clearText.value), encoding.value);
  }
  hashResults.value = { ...hashResults.value, ...out };
}

// Each run gets an id so a slow, outdated run cannot overwrite newer results.
let asyncRunId = 0;
async function computeAsync() {
  const runId = ++asyncRunId;
  const text = clearText.value;
  const currentEncoding = encoding.value;
  const out: Record<string, string> = {};
  for (const algo of Object.keys(asyncAlgos) as AsyncAlgoName[]) {
    const hasher = await asyncAlgos[algo]();
    hasher.init();
    hasher.update(new TextEncoder().encode(text));
    out[algo] = formatWithEncoding(enc.Hex.parse(hasher.digest('hex')), currentEncoding);
  }
  if (runId === asyncRunId) {
    hashResults.value = { ...hashResults.value, ...out };
  }
}

let asyncTimer: ReturnType<typeof setTimeout> | null = null;
watch([clearText, encoding], () => {
  computeSync();
  if (asyncTimer) clearTimeout(asyncTimer);
  asyncTimer = setTimeout(computeAsync, 60);
});
computeSync();
computeAsync();
</script>
