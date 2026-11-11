<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      在浏览器本地将视频转为 GIF 动图:拖选时间区间,可调帧率、尺寸与画质,两遍调色板法输出高质量 GIF,文件不会上传。
    </n-alert>

    <n-upload v-if="!file" :accept="accept" :show-file-list="false" :on-before-upload="job.onPick" style="width: 100%">
      <n-upload-dragger style="padding: 40px 0">
        <n-icon size="48" :depth="3" :component="MovieIcon" />
        <n-p style="margin: 10px 0 0">点击选择,或将视频拖拽到此处</n-p>
        <n-text depth="3" style="font-size: 12px">支持 MP4 / WEBM / MKV / MOV / AVI / FLV 等</n-text>
      </n-upload-dragger>
    </n-upload>

    <template v-else>
      <n-text depth="2" style="display: block; margin: 14px 0 6px">
        视频:{{ file.name }}({{ formatBytes(file.size) }})
      </n-text>
      <video
        ref="videoEl"
        :src="fileUrl"
        controls
        preload="metadata"
        style="width: 100%; max-height: 360px; background: #000"
        @loadedmetadata="onMeta"
        @timeupdate="onTimeUpdate"
      />

      <div style="margin-top: 14px">
        <n-slider
          v-model:value="range"
          range
          :min="0"
          :max="sliderMax"
          :step="0.05"
          :format-tooltip="fmtSec"
          :disabled="!duration"
          @update:value="onRangeUpdate"
        />
      </div>
      <n-space align="center" justify="space-between" :wrap="true" :size="8" style="margin-top: 4px">
        <n-text depth="3" style="font-size: 12px">
          选区:{{ fmtSec(range[0]) }} ~ {{ fmtSec(range[1]) }} · 时长 {{ fmtSec(range[1] - range[0]) }}
        </n-text>
        <n-space :size="8">
          <n-button size="small" secondary @click="setStartHere">起点=当前</n-button>
          <n-button size="small" secondary @click="setEndHere">终点=当前</n-button>
          <n-button size="small" secondary @click="previewRange">预览选区</n-button>
        </n-space>
      </n-space>

      <n-alert v-if="longSelection" type="warning" :show-icon="false" style="margin-top: 10px">
        选区时长 {{ fmtSec(range[1] - range[0]) }},转换可能较慢且 GIF 体积较大,建议截取 15 秒以内的片段。
      </n-alert>

      <n-grid cols="1 700:4" x-gap="12" y-gap="8" responsive="screen" style="margin-top: 16px">
        <n-gi>
          <n-form-item label="帧率 (FPS)" label-placement="top" style="margin: 0">
            <n-select v-model:value="fps" :options="fpsOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="宽度" label-placement="top" style="margin: 0">
            <n-select v-model:value="width" :options="widthOptions" />
          </n-form-item>
        </n-gi>
        <n-gi v-if="width === 'custom'">
          <n-form-item label="自定义宽度 (px)" label-placement="top" style="margin: 0">
            <n-input-number v-model:value="customWidth" :min="32" :max="1920" style="width: 100%" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="画质(颜色数)" label-placement="top" style="margin: 0">
            <n-select v-model:value="colors" :options="colorOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="循环" label-placement="top" style="margin: 0">
            <n-radio-group v-model:value="loop">
              <n-radio-button value="0">无限循环</n-radio-button>
              <n-radio-button value="-1">播放一次</n-radio-button>
            </n-radio-group>
          </n-form-item>
        </n-gi>
      </n-grid>

      <n-space justify="center" style="margin: 16px 0">
        <n-button type="primary" :loading="processing" :disabled="!duration" @click="start">开始转换</n-button>
        <n-button v-if="processing" secondary type="warning" @click="job.cancel">取消</n-button>
        <n-button secondary @click="job.reset">清空</n-button>
      </n-space>

      <media-job-status
        :processing="processing"
        :status="status"
        :progress="progress"
        :text="stageText"
        :error="error"
      />

      <template v-if="output">
        <n-h3 style="margin: 16px 0 8px">转换结果({{ output.name }},{{ formatBytes(output.size) }})</n-h3>
        <div style="text-align: center">
          <img
            :src="output.url"
            alt="gif"
            style="max-width: 100%; max-height: 360px; border: 1px solid rgba(128, 128, 128, 0.3)"
          />
        </div>
        <n-space justify="center" style="margin-top: 12px">
          <n-button type="primary" secondary @click="job.download">下载</n-button>
          <n-button secondary @click="job.clearOutput">删除</n-button>
        </n-space>
      </template>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Movie } from '@vicons/tabler';
import { formatBytes } from '@/utils/image-encode';
import { extOf } from '../_media/ffmpeg-loader';
import { outputFileName } from '../_media/media-utils';
import { useFfmpegJob } from '../_media/use-ffmpeg-job';
import MediaJobStatus from '../_media/media-job-status.vue';

const MovieIcon = Movie;
const EXTENSIONS = ['mp4', 'webm', 'mkv', 'mov', 'avi', 'flv', 'wmv', 'm4v', 'ts', 'mpg', 'mpeg', '3gp'];
const accept = EXTENSIONS.map((e) => `.${e}`).join(',');

