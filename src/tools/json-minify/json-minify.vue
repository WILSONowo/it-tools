<template>
  <n-card title="JSON 压缩">
    <n-form label-placement="top">
      <n-form-item label="原始 JSON" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="在此粘贴原始 JSON..."
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>

    <n-space justify="center" style="margin: 12px 0 16px">
      <n-button secondary type="primary" @click="minify">压缩</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制结果</n-button>
      <n-button secondary :disabled="!output" @click="clear">清空</n-button>
    </n-space>

    <n-form-item label="压缩后的 JSON" label-placement="top">
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
import JSON5 from 'json5';

const input = ref('{\n\t"hello": [\n\t\t"world"\n\t]\n}');
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

function minify() {
  if (!parsed.value.ok) {
    output.value = '';
    return;
  }
  output.value = JSON.stringify(parsed.value.value);
}

minify();

const { copy } = useCopy({ source: output, text: '结果已复制到剪贴板' });

function clear() {
  output.value = '';
}
</script>
