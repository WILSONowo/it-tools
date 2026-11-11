<template>
  <n-card>
    <n-grid x-gap="12" y-gap="12" cols="1 600:3">
      <n-gi span="2">
        <n-form :show-feedback="false">
          <n-form-item label="文本" label-placement="top">
            <n-input v-model:value="text" type="textarea" :autosize="{ minRows: 3 }" placeholder="链接或文本..." />
          </n-form-item>
          <n-grid y-gap="16" cols="2" x-gap="12" responsive="screen">
            <n-gi>
              <n-form-item label="前景色(图案)" label-placement="top">
                <n-color-picker v-model:value="foreground" :modes="['hex']" style="width: 100%" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="背景色" label-placement="top">
                <n-color-picker v-model:value="background" :modes="['hex']" style="width: 100%" />
              </n-form-item>
            </n-gi>
          </n-grid>
          <n-form-item label="容错级别" label-placement="top" style="margin: 16px 0 0">
            <n-select
              v-model:value="errorCorrectionLevel"
              :options="errorCorrectionLevels.map((value) => ({ label: errorCorrectionLabels[value], value }))"
            />
          </n-form-item>
        </n-form>
      </n-gi>
      <n-gi>
        <n-space justify="center" align="center" vertical style="height: 100%">
          <n-image :src="qrcode" width="200" />
          <n-button secondary @click="download">下载二维码</n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { ref } from 'vue';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { useQRCode } from './useQRCode';

const foreground = ref('#000000ff');
const background = ref('#ffffffff');
const errorCorrectionLevel = ref<QRCodeErrorCorrectionLevel>('medium');

const errorCorrectionLabels: Record<string, string> = {
  low: '低 (约 7%)',
  medium: '中 (约 15%)',
  quartile: '较高 (约 25%)',
  high: '高 (约 30%)',
};

const errorCorrectionLevels = ['low', 'medium', 'quartile', 'high'];

const text = ref('https://it-tools.tech');
const { qrcode } = useQRCode({
  text,
  color: {
    background,
    foreground,
  },
  errorCorrectionLevel,
  options: { width: 1024 },
});

const { download } = useDownloadFileFromBase64({ source: qrcode, filename: 'qr-code.png' });
</script>