const videoEl = ref<HTMLVideoElement | null>(null);
const duration = ref(0);
const range = ref<[number, number]>([0, 0]);
const fps = ref(10);
const width = ref<number | 'custom'>(480);
const customWidth = ref(480);
const colors = ref(256);
const loop = ref('0');
const stage = ref(0);
let previewing = false;
let prevRange: [number, number] = [0, 0];

const job = useFfmpegJob({
  extensions: EXTENSIONS,
  kind: '视频',
  onReset: () => {
    duration.value = 0;
    range.value = [0, 0];
    prevRange = [0, 0];
    previewing = false;
    stage.value = 0;
  },
});
const { file, fileUrl, processing, status, statusText, progress, error, output } = job;

const fpsOptions = [5, 10, 12, 15, 20, 24].map((v) => ({ label: String(v), value: v }));
const widthOptions = [
  { label: '原始宽度', value: 0 },
  { label: '640 px', value: 640 },
  { label: '480 px', value: 480 },
  { label: '320 px', value: 320 },
  { label: '240 px', value: 240 },
  { label: '自定义', value: 'custom' },
];
const colorOptions = [
  { label: '256 色(最佳)', value: 256 },
  { label: '128 色(均衡)', value: 128 },
  { label: '64 色(最小)', value: 64 },
];

const sliderMax = computed(() => (duration.value > 0 ? duration.value : 1));
const longSelection = computed(() => range.value[1] - range.value[0] > 15);
const stageText = computed(() => {
  if (status.value !== 'running' || !stage.value) return statusText.value;
  return stage.value === 1
    ? `第 1/2 步:正在生成调色板...${progress.value}%`
    : `第 2/2 步:正在编码 GIF...${progress.value}%`;
});

function fmtSec(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = s.toFixed(1).padStart(4, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function onMeta() {
  const v = videoEl.value;
  if (!v) return;
  let d = v.duration;
  if (!isFinite(d) || d <= 0) {
    try {
      if (v.seekable.length) d = v.seekable.end(v.seekable.length - 1);
    } catch {
      // ignore
    }
  }
  duration.value = isFinite(d) && d > 0 ? Math.round(d * 100) / 100 : 0;
  range.value = [0, duration.value];
  prevRange = [...range.value];
}

function onTimeUpdate() {
  const v = videoEl.value;
  if (!v) return;
  if (previewing && v.currentTime >= range.value[1] - 0.02) {
    v.pause();
    previewing = false;
  }
}

function onRangeUpdate(v: number | number[]) {
  const arr = v as [number, number];
  const el = videoEl.value;
  if (el) {
    const changedStart = Math.abs(arr[0] - prevRange[0]) > 0.001;
    el.currentTime = changedStart ? arr[0] : arr[1];
  }
  prevRange = [arr[0], arr[1]];
}

function setStartHere() {
  const v = videoEl.value;
  if (!v) return;
  const t = Math.max(0, Math.min(v.currentTime, range.value[1] - 0.05));
  range.value = [t, range.value[1]];
  prevRange = [...range.value];
}

function setEndHere() {
  const v = videoEl.value;
  if (!v) return;
  const t = Math.min(duration.value, Math.max(v.currentTime, range.value[0] + 0.05));
  range.value = [range.value[0], t];
  prevRange = [...range.value];
}

function previewRange() {
  const v = videoEl.value;
  if (!v) return;
  v.currentTime = range.value[0];
  void v.play();
  previewing = true;
}

function start() {
  if (!file.value || !duration.value) return;
  const startT = Math.max(0, range.value[0]);
  const durT = Math.max(0.1, range.value[1] - range.value[0]);
  const w = width.value === 'custom' ? Math.round(customWidth.value || 480) : width.value;
  const chain = [`fps=${fps.value}`];
  if (w) chain.push(`scale=${w}:-1:flags=lanczos`);
  const base = chain.join(',');
  const vf1 = `${base},palettegen=max_colors=${colors.value}:stats_mode=diff`;
  const vf2 = `${base}[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle`;
  const loopValue = loop.value;
  const seek = ['-ss', startT.toFixed(3), '-t', durT.toFixed(3)];

  void job.run(
    async (ctx, input) => {
      const inExt = extOf(input.name) || 'mp4';
      const inName = await ctx.write(`input.${inExt}`, new Uint8Array(await input.arrayBuffer()));
      const palette = ctx.file('palette.png');
      const outName = ctx.file('output.gif');
      try {
        stage.value = 1;
        await ctx.exec([...seek, '-i', inName, '-vf', vf1, '-y', palette]);
        stage.value = 2;
        await ctx.exec([...seek, '-i', inName, '-i', palette, '-lavfi', vf2, '-loop', loopValue, '-y', outName]);
      } finally {
        stage.value = 0;
      }
      return { data: await ctx.read(outName), name: outputFileName(input.name, 'gif'), mime: 'image/gif' };
    },
    { successText: '转换完成', fallbackError: '转换失败,请尝试缩短选区或降低尺寸/帧率' },
  );
}
</script>
