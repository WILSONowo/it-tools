<template>
  <n-scrollbar style="flex: 1" x-scrollable>
    <n-space :wrap="false" style="flex: 1" justify="center" :size="0">
      <div v-for="(suite, index) of suites" :key="index">
        <n-card style="width: 292px; margin: 0 8px 5px">
          <n-form-item label="套件名称:" :show-feedback="false" label-placement="left">
            <n-input v-model:value="suite.title" placeholder="套件名称..." />
          </n-form-item>

          <n-divider></n-divider>
          <n-form-item label="套件数值" :show-feedback="false" label-placement="top">
            <dynamic-values v-model:values="suite.data" />
          </n-form-item>
        </n-card>

        <n-space justify="center">
          <n-button v-if="suites.length > 1" quaternary @click="suites.splice(index, 1)">
            <template #icon>
              <n-icon :component="Trash" depth="3" />
            </template>
            删除套件
          </n-button>
          <n-button quaternary @click="suites.splice(index + 1, 0, { data: [0], title: `Suite ${suites.length + 1}` })">
            <template #icon>
              <n-icon :component="Plus" depth="3" />
            </template>
            添加套件
          </n-button>
        </n-space>
      </div>
    </n-space>
  </n-scrollbar>

  <div style="flex: 0 0 100%; margin-top: 16px">
    <div style="max-width: 600px; margin: 0 auto">
      <n-space justify="space-between" align="center" style="margin-bottom: 12px">
        <n-form-item label="单位:" label-placement="left" :show-feedback="false">
          <n-input v-model:value="unit" placeholder="单位(如: ms)" style="width: 160px" />
        </n-form-item>
        <n-button
          quaternary
          @click="
            suites = [
              { title: 'Suite 1', data: [] },
              { title: 'Suite 2', data: [] },
            ]
          "
          >重置套件</n-button
        >
      </n-space>

      <n-text depth="2" style="display: block; margin-bottom: 8px">结果对比</n-text>
      <n-table>
        <thead>
          <tr>
            <th>{{ header.position }}</th>
            <th>{{ header.title }}</th>
            <th>{{ header.size }}</th>
            <th>{{ header.mean }}</th>
            <th>{{ header.variance }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="{ title, size, mean, variance, position } of results" :key="title">
            <td>{{ position }}</td>
            <td>{{ title }}</td>
            <td>{{ size }}</td>
            <td>{{ mean }}</td>
            <td>{{ variance }}</td>
          </tr>
        </tbody>
      </n-table>
      <div style="margin-top: 12px">
        <n-space justify="center">
          <n-button secondary @click="copyAsMarkdown">复制为 Markdown 表格</n-button>
          <n-button secondary @click="copyAsBulletList">复制为项目符号列表</n-button>
        </n-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash, Plus } from '@vicons/tabler';
import { useClipboard, useStorage } from '@vueuse/core';
import _ from 'lodash';
import { computed } from 'vue';
import { computeAverage, computeVariance, arrayToMarkdownTable } from './benchmark-builder.models';
import DynamicValues from './dynamic-values.vue';

const suites = useStorage('benchmark-builder:suites', [
  { title: 'Suite 1', data: [5, 10] },
  { title: 'Suite 2', data: [8, 12] },
]);

const unit = useStorage('benchmark-builder:unit', '');

const round = (v: number) => Math.round(v * 1000) / 1000;

const results = computed(() => {
  return suites.value
    .map(({ data: dirtyData, title }) => {
      const data = dirtyData.filter(_.isNumber);

      return {
        title,
        size: data.length,
        mean: computeAverage({ data }),
        variance: computeVariance({ data }),
      };
    })
    .sort((a, b) => a.mean - b.mean)
    .map(({ mean, variance, size, title }, index, suites) => {
      const cleanUnit = unit.value.trim();
      const bestMean: number = suites[0].mean;
      const deltaWithBestMean = mean - bestMean;
      const ratioWithBestMean = bestMean === 0 ? '∞' : round(mean / bestMean);

      const comparisonValues: string =
        index !== 0 && bestMean !== mean ? ` (+${round(deltaWithBestMean)}${cleanUnit} ; x${ratioWithBestMean})` : '';

      return {
        position: index + 1,
        title,
        mean: `${round(mean)}${cleanUnit}${comparisonValues}`,
        variance: `${round(variance)}${cleanUnit}${cleanUnit ? '²' : ''}`,
        size,
      };
    });
});

const { copy } = useClipboard();

const header = {
  title: '套件',
  size: '样本数',
  mean: '均值',
  variance: '方差',
  position: '排名',
};

function copyAsMarkdown() {
  copy(arrayToMarkdownTable({ data: results.value, headerMap: header }));
}

function copyAsBulletList() {
  const bulletList = results.value
    .flatMap(({ title, ...sections }) => {
      return [
        ` - ${title}`,
        ...Object.entries(sections).map(
          ([key, value]) => `    - ${header[key as keyof typeof header] ?? key}: ${value}`,
        ),
      ];
    })
    .join('\n');

  copy(bulletList);
}
</script>

<style lang="less" scoped></style>
