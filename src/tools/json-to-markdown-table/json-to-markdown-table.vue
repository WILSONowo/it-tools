<template>
  <n-card title="JSON ↔ Markdown 表格">
    <n-tabs type="line" default-value="json2md">
      <n-tab-pane name="json2md" tab="JSON → Markdown">
        <n-form label-placement="top">
          <n-form-item label="JSON(对象数组或单个对象)" :feedback="jsonFeedback" :validation-status="jsonStatus">
            <n-input
              v-model:value="jsonInput"
              type="textarea"
              :autosize="{ minRows: 8 }"
              placeholder='[{"name":"it-tools","category":"dev"},{"name":"other","category":"misc"}]'
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-space justify="center" style="margin: 0 0 12px">
            <n-button type="primary" secondary @click="copyMarkdown">复制 Markdown</n-button>
          </n-space>
        </n-form>
        <n-form-item label="Markdown 表格" label-placement="top">
          <n-input
            :value="markdownOutput"
            type="textarea"
            readonly
            :autosize="{ minRows: 8 }"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="md2json" tab="Markdown → JSON">
        <n-form label-placement="top">
          <n-form-item label="Markdown 表格" :feedback="mdFeedback" :validation-status="mdStatus">
            <n-input
              v-model:value="mdInput"
              type="textarea"
              :autosize="{ minRows: 8 }"
              placeholder="| name | category |\n| --- | --- |\n| it-tools | dev |"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-space justify="center" style="margin-bottom: 12px">
            <n-button type="primary" secondary @click="copyJson">复制 JSON</n-button>
          </n-space>
        </n-form>
        <n-form-item label="JSON 输出" label-placement="top">
          <n-input
            :value="jsonOutput"
            type="textarea"
            readonly
            :autosize="{ minRows: 8 }"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  jsonToMarkdownTable,
  markdownTableToJson,
  parseJsonRows,
  parseMarkdownTable,
} from './json-to-markdown-table.service';

const jsonInput = ref(
  '[\n  { "name": "it-tools", "category": "dev", "stars": 0 },\n  { "name": "lddgo", "category": "tools" }\n]',
);
const mdInput = ref('| name | category |\n| --- | --- |\n| it-tools | dev |\n| lddgo | tools |');

const jsonParsed = computed(() => parseJsonRows(jsonInput.value));
const jsonStatus = computed(() => (jsonParsed.value.ok ? undefined : 'error'));
const jsonFeedback = computed(() => (jsonParsed.value.ok ? '' : jsonParsed.value.error));

const markdownOutput = computed(() => jsonToMarkdownTable(jsonInput.value));

const { copy: copyMarkdown } = useCopy({ source: markdownOutput, text: 'Markdown 已复制到剪贴板' });

const mdParsed = computed(() => parseMarkdownTable(mdInput.value));
const mdStatus = computed(() => (mdParsed.value.ok ? undefined : 'error'));
const mdFeedback = computed(() => (mdParsed.value.ok ? '' : mdParsed.value.error));

const jsonOutput = computed(() => markdownTableToJson(mdInput.value));

const { copy: copyJson } = useCopy({ source: jsonOutput, text: 'JSON 已复制到剪贴板' });
</script>
