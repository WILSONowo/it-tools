<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      在线裁剪选取图片区域,支持矩形/圆形裁剪与自定义尺寸,可做头像与证件照。本地处理不上传。
    </n-alert>

    <n-upload
      v-if="!imgSrc"
      :show-file-list="false"
      :on-before-upload="onPick"
      accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
      style="width: 100%"
    >
      <n-upload-dragger style="padding: 40px 0">
        <n-icon size="48" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 10px 0 0">点击选择,或将图片拖拽到此处</n-p>
        <n-text depth="3" style="font-size: 12px">支持 jpg / jpeg / png / gif / webp 等</n-text>
      </n-upload-dragger>
    </n-upload>

    <template v-else>
      <div class="crop-layout">
        <!-- 左:画布 -->
        <div class="crop-left">
          <div class="crop-box">
            <img ref="imgEl" :src="imgSrc" alt="crop" />
          </div>

          <n-space align="center" style="margin-top: 12px" :wrap="true" :size="16">
            <n-form-item label="裁剪形状" label-placement="left" label-width="80" style="margin: 0">
              <n-radio-group v-model:value="shape" @update:value="reinitCropper">
                <n-radio-button value="rect">矩形</n-radio-button>
                <n-radio-button value="circle">圆形</n-radio-button>
              </n-radio-group>
            </n-form-item>
            <n-form-item label="尺寸" label-placement="left" label-width="50" style="margin: 0">
              <n-select v-model:value="sizeKey" :options="sizeOptions" style="width: 180px" @update:value="onSizeKey" />
            </n-form-item>
          </n-space>

          <n-space v-if="sizeKey === 'custom'" align="center" style="margin-top: 8px" :size="12">
            <n-form-item label="像素宽度" label-placement="left" label-width="80" style="margin: 0">
              <n-input-number v-model:value="customW" :min="1" style="width: 120px" @update:value="applyCustom" />
            </n-form-item>
            <n-form-item label="像素高度" label-placement="left" label-width="80" style="margin: 0">
              <n-input-number v-model:value="customH" :min="1" style="width: 120px" @update:value="applyCustom" />
            </n-form-item>
          </n-space>

          <n-space justify="center" style="margin-top: 14px">
            <n-button type="primary" @click="doCrop">下载图片</n-button>
            <n-button secondary @click="reset">重新上传</n-button>
          </n-space>
        </div>

        <!-- 右:预览 + 信息 -->
        <div class="crop-right">
          <n-card size="small" title="裁剪预览">
            <div class="preview-box">
              <img v-if="liveUrl" :src="liveUrl" alt="preview" />
              <n-text v-else depth="3">拖动选框,预览实时更新</n-text>
            </div>
            <n-divider style="margin: 10px 0" />
            <div style="font-size: 13px; line-height: 1.9">
              <div>文件名称:{{ fileName }}</div>
              <div>文件类型:{{ fileType }}</div>
              <div>文件大小:{{ formatBytes(fileSize) }}</div>
              <n-divider style="margin: 6px 0" />
              <div>X 坐标:{{ dataX }}</div>
              <div>Y 坐标:{{ dataY }}</div>
              <div>宽度:{{ dataW }}</div>
              <div>高度:{{ dataH }}</div>
            </div>
          </n-card>
        </div>
      </div>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { get2dContext } from '@/utils/canvas';
