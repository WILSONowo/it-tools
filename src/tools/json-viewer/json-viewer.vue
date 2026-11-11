<template>
  <div style="width: 100%">
    <n-card>
      <n-form label-placement="left" label-width="150">
        <n-grid y-gap="16" cols="1 800:2" x-gap="16" responsive="screen">
          <n-gi>
            <n-form-item label="排序键:" :show-feedback="false">
              <n-switch v-model:value="sortKeys" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="缩进大小:" :show-feedback="false">
              <n-input-number v-model:value="indentSize" min="0" max="10" style="width: 100%" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>
    </n-card>

    <n-card style="margin-top: 16px">
      <n-form-item
        label="原始 JSON"
        :feedback="rawJsonValidation.message"
        :validation-status="rawJsonValidation.status"
        label-placement="top"
      >
        <n-input
          ref="inputElement"
          v-model:value="rawJson"
          placeholder="在此粘贴原始 JSON..."
          type="textarea"
          :autosize="{ minRows: 6 }"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>

      <n-space justify="center" style="margin: 12px 0 16px">
        <n-button secondary :disabled="!rawJson" @click="clearJson">清空</n-button>
      </n-space>

      <n-form-item label="格式化后的 JSON" label-placement="top">
        <textarea-copyable
          :value="cleanJson"
          language="json"
          :follow-height-of="inputElement"
          copy-placement="top-right"
        />
      </n-form-item>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useValidation } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { computed, ref } from 'vue';
import JSON5 from 'json5';
import { useStorage } from '@vueuse/core';
import { formatJson } from './json.models';

const inputElement = ref<HTMLElement>();

const rawJson = useStorage('json-prettify:raw-json', '{"hello": "world", "foo": "bar"}');
const indentSize = useStorage('json-prettify:indent-size', 3);
const sortKeys = useStorage('json-prettify:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatJson({ rawJson, indentSize, sortKeys }), ''));

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: [
    {
      validator: (v) => v === '' || JSON5.parse(v),
      message: '提供的 JSON 无效。',
    },
  ],
});

function clearJson() {
  rawJson.value = '';
}
</script>

<style lang="less" scoped>
.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
