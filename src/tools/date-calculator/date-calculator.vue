<template>
  <n-card title="日期计算器">
    <n-grid cols="1 800:2" x-gap="20" y-gap="20" responsive="screen">
      <n-gi>
        <n-card title="两个日期相差">
          <n-form label-placement="top">
            <n-form-item label="开始日期">
              <n-date-picker v-model:value="startTs" type="datetime" style="width: 100%" />
            </n-form-item>
            <n-form-item label="结束日期">
              <n-date-picker v-model:value="endTs" type="datetime" style="width: 100%" />
            </n-form-item>
          </n-form>
          <n-space justify="center" style="margin: 12px 0">
            <n-button type="primary" @click="applyDiff">计算相差</n-button>
          </n-space>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 16px">
            <n-card v-if="diffDone" :bordered="false" embedded style="flex: 1 1 200px; text-align: center">
              <n-statistic label="相差" :value="diffText" />
            </n-card>
            <n-card
              v-if="diffDone && startTs !== null && endTs !== null && endTs > startTs"
              :bordered="false"
              embedded
              style="flex: 1 1 200px; text-align: center"
            >
              <n-statistic label="年龄(按整年)" :value="yearsText" />
            </n-card>
          </div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="日期 加/减">
          <n-form label-placement="top">
            <n-form-item label="基准日期">
              <n-date-picker v-model:value="baseTs" type="datetime" style="width: 100%" />
            </n-form-item>
            <n-form-item label="加/减">
              <n-grid y-gap="16" cols="1 400:3" x-gap="12" responsive="screen" style="width: 100%">
                <n-gi span="2">
                  <n-input-number v-model:value="addAmount" :min="-100000" :max="100000" style="width: 100%" />
                </n-gi>
                <n-gi>
                  <n-select v-model:value="addUnit" :options="unitOptions" style="width: 100%" />
                </n-gi>
              </n-grid>
            </n-form-item>
            <n-space justify="center" style="margin: 12px 0">
              <n-button type="primary" @click="applyAdd">计算</n-button>
            </n-space>
          </n-form>
          <n-form label-placement="left" label-width="80" :show-feedback="false">
            <n-form-item label="结果">
              <input-copyable
                :value="addResult"
                readonly
                placeholder="点击计算后显示结果"
                :input-props="{ 'data-test-id': 'date-calculator-add-result' }"
              />
            </n-form-item>
            <n-form-item label="星期">
              <input-copyable
                :value="addResultWeekday"
                readonly
                :input-props="{ 'data-test-id': 'date-calculator-weekday' }"
              />
            </n-form-item>
          </n-form>
        </n-card>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { differenceInYears, addDays, addMonths, addWeeks, addYears, format } from 'date-fns'; // eslint-disable-line import/no-duplicates -- date-fns shares declarations with its locales.
import zhCN from 'date-fns/locale/zh-CN'; // eslint-disable-line import/no-duplicates
import InputCopyable from '../../components/InputCopyable.vue';
import { formatDateDifference } from './date-calculator.service';

const now = Date.now();
const startTs = ref<number | null>(now - 1000 * 60 * 60 * 24 * 30);
const endTs = ref<number | null>(now);

const baseTs = ref<number | null>(now);
const addAmount = ref<number | null>(7);
const addUnit = ref('days');
const unitOptions = [
  { label: '天', value: 'days' },
  { label: '周', value: 'weeks' },
  { label: '月', value: 'months' },
  { label: '年', value: 'years' },
];

const diffText = computed(() => {
  if (startTs.value === null || endTs.value === null) return '请选择日期';
  return formatDateDifference(startTs.value, endTs.value);
});

const diffDone = ref(false);

function applyDiff() {
  if (diffText.value) {
    diffDone.value = true;
  }
}

const yearsText = computed(() => {
  if (startTs.value === null || endTs.value === null) return '-';
  const start = new Date(startTs.value);
  const end = new Date(endTs.value);
  return `${Math.abs(differenceInYears(start, end))} 岁`;
});

const addResult = ref('');
const addResultWeekday = ref('');

function applyAdd() {
  if (baseTs.value === null) {
    addResult.value = '';
    addResultWeekday.value = '';
    return;
  }
  const base = new Date(baseTs.value);
  const amount = addAmount.value ?? 0;
  let result: Date;
  switch (addUnit.value) {
    case 'days':
      result = addDays(base, amount);
      break;
    case 'weeks':
      result = addWeeks(base, amount);
      break;
    case 'months':
      result = addMonths(base, amount);
      break;
    case 'years':
      result = addYears(base, amount);
      break;
    default:
      result = base;
  }
  addResult.value = format(result, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  addResultWeekday.value = format(result, 'EEEE', { locale: zhCN });
}

applyDiff();
applyAdd();
</script>