import { nextTick, onBeforeUnmount, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { downloadBlob, formatBytes } from '../_media/image-helpers';

const UploadIcon = Upload;
const message = useMessage();

const imgEl = ref<HTMLImageElement | null>(null);
const imgSrc = ref('');
const fileName = ref('');
const fileType = ref('');
const fileSize = ref(0);
const shape = ref<'rect' | 'circle'>('rect');
const sizeKey = ref('raw');
const customW = ref(295);
const customH = ref(413);
const dataX = ref(0);
const dataY = ref(0);
const dataW = ref(0);
const dataH = ref(0);
const liveUrl = ref('');

let cropper: Cropper | null = null;
let applying = false;
let liveTimer: ReturnType<typeof setTimeout> | null = null;
let styleEl: HTMLStyleElement | null = null;

const sizeOptions = [
  { label: '任意', value: 'raw' },
  { label: '小一寸 (259×377)', value: 'littleOne' },
  { label: '一寸 (295×413)', value: 'one' },
  { label: '大一寸 (389×566)', value: 'greatOne' },
  { label: '两寸 (413×579)', value: 'two' },
  { label: '大两寸 (423×626)', value: 'greatTwo' },
  { label: '自定义', value: 'custom' },
];
const SIZES: Record<string, [number, number]> = {
  littleOne: [259, 377],
  one: [295, 413],
  greatOne: [389, 566],
  two: [413, 579],
  greatTwo: [423, 626],
};

function onPick({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const f = file.file as File;
  if (!/image\/(png|jpe?g|webp|bmp|gif)/.test(f.type)) {
    message.error('不支持的图片格式');
    return false;
  }
  fileName.value = f.name;
  fileType.value = f.type || '未知';
  fileSize.value = f.size;
  const reader = new FileReader();
  reader.onload = () => {
    imgSrc.value = reader.result as string;
    nextTick(() => {
      const img = imgEl.value;
      if (img) {
        if (img.complete) initCropper();
        else img.onload = () => initCropper();
      }
    });
  };
  reader.readAsDataURL(f);
  return false;
}

function setCircleStyle(on: boolean) {
  if (styleEl) {
    styleEl.remove();
    styleEl = null;
  }
  if (on) {
    styleEl = document.createElement('style');
    styleEl.textContent =
      '.crop-box .cropper-view-box, .crop-box .cropper-face { border-radius: 50%; } .crop-box .cropper-view-box { outline: 2px solid #39f; }';
    document.head.appendChild(styleEl);
  }
}

function initCropper() {
  destroy();
  const img = imgEl.value;
  if (!img) return;
  const isCircle = shape.value === 'circle';
  setCircleStyle(isCircle);
  applying = true;
  cropper = new Cropper(img, {
    viewMode: 1,
    aspectRatio: isCircle ? 1 : NaN,
    // 图片固定不移动不缩放(同 lanren)
    movable: false,
    zoomable: false,
    zoomOnWheel: false,
    rotatable: false,
    scalable: false,
    dragMode: 'crop',
    toggleDragModeOnDblclick: false,
    autoCropArea: 0.7,
    crop: (e) => {
      if (applying) return;
      dataX.value = Math.round(e.detail.x);
      dataY.value = Math.round(e.detail.y);
      dataW.value = Math.round(e.detail.width);
      dataH.value = Math.round(e.detail.height);
      scheduleLive();
    },
    ready: () => {
      applying = false;
      applySize();
      refreshLive();
    },
  });
}

function destroy() {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  setCircleStyle(false);
}

/** Natural (original pixel) size of the image: setData() works in natural pixels, not displayed size. */
function naturalSize(c: Cropper): { nw: number; nh: number } {
  const imgData = c.getImageData();
  return { nw: imgData.naturalWidth, nh: imgData.naturalHeight };
}

/** Center a crop box with the aspect ratio w0:h0 as large as the image allows. */
function centerBox(c: Cropper, w0: number, h0: number) {
  const { nw, nh } = naturalSize(c);
  const scale = Math.min(nw / w0, nh / h0);
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));
  c.setAspectRatio(w0 / h0);
  c.setData({ x: (nw - w) / 2, y: (nh - h) / 2, width: w, height: h });
}

/** Exact output size (px) for the active size preset, or null for free cropping. */
function targetSize(): [number, number] | null {
  const isCircle = shape.value === 'circle';
  let size: [number, number] | null = null;
  if (sizeKey.value === 'custom') size = [Math.max(1, customW.value || 1), Math.max(1, customH.value || 1)];
  else if (SIZES[sizeKey.value]) size = SIZES[sizeKey.value];
  if (size && isCircle) return [size[0], size[0]];
  return size;
}

