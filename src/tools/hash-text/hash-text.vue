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
import { enc, lib, MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512 } from 'crypto-js';
import { createSM3 } from 'hash-wasm';
import { ref, watch } from 'vue';
import InputCopyable from '../../components/InputCopyable.vue';
import { convertHexToBin } from './hash-text.service';

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = 'Hex' | 'Base64' | 'Base64url' | 'Bin';
const algoNames = [...Object.keys(algos), 'SM3'] as const;
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
  for (const algo of Object.keys(algos) as AlgoNames[]) {
    out[algo] = formatWithEncoding(algos[algo](clearText.value), encoding.value);
  }
  hashResults.value = out;
}

let sm3Timer: ReturnType<typeof setTimeout> | null = null;
async function computeSm3() {
  if (clearText.value === '') {
    hashResults.value = { ...hashResults.value, SM3: '' };
    return;
  }
  const hasher = await createSM3();
  hasher.init();
  hasher.update(new TextEncoder().encode(clearText.value));
  const hex = hasher.digest('hex');
  let out: string = hex;
  if (encoding.value === 'Base64') {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    out = btoa(bin);
  } else if (encoding.value === 'Base64url') {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    out = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } else if (encoding.value === 'Bin') {
    out = convertHexToBin(hex);
  }
  hashResults.value = { ...hashResults.value, SM3: out };
}

watch([clearText, encoding], () => {
  computeSync();
  if (sm3Timer) clearTimeout(sm3Timer);
  sm3Timer = setTimeout(computeSm3, 60);
});
computeSync();
computeSm3();
</script>
