<template>
  <n-card>
    <!-- 顶部参数行 -->
    <n-grid y-gap="16" cols="1 800:4" x-gap="12" responsive="screen">
      <n-gi>
        <n-form-item label="密钥长度" label-placement="top">
          <n-select v-model:value="bits" :options="lengthOptions" />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="输出格式" label-placement="top">
          <n-select v-model:value="format" :options="formatOptions" />
        </n-form-item>
      </n-gi>
      <n-gi span="2">
        <n-space align="end" style="height: 100%">
          <n-button type="primary" :loading="generating" @click="generate">生成</n-button>
        </n-space>
      </n-gi>
    </n-grid>

    <n-alert
      v-if="bitsValidationAttrs.validationStatus === 'error'"
      type="error"
      :show-icon="false"
      style="margin-top: 8px"
    >
      {{ bitsValidationAttrs.feedback }}
    </n-alert>

    <!-- 结果区 -->
    <template v-if="certs.publicKeyPem || certs.privateKeyPem">
      <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0 10px">
        <n-h3 style="margin: 0">密钥对生成结果</n-h3>
        <n-button text type="primary" @click="downloadZip">下载</n-button>
      </div>

      <n-form-item label="公钥" label-placement="top" style="margin: 0 0 14px">
        <n-input
          :value="format === 'PEM' ? certs.publicKeyPem : certs.publicKeyHex"
          type="textarea"
          readonly
          :autosize="{ minRows: 6 }"
          spellcheck="false"
          style="font-family: monospace; font-size: 12px"
        />
      </n-form-item>
      <n-form-item label="私钥" label-placement="top">
        <n-input
          :value="format === 'PEM' ? certs.privateKeyPem : certs.privateKeyHex"
          type="textarea"
          readonly
          :autosize="{ minRows: 8 }"
          spellcheck="false"
          style="font-family: monospace; font-size: 12px"
        />
      </n-form-item>
      <n-space justify="center" style="margin-top: 14px">
        <n-button secondary @click="copyPublic">复制公钥</n-button>
        <n-button secondary @click="copyPrivate">复制私钥</n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { useValidation } from '@/composable/validation';
import { withDefaultOnErrorAsync } from '@/utils/defaults';
import { generateKeyPair } from './rsa-key-pair-generator.service';

const bits = ref(2048);
const format = ref<'PEM' | 'HEX'>('PEM');
const generating = ref(false);

const lengthOptions = [512, 1024, 2048, 3072, 4096].map((value) => ({ label: `${value}`, value }));
const formatOptions = [
  { label: 'PEM', value: 'PEM' },
  { label: 'HEX', value: 'HEX' },
];

const message = useMessage();
const emptyCerts = { publicKeyPem: '', privateKeyPem: '', publicKeyHex: '', privateKeyHex: '' };
const certs = ref({ ...emptyCerts });

const { attrs: bitsValidationAttrs } = useValidation({
  source: bits,
  rules: [
    {
      message: '请选择有效的密钥长度',
      validator: (value) => lengthOptions.some((o) => o.value === value),
    },
  ],
});

function pemToHex(pem: string): string {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bytes = atob(body);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes.charCodeAt(i).toString(16).padStart(2, '0');
  return hex;
}

async function generate() {
  if (bitsValidationAttrs.validationStatus === 'error') return;
  generating.value = true;
  try {
    const pair = await withDefaultOnErrorAsync(() => generateKeyPair({ bits: bits.value }), {
      publicKeyPem: '',
      privateKeyPem: '',
    });
    certs.value = {
      publicKeyPem: pair.publicKeyPem,
      privateKeyPem: pair.privateKeyPem,
      publicKeyHex: pair.publicKeyPem ? pemToHex(pair.publicKeyPem) : '',
      privateKeyHex: pair.privateKeyPem ? pemToHex(pair.privateKeyPem) : '',
    };
  } finally {
    generating.value = false;
  }
}

const publicValue = computed(() => (format.value === 'PEM' ? certs.value.publicKeyPem : certs.value.publicKeyHex));
const privateValue = computed(() => (format.value === 'PEM' ? certs.value.privateKeyPem : certs.value.privateKeyHex));

const { copy: copyPub } = useClipboard({ source: publicValue });
const { copy: copyPriv } = useClipboard({ source: privateValue });
function copyPublic() {
  if (!publicValue.value) return;
  copyPub();
  message.success('公钥已复制');
}
function copyPrivate() {
  if (!privateValue.value) return;
  copyPriv();
  message.success('私钥已复制');
}

function downloadZip() {
  const pub = publicValue.value;
  const priv = privateValue.value;
  if (!pub && !priv) return;
  const content = `public key:\n\n${pub}\n\nprivate key:\n\n${priv}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'rsa-key-pair.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

generate();
</script>
