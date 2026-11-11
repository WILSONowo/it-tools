<template>
  <n-card title="JSON → YAML">
    <n-form label-placement="top">
      <n-form-item label="输入 JSON" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="在此粘贴输入 JSON..."
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>

    <n-space justify="center" style="margin: 12px 0 16px">
      <n-button secondary type="primary" @click="convert">转换</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制结果</n-button>
      <n-button secondary :disabled="!output" @click="clear">清空</n-button>
    </n-space>

    <n-form-item label="由 JSON 转换的 YAML" label-placement="top">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 6 }"
        placeholder="结果将显示在这里"
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { stringify } from 'yaml';
import JSON5 from 'json5';

const input = ref('{\n  "name": "it-tools",\n  "tags": ["dev", "tools"]\n}');
const output = ref('');

const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON5.parse(input.value) };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const status = computed(() => (parsed.value.ok ? undefined : 'error'));
const feedback = computed(() => (parsed.value.ok ? '' : parsed.value.error));

function convert() {
  if (!parsed.value.ok) {
    output.value = '';
    return;
  }
  output.value = stringify(parsed.value.value);
}

convert();

const { copy } = useCopy({ source: output, text: '结果已复制到剪贴板' });

function clear() {
  output.value = '';
}
</script>
