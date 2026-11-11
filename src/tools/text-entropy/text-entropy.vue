<template>
  <n-card>
    <n-form-item label="文本">
      <n-input
        v-model:value="text"
        type="textarea"
        :autosize="{ minRows: 6 }"
        placeholder="输入文本..."
        spellcheck="false"
      />
    </n-form-item>

    <n-grid cols="1 600:3" x-gap="12" y-gap="12" responsive="screen" style="margin-bottom: 12px">
      <n-gi>
        <n-statistic label="总字符数" :value="totalChars" />
      </n-gi>
      <n-gi>
        <n-statistic label="不同字符数" :value="uniqueChars" />
      </n-gi>
      <n-gi>
        <n-statistic label="熵 (bits/char)" :value="entropy === 0 ? '0' : entropy.toFixed(4)" />
      </n-gi>
    </n-grid>

    <n-alert type="info" :show-icon="false" style="margin-bottom: 12px">
      该文本长度下的最大熵为 {{ maxEntropy.toFixed(2) }} bits/char(所有字符均不重复时)。
    </n-alert>

    <n-form-item label="选项">
      <n-space>
        <n-checkbox v-model:checked="caseInsensitive">忽略大小写</n-checkbox>
        <n-checkbox v-model:checked="ignoreWhitespace">忽略空白字符</n-checkbox>
        <n-radio-group v-model:value="sortBy" size="small">
          <n-radio-button value="count">按数量</n-radio-button>
          <n-radio-button value="char">按字符</n-radio-button>
        </n-radio-group>
      </n-space>
    </n-form-item>

    <n-table v-if="frequencies.length > 0" size="small">
      <thead>
        <tr>
          <th>字符</th>
          <th>数量</th>
          <th>占比</th>
          <th style="width: 45%">分布</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in frequencies" :key="item.char">
          <td style="font-family: monospace">
            <n-tag v-if="item.char === ' '" :bordered="false" type="warning">空格</n-tag>
            <n-tag v-else-if="item.char === '\n'" :bordered="false" type="warning">换行</n-tag>
            <n-tag v-else-if="item.char === '\t'" :bordered="false" type="warning">制表符</n-tag>
            <span v-else>{{ item.char }}</span>
          </td>
          <td>{{ item.count }}</td>
          <td>{{ item.percent.toFixed(2) }}%</td>
          <td>
            <n-progress type="line" :percentage="item.percent" :show-indicator="false" :height="14" />
          </td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const text = ref('To be or not to be, that is the question.');
const caseInsensitive = ref(false);
const ignoreWhitespace = ref(true);
const sortBy = ref<'count' | 'char'>('count');

const normalizedText = computed(() => {
  let value = text.value;
  if (caseInsensitive.value) value = value.toLowerCase();
  if (ignoreWhitespace.value) value = value.replace(/\s+/g, '');

  return value;
});

// Count code points, not UTF-16 units, so that emoji and other astral characters count once.
const totalChars = computed(() => [...normalizedText.value].length);

const frequencies = computed(() => {
  const counts = new Map<string, number>();
  for (const char of normalizedText.value) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }
  const total = totalChars.value || 1;
  const items = [...counts.entries()].map(([char, count]) => ({
    char,
    count,
    percent: (count / total) * 100,
  }));
  items.sort((a, b) =>
    sortBy.value === 'count' ? b.count - a.count || a.char.localeCompare(b.char) : a.char.localeCompare(b.char),
  );

  return items;
});

const uniqueChars = computed(() => frequencies.value.length);

const entropy = computed(() => {
  if (totalChars.value === 0) return 0;
  let h = 0;
  for (const { count } of frequencies.value) {
    const p = count / totalChars.value;
    h -= p * Math.log2(p);
  }

  return h;
});

const maxEntropy = computed(() => (totalChars.value === 0 ? 0 : Math.log2(totalChars.value)));
</script>
