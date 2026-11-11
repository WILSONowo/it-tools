<template>
  <n-grid cols="1 700:2" x-gap="20" y-gap="20" responsive="screen">
    <n-gi>
      <n-card title="时间戳 → 日期">
        <n-form label-placement="top">
          <n-form-item label="时间戳:">
            <n-input v-model:value="tsInput" placeholder="例如 1700000000 或 1700000000123" />
          </n-form-item>
          <n-form-item label="时区:">
            <n-select v-model:value="timeZone" :options="timezoneOptions" filterable />
          </n-form-item>
          <n-form-item label="类型:">
            <n-radio-group v-model:value="tsType">
              <n-radio-button value="seconds">秒</n-radio-button>
              <n-radio-button value="milliseconds">毫秒</n-radio-button>
              <n-radio-button value="auto">自动</n-radio-button>
            </n-radio-group>
            <template #feedback> 自动:绝对值 ≥ 1e11 视为毫秒,否则视为秒 </template>
          </n-form-item>
          <n-space justify="center" style="margin-top: 4px">
            <n-button type="primary" :disabled="formattedDate === ''" @click="copyDate">复制日期</n-button>
          </n-space>
        </n-form>
        <n-form-item label="结果:" label-placement="top" style="margin-top: 16px">
          <n-input :value="formattedDate" type="textarea" readonly :autosize="{ minRows: 2 }" placeholder="日期..." />
        </n-form-item>
      </n-card>
    </n-gi>

    <n-gi>
      <n-card title="日期 → 时间戳">
        <n-form label-placement="top">
          <n-form-item label="日期:">
            <n-input
              v-model:value="dateInput"
              placeholder="YYYY-MM-DD HH:mm:ss,或任何可解析的日期"
              @keyup.enter="parseFromDate"
            />
          </n-form-item>
          <n-form-item label="时区:">
            <n-select v-model:value="timeZone" :options="timezoneOptions" filterable />
          </n-form-item>
          <n-space justify="center" style="margin-top: 4px">
            <n-button type="primary" @click="useNow">使用当前时间</n-button>
            <n-button secondary :disabled="secondsOutput === ''" @click="copySeconds">复制秒</n-button>
            <n-button secondary :disabled="msOutput === ''" @click="copyMs">复制毫秒</n-button>
          </n-space>
        </n-form>
        <n-form-item label="时间戳(秒):" label-placement="top" style="margin-top: 16px">
          <n-input :value="secondsOutput" readonly />
        </n-form-item>
        <n-form-item label="时间戳(毫秒):" label-placement="top">
          <n-input :value="msOutput" readonly />
        </n-form-item>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  formatInZone,
  formatTimestampInZone,
  parseDateInZone,
  resolveTimestampMs,
  type TimestampType,
} from './unix-time-converter.service';

const tsInput = ref('1700000000');
const tsType = ref<TimestampType>('auto');

const dateInput = ref('2023-11-15 00:00:00');
const timeZone = ref('Asia/Shanghai');

const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Asia/Shanghai (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'Asia/Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
];

const resolvedTs = computed(() => resolveTimestampMs(tsInput.value, tsType.value));
const formattedDate = computed(() => formatTimestampInZone(resolvedTs.value, timeZone.value));

const { copy: copyDate } = useCopy({ source: formattedDate, text: '日期已复制到剪贴板' });

function parseFromDate() {
  const ms = parseDateInZone(dateInput.value, timeZone.value);
  if (ms !== null) {
    dateInput.value = formatInZone(ms, timeZone.value, 'yyyy-MM-dd HH:mm:ss');
  }
}

const parsedMs = computed(() => parseDateInZone(dateInput.value, timeZone.value));
const secondsOutput = computed(() => (parsedMs.value === null ? '' : String(Math.floor(parsedMs.value / 1000))));
const msOutput = computed(() => (parsedMs.value === null ? '' : String(parsedMs.value)));

const { copy: copySeconds } = useCopy({ source: secondsOutput, text: '时间戳已复制到剪贴板' });
const { copy: copyMs } = useCopy({ source: msOutput, text: '时间戳已复制到剪贴板' });

function useNow() {
  dateInput.value = formatInZone(Date.now(), timeZone.value, 'yyyy-MM-dd HH:mm:ss');
}
</script>
