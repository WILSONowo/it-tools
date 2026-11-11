<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      在浏览器本地将视频转为 GIF 动图:拖选时间区间,可调帧率、尺寸与画质,两遍调色板法输出高质量 GIF,文件不会上传。
    </n-alert>

    <n-upload
      v-if="!file"
      accept=".mp4,.webm,.mkv,.mov,.avi,.flv,.wmv,.m4v,.ts,.mpg,.mpeg,.3gp"
      :show-file-list="false"
      :on-before-upload="onPick"
      style="width: 100%"
    >
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
        <n-button secondary @click="reset">清空</n-button>
      </n-space>

      <n-text v-if="processing" depth="3" style="font-size: 13px; display: block; text-align: center">
        {{ stageText }}
      </n-text>
      <n-alert v-if="error" type="error" :show-icon="false" style="margin: 10px 0">{{ error }}</n-alert>

      <template v-if="outputUrl">
        <n-h3 style="margin: 16px 0 8px">转换结果({{ outputName }},{{ formatBytes(outputSize) }})</n-h3>
        <div style="text-align: center">
          <img
            :src="outputUrl"
            alt="gif"
            style="max-width: 100%; max-height: 360px; border: 1px solid rgba(128, 128, 128, 0.3)"
          />
        </div>
        <n-space justify="center" style="margin-top: 12px">
          <n-button type="primary" secondary @click="downloadOutput">下载</n-button>
          <n-button secondary @click="clearOutput">删除</n-button>
        </n-space>
      </template>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo } from 'naive-ui';
import { useMessage } from 'naive-ui';
import { Movie } from '@vicons/tabler';
import { formatBytes } from '@/utils/image-encode';
import { extOf, getFFmpeg } from '../_media/ffmpeg-loader';

const MovieIcon = Movie;
const message = useMessage();

const videoEl = ref<HTMLVideoElement | null>(null);
const file = ref<File | null>(null);
const fileUrl = ref('');
const duration = ref(0);
const range = ref<[number, number]>([0, 0]);
const fps = ref(10);
const width = ref<number | 'custom'>(480);
const customWidth = ref(480);
const colors = ref(256);
const loop = ref('0');
const processing = ref(false);
const stage = ref(0);
const stagePercent = ref(0);
const error = ref('');
const outputUrl = ref('');
const outputName = ref('');
const outputSize = ref(0);

let previewing = false;
let prevRange: [number, number] = [0, 0];

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
const stageText = computed(() =>
  stage.value === 1 ? `正在生成调色板...${stagePercent.value}%` : `正在编码 GIF...${stagePercent.value}%`,
);

function fmtSec(t: number): string {
  if (!isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = s.toFixed(1).padStart(4, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

function onPick({ file: f }: { file: UploadFileInfo }) {
  if (!f?.file) return false;
  reset();
  file.value = f.file as File;
  fileUrl.value = URL.createObjectURL(file.value);
  return false;
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

async function start() {
  if (!file.value || !duration.value) return;
  error.value = '';
  clearOutput();
  processing.value = true;

  const inExt = extOf(file.value.name) || 'mp4';
  const inName = 'input.' + inExt;
  const outName = file.value.name.replace(/\.[^.]+$/, '') + '.gif';
  const startT = Math.max(0, range.value[0]);
  const durT = Math.max(0.1, range.value[1] - range.value[0]);
  const w = width.value === 'custom' ? Math.round(customWidth.value || 480) : width.value;
  const chain = [`fps=${fps.value}`];
  if (w) chain.push(`scale=${w}:-1:flags=lanczos`);
  const base = chain.join(',');
  const vf1 = `${base},palettegen=max_colors=${colors.value}:stats_mode=diff`;
  const vf2 = `${base}[x];[x][1:v]paletteuse=dither=sierra2_4a:diff_mode=rectangle`;
  const args1 = ['-ss', startT.toFixed(3), '-t', durT.toFixed(3), '-i', inName, '-vf', vf1, '-y', 'palette.png'];
  const args2 = [
    '-ss',
    startT.toFixed(3),
    '-t',
    durT.toFixed(3),
    '-i',
    inName,
    '-i',
    'palette.png',
    '-lavfi',
    vf2,
    '-loop',
    loop.value,
    '-y',
    outName,
  ];

  let ffmpeg = null;
  const onProgress = ({ progress }: { progress: number }) => {
    const p = Math.max(0, Math.min(1, progress || 0));
    stagePercent.value = Math.round(p * 100);
  };
  try {
    ffmpeg = await getFFmpeg();
    ffmpeg.on('progress', onProgress);
    const data = new Uint8Array(await file.value.arrayBuffer());
    await ffmpeg.writeFile(inName, data);
    stage.value = 1;
    stagePercent.value = 0;
    await ffmpeg.exec(args1);
    stage.value = 2;
    stagePercent.value = 0;
    await ffmpeg.exec(args2);
    const out = (await ffmpeg.readFile(outName)) as Uint8Array;
    outputUrl.value = URL.createObjectURL(new Blob([out], { type: 'image/gif' }));
    outputName.value = outName;
    outputSize.value = out.length;
    message.success('转换完成');
  } catch (e) {
    error.value = (e as Error)?.message || '转换失败,请尝试缩短选区或降低尺寸/帧率';
  } finally {
    if (ffmpeg) {
      ffmpeg.off('progress', onProgress);
      try {
        await ffmpeg.deleteFile(inName);
      } catch {
        // ignore
      }
      try {
        await ffmpeg.deleteFile('palette.png');
      } catch {
        // ignore
      }
      try {
        await ffmpeg.deleteFile(outName);
      } catch {
        // ignore
      }
    }
    processing.value = false;
    stage.value = 0;
    stagePercent.value = 0;
  }
}

function downloadOutput() {
  const a = document.createElement('a');
  a.href = outputUrl.value;
  a.download = outputName.value;
  a.click();
}

function clearOutput() {
  if (outputUrl.value) URL.revokeObjectURL(outputUrl.value);
  outputUrl.value = '';
  outputName.value = '';
  outputSize.value = 0;
}

function reset() {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value);
  clearOutput();
  file.value = null;
  fileUrl.value = '';
  duration.value = 0;
  range.value = [0, 0];
  prevRange = [0, 0];
  error.value = '';
}
</script>
