<template>
  <div style="width: 100%; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; align-items: flex-start">
    <div style="flex: 1 1 360px; min-width: 300px; max-width: 520px">
      <n-card>
        <n-form label-placement="top">
          <n-form-item label="密钥" v-bind="secretValidationAttrs">
            <n-input v-model:value="secret" placeholder="粘贴TOTP 密钥...">
              <template #suffix>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button quaternary circle aria-label="生成密钥" @click="refreshSecret">
                      <n-icon :component="Refresh" />
                    </n-button>
                  </template>
                  生成密钥
                </n-tooltip>
              </template>
            </n-input>
          </n-form-item>
        </n-form>

        <div>
          <token-display :tokens="tokens" style="margin-top: 2px" />

          <n-progress :percentage="(100 * interval) / 30" :color="theme.primaryColor" :show-indicator="false" />
          <div style="text-align: center">下次更新于 {{ String(Math.floor(30 - interval)).padStart(2, '0') }} 秒后</div>
        </div>
        <n-space justify="center" vertical align="center" style="margin-top: 10px">
          <n-image :src="qrcode"></n-image>
          <n-button secondary tag="a" :href="keyUri" target="_blank">在新标签页打开密钥 URI</n-button>
        </n-space>
      </n-card>
    </div>

    <div style="flex: 1 1 360px; min-width: 300px; max-width: 520px">
      <n-card>
        <n-form label-placement="top">
          <n-form-item label="十六进制密钥">
            <input-copyable :value="base32toHex(secret)" readonly placeholder="密钥的十六进制形式将显示在这里" />
          </n-form-item>

          <n-form-item label="时间戳">
            <input-copyable
              :value="Math.floor(now / 1000).toString()"
              readonly
              placeholder="以秒为单位的时间戳将显示在这里"
            />
          </n-form-item>

          <n-form-item label="迭代次数" :show-feedback="false">
            <input-copyable
              :value="String(getCounterFromTime({ now, timeStep: 30 }))"
              readonly
              placeholder="迭代次数将显示在这里"
            />
          </n-form-item>

          <n-form-item label="迭代次数(十六进制)" :show-feedback="false">
            <input-copyable
              :value="getCounterFromTime({ now, timeStep: 30 }).toString(16).padStart(16, '0')"
              readonly
              placeholder="迭代次数的十六进制形式将显示在这里"
            />
          </n-form-item>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Refresh } from '@vicons/tabler';
import { useTimestamp } from '@vueuse/core';
import { useThemeVars } from 'naive-ui';
import { useStyleStore } from '@/stores/style.store';
import InputCopyable from '@/components/InputCopyable.vue';
import { useValidation } from '@/composable/validation';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { generateTOTP, buildKeyUri, generateSecret, base32toHex, getCounterFromTime } from './otp.service';
import { useQRCode } from '../qr-code-generator/useQRCode';
import TokenDisplay from './token-display.vue';

const now = useTimestamp();
const interval = computed(() => (now.value / 1000) % 30);
const theme = useThemeVars();
const styleStore = useStyleStore();

const secret = ref(generateSecret());

function refreshSecret() {
  secret.value = generateSecret();
}

const [tokens] = computedRefreshable(
  () => ({
    previous: generateTOTP({ key: secret.value, now: now.value - 30000 }),
    current: generateTOTP({ key: secret.value, now: now.value }),
    next: generateTOTP({ key: secret.value, now: now.value + 30000 }),
  }),
  { throttle: 500 },
);

const keyUri = computed(() => buildKeyUri({ secret: secret.value }));

const { qrcode } = useQRCode({
  text: keyUri,
  color: {
    background: computed(() => (styleStore.isDarkTheme ? '#ffffff' : '#00000000')),
    foreground: '#000000',
  },
  options: { width: 210 },
});

const { attrs: secretValidationAttrs } = useValidation({
  source: secret,
  rules: [
    {
      message: '密钥应为 Base32 字符串',
      validator: (value) => value.toUpperCase().match(/^[A-Z234567]+$/),
    },
    {
      message: '请设置密钥',
      validator: (value) => value !== '',
    },
  ],
});
</script>

<style lang="less" scoped>
.n-progress {
  margin-top: 10px;
  ::v-deep(.n-progress-graph-line-fill) {
    transition-duration: 0.05s !important;
  }
}

.token {
  text-align: center;
  &.token-current {
    font-size: 20px;
  }
}
</style>
