<template>
  <n-card v-for="{ name, information } in sections" :key="name" :title="name">
    <n-form label-placement="top" :show-feedback="false">
      <n-grid cols="1 400:2" x-gap="16" y-gap="8" responsive="screen">
        <n-gi v-for="{ label, value: { value } } in information" :key="label">
          <n-form-item :label="label" style="margin-bottom: 8px">
            <n-input
              :value="value ?? ''"
              readonly
              placeholder="未知"
              :input-props="{ 'data-test-id': `device-information-${label}` }"
            />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

const { width, height } = useWindowSize();

// screen.orientation is undefined on Safari < 16.4: fall back to media queries / window.orientation
function getOrientationType(): string | null {
  const orientation = window.screen.orientation as ScreenOrientation | undefined;
  if (orientation?.type) {
    return orientation.type;
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }
  return null;
}

function getOrientationAngle(): number | null {
  const orientation = window.screen.orientation as ScreenOrientation | undefined;
  if (orientation && typeof orientation.angle === 'number') {
    return orientation.angle;
  }
  const legacyAngle = (window as { orientation?: unknown }).orientation;
  return typeof legacyAngle === 'number' ? legacyAngle : null;
}

const sections = [
  {
    name: '屏幕',
    information: [
      {
        label: '屏幕尺寸',
        value: computed(() => `${window.screen.width} x ${window.screen.height}`),
      },
      {
        label: '可用屏幕尺寸(不含任务栏/Dock)',
        value: computed(() => `${window.screen.availWidth} x ${window.screen.availHeight}`),
      },
      {
        label: '方向',
        value: computed(() => getOrientationType()),
      },
      {
        label: '方向角度',
        value: computed(() => {
          const angle = getOrientationAngle();
          return angle === null ? null : `${angle}°`;
        }),
      },
      {
        label: '色彩深度',
        value: computed(() => `${window.screen.colorDepth} bits`),
      },
      {
        label: '像素比',
        value: computed(() => `${window.devicePixelRatio} dppx`),
      },
      {
        label: '窗口大小',
        value: computed(() => `${width.value} x ${height.value}`),
      },
    ],
  },
  {
    name: '设备',
    information: [
      {
        label: '浏览器厂商',
        value: computed(() => navigator.vendor),
      },
      {
        label: '语言',
        value: computed(() => navigator.languages.join(', ')),
      },
      {
        label: '平台',
        value: computed(() => navigator.platform),
      },
      {
        label: '用户代理',
        value: computed(() => navigator.userAgent),
      },
    ],
  },
];
</script>

<style lang="less" scoped>
.information {
  .label {
    font-size: 14px;
    opacity: 0.8;
    line-height: 1;
    margin-bottom: 5px;
  }
  .value {
    font-size: 20px;
    font-weight: 400;
  }

  .undefined-value {
    opacity: 0.8;
  }
}
</style>
