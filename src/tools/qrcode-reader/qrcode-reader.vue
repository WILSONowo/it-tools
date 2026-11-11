<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      识别图片或摄像头画面中的二维码 / 条形码,全部在本地浏览器完成。
    </n-alert>

    <n-tabs type="line" default-value="image" @update:value="onTabChange">
      <n-tab-pane name="image" tab="图片识别">
        <n-upload :show-file-list="false" :on-before-upload="onImage" accept="image/*" style="width: 100%">
          <n-upload-dragger style="padding: 24px 0">
            <n-icon size="40" :depth="3" :component="ImageIcon" />
            <n-p style="margin: 6px 0 0">点击上传包含二维码的图片</n-p>
          </n-upload-dragger>
        </n-upload>
        <div v-if="previewUrl" style="text-align: center; margin-top: 12px">
          <img :src="previewUrl" style="max-height: 320px; max-width: 100%" alt="preview" />
        </div>
      </n-tab-pane>

      <n-tab-pane name="camera" tab="摄像头扫描">
        <n-space vertical align="center">
          <video ref="videoEl" muted playsinline style="max-width: 100%; max-height: 360px; border-radius: 6px" />
          <n-space>
            <n-button type="primary" :loading="starting" :disabled="cameraOn" @click="startCamera">开启摄像头</n-button>
            <n-button secondary :disabled="!cameraOn && !starting" @click="stopCamera">关闭</n-button>
          </n-space>
        </n-space>
      </n-tab-pane>
    </n-tabs>

    <n-divider v-if="result" />
    <template v-if="result">
      <n-alert type="success" :show-icon="false" style="margin-bottom: 8px">识别成功</n-alert>
      <n-input :value="result" type="textarea" :autosize="{ minRows: 2 }" readonly />
      <n-space justify="center" style="margin-top: 10px">
        <n-button secondary @click="copyResult">复制</n-button>
      </n-space>
    </template>
    <n-text v-else-if="scanning" depth="3">正在扫描...</n-text>
    <n-alert v-if="error" type="error" :show-icon="false" style="margin-top: 8px">{{ error }}</n-alert>
  </n-card>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { Photo as ImageIcon } from '@vicons/tabler';
import jsQR from 'jsqr';
import { useCopy } from '@/composable/copy';
import { fitWithin } from '../_media/image-helpers';

// 摄像头帧缩到 800px 以内、约 10 fps 识别;上传图片先在 1000px 内识别,失败再用 2000px 重试
const CAMERA_MAX_SIDE = 800;
const SCAN_INTERVAL_MS = 100;
const IMAGE_MAX_SIDES = [1000, 2000];

const previewUrl = ref('');
const videoEl = ref<HTMLVideoElement | null>(null);
const cameraOn = ref(false);
const starting = ref(false);
const scanning = ref(false);
const result = ref('');
const error = ref('');

let stream: MediaStream | null = null;
let rafId = 0;
let lastScan = 0;
let unmounted = false;
// Bumped by every start / stop so a getUserMedia that resolves late is discarded.
let cameraToken = 0;
let imageToken = 0;

// One reusable canvas for all decoding.
let scanCanvas: HTMLCanvasElement | null = null;
let scanCtx: CanvasRenderingContext2D | null = null;

function decode(
  source: HTMLImageElement | HTMLVideoElement,
  width: number,
  height: number,
  maxSide: number,
  inversionAttempts: 'dontInvert' | 'attemptBoth',
): string | null {
  const { w, h } = fitWithin(width, height, maxSide);
  if (!scanCanvas) {
    scanCanvas = document.createElement('canvas');
    scanCtx = scanCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (!scanCtx) return null;
  if (scanCanvas.width !== w) scanCanvas.width = w;
  if (scanCanvas.height !== h) scanCanvas.height = h;
  scanCtx.drawImage(source, 0, 0, w, h);
  const data = scanCtx.getImageData(0, 0, w, h);
  const code = jsQR(data.data, w, h, { inversionAttempts });
  return code?.data ? code.data : null;
}

function onImage({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const imgFile = file.file as File;
  const token = ++imageToken;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(imgFile);
  result.value = '';
  error.value = '';

  const img = new Image();
  img.onload = () => {
    if (token !== imageToken) return;
    try {
      const { naturalWidth: w, naturalHeight: h } = img;
      let text: string | null = null;
      for (const max of IMAGE_MAX_SIDES) {
        text = decode(img, w, h, max, 'attemptBoth');
        if (text || Math.max(w, h) <= max) break;
      }
      if (text) result.value = text;
      else error.value = '未识别到二维码,请尝试更清晰/更大的图片';
    } catch {
      error.value = '图片解析失败';
    }
  };
  img.onerror = () => {
    if (token === imageToken) error.value = '图片加载失败';
  };
  img.src = previewUrl.value;
  return false;
}

async function startCamera() {
  if (cameraOn.value || starting.value) return; // 防止重复开启导致旧流泄漏
  error.value = '';
  result.value = '';
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = '当前浏览器不支持访问摄像头(需要 HTTPS 或 localhost 环境)';
    return;
  }
  const token = ++cameraToken;
  starting.value = true;
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (token !== cameraToken || unmounted) {
      // 授权弹窗期间已关闭或离开页面:立即释放摄像头
      s.getTracks().forEach((t) => t.stop());
      return;
    }
    stream = s;
    const video = videoEl.value;
    if (video) {
      video.srcObject = s;
      await video.play();
    }
    if (token !== cameraToken) return;
    cameraOn.value = true;
    lastScan = 0;
    rafId = requestAnimationFrame(scanLoop);
  } catch (e) {
    if (token !== cameraToken) return;
    stopCamera();
    error.value = `无法访问摄像头:${e instanceof Error ? e.message : String(e)}`;
  } finally {
    if (token === cameraToken) starting.value = false;
  }
}

function scanLoop(now: number) {
  rafId = requestAnimationFrame(scanLoop);
  if (now - lastScan < SCAN_INTERVAL_MS) return;
  const video = videoEl.value;
  if (!video || video.readyState < 2 || !video.videoWidth) return;
  lastScan = now;
  scanning.value = true;
  try {
    const text = decode(video, video.videoWidth, video.videoHeight, CAMERA_MAX_SIDE, 'dontInvert');
    if (text) {
      result.value = text;
      error.value = '';
      stopCamera();
    }
  } catch {
    // 忽略帧错误
  }
}

function stopCamera() {
  cameraToken++;
  starting.value = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (videoEl.value) videoEl.value.srcObject = null;
  cameraOn.value = false;
  scanning.value = false;
}

// 切走摄像头标签页时视频元素会被卸载,需同时关闭摄像头
function onTabChange(name: string) {
  if (name !== 'camera') stopCamera();
}

const { copy } = useCopy({ source: result, text: '已复制' });
function copyResult() {
  if (result.value) copy();
}

onBeforeUnmount(() => {
  unmounted = true;
  stopCamera();
  imageToken++;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>
