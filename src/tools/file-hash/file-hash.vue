<template>
  <n-card title="文件哈希计算">
    <n-upload :show-file-list="false" :on-before-upload="onFilePicked" accept="*">
      <n-upload-dragger>
        <div style="padding: 24px; text-align: center">
          <n-icon size="40" :depth="3" :component="UploadIcon" />
          <n-text>点击或拖拽文件到此处(最大 1GB)</n-text>
          <div style="opacity: 0.6; font-size: 12px">计算 MD5 / SHA-1 / SHA-256 / SHA-512 / SHA3 / SM3</div>
        </div>
      </n-upload-dragger>
    </n-upload>

    <n-text v-if="fileName" depth="2" style="display: block; margin: 10px 0">
      文件:{{ fileName }}({{ formatSize }})
    </n-text>

    <n-alert v-if="error" type="error" :show-icon="false">{{ error }}</n-alert>
    <n-spin :show="loading">
      <div style="min-height: 40px">
        <div v-if="loading" style="padding: 10px">正在计算...大文件可能较慢</div>
        <n-table v-else size="small" :bordered="false">
          <thead>
            <tr>
              <th>算法</th>
              <th>结果 (HEX)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in results" :key="row.algorithm">
              <td style="white-space: nowrap; width: 110px">{{ row.algorithm }}</td>
              <td style="font-family: monospace; word-break: break-all">
                <n-input-group>
                  <input-copyable :value="row.hash" readonly />
                </n-input-group>
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>
    </n-spin>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import {
  createMD5,
  createSHA1,
  createSHA224,
  createSHA256,
  createSHA384,
  createSHA512,
  createSHA3,
  createSM3,
} from 'hash-wasm';
import { formatBytes } from '@/utils/convert';
import InputCopyable from '../../components/InputCopyable.vue';

const UploadIcon = Upload;
const file = ref<File | null>(null);
const loading = ref(false);
const error = ref('');
const results = ref<{ algorithm: string; hash: string }[]>([]);

const fileName = computed(() => file.value?.name ?? '');
const formatSize = computed(() => (file.value ? formatBytes(file.value.size) : ''));

async function hashFile(algo: string, data: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(data);
  const CHUNK = 1024 * 1024 * 8;
  let hasher: Awaited<ReturnType<typeof createMD5>>;
  switch (algo) {
    case 'MD5':
      hasher = await createMD5();
      break;
    case 'SHA-1':
      hasher = await createSHA1();
      break;
    case 'SHA-224':
      hasher = await createSHA224();
      break;
    case 'SHA-256':
      hasher = await createSHA256();
      break;
    case 'SHA-384':
      hasher = await createSHA384();
      break;
    case 'SHA-512':
      hasher = await createSHA512();
      break;
    case 'SHA3-256':
      hasher = await createSHA3(256);
      break;
    case 'SM3':
      hasher = await createSM3();
      break;
    default:
      throw new Error('unknown algo');
  }
  await hasher.init();
  for (let i = 0; i < bytes.length; i += CHUNK) {
    await hasher.update(bytes.subarray(i, i + CHUNK));
  }
  return hasher.digest('hex');
}

function onFilePicked({ file: picked }: { file: UploadFileInfo }) {
  if (!picked?.file) return false;
  file.value = picked.file;
  compute();
  return false;
}

async function compute() {
  if (!file.value) return;
  loading.value = true;
  error.value = '';
  results.value = [];
  try {
    const data = await file.value.arrayBuffer();
    const algos = ['MD5', 'SHA-1', 'SHA-224', 'SHA-256', 'SHA-384', 'SHA-512', 'SHA3-256', 'SM3'];
    const rows: { algorithm: string; hash: string }[] = [];
    for (const algo of algos) {
      try {
        rows.push({ algorithm: algo, hash: await hashFile(algo, data) });
      } catch {
        // skip algo
      }
    }
    results.value = rows;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>
