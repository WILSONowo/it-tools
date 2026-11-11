<template>
  <n-card title="随机数生成器">
    <n-form label-placement="left" label-width="150">
      <n-space>
        <n-form-item label="数字类型">
          <n-radio-group v-model:value="numType">
            <n-radio-button value="int">整数</n-radio-button>
            <n-radio-button value="float">浮点数</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item v-if="numType === 'float'" label="小数位数">
          <n-input-number v-model:value="decimals" :min="1" :max="20" style="width: 120px" />
        </n-form-item>
      </n-space>

      <n-space>
        <n-form-item label="最小值">
          <n-input-number v-model:value="min" style="width: 180px" />
        </n-form-item>
        <n-form-item label="最大值(不含)">
          <n-input-number v-model:value="max" style="width: 180px" />
        </n-form-item>
        <n-form-item label="生成数量">
          <n-input-number v-model:value="count" :min="1" :max="10000" style="width: 120px" />
        </n-form-item>
      </n-space>

      <n-space>
        <n-form-item label="数字唯一">
          <n-radio-group v-model:value="unique">
            <n-radio-button :value="true">唯一</n-radio-button>
            <n-radio-button :value="false">不唯一</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="排序">
          <n-select v-model:value="sort" :options="sortOptions" style="width: 120px" />
        </n-form-item>
      </n-space>

      <n-form-item label="结果分隔符">
        <n-radio-group v-model:value="separator">
          <!-- A static value="\n" would be a literal backslash + n, not a newline -->
          <n-radio-button :value="'\n'">换行</n-radio-button>
          <n-radio-button value=",">,</n-radio-button>
          <n-radio-button value=" ">空格</n-radio-button>
          <n-radio-button value="custom">自定义</n-radio-button>
        </n-radio-group>
        <n-input
          v-if="separator === 'custom'"
          v-model:value="customSeparator"
          placeholder="自定义分隔符"
          style="max-width: 160px; margin-left: 8px"
        />
      </n-form-item>
    </n-form>

    <n-input
      :value="output"
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 16 }"
      readonly
      placeholder="生成结果..."
      style="font-family: monospace"
      spellcheck="false"
    />

    <n-space justify="center" style="margin-top: 16px">
      <n-button type="primary" secondary @click="generate">生成</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制结果</n-button>
      <n-button secondary :disabled="!output" @click="download">下载到文件</n-button>
      <n-button secondary @click="output = ''">清空</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { useMessage } from 'naive-ui';
import { generateRandomNumbers } from './random-number-generator.service';

const numType = ref<'int' | 'float'>('int');
const decimals = ref<number | null>(4);
const min = ref<number | null>(1);
const max = ref<number | null>(100);
const count = ref<number | null>(10);
const unique = ref(true);
const sort = ref('none');
const separator = ref<string>('\n');
const customSeparator = ref('|');
const output = ref('');

const sortOptions = [
  { label: '无序', value: 'none' },
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
];

const message = useMessage();

function generate() {
  const result = generateRandomNumbers({
    type: numType.value,
    decimals: decimals.value ?? 0,
    min: min.value as number,
    max: max.value as number,
    count: count.value as number,
    unique: unique.value,
  });
  if (!result.ok) {
    message.warning(result.error);
    return;
  }
  const list = result.values;
  if (sort.value === 'asc') list.sort((a, b) => Number(a) - Number(b));
  if (sort.value === 'desc') list.sort((a, b) => Number(b) - Number(a));
  const sep = separator.value === 'custom' ? customSeparator.value : separator.value;
  output.value = list.join(sep);
}

const { copy: copyText } = useCopy({ source: output, text: '已复制到剪贴板' });
function copy() {
  if (!output.value) return;
  copyText();
}

function download() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'random-numbers.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

generate();
</script>
