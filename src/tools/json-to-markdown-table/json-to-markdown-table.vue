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

const jsonInput = ref(
  '[\n  { "name": "it-tools", "category": "dev", "stars": 0 },\n  { "name": "lddgo", "category": "tools" }\n]',
);
const mdInput = ref('| name | category |\n| --- | --- |\n| it-tools | dev |\n| lddgo | tools |');

function escapeCell(value: unknown): string {
  const str =
    value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return str.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

const jsonParsed = computed(() => {
  try {
    const value = JSON.parse(jsonInput.value);
    if (Array.isArray(value) && value.length === 0)
      return { ok: true as const, rows: [] as Record<string, unknown>[], columns: [] as string[] };
    const rows = Array.isArray(value) ? value : [value];
    if (!rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
      return { ok: false as const, error: '输入必须是对象或对象数组。' };
    }
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row as Record<string, unknown>)))];
    return { ok: true as const, rows: rows as Record<string, unknown>[], columns };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const jsonStatus = computed(() => (jsonParsed.value.ok ? undefined : 'error'));
const jsonFeedback = computed(() => (jsonParsed.value.ok ? '' : jsonParsed.value.error));

const markdownOutput = computed(() => {
  const p = jsonParsed.value;
  if (!p.ok || p.rows.length === 0) return '';
  const header = `| ${p.columns.join(' | ')} |`;
  const separator = `| ${p.columns.map(() => '---').join(' | ')} |`;
  const body = p.rows.map((row) => `| ${p.columns.map((col) => escapeCell(row[col])).join(' | ')} |`).join('\n');

  return [header, separator, body].join('\n');
});

const { copy: copyMarkdown } = useCopy({ source: markdownOutput, text: 'Markdown 已复制到剪贴板' });

function parseMarkdownTable(md: string): { ok: boolean; error?: string; rows?: string[][]; columns?: string[] } {
  const lines = md
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'));
  if (lines.length < 2) return { ok: false, error: '至少需要表头行和分隔行。' };
  const split = (line: string) =>
    line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim().replace(/\\\|/g, '|').replace(/<br>/g, '\n'));
  const header = split(lines[0]);
  const rows = lines.slice(1).map(split);
  if (!rows.every((row) => row.length === header.length)) return { ok: false, error: '所有行必须具有相同的列数。' };

  return { ok: true, columns: header, rows };
}

const mdParsed = computed(() => parseMarkdownTable(mdInput.value));
const mdStatus = computed(() => (mdParsed.value.ok ? undefined : 'error'));
const mdFeedback = computed(() => (mdParsed.value.ok ? '' : mdParsed.value.error ?? ''));

const jsonOutput = computed(() => {
  const p = mdParsed.value;
  if (!p.ok || !p.rows || !p.columns) return '';
  const columns = p.columns;
  const data = p.rows.map((row) => {
    const obj: Record<string, string> = {};
    columns.forEach((col, index) => {
      const cell = row[index];
      obj[col] = cell === undefined ? '' : cell;
    });
    return obj;
  });

  return JSON.stringify(data, null, 2);
});

const { copy: copyJson } = useCopy({ source: jsonOutput, text: 'JSON 已复制到剪贴板' });
</script>
