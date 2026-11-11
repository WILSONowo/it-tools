<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      将图片转换为 ICO 图标。可多选生成尺寸(16-256),并选择缩放或裁剪填充。全部在浏览器本地完成。
    </n-alert>

    <n-upload
      multiple
      accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/webp"
      :show-file-list="false"
      :on-before-upload="onPick"
      style="width: 100%"
    >
      <n-upload-dragger style="padding: 30px 0">
        <n-icon size="46" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 10px 0 0">将文件拖入此处或者点击按钮选择图片</n-p>
        <n-text depth="3" style="font-size: 12px">无需上传文件,100% 安全,支持多个文件</n-text>
      </n-upload-dragger>
    </n-upload>

    <template v-if="queue.length > 0">
      <n-space :size="8" wrap style="margin: 12px 0">
        <n-tag v-for="(f, i) in queue" :key="f.name + i" closable :bordered="false" @close="queue.splice(i, 1)">
          {{ f.name }}
        </n-tag>
      </n-space>
    </template>

    <n-grid cols="1 700:2" x-gap="20" y-gap="16" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="图标大小" label-placement="top" style="margin: 0">
          <n-checkbox-group v-model:value="sizes">
            <n-space wrap :size="14">
              <n-checkbox v-for="s in sizeOptions" :key="s" :value="s"> {{ s }}×{{ s }} </n-checkbox>
            </n-space>
          </n-checkbox-group>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="裁剪模式" label-placement="top" style="margin: 0">
          <n-radio-group v-model:value="fitMode">
            <n-radio-button value="contain">缩放(完整显示)</n-radio-button>
            <n-radio-button value="cover">裁剪(填满)</n-radio-button>
          </n-radio-group>
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space justify="center" style="margin: 18px 0">
      <n-button
        type="primary"
        :loading="processing"
        :disabled="queue.length === 0 || sizes.length === 0"
        @click="start"
      >
        开始转换
      </n-button>
      <n-button secondary :disabled="queue.length === 0" @click="queue = []">清空列表</n-button>
    </n-space>

    <template v-if="results.length > 0">
      <n-h3 style="margin: 0 0 8px">转换结果</n-h3>
      <n-table size="small">
        <thead>
          <tr>
            <th>文件名称</th>
            <th>尺寸</th>
            <th>大小</th>
            <th style="width: 200px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in results" :key="row.name + i">
            <td style="word-break: break-all">{{ row.name }}</td>
            <td>{{ row.sizesText }}</td>
            <td>{{ formatBytes(row.size) }}</td>
            <td>
              <n-button size="small" secondary @click="downloadOne(row)">下载</n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
      <n-space justify="center" style="margin-top: 14px">
        <n-button secondary @click="downloadZip">全部下载(ZIP)</n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { get2dContext } from '@/utils/canvas';
import { onBeforeUnmount, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import { canvasesToIcoBlob } from '@/utils/image-encode';
import {
  containSize,
  coverCropRect,
  downloadAllZip,
  downloadBlob,
  formatBytes,
  isSupportedImage,
  loadImage,
  replaceExtension,
} from '../_media/image-helpers';

const UploadIcon = Upload;
const message = useMessage();

type Row = { name: string; blob: Blob; size: number; sizesText: string };

const queue = ref<File[]>([]);
const sizes = ref<number[]>([16, 32, 48, 64, 128, 256]);
// ICO 目录项用 1 字节记录宽高,规范上限为 256(写作 0)
const sizeOptions = [16, 24, 32, 48, 64, 72, 96, 128, 256];
const fitMode = ref<'contain' | 'cover'>('contain');
const processing = ref(false);
const results = ref<Row[]>([]);
let runId = 0;

function onPick({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const f = file.file as File;
  if (!isSupportedImage(f)) {
    message.error('不支持的图片格式');
    return false;
  }
  queue.value.push(f);
  return false;
}

function drawAtSize(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = get2dContext(canvas);
  ctx.imageSmoothingQuality = 'high';
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  if (fitMode.value === 'contain') {
    const { w, h } = containSize(nw, nh, size, size);
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  } else {
    const { sx, sy, sw, sh } = coverCropRect(nw, nh, size, size);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  }
  return canvas;
}

async function processFile(file: File, chosen: number[]): Promise<Row> {
  const img = await loadImage(file);
  const entries = chosen.map((s) => ({ canvas: drawAtSize(img, s), size: s }));
  const blob = await canvasesToIcoBlob(entries);
  return {
    name: replaceExtension(file.name, 'ico'),
    blob,
    size: blob.size,
    sizesText: `${chosen.join(' / ')} px`,
  };
}

async function start() {
  if (queue.value.length === 0 || sizes.value.length === 0) return;
  const chosen = [...new Set(sizes.value)].filter((s) => s <= 256).sort((a, b) => a - b);
  const id = ++runId;
  processing.value = true;
  results.value = [];
  try {
    for (const f of [...queue.value]) {
      try {
        const row = await processFile(f, chosen);
        if (id !== runId) return;
        results.value.push(row);
      } catch {
        if (id !== runId) return;
        message.error(`转换失败:${f.name}`);
      }
    }
    if (results.value.length > 0) message.success('转换完成');
  } finally {
    if (id === runId) processing.value = false;
  }
}

function downloadOne(row: Row) {
  downloadBlob(row.blob, row.name);
}

function downloadZip() {
  return downloadAllZip(results.value, 'icons.zip', 'icons');
}

onBeforeUnmount(() => {
  runId++;
});
</script>
