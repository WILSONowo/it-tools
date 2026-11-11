<template>
  <n-card>
    <!-- 上传 -->
    <n-upload :accept="accept" :show-file-list="false" :on-before-upload="job.onPick" style="width: 100%">
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

    <!-- 结果 -->
    <template v-if="output">
      <n-h3 style="margin: 16px 0 8px">裁剪结果({{ output.name }},{{ formatBytes(output.size) }})</n-h3>
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
import { outputFileName, parseTimecode } from '../_media/media-utils';
import { useFfmpegJob } from '../_media/use-ffmpeg-job';
import MediaJobStatus from '../_media/media-job-status.vue';

const UploadIcon = Upload;
const EXTENSIONS = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'wma', 'aiff', 'opus', 'mp4', 'webm', 'mkv'];
const accept = EXTENSIONS.map((e) => `.${e}`).join(',');

const startTime = ref('00:00:00.000');
const endTime = ref('');

const job = useFfmpegJob({
  extensions: EXTENSIONS,
  kind: '音频',
  onReset: () => {
    startTime.value = '00:00:00.000';
    endTime.value = '';
  },
});
const { file, fileUrl, processing, status, statusText, progress, error, output } = job;

function start() {
  if (!file.value) return;
  const startSec = parseTimecode(startTime.value);
  if (startSec === null || Number.isNaN(startSec)) {
    error.value = '开始时间格式应为 HH:mm:ss.SSS';
    return;
  }
  const endSec = parseTimecode(endTime.value);
  if (endSec !== null && Number.isNaN(endSec)) {
    error.value = '结束时间格式应为 HH:mm:ss.SSS';
    return;
  }
  if (endSec !== null && endSec <= startSec) {
    error.value = '结束时间必须大于开始时间';
    return;
  }

  void job.run(
    async (ctx, input) => {
      const ext = extOf(input.name) || 'mp3';
      const inName = await ctx.write(`input.${ext}`, new Uint8Array(await input.arrayBuffer()));
      const outName = ctx.file(`output.${ext}`);
      const args = ['-i', inName, '-ss', startSec.toFixed(3)];
      if (endSec !== null) args.push('-t', (endSec - startSec).toFixed(3));
      args.push('-c', 'copy'); // 流拷贝,不重编码、速度快、无损
      args.push('-avoid_negative_ts', 'make_zero', '-y', outName);
      await ctx.exec(args);
      return { data: await ctx.read(outName), name: outputFileName(input.name, ext, '-cut'), mime: mimeOf(ext) };
    },
    { successText: '裁剪完成' },
  );
}
</script>
