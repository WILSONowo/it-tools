<template>
  <n-card>
    <!-- 上传 -->
    <n-upload
      accept=".mp3,.wav,.m4a,.flac,.ogg,.aac,.opus,.wma,.aiff"
      :show-file-list="false"
      :on-before-upload="onPick"
      style="width: 100%"
    >
      <n-upload-dragger style="padding: 26px 0">
        <n-icon size="44" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 8px 0 0">点击选择或将音频文件拖到此处</n-p>
        <n-text depth="3" style="font-size: 12px">支持 MP3 / WAV / M4A / FLAC / OGG / AAC / Opus / WMA / AIFF</n-text>
      </n-upload-dragger>
    </n-upload>

    <template v-if="file">
      <n-text depth="2" style="display: block; margin: 14px 0 6px"
        >音频:{{ file.name }}({{ formatBytes(file.size) }})</n-text
      >
      <audio :src="fileUrl" controls style="width: 100%" />
    </template>

    <n-grid v-if="file" cols="1 700:3" x-gap="12" y-gap="8" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="输出格式" label-placement="top" style="margin: 0">
          <n-select v-model:value="format" :options="formatOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="码率" label-placement="top" style="margin: 0">
          <n-select v-model:value="bitrate" :options="bitrateOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="声道" label-placement="top" style="margin: 0">
          <n-select v-model:value="channels" :options="channelOptions" />
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
    <n-alert v-if="error" type="error" :show-icon="false" style="margin: 10px 0; white-space: pre-wrap">{{
      error
    }}</n-alert>

    <template v-if="outputUrl">
      <n-h3 style="margin: 16px 0 8px">转换结果({{ outputName }},{{ formatBytes(outputSize) }})</n-h3>
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
import { execFFmpeg, extOf, mimeOf, ffmpegErrorMessage } from '../_media/ffmpeg-loader';

const UploadIcon = Upload;
const message = useMessage();

const file = ref<File | null>(null);
const fileUrl = ref('');
const format = ref('mp3');
const bitrate = ref('192k');
const channels = ref('2');
const processing = ref(false);
const loadingEngine = ref(false);
const loadPercent = ref(0);
const error = ref('');
const outputUrl = ref('');
const outputName = ref('');
const outputSize = ref(0);

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
  { label: 'M4A (AAC)', value: 'm4a' },
  { label: 'FLAC', value: 'flac' },
  { label: 'OGG', value: 'ogg' },
  { label: 'AAC', value: 'aac' },
  { label: 'Opus', value: 'opus' },
  { label: 'WMA', value: 'wma' },
  { label: 'AIFF', value: 'aiff' },
];
const bitrateOptions = ['128k', '192k', '256k', '320k'].map((b) => ({ label: b, value: b }));
const channelOptions = [
  { label: '立体声', value: '2' },
  { label: '单声道', value: '1' },
];

function onPick({ file: f }: { file: UploadFileInfo }) {
  if (!f?.file) return false;
  reset();
  file.value = f.file as File;
  fileUrl.value = URL.createObjectURL(file.value);
  return false;
}

function encoderFor(fmt: string): string {
  const map: Record<string, string> = {
    mp3: 'libmp3lame',
    m4a: 'aac',
    ogg: 'libvorbis',
    opus: 'libopus',
    wma: 'wmav2',
    flac: 'flac',
    wav: 'pcm_s16le',
    aiff: 'pcm_s16be',
    aac: 'aac',
  };
  return map[fmt] || 'libmp3lame';
}

async function start() {
  if (!file.value) return;
  error.value = '';
  outputUrl.value = '';
  const inExt = extOf(file.value.name) || 'mp3';
  const inName = 'input.' + inExt;
  const outName = file.value.name.replace(/\.[^.]+$/, '') + '.' + format.value;
  const outExt = format.value;

  processing.value = true;
  loadingEngine.value = true;
  try {
    const data = new Uint8Array(await file.value.arrayBuffer());
    const args = ['-i', inName];
    args.push('-map', '0:a:0');
    args.push('-c:a', encoderFor(outExt));
    if (outExt !== 'wav' && outExt !== 'aiff' && outExt !== 'flac') args.push('-b:a', bitrate.value);
    args.push('-ac', channels.value);
    if (outExt === 'm4a') args.push('-movflags', '+faststart');
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
