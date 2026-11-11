<template>
  <n-card>
    <n-alert type="info" :show-icon="false" style="margin-bottom: 14px">
      将分隔符文本(如 CSV/TSV)转换为 HTML 表格代码。
    </n-alert>
    <n-form label-placement="top">
      <n-form-item label="输入文本" style="margin-bottom: 10px">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="name,age,country&#10;Alice,25,CN&#10;Bob,30,US"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
      <n-grid cols="2 600:4" x-gap="12" responsive="screen">
        <n-gi>
          <n-form-item label="分隔符" style="margin-bottom: 8px">
            <n-select v-model:value="delimiter" :options="delimOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="首行为表头" style="margin-bottom: 8px">
            <n-switch v-model:value="firstRowHeader" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="边框样式" style="margin-bottom: 8px">
            <n-select v-model:value="bordered" :options="borderedOptions" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="对齐" style="margin-bottom: 8px">
            <n-select v-model:value="align" :options="alignOptions" />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    <n-space justify="center" style="margin: 8px 0 14px">
      <n-button type="primary" @click="convert">生成表格</n-button>
      <n-button secondary @click="copy">复制代码</n-button>
    </n-space>
    <n-form-item label="HTML 代码" label-placement="top">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 8 }"
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
    <n-divider>预览</n-divider>
    <div style="overflow: auto" v-html="output" />
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';

const input = ref('name,age,country\nAlice,25,CN\nBob,30,US');
const delimiter = ref(',');
const firstRowHeader = ref(true);
const bordered = ref('default');
const align = ref('left');
const output = ref('');

const delimOptions = [
  { label: '逗号 ,', value: ',' },
  { label: '制表符 \\t', value: 'tab' },
  { label: '分号 ;', value: ';' },
  { label: '竖线 |', value: '|' },
];
const borderedOptions = [
  { label: '默认', value: 'default' },
  { label: '带边框', value: 'bordered' },
  { label: '紧凑', value: 'condensed' },
  { label: '条纹', value: 'striped' },
];
const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
];

function sep(): string {
  return delimiter.value === 'tab' ? '\t' : delimiter.value;
}

function convert() {
  const rows = input.value
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '');
  if (rows.length === 0) {
    output.value = '';
    return;
  }
  const split = (line: string) => line.split(sep()).map((c) => c.trim());
  const dataRows = firstRowHeader.value ? rows.slice(1) : rows;
  const headRow = firstRowHeader.value ? split(rows[0]) : null;
  const cols = Math.max(headRow?.length ?? 0, ...dataRows.map((r) => split(r).length));

  const cls =
    bordered.value === 'default'
      ? ' style="border-collapse:collapse"'
      : ` class="table table-${bordered.value}" style="border-collapse:collapse"`;
  const alignAttr = align.value === 'left' ? '' : ` style="text-align:${align.value}"`;
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let html = `<table${cls}${alignAttr}>\n`;
  if (headRow) {
    html += '  <thead>\n    <tr>\n';
    for (let i = 0; i < cols; i++) html += `      <th>${escapeHtml(headRow[i] ?? '')}</th>\n`;
    html += '    </tr>\n  </thead>\n';
  }
  html += '  <tbody>\n';
  for (const row of dataRows) {
    const cells = split(row);
    html += '    <tr>\n';
    for (let i = 0; i < cols; i++) html += `      <td>${escapeHtml(cells[i] ?? '')}</td>\n`;
    html += '    </tr>\n';
  }
  html += '  </tbody>\n</table>';
  output.value = html;
}

const { copy } = useCopy({ source: output, text: 'HTML 代码已复制' });
convert();
</script>
