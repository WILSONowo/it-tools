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
              <n-text depth="3" style="font-size: 12px">质量 {{ quality }}%(用于 WebP 输出)</n-text>
            </div>
          </div>
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="尺寸" label-placement="top" style="margin: 0">
          <n-select v-model:value="sizePreset" :options="sizeOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="PNG 处理方式" label-placement="top" style="margin: 0">
          <n-select v-model:value="pngMode" :options="pngModeOptions" />
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

    <n-text
      v-if="sizePreset !== 'raw' && sizePreset !== 'custom'"
      depth="3"
      style="display: block; margin-top: 8px; font-size: 12px"
    >
      证件照尺寸会按目标比例居中裁剪后缩放,不会拉伸变形。
    </n-text>
    <n-text depth="3" style="display: block; margin-top: 4px; font-size: 12px">
      注意:浏览器重新编码图片时不会保留 EXIF 等元数据(拍摄信息、GPS 定位等)。
    </n-text>

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
        <n-button secondary :disabled="results.length === 0" @click="downloadZip">全部下载(ZIP)</n-button>
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
import { get2dContext } from '@/utils/canvas';
import { computed, onBeforeUnmount, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import UPNG from 'upng-js';
import {
  canvasToBlob,
  containSize,
  coverCropRect,
  downloadAllZip,
  downloadBlob,
  extForMime,
  formatBytes,
  isSupportedImage,
  loadImage,
  replaceExtension,
} from '../_media/image-helpers';

const UploadIcon = Upload;
const message = useMessage();

type ResultRow = {
  name: string;
  blob: Blob;
  before: number;
  after: number;
  percent: number;
  beforeUrl: string;
  afterUrl: string;
};
type PngMode = 'lossless' | 'quant256' | 'webp';

const queue = ref<File[]>([]);
const quality = ref(85);
const sizePreset = ref('raw');
const customW = ref(800);
const customH = ref(600);
const keepRatio = ref(true);
const pngMode = ref<PngMode>('lossless');
const processing = ref(false);
const results = ref<ResultRow[]>([]);
// Bumped on every run and on unmount so a stale run drops its results.
let runId = 0;

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
const pngModeOptions = [
  { label: 'PNG 无损优化', value: 'lossless' },
  { label: 'PNG 256 色(有损)', value: 'quant256' },
  { label: '转为 WebP', value: 'webp' },
];

const totalSaved = computed(() => {
  const saved = results.value.reduce((s, r) => s + (r.before - r.after), 0);
  return formatBytes(Math.max(0, saved));
});

function onPick({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const f = file.file as File;
  if (f.size > 50 * 1024 * 1024) {
    message.error('单个文件不能超过 50MB');
    return false;
  }
  if (!isSupportedImage(f)) {
    message.error('不支持的图片格式');
    return false;
  }
  queue.value.push(f);
  return false;
}

/** Target canvas size plus the source rectangle to draw (cover-crop for photo presets). */
function getLayout(img: HTMLImageElement) {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const full = { sx: 0, sy: 0, sw: nw, sh: nh };
  const preset = PRESETS[sizePreset.value];
  if (preset) return { w: preset.w, h: preset.h, src: coverCropRect(nw, nh, preset.w, preset.h) };
  if (sizePreset.value === 'custom' && customW.value > 0 && customH.value > 0) {
    if (keepRatio.value) return { ...containSize(nw, nh, customW.value, customH.value), src: full };
    return { w: customW.value, h: customH.value, src: full };
  }
  return { w: nw, h: nh, src: full };
}

function drawToCanvas(img: HTMLImageElement, transparent: boolean): HTMLCanvasElement {
  const { w, h, src } = getLayout(img);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = get2dContext(canvas);
  ctx.imageSmoothingQuality = 'high';
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, src.sx, src.sy, src.sw, src.sh, 0, 0, w, h);
  return canvas;
}

/**
 * Re-encode a PNG at its original size with UPNG. cnum = 0 is lossless,
 * cnum = 256 quantises to a 256 colour palette (lossy).
 * Returns null when the file cannot be handled here.
 */
async function encodePngOriginalSize(file: File, cnum: number): Promise<Blob | null> {
  try {
    const buf = await file.arrayBuffer();
    const decoded = UPNG.decode(buf);
    // 16 位 PNG 经 toRGBA8 会降为 8 位,无损模式下不能这样做
    if (cnum === 0 && decoded.depth > 8) return null;
    // toRGBA8 实际返回每一帧的 ArrayBuffer 数组(类型声明有误)
    const frames = UPNG.toRGBA8(decoded) as unknown as ArrayBuffer[];
    const delays = frames.length > 1 ? (decoded.frames as { delay: number }[]).map((f) => f.delay) : undefined;
    const out = UPNG.encode(frames as unknown as ArrayBuffer, decoded.width, decoded.height, cnum, delays);
    return new Blob([out], { type: 'image/png' });
  } catch {
    return null;
  }
}

function encodePngFromCanvas(canvas: HTMLCanvasElement, cnum: number): Blob {
  const data = get2dContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
  const out = UPNG.encode([data.data.buffer] as unknown as ArrayBuffer, canvas.width, canvas.height, cnum);
  return new Blob([out], { type: 'image/png' });
}

function makeRow(file: File, blob: Blob, name: string): ResultRow {
  return {
    name,
    blob,
    before: file.size,
    after: blob.size,
    percent: Math.round(((blob.size - file.size) / file.size) * 100),
    beforeUrl: URL.createObjectURL(file),
    afterUrl: URL.createObjectURL(blob),
  };
}

async function processFile(file: File): Promise<ResultRow> {
  const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
  const mode = pngMode.value;

  if (isPng && mode !== 'webp') {
    const cnum = mode === 'lossless' ? 0 : 256;
    if (sizePreset.value === 'raw') {
      const blob = await encodePngOriginalSize(file, cnum);
      // 重新编码反而更大时保留原文件
      if (blob) return makeRow(file, blob.size < file.size ? blob : file, replaceExtension(file.name, 'png'));
      // 无法无损处理(如 16 位 PNG)时原样保留
      if (mode === 'lossless') return makeRow(file, file, file.name);
    }
    const img = await loadImage(file);
    const blob = encodePngFromCanvas(drawToCanvas(img, true), cnum);
    return makeRow(file, blob, replaceExtension(file.name, 'png'));
  }

  const img = await loadImage(file);
  const transparent = isPng || /\.(gif|webp)$/i.test(file.name);
  const canvas = drawToCanvas(img, transparent);
  const blob = await canvasToBlob(canvas, 'image/webp', quality.value / 100);
  // 不支持 WebP 编码的浏览器会返回 PNG,扩展名按实际类型
  return makeRow(file, blob, replaceExtension(file.name, extForMime(blob.type, 'png')));
}

function revokeRow(row: ResultRow) {
  URL.revokeObjectURL(row.beforeUrl);
  URL.revokeObjectURL(row.afterUrl);
}

function clearResults() {
  results.value.forEach(revokeRow);
  results.value = [];
  compareShow.value = false;
  compareRow.value = null;
}

async function start() {
  if (queue.value.length === 0) return;
  const id = ++runId;
  processing.value = true;
  clearResults();
  try {
    for (const f of [...queue.value]) {
      try {
        const row = await processFile(f);
        if (id !== runId) {
          revokeRow(row);
          return;
        }
        results.value.push(row);
      } catch {
        if (id !== runId) return;
        message.error(`压缩失败:${f.name}`);
      }
    }
    if (results.value.length > 0) message.success('压缩完成');
  } finally {
    if (id === runId) processing.value = false;
  }
}

function compare(row: ResultRow) {
  compareRow.value = row;
  comparePos.value = 50;
  compareShow.value = true;
}

function downloadOne(row: ResultRow) {
  downloadBlob(row.blob, row.name);
}

function downloadZip() {
  return downloadAllZip(
    results.value.map((r) => ({ name: r.name, blob: r.blob })),
    'compressed-images.zip',
    'compressed',
  );
}

onBeforeUnmount(() => {
  runId++;
  clearResults();
});
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
