<template>
  <n-card title="URL 参数格式化">
    <n-tabs type="line" default-value="toLines">
      <!-- 查询串 → 多行 / JSON -->
      <n-tab-pane name="toLines" tab="Query → 多行/JSON">
        <n-form label-placement="top">
          <n-form-item label="URL 或查询串" style="margin-bottom: 10px">
            <n-input
              v-model:value="queryInput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              placeholder="https://x.com/path?a=1&b=hello%20world&c=3"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center" style="margin-bottom: 10px">
            <n-button type="primary" @click="toLines">转多行</n-button>
            <n-button secondary @click="toJson">转 JSON</n-button>
            <n-button secondary @click="parseSample">示例</n-button>
          </n-space>
          <n-form-item label="结果" style="margin-bottom: 6px">
            <n-input
              :value="parseOutput"
              type="textarea"
              readonly
              :autosize="{ minRows: 5 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center">
            <n-button secondary :disabled="!parseOutput" @click="copyParse">复制</n-button>
          </n-space>
        </n-form>
      </n-tab-pane>

      <!-- 多行 → Query -->
      <n-tab-pane name="toQuery" tab="多行 → Query">
        <n-form label-placement="top">
          <n-form-item label="每行一个参数(key=value)" style="margin-bottom: 10px">
            <n-input
              v-model:value="linesInput"
              type="textarea"
              :autosize="{ minRows: 5 }"
              placeholder="a=1&#10;b=hello world&#10;c=3"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-form-item label="编码" style="margin-bottom: 10px">
            <n-radio-group v-model:value="encodeMode">
              <n-radio-button value="none">不编码</n-radio-button>
              <n-radio-button value="encode">URL 编码</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-space justify="center" style="margin-bottom: 10px">
            <n-button type="primary" @click="buildQuery">生成 Query</n-button>
          </n-space>
          <n-form-item label="完整 URL(可选拼接)" style="margin-bottom: 6px">
            <n-input :value="queryOutput" readonly style="font-family: monospace" />
          </n-form-item>
          <n-space justify="center">
            <n-button secondary :disabled="!queryOutput" @click="copyQuery">复制</n-button>
          </n-space>
        </n-form>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';

const queryInput = ref('https://example.com/path?a=1&b=hello%20world&c=%E4%B8%AD%E6%96%87');
const parseOutput = ref('');
const linesInput = ref('a=1\nb=hello world\nc=3');
const encodeMode = ref<'none' | 'encode'>('encode');
const queryOutput = ref('');

function extractQuery(raw: string): string {
  const idx = raw.indexOf('?');
  return idx >= 0 ? raw.slice(idx + 1) : raw;
}

function parsePairs(raw: string): [string, string][] {
  const q = extractQuery(raw.trim());
  if (!q) return [];
  return q
    .split('&')
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf('=');
      if (eq < 0) return [decodeURIComponent(pair), ''];
      return [decodeURIComponent(pair.slice(0, eq)), decodeURIComponent(pair.slice(eq + 1))];
    });
}

function toLines() {
  try {
    parseOutput.value = parsePairs(queryInput.value)
      .map(([k, v]) => `${k} = ${v}`)
      .join('\n');
  } catch {
    parseOutput.value = '解析失败:包含无法解码的字符';
  }
}

function toJson() {
  try {
    const obj: Record<string, string | string[]> = {};
    for (const [k, v] of parsePairs(queryInput.value)) {
      if (k in obj) {
        const cur = obj[k];
        obj[k] = Array.isArray(cur) ? [...cur, v] : [cur, v];
      } else {
        obj[k] = v;
      }
    }
    parseOutput.value = JSON.stringify(obj, null, 2);
  } catch {
    parseOutput.value = '解析失败:包含无法解码的字符';
  }
}

function parseSample() {
  queryInput.value = 'https://example.com/path?a=1&b=hello%20world&c=%E4%B8%AD%E6%96%87&a=2';
  toLines();
}

function buildQuery() {
  const parts = linesInput.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const pairs = parts.map((line) => {
    const eq = line.indexOf('=');
    const k = eq < 0 ? line : line.slice(0, eq);
    const v = eq < 0 ? '' : line.slice(eq + 1);
    return encodeMode.value === 'encode' ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`;
  });
  queryOutput.value = '?' + pairs.join('&');
}

const { copy: copyParse } = useCopy({ source: parseOutput, text: '已复制' });
const { copy: copyQuery } = useCopy({ source: queryOutput, text: '已复制' });
</script>
