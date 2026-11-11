<template>
  <div>
    <n-text depth="3" style="text-align: justify; width: 100%; display: inline-block">
      举个具体例子:如果你 5 分钟能洗 3 个盘子,而你需要洗 500 个盘子,那么洗完全部盘子大约需要 5 小时 10
      分钟;如果现在开始,你将在
      {{ exampleEndAt }}
      结束。
    </n-text>
    <br />
    <n-divider />
    <n-form label-placement="left" label-width="130" :show-feedback="false">
      <n-form-item label="待消耗的总量">
        <n-input-number v-model:value="unitCount" :min="1" style="width: 200px" />
      </n-form-item>
      <n-form-item label="开始消耗时间">
        <n-date-picker v-model:value="startedAt" type="datetime" style="width: 240px" />
      </n-form-item>
      <n-form-item label="消耗速率">
        <div style="display: flex; align-items: center; width: 100%; gap: 6px; flex-wrap: nowrap">
          <n-input-number v-model:value="unitPerTimeSpan" :min="1" style="width: 100px; flex: 1 1 100px" />
          <span style="white-space: nowrap">单位/用时</span>
          <n-input-group style="flex: 1 1 auto; min-width: 160px">
            <n-input-number v-model:value="timeSpan" :min="1" style="flex: 1" />
            <n-select
              v-model:value="timeSpanUnitMultiplier"
              style="width: 88px"
              :options="[
                { label: '毫秒', value: 1 },
                { label: '秒', value: 1000 },
                { label: '分钟', value: 1000 * 60 },
                { label: '小时', value: 1000 * 60 * 60 },
                { label: '天', value: 1000 * 60 * 60 * 24 },
              ]"
            ></n-select>
          </n-input-group>
        </div>
      </n-form-item>
    </n-form>

    <n-divider />
    <n-alert v-if="durationMs === null" type="warning" :show-icon="false" style="max-width: 420px">
      请填写所有数值,且均需大于 0。
    </n-alert>
    <n-space v-else vertical style="max-width: 420px">
      <n-card>
        <n-statistic label="总耗时">{{ formatMsDuration(durationMs) }}</n-statistic>
      </n-card>
      <n-card>
        <n-statistic label="预计结束时间">{{ endAt ?? '请选择开始时间' }}</n-statistic>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
// Duplicate issue with sub directory
// eslint-disable-next-line import/no-duplicates
import { formatRelative } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { zhCN } from 'date-fns/locale';
import { computed, ref } from 'vue';
import { computeEtaDurationMs, computeEtaEnd, formatMsDuration } from './eta-calculator.service';

const unitCount = ref<number | null>(3 * 62);
const unitPerTimeSpan = ref<number | null>(3);
const timeSpan = ref<number | null>(5);
const timeSpanUnitMultiplier = ref(60000);
const startedAt = ref<number | null>(Date.now());

const durationMs = computed(() =>
  computeEtaDurationMs({
    unitCount: unitCount.value,
    unitPerTimeSpan: unitPerTimeSpan.value,
    timeSpan: timeSpan.value,
    timeSpanUnitMultiplier: timeSpanUnitMultiplier.value,
  }),
);

function formatEnd(end: number | null) {
  return end === null ? null : formatRelative(end, Date.now(), { locale: zhCN });
}

const endAt = computed(() => {
  if (durationMs.value === null || startedAt.value === null) return null;
  return formatEnd(computeEtaEnd(startedAt.value, durationMs.value)) ?? '超出可表示的日期范围';
});
const exampleEndAt = computed(() => endAt.value ?? '……');
</script>

<style lang="less" scoped>
.n-form-item {
  align-items: center;
}
</style>
