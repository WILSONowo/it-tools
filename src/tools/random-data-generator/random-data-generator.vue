<template>
  <n-card>
    <n-form label-placement="left" label-width="140" :show-feedback="false">
      <n-form-item label="数据类型">
        <n-select v-model:value="kind" :options="kindOptions" style="max-width: 320px" />
      </n-form-item>

      <template v-if="kind === 'integer' || kind === 'float'">
        <n-grid y-gap="16" cols="2 700:4" x-gap="12" responsive="screen">
          <n-gi>
            <n-form-item label="最小值">
              <n-input-number v-model:value="min" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="最大值">
              <n-input-number v-model:value="max" style="width: 100%" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </template>

      <template v-if="kind === 'hex' || kind === 'string' || kind === 'password'">
        <n-form-item label="长度">
          <n-input-number v-model:value="length" :min="1" :max="256" style="width: 140px" />
        </n-form-item>
      </template>

      <template v-if="kind === 'date'">
        <n-form-item label="开始日期">
          <n-date-picker v-model:value="startTs" type="datetime" style="width: 220px" />
        </n-form-item>
        <n-form-item label="结束日期">
          <n-date-picker v-model:value="endTs" type="datetime" style="width: 220px" />
        </n-form-item>
      </template>

      <n-form-item label="数量">
        <n-input-number v-model:value="quantity" :min="1" :max="500" style="width: 140px" />
      </n-form-item>

      <n-form-item label="唯一值">
        <n-switch v-model:value="unique" />
      </n-form-item>
    </n-form>

    <n-text depth="2" style="display: block; margin-bottom: 6px">生成结果</n-text>
    <n-input
      :value="output"
      type="textarea"
      :autosize="{ minRows: 8, maxRows: 20 }"
      readonly
      placeholder="点击生成按钮生成数据..."
      spellcheck="false"
      style="font-family: monospace"
    />

    <n-space justify="center" style="margin-top: 16px">
      <n-button type="primary" @click="generate">生成</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { format } from 'date-fns';
import { randIntFromInterval, randomDecimal, randomUuid } from '@/utils/random';
import { createToken } from '../token-generator/token-generator.service';
import { randomIpv4 } from '../random-ip-generator/random-ip-generator.service';

const kind = ref('integer');
const min = ref(0);
const max = ref(1000);
const length = ref(8);
const quantity = ref(10);
const unique = ref(false);
const startTs = ref(new Date('2020-01-01').getTime());
const endTs = ref(new Date().getTime());

const kindOptions = [
  { label: '整数', value: 'integer' },
  { label: '浮点数', value: 'float' },
  { label: 'HEX 字符串', value: 'hex' },
  { label: '随机字符串', value: 'string' },
  { label: '密码', value: 'password' },
  { label: '日期/时间', value: 'date' },
  { label: '邮箱', value: 'email' },
  { label: 'IPv4', value: 'ipv4' },
  { label: 'UUID', value: 'uuid' },
  { label: '颜色（HEX）', value: 'color' },
  { label: '姓名（英文）', value: 'name' },
];

const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'David',
  'Elizabeth',
  'William',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
];
const domains = ['example.com', 'test.org', 'sample.net', 'mail.dev', 'demo.io'];

function randomEmail(): string {
  const local = createToken({
    length: randIntFromInterval(5, 10),
    withUppercase: false,
    withSymbols: false,
    withNumbers: true,
  });
  const domain = domains[randIntFromInterval(0, domains.length - 1)];

  return `${local}@${domain}`;
}

function randomHexColor(): string {
  let value = '';
  for (let i = 0; i < 6; i++) value += '0123456789abcdef'[randIntFromInterval(0, 15)];

  return `#${value}`;
}

function generateOne(): string {
  switch (kind.value) {
    case 'integer':
      return String(randIntFromInterval(min.value, max.value));
    case 'float':
      return randomDecimal(min.value, max.value, 2).toFixed(2);
    case 'hex':
      return createToken({
        length: length.value,
        withUppercase: false,
        withLowercase: false,
        withNumbers: true,
        alphabet: '0123456789abcdef',
      });
    case 'string':
      return createToken({ length: length.value, withSymbols: false, withNumbers: true });
    case 'password':
      return createToken({ length: length.value, withSymbols: true });
    case 'date':
      return format(new Date(randIntFromInterval(startTs.value, endTs.value)), 'yyyy-MM-dd HH:mm:ss');
    case 'email':
      return randomEmail();
    case 'ipv4':
      return randomIpv4();
    case 'uuid':
      return randomUuid();
    case 'color':
      return randomHexColor();
    case 'name':
      return `${firstNames[randIntFromInterval(0, firstNames.length - 1)]} ${
        lastNames[randIntFromInterval(0, lastNames.length - 1)]
      }`;
    default:
      return '';
  }
}

const output = ref('');
function generate() {
  const seen = new Set<string>();
  const values: string[] = [];
  let guard = 0;
  while (values.length < quantity.value && guard < quantity.value * 100) {
    const value = generateOne();
    guard++;
    if (unique.value && seen.has(value)) continue;
    seen.add(value);
    values.push(value);
  }
  output.value = values.join('\n');
}

generate();

const { copy } = useCopy({ source: output, text: '数据已复制到剪贴板' });
</script>
