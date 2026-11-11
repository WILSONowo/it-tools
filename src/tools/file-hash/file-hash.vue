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
    <div style="min-height: 40px">
      <div v-if="loading" style="padding: 10px">
        <n-text depth="2">正在分块计算...大文件可能较慢</n-text>
        <n-progress type="line" :percentage="progress" indicator-placement="inside" style="margin-top: 8px" />
      </div>
      <n-table v-else-if="results.length" size="small" :bordered="false">
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
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import { formatBytes } from '@/utils/convert';
import InputCopyable from '../../components/InputCopyable.vue';
import { HashCancelledError, getFileSizeError, hashBlob } from './file-hash.service';

const UploadIcon = Upload;
const file = ref<File | null>(null);
const loading = ref(false);
const progress = ref(0);
const error = ref('');
const results = ref<{ algorithm: string; hash: string }[]>([]);

const fileName = computed(() => file.value?.name ?? '');
const formatSize = computed(() => (file.value ? formatBytes(file.value.size) : ''));

// 每次选择文件递增,旧的计算发现自己过期后立即停止,避免结果互相覆盖
let runId = 0;

function onFilePicked({ file: picked }: { file: UploadFileInfo }) {
  if (!picked?.file) return false;
  file.value = picked.file;
  compute(picked.file);
  return false;
}

async function compute(target: File) {
  const currentRun = ++runId;
  error.value = '';
  results.value = [];
  progress.value = 0;

  const sizeError = getFileSizeError(target.size);
  if (sizeError) {
    loading.value = false;
    error.value = sizeError;
    return;
  }

  loading.value = true;
  try {
    const rows = await hashBlob({
      blob: target,
      onProgress: (ratio) => {
        if (currentRun === runId) progress.value = Math.floor(ratio * 100);
      },
      isCancelled: () => currentRun !== runId,
    });
    if (currentRun === runId) results.value = rows;
  } catch (e) {
    if (e instanceof HashCancelledError || currentRun !== runId) return;
    error.value = `计算失败:${e instanceof Error ? e.message : String(e)}`;
  } finally {
    if (currentRun === runId) loading.value = false;
  }
}
</script>
