<template>
  <n-card>
    <!-- 上传 -->
    <n-upload
      accept=".mp3,.wav,.m4a,.flac,.ogg,.aac,.wma,.aiff,.opus,.mp4,.webm,.mkv"
      :show-file-list="false"
      :on-before-upload="onPick"
      style="width: 100%"
    >
      <n-upload-dragger style="padding: 26px 0">
        <n-icon size="44" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 8px 0 0">点击选择或将音频文件拖到此处</n-p>
        <n-text depth="3" style="font-size: 12px">支持 MP3 / WAV / M4A / FLAC / OGG / AAC 等</n-text>
      </n-upload-dragger>
    </n-upload>

    <!-- 播放预览 -->
    <template v-if="file">
      <n-text depth="2" style="display: block; margin: 14px 0 6px"
        >原始音频:{{ file.name }}({{ formatBytes(file.size) }})</n-text
      >
      <audio :src="fileUrl" controls style="width: 100%" />
    </template>

    <!-- 起止时间 -->
    <n-grid v-if="file" cols="1 700:2" x-gap="16" y-gap="8" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="开始时间" label-placement="top" style="margin: 0">
          <n-input v-model:value="startTime" placeholder="00:00:00.000" style="font-family: monospace" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="结束时间(留空=到末尾)" label-placement="top" style="margin: 0">
          <n-input v-model:value="endTime" placeholder="00:00:30.000" style="font-family: monospace" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space justify="center" style="margin: 16px 0">
      <n-button type="primary" :loading="processing" :disabled="!file" @click="start">开始裁剪</n-button>
      <n-button secondary @click="reset">清空</n-button>
    </n-space>

    <!-- ffmpeg 加载进度 -->
    <n-progress
      v-if="loadPercent > 0 && loadPercent < 100"
      type="line"
      :percentage="loadPercent"
      :show-indicator="false"
      style="margin: 8px 0"
    />
    <n-text v-if="loadingEngine" depth="3" style="font-size: 13px; display: block; text-align: center">
      正在加载 FFmpeg 引擎...{{ loadPercent }}%(仅首次)
    </n-text>

    <n-alert v-if="error" type="error" :show-icon="false" style="margin: 10px 0">{{ error }}</n-alert>

    <!-- 结果 -->
    <template v-if="outputUrl">
      <n-h3 style="margin: 16px 0 8px">裁剪结果({{ outputName }},{{ formatBytes(outputSize) }})</n-h3>
      <audio :src="outputUrl" controls style="width: 100%" />
      <n-space justify="center" style="margin-top: 12px">
        <n-button type="primary" secondary @click="downloadOutput">下载</n-button>
        <n-button secondary @click="outputUrl = ''">删除</n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Upload } from '@vicons/tabler';
import { formatBytes } from '@/utils/image-encode';
import { execFFmpeg, extOf, mimeOf, getFFmpeg } from '../_media/ffmpeg-loader';

const UploadIcon = Upload;
const message = useMessage();

const file = ref<File | null>(null);
const fileUrl = ref('');
const startTime = ref('00:00:00.000');
const endTime = ref('');
const processing = ref(false);
const loadingEngine = ref(false);
const loadPercent = ref(0);
const error = ref('');
const outputUrl = ref('');
const outputName = ref('');
const outputSize = ref(0);

function onPick({ file: f }: { file: UploadFileInfo }) {
  if (!f?.file) return false;
  reset();
  file.value = f.file as File;
  fileUrl.value = URL.createObjectURL(file.value);
  return false;
}

function parseTime(t: string): number | null {
  const s = t.trim();
  if (s === '') return null;
  const m = s.match(/^(\d+):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?$/);
  if (!m) return null;
  const ms = m[4] ? m[4].padEnd(3, '0') : '000';
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(ms) / 1000;
}

async function start() {
  if (!file.value) return;
  error.value = '';
  outputUrl.value = '';
  const startSec = parseTime(startTime.value);
  if (startSec === null) {
    error.value = '开始时间格式应为 HH:mm:ss.SSS';
    return;
  }
  const endSec = parseTime(endTime.value);
  if (endSec !== null && endSec <= startSec) {
    error.value = '结束时间必须大于开始时间';
    return;
  }
  const ext = extOf(file.value.name) || 'mp3';
  const inName = 'input.' + ext;
  const outExt = ext;
  const outName = file.value.name.replace(/\.[^.]+$/, '') + '-cut.' + outExt;

  processing.value = true;
  loadingEngine.value = true;
  try {
    const data = new Uint8Array(await file.value.arrayBuffer());
    const args = ['-i', inName];
    args.push('-ss', startSec.toFixed(3));
    if (endSec !== null) args.push('-t', (endSec - startSec).toFixed(3));
    args.push('-c', 'copy'); // 流拷贝,不重编码、速度快、无损
    args.push('-avoid_negative_ts', 'make_zero', '-y', outName);

    const result = await execFFmpeg(args, [{ name: inName, data }], outName, (p) => {
      loadPercent.value = p;
    });
    outputUrl.value = URL.createObjectURL(new Blob([result], { type: mimeOf(outExt) }));
    outputName.value = outName;
    outputSize.value = result.length;
    message.success('裁剪完成');
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    processing.value = false;
    loadingEngine.value = false;
    loadPercent.value = 0;
  }
}

function downloadOutput() {
  const a = document.createElement('a');
  a.href = outputUrl.value;
  a.download = outputName.value;
  a.click();
}

function reset() {
  file.value = null;
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
  fileUrl.value = '';
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
  outputUrl.value = '';
  error.value = '';
  startTime.value = '00:00:00.000';
  endTime.value = '';
}

// 预加载引擎(用户第一次交互后可能)
</script>
