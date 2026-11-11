<template>
  <div>
    <n-form label-placement="left" label-width="150">
      <n-space item-style="flex:1 1 0">
        <n-form-item label="宽度(px)">
          <n-input-number v-model:value="width" placeholder="SVG 宽度..." min="1" />
        </n-form-item>
        <n-form-item label="背景色">
          <n-color-picker v-model:value="bgColor" :modes="['hex']" />
        </n-form-item>
      </n-space>
      <n-space item-style="flex:1 1 0">
        <n-form-item label="高度(px)">
          <n-input-number v-model:value="height" placeholder="SVG 高度..." min="1" />
        </n-form-item>
        <n-form-item label="文字颜色">
          <n-color-picker v-model:value="fgColor" :modes="['hex']" />
        </n-form-item>
      </n-space>
      <n-space item-style="flex:1 1 0">
        <n-form-item label="字号">
          <n-input-number v-model:value="fontSize" placeholder="字号..." min="1" />
        </n-form-item>
        <n-form-item label="自定义文字">
          <n-input v-model:value="customText" :placeholder="`默认为 ${width}x${height}`" />
        </n-form-item>
      </n-space>
      <n-form-item label="使用精确尺寸" label-placement="left">
        <n-switch v-model:value="useExactSize" />
      </n-form-item>
    </n-form>

    <n-form-item label="SVG HTML 元素">
      <textarea-copyable :value="svgString" copy-placement="none" />
    </n-form-item>
    <n-form-item label="Base64 格式 SVG">
      <textarea-copyable :value="base64" copy-placement="none" />
    </n-form-item>

    <n-space justify="center" style="margin-top: 12px">
      <n-button secondary @click="copySVG()">复制 SVG</n-button>
      <n-button secondary @click="copyBase64()">复制 Base64</n-button>
      <n-button type="primary" secondary @click="download()">下载 SVG</n-button>
    </n-space>

    <n-divider />

    <n-text depth="2" style="display: block; margin-bottom: 6px">预览</n-text>
    <n-space vertical justify="center" align="center">
      <img :src="base64" alt="占位图" style="max-width: 100%" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useCopy } from '@/composable/copy';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { textToBase64 } from '@/utils/base64';
import { computed, ref } from 'vue';

const width = ref(600);
const height = ref(350);
const fontSize = ref(26);
const bgColor = ref('#cccccc');
const fgColor = ref('#333333');
const useExactSize = ref(true);
const customText = ref('');
const svgString = computed(() => {
  const w = width.value;
  const h = height.value;
  const rawText = customText.value.length > 0 ? customText.value : `${w}x${h}`;
  const text = rawText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const size = useExactSize.value ? ` width="${w}" height="${h}"` : '';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${size}>
  <rect width="${w}" height="${h}" fill="${bgColor.value}"></rect>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize.value}px" fill="${fgColor.value}">${text}</text>   
</svg>
  `.trim();
});
const base64 = computed(() => 'data:image/svg+xml;base64,' + textToBase64(svgString.value));

const { copy: copySVG } = useCopy({ source: svgString });
const { copy: copyBase64 } = useCopy({ source: base64 });
const { download } = useDownloadFileFromBase64({ source: base64 });
</script>

<style lang="less" scoped>
.n-input-number {
  width: 100%;
}
</style>
