<template>
  <n-card>
    <n-form label-placement="top">
      <n-form-item label="内容">
        <n-input v-model:value="content" placeholder="输入要编码的内容" style="font-family: monospace" />
      </n-form-item>
      <n-grid cols="1 700:3" x-gap="12" y-gap="4" responsive="screen">
        <n-gi>
          <n-form-item label="类型" style="margin-bottom: 6px">
            <n-select v-model:value="format" :options="formatOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="显示文本" style="margin-bottom: 6px">
            <n-switch v-model:value="displayValue" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="高度" style="margin-bottom: 6px">
            <n-input-number v-model:value="height" :min="20" :max="300" style="width: 100%" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>

    <n-space justify="center" style="margin: 8px 0 14px">
      <n-button type="primary" @click="generate">生成</n-button>
      <n-button secondary @click="downloadPng">下载 PNG</n-button>
      <n-button secondary @click="downloadSvg">下载 SVG</n-button>
    </n-space>

    <div v-if="error" style="color: #d03050; margin-bottom: 8px">{{ error }}</div>
    <div ref="svgWrap" style="text-align: center; background: #fff; padding: 12px; border-radius: 6px"></div>
  </n-card>
</template>

<script setup lang="ts">
import { get2dContext } from '@/utils/canvas';
import { onMounted, ref } from 'vue';
import JsBarcode from 'jsbarcode';
import { downloadBlob } from '../_media/file-helpers';

const content = ref('6901234567892');
const format = ref('EAN13');
const displayValue = ref(true);
const height = ref(80);
const error = ref('');
const svgWrap = ref<HTMLDivElement | null>(null);

const formatOptions = ['EAN13', 'EAN8', 'UPC', 'CODE39', 'CODE128', 'ITF14', 'MSI', 'pharmacode'].map((v) => ({
  label: v,
  value: v,
}));

function generate() {
  error.value = '';
  if (!svgWrap.value) return;
  svgWrap.value.innerHTML = '';
  if (!content.value) {
    error.value = '请输入内容';
    return;
  }
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, content.value, {
      format: format.value as 'CODE128',
      width: 2,
      height: height.value,
      displayValue: displayValue.value,
      margin: 6,
    });
    svgWrap.value.appendChild(svg);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    error.value = `内容不符合 ${format.value} 格式要求,请检查位数与字符(${detail})`;
  }
}

function downloadPng() {
  const svg = svgWrap.value?.querySelector('svg');
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.getBoundingClientRect().width * 2;
    canvas.height = svg.getBoundingClientRect().height * 2;
    const ctx = get2dContext(canvas);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'barcode.png');
      else error.value = 'PNG 导出失败';
    }, 'image/png');
  };
  img.onerror = () => {
    error.value = 'PNG 导出失败';
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

function downloadSvg() {
  const svg = svgWrap.value?.querySelector('svg');
  if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([xml], { type: 'image/svg+xml' }), 'barcode.svg');
}

onMounted(generate);
</script>
