<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      图片在浏览器本地压缩,不会上传到任何服务器。支持 JPG / PNG / GIF / BMP / WebP,可批量。
    </n-alert>

    <!-- 上传 -->
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

    <!-- 已选文件列表 -->
    <template v-if="queue.length > 0">
      <n-text depth="2" style="display: block; margin: 14px 0 6px">已添加 {{ queue.length }} 个文件</n-text>
      <n-space :size="8" wrap style="margin-bottom: 12px">
        <n-tag v-for="(f, i) in queue" :key="f.name + i" closable :bordered="false" @close="queue.splice(i, 1)">
          {{ f.name }}({{ formatBytes(f.size) }})
        </n-tag>
      </n-space>
    </template>

    <!-- 参数 -->
    <n-grid cols="1 700:3" x-gap="20" y-gap="16" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="压缩质量" label-placement="top" style="margin: 0">
          <div style="width: 100%">
            <n-slider v-model:value="quality" :min="1" :max="100" :step="1" />
            <div style="text-align: right">
              <n-text depth="3" style="font-size: 12px">质量 {{ quality }}%</n-text>
            </div>
          </div>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="尺寸" label-placement="top" style="margin: 0">
          <n-select v-model:value="sizePreset" :options="sizeOptions" />
        </n-form-item>
      </n-gi>
      <n-gi v-if="sizePreset === 'custom'">
        <n-form-item label="自定义尺寸" label-placement="top" style="margin: 0">
          <n-space :size="8" style="width: 100%">
            <n-input-number v-model:value="customW" :min="1" style="flex: 1" placeholder="宽度" />
            <n-text depth="3">×</n-text>
            <n-input-number v-model:value="customH" :min="1" style="flex: 1" placeholder="高度" />
          </n-space>
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space v-if="sizePreset === 'custom'" align="center" style="margin-top: 4px">
      <n-radio-group v-model:value="keepRatio">
        <n-radio-button :value="true">保持纵横比</n-radio-button>
        <n-radio-button :value="false">缩放拉伸</n-radio-button>
      </n-radio-group>
    </n-space>

    <n-space align="center" style="margin-top: 8px">
      <n-checkbox v-model:checked="pngLossless">PNG 无损优化</n-checkbox>
      <n-checkbox v-model:checked="keepMeta">保留元数据(尽力)</n-checkbox>
    </n-space>

    <n-space justify="center" style="margin: 18px 0">
      <n-button type="primary" :loading="processing" :disabled="queue.length === 0" @click="start"> 开始压缩 </n-button>
      <n-button secondary :disabled="queue.length === 0" @click="queue = []">清空列表</n-button>
    </n-space>

    <!-- 结果 -->
    <template v-if="results.length > 0">
      <n-h3 style="margin: 0 0 8px">压缩结果(共节省 {{ totalSaved }})</n-h3>
      <n-table size="small">
        <thead>
          <tr>
            <th>文件名称</th>
            <th>压缩前</th>
            <th>压缩后</th>
            <th>变化</th>
            <th style="width: 200px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in results" :key="row.name + i">
            <td style="word-break: break-all">{{ row.name }}</td>
            <td>{{ formatBytes(row.before) }}</td>
            <td>{{ formatBytes(row.after) }}</td>
            <td>
              <n-tag :type="row.percent <= 0 ? 'success' : 'warning'" size="small" :bordered="false">
                {{ row.percent <= 0 ? '减少 ' + Math.abs(row.percent) + '%' : '增大 ' + row.percent + '%' }}
              </n-tag>
            </td>
            <td>
              <n-space :size="8">
                <n-button size="small" secondary @click="compare(row)">比较</n-button>
                <n-button size="small" secondary @click="downloadOne(row)">下载</n-button>
              </n-space>
            </td>
          </tr>
        </tbody>
      </n-table>
      <n-space justify="center" style="margin-top: 14px">
        <n-button secondary :disabled="results.length === 0" @click="downloadAllZip">全部下载(ZIP)</n-button>
      </n-space>
    </template>

    <!-- 前后对比 -->
    <n-modal
      v-model:show="compareShow"
      preset="card"
      style="width: 94%; max-width: 1000px"
      title="原始 VS 压缩后(拖动滑块对比)"
    >
      <div v-if="compareRow" class="compare-wrap">
        <img :src="compareRow.afterUrl" alt="after" class="compare-after" />
        <img
          :src="compareRow.beforeUrl"
          alt="before"
          class="compare-before"
          :style="{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }"
        />
        <input v-model="comparePos" type="range" min="0" max="100" class="compare-slider" />
        <div class="compare-line" :style="{ left: comparePos + '%' }" />
        <div class="compare-tag compare-tag-before">压缩前 {{ formatBytes(compareRow.before) }}</div>
        <div class="compare-tag compare-tag-after">压缩后 {{ formatBytes(compareRow.after) }}</div>
      </div>
    </n-modal>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import JSZip from 'jszip';
import UPNG from 'upng-js';
import { canvasToPngBlob, formatBytes } from '@/utils/image-encode';

const UploadIcon = Upload;
const message = useMessage();

type ResultRow = {
  name: string;
  before: number;
  after: number;
  percent: number;
  beforeUrl: string;
  afterUrl: string;
};

const queue = ref<File[]>([]);
const quality = ref(85);
const sizePreset = ref('raw');
const customW = ref(800);
const customH = ref(600);
const keepRatio = ref(true);
const pngLossless = ref(true);
const keepMeta = ref(false);
const processing = ref(false);
const results = ref<ResultRow[]>([]);

