<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 16px">
      说明:可生成指定字符集的随机字符串,常用于令牌、验证码、临时 ID 等;可批量生成。
    </n-alert>

    <n-form label-placement="left" label-width="160" :show-feedback="false">
      <n-form-item label="使用字符">
        <n-space :size="24" align="center">
          <n-checkbox v-model:checked="useLower">小写 a-z</n-checkbox>
          <n-checkbox v-model:checked="useUpper">大写 A-Z</n-checkbox>
          <n-checkbox v-model:checked="useNumber">数字 0-9</n-checkbox>
          <n-checkbox v-model:checked="useSymbol">符号 !@#等</n-checkbox>
        </n-space>
      </n-form-item>

      <n-form-item label="生成数量">
        <n-input-number v-model:value="count" :min="1" :max="10000" style="width: 200px" />
      </n-form-item>

      <n-form-item label="字符串长度">
        <n-space align="center" :size="6">
          <n-input-number v-model:value="length" :min="1" :max="1000000" style="width: 160px" />
          <n-text style="padding: 0 4px">-</n-text>
          <n-input-number v-model:value="lengthMax" :min="1" :max="1000000" style="width: 160px" placeholder="可选" />
        </n-space>
      </n-form-item>

      <n-form-item label="排除字符">
        <n-input v-model:value="exclude" placeholder="可选,如 0O1lI" style="max-width: 480px" />
      </n-form-item>

      <n-space justify="center" style="margin: 12px 0 16px">
        <n-button type="primary" @click="generate">生成</n-button>
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
        font-size: 16px;
        line-height: 24px;
        background-color: rgba(128, 128, 128, 0.08);
        border: 1px solid rgba(128, 128, 128, 0.25);
        border-radius: 4px;
        padding: 12px 14px;
      "
    >
      {{ result || '点击"生成"生成结果' }}
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useCopy } from '@/composable/copy';
import { type CharsetName, generateBatch } from '../password-generator/password-generator.service';

const useLower = ref(true);
const useUpper = ref(true);
const useNumber = ref(true);
const useSymbol = ref(false);
const count = ref(1);
const length = ref(32);
const lengthMax = ref<number | null>(null);
const exclude = ref('');
const result = ref('');

const message = useMessage();

function selectedCharsets(): CharsetName[] {
  const charsets: CharsetName[] = [];
  if (useLower.value) charsets.push('lower');
  if (useUpper.value) charsets.push('upper');
  if (useNumber.value) charsets.push('number');
  if (useSymbol.value) charsets.push('symbol');
  return charsets;
}

function generate() {
  const { values, warning } = generateBatch({
    charsets: selectedCharsets(),
    exclude: exclude.value,
    length: length.value,
    lengthMax: lengthMax.value,
    count: count.value,
  });
  if (warning) message.warning(warning);
  if (values.length === 0) return;

  const joined = values.join('\n');
  if (joined.length > 100000) {
    result.value = '';
    downloadText(joined, 'random-string.txt');
    message.info('结果较大,已直接下载到本地');
  } else {
    result.value = joined;
  }
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  // Revoke later: revoking right after click() can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const { copy: copyResult } = useCopy({ source: result, text: '已复制到剪贴板' });
function copy() {
  if (!result.value) return;
  copyResult();
}
function download() {
  if (!result.value) return;
  downloadText(result.value, 'random-string.txt');
}
function clear() {
  result.value = '';
}

generate();
</script>
