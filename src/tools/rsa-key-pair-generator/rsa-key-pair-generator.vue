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
    <n-alert v-if="isInsecureKeySize(bits)" type="warning" :show-icon="false" style="margin-top: 8px">
      {{ bits }} 位 RSA 密钥已不安全(512 位可在数小时内分解,1024 位已被各大标准弃用),仅可用于测试;实际使用请选择 2048
      位或以上。
    </n-alert>
    <n-alert v-if="generateError" type="error" :show-icon="false" style="margin-top: 8px">
      {{ generateError }}
    </n-alert>

    <!-- 结果区 -->
    <template v-if="certs.publicKeyPem || certs.privateKeyPem">
      <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0 10px">
        <n-h3 style="margin: 0">密钥对生成结果</n-h3>
        <n-button text type="primary" @click="downloadZip">下载 ZIP</n-button>
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
import { useCopy } from '@/composable/copy';
import { useMessage } from 'naive-ui';
import { useValidation } from '@/composable/validation';
import { generateKeyPair } from './rsa-key-pair-generator.service';
import { buildKeyPairZip, isInsecureKeySize, pemToHex } from './rsa-key-pair-export.service';

const bits = ref(2048);
const format = ref<'PEM' | 'HEX'>('PEM');
const generating = ref(false);
const generateError = ref('');

const lengthOptions = [512, 1024, 2048, 3072, 4096].map((value) => ({
  label: isInsecureKeySize(value) ? `${value}(不安全)` : `${value}`,
  value,
}));
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

// 连续点击「生成」时只保留最后一次的结果
let generateRunId = 0;

async function generate() {
  if (bitsValidationAttrs.validationStatus === 'error') return;
  const runId = ++generateRunId;
  generating.value = true;
  generateError.value = '';
  try {
    const pair = await generateKeyPair({ bits: bits.value });
    if (runId !== generateRunId) return;
    certs.value = {
      publicKeyPem: pair.publicKeyPem,
      privateKeyPem: pair.privateKeyPem,
      publicKeyHex: pemToHex(pair.publicKeyPem),
      privateKeyHex: pemToHex(pair.privateKeyPem),
    };
  } catch (e) {
    if (runId !== generateRunId) return;
    certs.value = { ...emptyCerts };
    generateError.value = `密钥生成失败:${e instanceof Error ? e.message : String(e)}`;
  } finally {
    if (runId === generateRunId) generating.value = false;
  }
}

const publicValue = computed(() => (format.value === 'PEM' ? certs.value.publicKeyPem : certs.value.publicKeyHex));
const privateValue = computed(() => (format.value === 'PEM' ? certs.value.privateKeyPem : certs.value.privateKeyHex));

const { copy: copyPub } = useCopy({ source: publicValue, text: '公钥已复制' });
const { copy: copyPriv } = useCopy({ source: privateValue, text: '私钥已复制' });
function copyPublic() {
  if (!publicValue.value) return;
  copyPub();
}
function copyPrivate() {
  if (!privateValue.value) return;
  copyPriv();
}

async function downloadZip() {
  const pub = publicValue.value;
  const priv = privateValue.value;
  if (!pub && !priv) return;
  try {
    const blob = await buildKeyPairZip({ publicKey: pub, privateKey: priv, format: format.value });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rsa-key-pair-${bits.value}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
  } catch (e) {
    message.error(`打包下载失败:${e instanceof Error ? e.message : String(e)}`);
  }
}

generate();
</script>
