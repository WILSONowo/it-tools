<template>
  <n-card title="随机 JSON 数据生成器">
    <n-grid y-gap="16" cols="1 700:2" x-gap="20" responsive="screen">
      <n-gi>
        <n-form label-placement="top" :show-feedback="false">
          <n-form-item label="根类型">
            <n-select v-model:value="rootType" :options="typeOptions" />
          </n-form-item>

          <template v-if="rootType !== 'array'">
            <n-form-item label="字段数量" style="margin-top: 16px">
              <n-input-number v-model:value="fieldCount" :min="1" :max="30" style="width: 100%" />
            </n-form-item>
          </template>

          <n-form-item v-if="rootType === 'array'" label="数组长度" style="margin-top: 16px">
            <n-input-number v-model:value="arrayLength" :min="1" :max="200" style="width: 100%" />
          </n-form-item>

          <n-form-item label="最大嵌套深度" style="margin-top: 16px">
            <n-input-number v-model:value="depth" :min="1" :max="4" style="width: 100%" />
          </n-form-item>

          <n-form-item label="字段类型" style="margin-top: 16px">
            <n-select v-model:value="fieldType" :options="fieldOptions" multiple />
          </n-form-item>

          <n-space justify="center" style="margin-top: 16px">
            <n-button type="primary" @click="generate">生成</n-button>
            <n-button secondary @click="minified = !minified">{{ minified ? '格式化' : '压缩' }}</n-button>
          </n-space>
        </n-form>
      </n-gi>

      <n-gi>
        <n-form-item label="输出" label-placement="top">
          <n-input
            :value="output"
            type="textarea"
            :autosize="{ minRows: 14 }"
            readonly
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-space justify="center" style="margin-top: 12px">
          <n-button secondary @click="copy">复制</n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { random, randIntFromInterval } from '@/utils/random';

const rootType = ref<'object' | 'array'>('object');
const fieldCount = ref(5);
const arrayLength = ref(5);
const depth = ref(2);
const fieldType = ref<string[]>(['string', 'number', 'boolean']);
const minified = ref(false);
const output = ref('');

const typeOptions = [
  { label: '对象', value: 'object' },
  { label: '对象数组', value: 'array' },
];

const fieldOptions = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔值', value: 'boolean' },
  { label: '日期/ISO', value: 'date' },
  { label: '邮箱', value: 'email' },
  { label: 'UUID', value: 'uuid' },
  { label: 'Null', value: 'null' },
];

function randomString(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const length = randIntFromInterval(4, 12);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet[randIntFromInterval(0, alphabet.length - 1)];
  }

  return result;
}

function randomValue(type: string, currentDepth: number): unknown {
  if (currentDepth <= 0 || type === 'string') return randomString();
  if (type === 'number') return randIntFromInterval(-9999, 99999);
  if (type === 'boolean') return random() > 0.5;
  if (type === 'date') return new Date(randIntFromInterval(0, Date.now())).toISOString();
  if (type === 'email') return `${randomString()}@${randomString()}.com`;
  if (type === 'uuid') {
    const chars = '0123456789abcdef';
    let uuid = '';
    for (let i = 0; i < 32; i++) {
      uuid += chars[randIntFromInterval(0, 15)];
      if ([8, 12, 16, 20].includes(i)) uuid += '-';
    }

    return uuid;
  }
  if (type === 'null') return null;
  if (type === 'array') {
    const length = randIntFromInterval(1, 3);
    return Array.from({ length }, () =>
      randomValue(fieldType.value[randIntFromInterval(0, fieldType.value.length - 1)], currentDepth - 1),
    );
  }
  if (random() > 0.3) return randomString();

  return null;
}

function randomObject(currentDepth: number): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  const count = currentDepth >= depth.value ? Math.min(fieldCount.value, 3) : fieldCount.value;
  for (let i = 0; i < count; i++) {
    const type = fieldType.value[randIntFromInterval(0, fieldType.value.length - 1)];
    obj[`field${i + 1}_${randomString().slice(0, 3)}`] = randomValue(type, currentDepth);
  }

  return obj;
}

function generate() {
  const types = fieldType.value.length > 0 ? fieldType.value : ['string'];
  if (rootType.value === 'array') {
    output.value = JSON.stringify(
      Array.from({ length: arrayLength.value }, () => randomObject(depth.value)),
      null,
      minified.value ? 0 : 2,
    );
  } else {
    output.value = JSON.stringify(randomObject(depth.value), null, minified.value ? 0 : 2);
  }
}

generate();

const { copy } = useCopy({ source: output, text: 'JSON 已复制到剪贴板' });
</script>
