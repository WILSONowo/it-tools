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

          <n-form-item label="最大嵌套深度(1 = 不嵌套)" style="margin-top: 16px">
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
import { generateRandomJson } from './random-json-data-generator.service';

const rootType = ref<'object' | 'array'>('object');
const fieldCount = ref<number | null>(5);
const arrayLength = ref<number | null>(5);
const depth = ref<number | null>(2);
const fieldType = ref<string[]>(['string', 'number', 'boolean']);
const minified = ref(false);
const data = ref<unknown>(null);
const output = computed(() => (data.value === null ? '' : JSON.stringify(data.value, null, minified.value ? 0 : 2)));

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

function generate() {
  data.value = generateRandomJson({
    rootType: rootType.value,
    fieldCount: fieldCount.value ?? 5,
    arrayLength: arrayLength.value ?? 5,
    depth: depth.value ?? 1,
    fieldTypes: fieldType.value,
  });
}

generate();

const { copy } = useCopy({ source: output, text: 'JSON 已复制到剪贴板' });
</script>