const compareShow = ref(false);
const compareRow = ref<ResultRow | null>(null);
const comparePos = ref(50);

const sizeOptions = [
  { label: '原始尺寸', value: 'raw' },
  { label: '小一寸 (259×377)', value: 'littleOne' },
  { label: '一寸 (295×413)', value: 'one' },
  { label: '大一寸 (389×566)', value: 'greatOne' },
  { label: '两寸 (413×579)', value: 'two' },
  { label: '大两寸 (423×626)', value: 'greatTwo' },
  { label: '自定义尺寸', value: 'custom' },
];
const PRESETS: Record<string, { w: number; h: number } | null> = {
  raw: null,
  littleOne: { w: 259, h: 377 },
  one: { w: 295, h: 413 },
  greatOne: { w: 389, h: 566 },
  two: { w: 413, h: 579 },
  greatTwo: { w: 423, h: 626 },
};

const totalSaved = computed(() => {
  const saved = results.value.reduce((s, r) => s + (r.before - r.after), 0);
  return saved > 0 ? formatBytes(saved) : '0 B';
});

function onPick({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const f = file.file as File;
  if (f.size > 50 * 1024 * 1024) {
    message.error('单个文件不能超过 50MB');
    return false;
  }
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

function getTargetSize(img: HTMLImageElement): { w: number; h: number } {
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const preset = PRESETS[sizePreset.value];
  if (preset) return { w: preset.w, h: preset.h };
  if (sizePreset.value === 'custom' && customW.value > 0 && customH.value > 0) {
    if (keepRatio.value) {
      const ratio = Math.min(customW.value / naturalW, customH.value / naturalH);
      return { w: Math.max(1, Math.round(naturalW * ratio)), h: Math.max(1, Math.round(naturalH * ratio)) };
    }
    return { w: customW.value, h: customH.value };
  }
  return { w: naturalW, h: naturalH };
}

function drawToCanvas(img: HTMLImageElement, transparent: boolean): HTMLCanvasElement {
  const { w, h } = getTargetSize(img);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

async function pngLosslessOptimize(file: File): Promise<Blob | null> {
  const buf = await file.arrayBuffer();
  try {
    const decoded = UPNG.decode(buf);
    const rgba = UPNG.toRGBA8(decoded);
    const out = UPNG.encode(rgba, decoded.width, decoded.height, 256); // 尝试无损调色板
    if (out.byteLength < buf.byteLength) return new Blob([out], { type: 'image/png' });
    const out2 = UPNG.encode(rgba, decoded.width, decoded.height, 0); // 尝试真彩色无损压缩
    if (out2.byteLength < buf.byteLength) return new Blob([out2], { type: 'image/png' });
    return null;
  } catch {
    return null;
  }
}

async function processFile(file: File): Promise<ResultRow | null> {
  const before = file.size;
  const beforeUrl = URL.createObjectURL(file);

  // PNG 无损优化:不做尺寸改变时
  if (pngLossless.value && /\.png$/i.test(file.name) && sizePreset.value === 'raw') {
    const opt = await pngLosslessOptimize(file);
    if (opt) {
      const afterUrl = URL.createObjectURL(opt);
      return {
        name: file.name,
        before,
        after: opt.size,
        percent: Math.round(((opt.size - before) / before) * 100),
        beforeUrl,
        afterUrl,
      };
    }
  }

  const img = await loadImage(beforeUrl);
  const transparent = /\.(png|gif|webp)$/i.test(file.name);
  const canvas = drawToCanvas(img, transparent);
  const isPngIn = /\.png$/i.test(file.name);
  const q = quality.value / 100;

  let blob: Blob;
  if (pngLossless.value && isPngIn && sizePreset.value === 'raw' && q >= 0.95) {
    blob = await canvasToPngBlob(canvas);
  } else {
    // JPG for photos(不透明), webp 一般场景(透明也支持)
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('压缩失败'))), 'image/webp', q);
    });
  }

  const afterUrl = URL.createObjectURL(blob);
  return {
    name: file.name.replace(/\.[^.]+$/, '') + (blob.type === 'image/png' ? '.png' : '.webp'),
    before,
    after: blob.size,
    percent: Math.round(((blob.size - before) / before) * 100),
    beforeUrl,
    afterUrl,
  };
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
        message.error(`压缩失败:${f.name}`);
      }
    }
    if (results.value.length > 0) message.success('压缩完成');
  } finally {
    processing.value = false;
  }
}

function compare(row: ResultRow) {
  compareRow.value = row;
  comparePos.value = 50;
  compareShow.value = true;
}

function downloadOne(row: ResultRow) {
  const a = document.createElement('a');
  a.href = row.afterUrl;
  a.download = row.name;
  a.click();
}

async function downloadAllZip() {
  const zip = new JSZip();
  const folder = zip.folder('compressed')!;
  for (const row of results.value) {
    const res = await fetch(row.afterUrl);
    folder.file(row.name, await res.blob());
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'compressed-images.zip';
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>

<style scoped>
.compare-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  user-select: none;
}
.compare-wrap img {
  display: block;
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
}
.compare-before {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.compare-after {
  position: relative;
  z-index: 0;
}
.compare-slider {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  z-index: 3;
}
.compare-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.6);
  z-index: 2;
}
.compare-tag {
  position: absolute;
  top: 10px;
  z-index: 4;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
}
.compare-tag-before {
  right: 10px;
}
.compare-tag-after {
  left: 10px;
}
</style>
