<template>
  <n-space vertical :size="16">
    <n-form label-placement="left" label-width="60" :show-feedback="false">
      <n-grid y-gap="16" cols="2 700:4" x-gap="12" responsive="screen">
        <n-gi>
          <n-form-item label="类型">
            <n-select v-model:value="type" :options="typeOptions" style="min-width: 140px" />
          </n-form-item>
        </n-gi>
        <n-gi v-if="type === 'uuid'">
          <n-form-item label="版本">
            <n-select v-model:value="version" :options="versionOptions" style="min-width: 110px" />
          </n-form-item>
        </n-gi>
        <n-gi v-else>
          <div style="min-height: 34px" />
        </n-gi>
        <n-gi>
          <n-form-item label="数量">
            <n-input-number v-model:value="count" :min="1" :max="500" style="width: 100%" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>

    <n-space align="center" :wrap="true" :size="16" justify="center">
      <n-checkbox v-model:checked="uppercase">大写</n-checkbox>
      <n-checkbox v-model:checked="hyphens">带连字符</n-checkbox>
      <n-checkbox v-model:checked="braces">带花括号</n-checkbox>
      <n-button type="primary" secondary @click="refreshUUIDs">生成</n-button>
      <n-button secondary @click="copy">复制</n-button>
    </n-space>

    <div>
      <n-text depth="2" style="display: block; margin-bottom: 6px">生成的 UUID</n-text>
      <n-input
        style="text-align: left; font-family: 'Consolas', monospace; font-size: 15px"
        :value="uuids"
        type="textarea"
        placeholder="生成的 UUID..."
        :autosize="{ minRows: 4, maxRows: 16 }"
        readonly
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
    </div>
  </n-space>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { v4 as uuidV4, v1 as uuidV1 } from 'uuid';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { ref } from 'vue';

const count = ref(10);
const type = ref<'uuid' | 'ulid' | 'nano' | 'uuidv7'>('uuid');
const version = ref<'v1' | 'v4'>('v4');
const uppercase = ref(false);
const hyphens = ref(true);
const braces = ref(false);

const typeOptions = [
  { label: 'UUID', value: 'uuid' },
  { label: 'ULID', value: 'ulid' },
  { label: 'NanoID', value: 'nano' },
  { label: 'UUIDv7', value: 'uuidv7' },
];

const versionOptions = [
  { label: 'v1', value: 'v1' },
  { label: 'v4', value: 'v4' },
];

function formatUuid(value: string) {
  const noHyphens = hyphens.value ? value : value.replace(/-/g, '');
  const withCase = uppercase.value ? noHyphens.toUpperCase() : noHyphens.toLowerCase();
  return braces.value ? `{${withCase}}` : withCase;
}

function randomBytes(count: number): Uint8Array {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj?.getRandomValues) {
    return cryptoObj.getRandomValues(new Uint8Array(count));
  }
  return new Uint8Array(count).map(() => Math.floor(Math.random() * 256));
}

function generateUlid(): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const time = Date.now();
  const timePart = time.toString(36).toUpperCase();
  const buffer = randomBytes(16);
  let randomness = '';
  for (let i = 0; i < 16 - timePart.length; i++) {
    randomness += alphabet[buffer[i] % 32];
  }
  const value = `${timePart}${randomness}`.slice(0, 26);
  return uppercase.value ? value : value.toLowerCase();
}

function generateUuidV7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;
  const random = randomBytes(10);
  bytes[6] = 0x70 | (random[0] & 0x0f);
  bytes[7] = random[1];
  bytes[8] = 0x80 | (random[2] & 0x3f);
  bytes.set(random.slice(3), 9);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const value = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return formatUuid(value);
}

function generateNanoId(): string {
  const alphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
  const length = 21;
  const buffer = randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[buffer[i] % 64];
  }
  return id;
}

function generateOne(): string {
  if (type.value === 'uuid') {
    const raw = version.value === 'v1' ? uuidV1() : uuidV4();
    return formatUuid(raw);
  }
  if (type.value === 'ulid') return generateUlid();
  if (type.value === 'uuidv7') return generateUuidV7();
  return generateNanoId();
}

const [uuids, refreshUUIDs] = computedRefreshable(() =>
  Array.from({ length: count.value }, () => generateOne()).join('\n'),
);

const { copy } = useCopy({ source: uuids, text: '已复制到剪贴板' });
</script>
