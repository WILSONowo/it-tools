<template>
  <n-card>
    <!-- 上传 -->
    <n-upload
      accept=".mp4,.webm,.mkv,.mov,.avi,.flv,.wmv,.mpg,.mpeg,.3gp,.ts,.m4v"
      :show-file-list="false"
      :on-before-upload="onPick"
      style="width: 100%"
    >
      <n-upload-dragger style="padding: 26px 0">
        <n-icon size="44" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 8px 0 0">点击选择或将视频文件拖到此处</n-p>
        <n-text depth="3" style="font-size: 12px"
          >支持 MP4 / WEBM / MKV / MOV / AVI / FLV / WMV / MPG / 3GP / TS</n-text
        >
      </n-upload-dragger>
    </n-upload>

    <template v-if="file">
      <n-text depth="2" style="display: block; margin: 14px 0 6px"
        >视频:{{ file.name }}({{ formatBytes(file.size) }})</n-text
      >
      <video :src="fileUrl" controls style="width: 100%; max-height: 320px" />
    </template>

    <n-grid v-if="file" cols="1 700:3" x-gap="12" y-gap="8" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="输出格式" label-placement="top" style="margin: 0">
          <n-select v-model:value="format" :options="formatOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="视频编码" label-placement="top" style="margin: 0">
          <n-select v-model:value="vcodec" :options="codecOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="转换速度" label-placement="top" style="margin: 0">
          <n-select v-model:value="preset" :options="presetOptions" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space justify="center" style="margin: 16px 0">
      <n-button type="primary" :loading="processing" :disabled="!file" @click="start">开始转换</n-button>
      <n-button secondary @click="reset">清空</n-button>
    </n-space>

    <n-text v-if="loadingEngine" depth="3" style="font-size: 13px; display: block; text-align: center">
      处理中...{{ loadPercent }}%(首次使用需先加载 FFmpeg 引擎)
    </n-text>
    <n-progress
      v-if="processing && loadPercent > 0 && !loadingEngine"
      type="line"
      :percentage="loadPercent"
      style="margin: 8px 0"
    />
    <n-alert v-if="error" type="error" :show-icon="false" style="margin: 10px 0; white-space: pre-wrap">{{
      error
    }}</n-alert>

    <template v-if="outputUrl">
      <n-h3 style="margin: 16px 0 8px">转换结果({{ outputName }},{{ formatBytes(outputSize) }})</n-h3>
      <video :src="outputUrl" controls style="width: 100%; max-height: 320px" />
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
import { execFFmpeg, extOf, mimeOf, ffmpegErrorMessage } from '../_media/ffmpeg-loader';

const UploadIcon = Upload;
const message = useMessage();

const file = ref<File | null>(null);
const fileUrl = ref('');
const format = ref('mp4');
const vcodec = ref('libx264');
const preset = ref('veryfast');
const processing = ref(false);
const loadingEngine = ref(false);
const loadPercent = ref(0);
const error = ref('');
const outputUrl = ref('');
const outputName = ref('');
const outputSize = ref(0);

const formatOptions = [
  { label: 'MP4', value: 'mp4' },
  { label: 'WebM', value: 'webm' },
  { label: 'MKV', value: 'mkv' },
  { label: 'MOV', value: 'mov' },
  { label: 'AVI', value: 'avi' },
  { label: 'TS', value: 'ts' },
  { label: 'MPEG', value: 'mpg' },
  { label: '3GP', value: '3gp' },
];
const codecOptions = [
  { label: 'H.264', value: 'libx264' },
  { label: 'H.265 (HEVC)', value: 'libx265' },
  { label: 'VP9', value: 'libvpx-vp9' },
];
const presetOptions = [
  { label: '极速(体积大)', value: 'ultrafast' },
  { label: '快速', value: 'veryfast' },
  { label: '平衡', value: 'medium' },
  { label: '高质量(慢)', value: 'slow' },
];

function onPick({ file: f }: { file: UploadFileInfo }) {
  if (!f?.file) return false;
  reset();
  file.value = f.file as File;
  fileUrl.value = URL.createObjectURL(file.value);
  return false;
}

function audioCodecFor(): string {
  const map: Record<string, string> = {
    webm: 'libopus',
    mkv: 'aac',
    mov: 'aac',
    avi: 'aac',
    ts: 'aac',
    mpg: 'mp2',
    '3gp': 'aac',
    mp4: 'aac',
  };
  return map[format.value] || 'aac';
}

function vcodecCompatible(ext: string): boolean {
  // 目标容器对所选编码的兼容提示由用户判断;这里仅做基础过滤
  if (vcodec.value === 'libvpx-vp9' && ext !== 'webm' && ext !== 'mkv' && ext !== 'mp4') {
    return false;
  }
  return true;
}

async function start() {
  if (!file.value) return;
  error.value = '';
  outputUrl.value = '';
  if (!vcodecCompatible(format.value)) {
    error.value = '所选编码与输出格式不兼容:VP9 建议输出 WebM/MKV/MP4';
    return;
  }
  const inExt = extOf(file.value.name) || 'mp4';
  const inName = 'input.' + inExt;
  const outExt = format.value;
  const outName = file.value.name.replace(/\.[^.]+$/, '') + '.' + outExt;

  processing.value = true;
  loadingEngine.value = true;
  try {
    const data = new Uint8Array(await file.value.arrayBuffer());
    const args = ['-i', inName];
    args.push('-c:v', vcodec.value);
    args.push('-preset', preset.value);
    if (vcodec.value === 'libvpx-vp9') {
      args.push('-b:v', '0');
      args.push('-crf', '30');
    } else {
      args.push('-crf', '23');
    }
    args.push('-c:a', audioCodecFor());
    args.push('-movflags', '+faststart');
    args.push('-y', outName);

    const result = await execFFmpeg(args, [{ name: inName, data }], outName, (p) => (loadPercent.value = p));
    outputUrl.value = URL.createObjectURL(new Blob([result], { type: mimeOf(outExt) }));
    outputName.value = outName;
    outputSize.value = result.length;
    message.success('转换完成');
  } catch (e) {
    error.value = ffmpegErrorMessage(e);
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
}
</script>