function applySize() {
  if (!cropper) return;
  const isCircle = shape.value === 'circle';
  if (sizeKey.value === 'raw') {
    const { nw, nh } = naturalSize(cropper);
    const side = Math.round(Math.min(nw, nh) * 0.8);
    const w = isCircle ? side : Math.round(nw * 0.8);
    const h = isCircle ? side : Math.round(nh * 0.8);
    cropper.setAspectRatio(isCircle ? 1 : NaN);
    cropper.setData({ x: (nw - w) / 2, y: (nh - h) / 2, width: w, height: h });
    return;
  }
  if (sizeKey.value === 'custom') {
    applyCustom();
    return;
  }
  const target = targetSize();
  if (target) centerBox(cropper, target[0], target[1]);
}

function onSizeKey() {
  if (!cropper) return;
  applySize();
  refreshLive();
}

function applyCustom() {
  if (!cropper) return;
  if (sizeKey.value !== 'custom') return;
  const target = targetSize();
  if (target) centerBox(cropper, target[0], target[1]);
}

function reinitCropper() {
  const img = imgEl.value;
  if (!img || !imgSrc.value) return;
  // 重挂:先移除 Cropper 容器,恢复裸 img,再重建
  if (cropper) {
    const parent = img.parentElement;
    cropper.destroy();
    cropper = null;
    if (parent && parent !== img.parentElement) parent.appendChild(img);
  }
  nextTick(() => initCropper());
}

function scheduleLive() {
  if (liveTimer) clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    liveTimer = null;
    refreshLive();
  }, 150);
}

function refreshLive() {
  if (!cropper) return;
  try {
    let canvas = cropper.getCroppedCanvas({ maxWidth: 240, maxHeight: 240, imageSmoothingEnabled: true });
    if (shape.value === 'circle') canvas = getRoundedCanvas(canvas);
    liveUrl.value = canvas.toDataURL('image/png');
  } catch {
    // ignore
  }
}

function getRoundedCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = get2dContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(source.width / 2, source.height / 2, Math.min(source.width, source.height) / 2, 0, 2 * Math.PI, true);
  ctx.fill();
  return canvas;
}

/** Redraw onto a canvas of exactly w×h px (getCroppedCanvas may be off by a pixel from rounding). */
function toExactSize(source: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  if (source.width === w && source.height === h) return source;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = get2dContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function doCrop() {
  if (!cropper) return;
  const target = targetSize();
  let canvas = cropper.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    ...(target ? { width: target[0], height: target[1] } : {}),
  });
  if (!canvas) {
    message.error('裁剪失败,请重新选择裁剪区域');
    return;
  }
  // 一寸/两寸等尺寸预设输出精确像素(如 295×413)
  if (target) canvas = toExactSize(canvas, target[0], target[1]);
  if (shape.value === 'circle') canvas = getRoundedCanvas(canvas);
  const base = fileName.value ? fileName.value.replace(/\.[^.]+$/, '') : 'result';
  canvas.toBlob((blob) => {
    if (!blob) {
      message.error('图片导出失败');
      return;
    }
    downloadBlob(blob, `${base}_cropped.png`);
  }, 'image/png');
}

function reset() {
  destroy();
  imgSrc.value = '';
  fileName.value = '';
  fileType.value = '';
  fileSize.value = 0;
  liveUrl.value = '';
  shape.value = 'rect';
  sizeKey.value = 'raw';
}

onBeforeUnmount(() => {
  if (liveTimer) clearTimeout(liveTimer);
  destroy();
});
</script>

<style scoped>
.crop-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  margin-top: 4px;
  width: 100%;
}
.crop-left {
  flex: 1 1 auto;
  min-width: 0;
}
.crop-right {
  flex: 0 0 260px;
  min-width: 0;
}
@media (max-width: 700px) {
  .crop-layout {
    flex-direction: column;
  }
  .crop-right {
    flex: 1 1 auto;
    width: 100%;
  }
}
/* 仅承载 Cropper,无自定义背景;图片自适应,类似 lanren 简洁容器 */
.crop-box {
  width: 100%;
  overflow: hidden;
}
.crop-box :deep(img) {
  display: block;
  max-width: 100%;
}
.preview-box {
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-box img {
  max-width: 100%;
  max-height: 200px;
}
</style>
