<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      识别图片或摄像头画面中的二维码 / 条形码,全部在本地浏览器完成。
    </n-alert>

    <n-tabs type="line" default-value="image">
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
            <n-button type="primary" :loading="cameraOn" @click="startCamera">开启摄像头</n-button>
            <n-button secondary @click="stopCamera">关闭</n-button>
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
import { useMessage } from 'naive-ui';
import { Photo as ImageIcon } from '@vicons/tabler';
import jsQR from 'jsqr';
import { useCopy } from '@/composable/copy';

const message = useMessage();
const previewUrl = ref('');
const videoEl = ref<HTMLVideoElement | null>(null);
const cameraOn = ref(false);
const scanning = ref(false);
const result = ref('');
const error = ref('');
let stream: MediaStream | null = null;
let rafId = 0;

function onImage({ file }: { file: UploadFileInfo }) {
  if (!file?.file) return false;
  const imgFile = file.file as File;
  previewUrl.value = URL.createObjectURL(imgFile);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code) {
        result.value = code.data;
      } else {
        result.value = '';
        error.value = '未识别到二维码,请尝试更清晰/更大的图片';
      }
    } catch {
      error.value = '图片解析失败';
    }
  };
  img.onerror = () => {
    error.value = '图片加载失败';
  };
  img.src = previewUrl.value;
  return false;
}

async function startCamera() {
  error.value = '';
  result.value = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    if (videoEl.value) {
      videoEl.value.srcObject = stream;
      await videoEl.value.play();
    }
    cameraOn.value = true;
    scanLoop();
  } catch (e) {
    error.value = '无法访问摄像头:' + (e as Error).message;
  }
}

function scanLoop() {
  const video = videoEl.value;
  if (!video || video.readyState < 2) {
    rafId = requestAnimationFrame(scanLoop);
    return;
  }
  scanning.value = true;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(video, 0, 0);
  try {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, data.width, data.height);
    if (code && code.data) {
      result.value = code.data;
      stopCamera();
      return;
    }
  } catch {
    // 忽略帧错误
  }
  rafId = requestAnimationFrame(scanLoop);
}

function stopCamera() {
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

const { copy } = useCopy({ source: result, text: '已复制' });
function copyResult() {
  if (result.value) copy();
}

onBeforeUnmount(stopCamera);
</script>
