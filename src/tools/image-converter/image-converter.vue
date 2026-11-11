<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      支持 JPG / PNG / GIF / BMP / WebP 输入,输出 JPG / PNG / WebP / BMP / ICO。浏览器本地转换,不上传。
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

    <n-grid cols="1 700:3" x-gap="20" y-gap="16" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="输出格式" label-placement="top" style="margin: 0">
          <n-select v-model:value="outFormat" :options="formatOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="图片质量" label-placement="top" style="margin: 0">
          <div style="width: 100%">
            <n-slider
              v-model:value="quality"
              :min="1"
              :max="100"
              :step="1"
              :disabled="outFormat === 'png' || outFormat === 'bmp' || outFormat === 'ico'"
            />
            <div style="text-align: right">
              <n-text depth="3" style="font-size: 12px">质量 {{ quality }}%</n-text>
            </div>
          </div>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="ICO 尺寸" label-placement="top" style="margin: 0">
          <n-select v-model:value="icoSize" :options="icoSizeOptions" :disabled="outFormat !== 'ico'" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space justify="center" style="margin: 18px 0">
      <n-button type="primary" :loading="processing" :disabled="queue.length === 0" @click="start">开始转换</n-button>
      <n-button secondary :disabled="queue.length === 0" @click="queue = []">清空列表</n-button>
    </n-space>

    <template v-if="results.length > 0">
      <n-h3 style="margin: 0 0 8px">转换结果</n-h3>
      <n-table size="small">
        <thead>
          <tr>
            <th>文件名称</th>
            <th>大小</th>
            <th style="width: 150px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in results" :key="row.name + i">
            <td style="word-break: break-all">{{ row.name }}</td>
            <td>{{ formatBytes(row.size) }}</td>
            <td>
              <n-button size="small" secondary @click="downloadOne(row)">下载</n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
      <n-space justify="center" style="margin-top: 14px">
        <n-button secondary @click="downloadAllZip">全部下载(ZIP)</n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import JSZip from 'jszip';
import { canvasToBmpBlob, canvasToIcoBlob, formatBytes } from '@/utils/image-encode';

const UploadIcon = Upload;
const message = useMessage();

type Row = { name: string; blob: Blob; size: number };

const queue = ref<File[]>([]);
const outFormat = ref('webp');
const quality = ref(90);
const icoSize = ref(256);
const processing = ref(false);
const results = ref<Row[]>([]);

const formatOptions = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
  { label: 'BMP', value: 'bmp' },
  { label: 'ICO', value: 'ico' },
];
const icoSizeOptions = [16, 24, 32, 48, 64, 128, 256].map((s) => ({ label: `${s}×${s}`, value: s }));

function onPick({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const f = file.file as File;
  if (!/image\/(jpeg|png|gif|bmp|webp)|\.(jpe?g|png|gif|bmp|webp)$/i.test(f.type + f.name)) {
    message.error('不支持的图片格式');
    return false;
  }
  queue.value.push(f);
  return false;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement, keepAlpha: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  if (!keepAlpha) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  return canvas;
}

async function encodeCanvas(canvas: HTMLCanvasElement): Promise<{ blob: Blob; ext: string }> {
  const q = quality.value / 100;
  switch (outFormat.value) {
    case 'jpg':
      return {
        blob: await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('转换失败'))), 'image/jpeg', q),
        ),
        ext: 'jpg',
      };
    case 'png':
      return {
        blob: await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('转换失败'))), 'image/png'),
        ),
        ext: 'png',
      };
    case 'bmp':
      return { blob: canvasToBmpBlob(canvas), ext: 'bmp' };
    case 'ico': {
      const blob = await canvasToIcoBlob(canvas);
      return { blob, ext: 'ico' };
    }
    default:
      return {
        blob: await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error('转换失败'))), 'image/webp', q),
        ),
        ext: 'webp',
      };
  }
}

async function processFile(file: File): Promise<Row | null> {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  URL.revokeObjectURL(url);
  const keepAlpha = outFormat.value === 'png' || outFormat.value === 'webp' || outFormat.value === 'ico';
  const canvas = drawToCanvas(img, keepAlpha);
  if (outFormat.value === 'ico') {
    // 正方形裁切绘制
    const size = icoSize.value;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    const { blob } = await encodeCanvas(c);
    return { name: file.name.replace(/\.[^.]+$/, '') + '.ico', blob, size: blob.size };
  }
  const { blob, ext } = await encodeCanvas(canvas);
  return { name: file.name.replace(/\.[^.]+$/, '') + '.' + ext, blob, size: blob.size };
}

async function start() {
  if (queue.value.length === 0) return;
  processing.value = true;
  results.value = [];
  try {
    for (const f of queue.value) {
      try {
        const row = await processFile(f);
        if (row) results.value.push(row);
      } catch {
        message.error(`转换失败:${f.name}`);
      }
    }
    if (results.value.length > 0) message.success('转换完成');
  } finally {
    processing.value = false;
  }
}

function downloadOne(row: Row) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(row.blob);
  a.download = row.name;
  a.click();
}

async function downloadAllZip() {
  const zip = new JSZip();
  const folder = zip.folder('converted')!;
  for (const row of results.value) folder.file(row.name, row.blob);
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'converted-images.zip';
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>
