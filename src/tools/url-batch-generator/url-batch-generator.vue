<template>
  <n-card title="URL 批量生成器">
    <n-tabs type="line" default-value="params">
      <n-tab-pane name="params" tab="参数组合">
        <n-form label-placement="top">
          <n-form-item label="基础 URL" style="margin-bottom: 8px">
            <n-input v-model:value="base" placeholder="https://example.com/api" style="font-family: monospace" />
          </n-form-item>
          <n-form-item label="参数与取值(每行一组:参数名 = 值1 | 值2 | 值3)" style="margin-bottom: 8px">
            <n-input
              v-model:value="paramConfig"
              type="textarea"
              :autosize="{ minRows: 5 }"
              placeholder="id = 1 | 2 | 3&#10;type = a | b"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center" style="margin: 8px 0 10px">
            <n-button type="primary" @click="generateCombos">生成</n-button>
            <n-button secondary @click="copyOutput">复制</n-button>
          </n-space>
          <n-form-item label="生成结果(共 {{ comboResults.length }} 条)">
            <n-input
              :value="comboResults.join('\n')"
              type="textarea"
              readonly
              :autosize="{ minRows: 6 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="template" tab="占位符模板">
        <n-form label-placement="top">
          <n-form-item label="模板(用 {{val}} 占位)" style="margin-bottom: 8px">
            <n-input
              v-model:value="template"
              type="textarea"
              :autosize="{ minRows: 3 }"
              placeholder="https://example.com/{{a}}-{{b}}"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-form-item label="变量值(每行:变量名 = 值1 | 值2)" style="margin-bottom: 8px">
            <n-input
              v-model:value="templateVars"
              type="textarea"
              :autosize="{ minRows: 4 }"
              placeholder="a = x | y&#10;b = 1 | 2"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center" style="margin: 8px 0 10px">
            <n-button type="primary" @click="generateTemplates">生成</n-button>
          </n-space>
          <n-form-item label="生成结果(共 {{ templateResults.length }} 条)">
            <n-input
              :value="templateResults.join('\n')"
              type="textarea"
              readonly
              :autosize="{ minRows: 6 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';

const base = ref('https://example.com/api');
const paramConfig = ref('id = 1 | 2 | 3\ntype = a | b');
const comboResults = ref<string[]>([]);
const template = ref('https://example.com/{{a}}-{{b}}');
const templateVars = ref('a = x | y\nb = 1 | 2');
const templateResults = ref<string[]>([]);

function parseVarConfig(text: string): Record<string, string[]> {
  const vars: Record<string, string[]> = {};
  for (const line of text.split('\n')) {
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const name = line.slice(0, eq).trim();
    if (!name) continue;
    const values = line
      .slice(eq + 1)
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (values.length) vars[name] = values;
  }
  return vars;
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, cur) => acc.flatMap((a) => cur.map((v) => [...a, v])), [[]]);
}

function generateCombos() {
  const vars = parseVarConfig(paramConfig.value);
  const names = Object.keys(vars);
  const combos = cartesian(names.map((n) => vars[n]));
  const chunks: string[] = [];
  for (const combo of combos) {
    const pairs = names.map((n, i) => `${encodeURIComponent(n)}=${encodeURIComponent(combo[i])}`);
    chunks.push(`${base.value}${base.value.includes('?') ? '&' : '?'}${pairs.join('&')}`);
  }
  comboResults.value = chunks;
}

function generateTemplates() {
  const vars = parseVarConfig(templateVars.value);
  const names = Object.keys(vars);
  const combos = cartesian(names.map((n) => vars[n]));
  templateResults.value = combos.map((combo) => {
    let url = template.value;
    for (let i = 0; i < names.length; i++) url = url.split(`{{${names[i]}}}`).join(combo[i]);
    return url;
  });
}

const { copy: copyOutput } = useCopy({ source: comboResults, text: '已复制' });
</script>
