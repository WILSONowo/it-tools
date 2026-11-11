<template>
  <div>
    <n-grid cols="2" x-gap="20" y-gap="20" responsive="screen">
      <n-gi>
        <n-form-item label="原始文本">
          <n-input
            v-model:value="original"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 24 }"
            placeholder="原始文本..."
            spellcheck="false"
          />
        </n-form-item>
      </n-gi>
      <n-gi>
        <n-form-item label="新文本">
          <n-input
            v-model:value="modified"
            type="textarea"
            :autosize="{ minRows: 10, maxRows: 24 }"
            placeholder="新文本..."
            spellcheck="false"
          />
        </n-form-item>
      </n-gi>
    </n-grid>

    <n-space align="center" style="margin: 8px 0">
      <n-checkbox v-model:value="showLineNumbers">行号</n-checkbox>
      <n-checkbox v-model:value="ignoreWhitespace">忽略空白</n-checkbox>
      <n-checkbox v-model:value="charDiff">词/字符级对比</n-checkbox>
      <n-tag v-if="statistics" size="small" :bordered="false" style="margin-left: auto">
        +{{ statistics.added }} / -{{ statistics.removed }} ({{ statistics.changed }} 处修改)
      </n-tag>
    </n-space>

    <n-card v-if="rendered.length > 0" size="small">
      <div class="diff-table">
        <div class="diff-row diff-header">
          <span v-if="showLineNumbers" class="diff-ln diff-ln-old">旧</span>
          <span v-if="showLineNumbers" class="diff-ln diff-ln-new">新</span>
          <span class="diff-line" style="opacity: 0.6">差异</span>
        </div>
        <div v-for="(row, index) in rendered" :key="index" :class="['diff-row', `diff-${row.type}`]">
          <span v-if="showLineNumbers" class="diff-ln diff-ln-old">{{ row.oldNumber || '' }}</span>
          <span v-if="showLineNumbers" class="diff-ln diff-ln-new">{{ row.newNumber || '' }}</span>
          <span class="diff-line">
            <span v-if="row.type === 'add'">+ </span>
            <span v-else-if="row.type === 'remove'">- </span>
            <span v-else-if="row.type === 'change'">~ </span>
            <template v-if="row.type === 'change' && charDiff">
              <span
                v-for="(part, partIndex) in row.parts ?? []"
                :key="partIndex"
                :class="{ 'diff-part': part.type !== 'equal' }"
              >
                {{ part.value }}
              </span>
            </template>
            <template v-else>{{ row.text }}</template>
          </span>
        </div>
      </div>
    </n-card>
    <n-empty v-else description="暂无内容可对比" style="padding: 30px 0" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { diffArrays, diffCharsInline } from './text-diff.service';
const original = ref('The quick brown fox\njumps over the lazy dog.');
const modified = ref('The quick brown fox\njumped over the lazy cat.');
const showLineNumbers = ref(true);
const ignoreWhitespace = ref(false);
const charDiff = ref(true);

type RowType = 'equal' | 'add' | 'remove' | 'change';
type Row = {
  type: RowType;
  text: string;
  parts?: { type: 'equal' | 'change'; value: string }[];
  oldNumber: number | null;
  newNumber: number | null;
};

const normalized = (value: string) => (ignoreWhitespace.value ? value.replace(/\s+/g, ' ').trim() : value);

const rendered = computed<Row[]>(() => {
  const oldLines = normalized(original.value).split('\n');
  const newLines = normalized(modified.value).split('\n');
  const changes = diffArrays(oldLines, newLines);

  const rows: Row[] = [];
  let oldCounter = 0;
  let newCounter = 0;

  for (const change of changes) {
    const count = Math.max(
      change.added ? change.value.length : change.removed ? change.value.length : change.value.length,
      1,
    );

    if (change.added) {
      change.value.forEach((line, index) => {
        rows.push({ type: 'add', text: line, oldNumber: null, newNumber: newCounter + index + 1 });
      });
      newCounter += count;
      continue;
    }

    if (change.removed) {
      change.value.forEach((line, index) => {
        rows.push({ type: 'remove', text: line, oldNumber: oldCounter + index + 1, newNumber: null });
      });
      oldCounter += count;
      continue;
    }

    change.value.forEach((line, index) => {
      rows.push({ type: 'equal', text: line, oldNumber: oldCounter + index + 1, newNumber: newCounter + index + 1 });
    });
    oldCounter += count;
    newCounter += count;
  }

  if (charDiff.value) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pair = rows[i + 1];
      if (row.type === 'remove' && pair && pair.type === 'add') {
        const wordChanges = diffCharsInline(row.text, pair.text).map((change) => ({
          type: change.type === 'equal' ? ('equal' as const) : ('change' as const),
          value: change.value,
        }));
        rows[i] = { ...row, type: 'change', text: row.text, parts: wordChanges };
        rows.splice(i + 1, 1);
      }
    }
  }

  return rows;
});

const statistics = computed(() => {
  const rows = rendered.value;
  const added = rows.filter((row) => row.type === 'add' || row.type === 'change').length;
  const removed = rows.filter((row) => row.type === 'remove' || row.type === 'change').length;
  const changed = rows.filter((row) => row.type === 'change').length;

  return { added, removed, changed };
});
</script>

<style scoped lang="less">
.diff-table {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.diff-row {
  display: flex;
  align-items: stretch;
  border-radius: 2px;
}

.diff-line {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 0 6px;
}

.diff-ln {
  flex: 0 0 3.2em;
  text-align: right;
  padding-right: 8px;
  opacity: 0.5;
  user-select: none;
}

.diff-ln-old {
  border-right: 1px solid rgba(128, 128, 128, 0.2);
}

.diff-equal {
  background: transparent;
}

.diff-add {
  background: rgba(24, 160, 88, 0.12);
}

.diff-remove {
  background: rgba(208, 48, 80, 0.12);
}

.diff-change {
  background: rgba(240, 160, 32, 0.14);
}

.diff-part {
  background: rgba(208, 48, 80, 0.3);
  border-radius: 2px;
}
</style>
