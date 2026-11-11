<template>
  <n-card>
    <!-- 上传 -->
    <n-upload :accept="accept" :show-file-list="false" :on-before-upload="job.onPick" style="width: 100%">
      <n-upload-dragger style="padding: 26px 0">
        <n-icon size="44" :depth="3" :component="UploadIcon" />
        <n-p style="margin: 8px 0 0">点击选择或将视频文件拖到此处</n-p>
        <n-text depth="3" style="font-size: 12px">支持 MP4 / WEBM / MKV / MOV / AVI / FLV 等</n-text>
      </n-upload-dragger>
    </n-upload>

    <template v-if="file">
      <n-text depth="2" style="display: block; margin: 14px 0 6px"
        >视频:{{ file.name }}({{ formatBytes(file.size) }})</n-text
      >
      <video :src="fileUrl" controls style="width: 100%; max-height: 320px" />
    </template>

    <n-grid v-if="file" cols="1 700:4" x-gap="12" y-gap="8" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form-item label="输出格式" label-placement="top" style="margin: 0">
          <n-select v-model:value="format" :options="audioFormatOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="码率" label-placement="top" style="margin: 0">
          <n-select v-model:value="bitrate" :options="audioBitrateOptions" :disabled="isLosslessAudioFormat(format)" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="声道" label-placement="top" style="margin: 0">
          <n-select v-model:value="channels" :options="audioChannelOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="开始时间(可选)" label-placement="top" style="margin: 0">
          <n-input v-model:value="startTime" placeholder="00:00:00.000" style="font-family: monospace" />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space justify="center" style="margin: 16px 0">
      <n-button type="primary" :loading="processing" :disabled="!file" @click="start">开始提取</n-button>
      <n-button v-if="processing" secondary type="warning" @click="job.cancel">取消</n-button>
      <n-button secondary @click="job.reset">清空</n-button>
    </n-space>

    <media-job-status
      :processing="processing"
      :status="status"
      :progress="progress"
      :text="statusText"
      :error="error"
    />

    <template v-if="output">
      <n-h3 style="margin: 16px 0 8px">提取结果({{ output.name }},{{ formatBytes(output.size) }})</n-h3>
      <audio :src="output.url" controls style="width: 100%" />
      <n-space justify="center" style="margin-top: 12px">
        <n-button type="primary" secondary @click="job.download">下载</n-button>
        <n-button secondary @click="job.clearOutput">删除</n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Upload } from '@vicons/tabler';
import { formatBytes } from '@/utils/image-encode';
import { extOf, mimeOf } from '../_media/ffmpeg-loader';
import {
  audioBitrateOptions,
  audioChannelOptions,
  audioEncodeArgs,
  audioFormatOptions,
  isLosslessAudioFormat,
  outputFileName,
  parseTimecode,
} from '../_media/media-utils';
import { useFfmpegJob } from '../_media/use-ffmpeg-job';
import MediaJobStatus from '../_media/media-job-status.vue';

const UploadIcon = Upload;
const EXTENSIONS = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'm4v', 'ts', 'mpg', 'mpeg', '3gp'];
const accept = EXTENSIONS.map((e) => `.${e}`).join(',');

const format = ref('mp3');
const bitrate = ref('192k');
const channels = ref('2');
const startTime = ref('');

const job = useFfmpegJob({
  extensions: EXTENSIONS,
  kind: '视频',
  onReset: () => {
    startTime.value = '';
  },
});
const { file, fileUrl, processing, status, statusText, progress, error, output } = job;

function start() {
  if (!file.value) return;
  const startSec = parseTimecode(startTime.value);
  if (startSec !== null && Number.isNaN(startSec)) {
    error.value = '开始时间格式应为 HH:mm:ss.SSS';
    return;
  }
  const outExt = format.value;
  const opts = { bitrate: bitrate.value, channels: channels.value };
  void job.run(
    async (ctx, input) => {
      const inExt = extOf(input.name) || 'mp4';
      const inName = await ctx.write(`input.${inExt}`, new Uint8Array(await input.arrayBuffer()));
      const outName = ctx.file(`output.${outExt}`);
      const args = ['-i', inName];
      if (startSec) args.push('-ss', startSec.toFixed(3));
      args.push('-vn', ...audioEncodeArgs(outExt, opts.bitrate, opts.channels), '-y', outName);
      await ctx.exec(args);
      return { data: await ctx.read(outName), name: outputFileName(input.name, outExt), mime: mimeOf(outExt) };
    },
    { successText: '提取完成' },
  );
}
</script>
