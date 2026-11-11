<template>
  <n-card title="JSON → Java / C# / Go 实体">
    <n-grid y-gap="16" cols="1 700:2" x-gap="20" responsive="screen">
      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="JSON 输入" :feedback="feedback" :validation-status="status">
            <n-input
              v-model:value="jsonInput"
              type="textarea"
              :autosize="{ minRows: 12 }"
              placeholder='{ "id": 1, "name": "demo", "email": "a@b.c", "tags": ["x","y"], "meta": { "enabled": true, "score": 4.5 } }'
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-form-item label="语言">
            <n-radio-group v-model:value="language" style="margin-bottom: 12px">
              <n-radio-button value="java">Java</n-radio-button>
              <n-radio-button value="csharp">C#</n-radio-button>
              <n-radio-button value="go">Go</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <n-form-item label="类名">
            <n-input v-model:value="className" placeholder="MyEntity" style="font-family: monospace" />
          </n-form-item>

          <n-space>
            <n-button secondary type="primary" @click="generate">生成</n-button>
            <n-button secondary @click="copy">复制</n-button>
          </n-space>
        </n-form>
      </n-gi>

      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="输出">
            <n-input
              :value="output"
              type="textarea"
              readonly
              :autosize="{ minRows: 12 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 12px">
          <n-button secondary @click="copy">复制输出</n-button>
          <n-button secondary :disabled="!output" @click="clear">清空</n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { type EntityLanguage, generateEntityCode } from './json-to-entity-classes.service';

const jsonInput = ref(
  '{\n  "id": 1,\n  "name": "it-tools",\n  "email": "hello@example.com",\n  "active": true,\n  "score": 4.5,\n  "tags": ["dev", "tools"],\n  "meta": {\n    "created": "2023-01-01",\n    "count": 10\n  }\n}',
);
const language = ref<EntityLanguage>('java');
const className = ref('DemoData');
const output = ref('');

const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON.parse(jsonInput.value) };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const status = computed(() => (parsed.value.ok ? undefined : 'error'));
const feedback = computed(() => (parsed.value.ok ? '' : parsed.value.error));

function generate() {
  if (!parsed.value.ok) {
    return;
  }
  try {
    output.value = generateEntityCode({
      value: parsed.value.value,
      language: language.value,
      className: className.value,
    });
  } catch (e) {
    output.value = (e as Error).message;
  }
}

generate();

const { copy } = useCopy({ source: output, text: '代码已复制到剪贴板' });

function clear() {
  output.value = '';
}
</script>
