<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      说明:请您妥善保管随机生成的密码,本站不会以任何方式存储生成的密码。
    </n-alert>

    <n-form label-placement="left" label-width="160" :show-feedback="false" class="password-form">
      <n-form-item label="使用字符">
        <n-space :size="24" align="center">
          <n-checkbox v-model:checked="useLower">小写 a-z</n-checkbox>
          <n-checkbox v-model:checked="useUpper">大写 A-Z</n-checkbox>
          <n-checkbox v-model:checked="useNumber">数字 0-9</n-checkbox>
          <n-checkbox v-model:checked="useSymbol">符号 !@#等</n-checkbox>
        </n-space>
      </n-form-item>

      <n-form-item label="生成数量">
        <n-input-number v-model:value="count" :min="1" :max="1000000" style="width: 200px" />
      </n-form-item>

      <n-form-item label="密码长度">
        <n-space align="center" :size="6">
          <n-input-number v-model:value="length" :min="1" :max="1000000" style="width: 160px" />
          <n-text style="padding: 0 4px">-</n-text>
          <n-input-number v-model:value="lengthMax" :min="1" :max="1000000" style="width: 160px" placeholder="可选" />
        </n-space>
        <n-text depth="3" style="font-size: 12px; margin-left: 8px">
          留空则按左侧单值;填写上限后,每个密码长度在区间内随机
        </n-text>
      </n-form-item>

      <n-form-item label="包含字符">
        <n-input v-model:value="include" placeholder="可选" style="max-width: 480px" />
      </n-form-item>

      <n-form-item label="排除字符">
        <n-input v-model:value="exclude" placeholder="可选" style="max-width: 480px" />
      </n-form-item>

      <n-space justify="center" style="margin: 12px 0 16px">
        <n-button type="primary" @click="generate">生成密码</n-button>
        <n-button secondary :disabled="!result" @click="copy">复制结果</n-button>
        <n-button secondary :disabled="!result" @click="download">下载</n-button>
        <n-button secondary @click="clear">清空</n-button>
      </n-space>
    </n-form>

    <n-text depth="2" style="display: block; margin-bottom: 6px">生成结果</n-text>
    <div
      class="result-box"
      style="
        min-height: 250px;
        max-height: 1000px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 24px;
        line-height: 32px;
        background-color: rgba(128, 128, 128, 0.08);
        border: 1px solid rgba(128, 128, 128, 0.25);
        border-radius: 4px;
        padding: 12px 14px;
      "
    >
      {{ result || '点击"生成密码"生成结果' }}
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useMessage } from 'naive-ui';
import { shuffleString } from '@/utils/random';

const useLower = ref(true);
const useUpper = ref(true);
const useNumber = ref(true);
const useSymbol = ref(false);
const count = ref(10);
const length = ref(16);
const lengthMax = ref<number | null>(null);
const include = ref('');
const exclude = ref('0oO1iIlLq9g');
const result = ref('');

const LOWERSET = 'abcdefghijklmnopqrstuvwxyz';
const UPPERSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERSET = '0123456789';
const SYMBOLSET = '!@#$%^&*()-_=+[]{};:,.<>?/~';

const message = useMessage();

function buildAlphabet(): string {
  let pool = '';
  if (useLower.value) pool += LOWERSET;
  if (useUpper.value) pool += UPPERSET;
  if (useNumber.value) pool += NUMBERSET;
  if (useSymbol.value) pool += SYMBOLSET;
  if (include.value) pool += include.value;
  if (exclude.value) {
    for (const ch of exclude.value) pool = pool.split(ch).join('');
  }
  return [...new Set(pool.split(''))].join('');
}

function randomLen(): number {
  if (lengthMax.value && lengthMax.value >= length.value) {
    return length.value + Math.floor(Math.random() * (lengthMax.value - length.value + 1));
  }
  return length.value;
}

function generateOne(pool: string): string {
  const len = randomLen();
  const chars = pool.split('');
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  for (const ch of include.value) {
    const idx = Math.floor(Math.random() * len);
    out = out.slice(0, idx) + ch + out.slice(idx + 1);
  }
  return shuffleString(out);
}

function generate() {
  const pool = buildAlphabet();
  if (pool.length === 0) {
    message.warning('请至少选择一种字符');
    return;
  }
  const seen = new Set<string>();
  const list: string[] = [];
  let guard = 0;
  const cap = Math.max(count.value * 50 + 500, 5000);
  while (list.length < count.value && guard < cap) {
    const pwd = generateOne(pool);
    guard++;
    if (!pwd) continue;
    if (seen.has(pwd)) continue;
    seen.add(pwd);
    list.push(pwd);
  }
  const joined = list.join('\n');
  if (joined.length > 100000) {
    result.value = '';
    downloadText(joined, 'randompassword.txt');
    message.info('结果较大,已直接下载到本地');
  } else {
    result.value = joined;
  }
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const { copy: copyText } = useClipboard({ source: result });
function copy() {
  if (!result.value) return;
  copyText();
  message.success('已复制到剪贴板');
}
function download() {
  if (!result.value) return;
  downloadText(result.value, 'randompassword.txt');
}
function clear() {
  result.value = '';
}

generate();
</script>

<style scoped>
.password-form :deep(.n-form-item) {
  margin-bottom: 20px;
}

.password-form :deep(.n-form-item:last-of-type) {
  margin-bottom: 4px;
}
</style>
