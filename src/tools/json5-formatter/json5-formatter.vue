<template>
  <n-card title="JSON5(支持注释、单引号、尾逗号)">
    <n-form label-placement="top">
      <n-form-item label="输入 JSON5" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 8 }"
          placeholder='// a comment
{ name: "it-tools", tags: ["json", "dev"], count: 5, }'
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>

    <n-space justify="center" style="margin: 12px 0 16px">
      <n-button secondary type="primary" @click="prettyMode = true">格式化</n-button>
      <n-button secondary @click="prettyMode = false">压缩</n-button>
    </n-space>

    <n-form-item label="输出" label-placement="top">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 6 }"
        placeholder="结果..."
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
    <n-space justify="center" align="center" style="margin-top: 12px">
      <n-tag v-if="parsedOk" type="success" :bordered="false">有效的 JSON5</n-tag>
      <n-tag v-if="parsedOk" :bordered="false">{{ typeLabel }}</n-tag>
      <n-button secondary @click="copy">复制输出</n-button>
      <n-button secondary :disabled="!input" @click="clearAll">清空</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import JSON5 from 'json5';
import { useCopy } from '@/composable/copy';

const input = ref('{\n  // the tools\n  name: "it-tools",\n  version: 1,\n  tags: ["json", "dev",],\n}');
const prettyMode = ref(true);

const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON5.parse(input.value) };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const parsedOk = computed(() => parsed.value.ok);
const status = computed(() => (parsed.value.ok ? undefined : 'error'));
const feedback = computed(() => (parsed.value.ok ? '' : parsed.value.error));
const typeLabelMap: Record<string, string> = {
  array: '数组',
  object: '对象',
  string: '字符串',
  number: '数字',
  boolean: '布尔值',
  undefined: '未定义',
};

const typeLabel = computed(() => {
  if (!parsed.value.ok) return '';
  const value = parsed.value.value;
  const t = Array.isArray(value) ? 'array' : typeof value;
  return typeLabelMap[t] ?? t;
});

const output = computed(() => {
  if (!parsed.value.ok) return '';
  return prettyMode.value ? JSON.stringify(parsed.value.value, null, 2) : JSON.stringify(parsed.value.value);
});

const { copy } = useCopy({ source: output, text: '输出已复制到剪贴板' });

function clearAll() {
  input.value = '';
}
</script>
