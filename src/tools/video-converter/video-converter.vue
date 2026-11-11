<template>
  <n-card>
    <!-- 上传 -->
    <n-upload :accept="accept" :show-file-list="false" :on-before-upload="job.onPick" style="width: 100%">
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
      <n-h3 style="margin: 16px 0 8px">转换结果({{ output.name }},{{ formatBytes(output.size) }})</n-h3>
      <video :src="output.url" controls style="width: 100%; max-height: 320px" />
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
import { outputFileName } from '../_media/media-utils';
import { useFfmpegJob } from '../_media/use-ffmpeg-job';
import MediaJobStatus from '../_media/media-job-status.vue';

const UploadIcon = Upload;
const EXTENSIONS = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'mpg', 'mpeg', '3gp', 'ts', 'm4v'];
const accept = EXTENSIONS.map((e) => `.${e}`).join(',');

const format = ref('mp4');
const vcodec = ref('libx264');
const preset = ref('veryfast');

const job = useFfmpegJob({ extensions: EXTENSIONS, kind: '视频' });
const { file, fileUrl, processing, status, statusText, progress, error, output } = job;

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

const VP9_SPEED: Record<string, [string, string]> = {
  ultrafast: ['realtime', '8'],
  veryfast: ['realtime', '6'],
  medium: ['good', '4'],
  slow: ['good', '2'],
};

const AUDIO_CODECS: Record<string, string> = {
  webm: 'libopus',
  mpg: 'mp2',
};

function incompatibility(ext: string, codec: string): string {
  if (ext === 'webm' && codec !== 'libvpx-vp9') return 'WebM 仅支持 VP9 编码,请将视频编码改为 VP9';
  if (codec === 'libvpx-vp9' && !['webm', 'mkv', 'mp4'].includes(ext)) {
    return '所选编码与输出格式不兼容:VP9 建议输出 WebM/MKV/MP4';
  }
  return '';
}

function start() {
  if (!file.value) return;
  const outExt = format.value;
  const codec = vcodec.value;
  const speed = preset.value;
  const problem = incompatibility(outExt, codec);
  if (problem) {
    error.value = problem;
    return;
  }
  void job.run(
    async (ctx, input) => {
      const inExt = extOf(input.name) || 'mp4';
      const inName = await ctx.write(`input.${inExt}`, new Uint8Array(await input.arrayBuffer()));
      const outName = ctx.file(`output.${outExt}`);
      const args = ['-i', inName, '-c:v', codec];
      if (codec === 'libvpx-vp9') {
        // VP9 没有 x264 式的 preset,用 deadline/cpu-used 控制速度
        const [deadline, cpuUsed] = VP9_SPEED[speed] ?? VP9_SPEED.veryfast;
        args.push('-b:v', '0', '-crf', '30', '-deadline', deadline, '-cpu-used', cpuUsed);
      } else {
        args.push('-preset', speed, '-crf', codec === 'libx265' ? '28' : '23');
      }
      args.push('-c:a', AUDIO_CODECS[outExt] || 'aac');
      if (outExt === 'mp4' || outExt === 'mov') args.push('-movflags', '+faststart');
      args.push('-y', outName);
      await ctx.exec(args);
      return { data: await ctx.read(outName), name: outputFileName(input.name, outExt), mime: mimeOf(outExt) };
    },
    { successText: '转换完成' },
  );
}
</script>
