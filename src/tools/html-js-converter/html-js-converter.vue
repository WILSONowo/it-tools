<template>
  <n-card title="HTML ↔ JS 字符串">
    <n-tabs type="line" default-value="html2js">
      <n-tab-pane name="html2js" tab="HTML → JS 字符串">
        <n-form-item label="HTML 源码">
          <n-input
            v-model:value="htmlInput"
            type="textarea"
            :autosize="{ minRows: 6 }"
            placeholder='<div class="card">Hello &amp; welcome</div>'
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-form-item label="引号风格">
          <n-radio-group v-model:value="quote">
            <n-radio-button value="double">" 双引号</n-radio-button>
            <n-radio-button value="single">' 单引号</n-radio-button>
            <n-radio-button value="template">` 反引号</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button secondary type="primary" @click="toJs">转换为 JS</n-button>
        </n-space>
        <n-form-item label="JS 字符串">
          <n-input
            :value="jsOutput"
            type="textarea"
            readonly
            :autosize="{ minRows: 4 }"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-space justify="center">
          <n-button secondary @click="copyJs">复制</n-button>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="js2html" tab="JS 字符串 → HTML">
        <n-form-item label="JS 字符串">
          <n-input
            v-model:value="jsInput"
            type="textarea"
            :autosize="{ minRows: 6 }"
            placeholder="'&lt;div class=&quot;card&quot;&gt;Hello &amp;amp; welcome&lt;/div&gt;'"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button secondary type="primary" @click="toHtml">还原为 HTML</n-button>
        </n-space>
        <n-form-item label="HTML">
          <n-input
            :value="htmlOutput"
            type="textarea"
            readonly
            :autosize="{ minRows: 4 }"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-space justify="center">
          <n-button secondary @click="copyHtml">复制</n-button>
        </n-space>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';

const htmlInput = ref('<div class="card">\n  Hello &amp; welcome\n</div>');
const quote = ref<'double' | 'single' | 'template'>('double');
const jsInput = ref('\'<div class="card">\\n  Hello &amp; welcome\\n</div>\'');
const htmlOutput = ref('');

const htmlToJs = computed(() => {
  const source = htmlInput.value;
  let escaped = source.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
  if (quote.value === 'single') escaped = escaped.replace(/'/g, "\\'");
  else if (quote.value === 'double') escaped = escaped.replace(/"/g, '\\"');
  escaped = escaped.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
  const open = quote.value === 'single' ? "'" : quote.value === 'double' ? '"' : '`';
  const close = open;
  return `${open}${escaped}${close}`;
});

const jsOutput = ref('');
function toJs() {
  jsOutput.value = htmlToJs.value;
}
toJs();

const jsToHtml = computed(() => {
  try {
    const raw = jsInput.value.trim();
    const first = raw[0];
    if ((first === '"' || first === "'" || first === '`') && raw.endsWith(first)) {
      return parseJsString(raw);
    }
    const fn = new Function(`return ${raw};`);
    const result = fn();
    return typeof result === 'string' ? result : String(result);
  } catch {
    return '';
  }
});

function parseJsString(raw: string): string {
  const quoteChar = raw[0];
  const body = raw.slice(1, -1);
  const out: string[] = [];
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch !== '\\') {
      out.push(ch);
      continue;
    }
    const next = body[i + 1];
    if (next === undefined) break;
    i++;
    switch (next) {
      case 'n':
        out.push('\n');
        break;
      case 't':
        out.push('\t');
        break;
      case 'r':
        out.push('\r');
        break;
      case '\\':
        out.push('\\');
        break;
      case "'":
        out.push("'");
        break;
      case '"':
        out.push('"');
        break;
      case '`':
        out.push('`');
        break;
      case '0':
        out.push('\0');
        break;
      case 'u': {
        const hex = body.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          out.push(String.fromCharCode(parseInt(hex, 16)));
          i += 4;
        } else out.push('u');
        break;
      }
      default:
        out.push(next);
    }
    void quoteChar;
  }
  return out.join('');
}

function toHtml() {
  htmlOutput.value = jsToHtml.value;
}
toHtml();

const { copy: copyJs } = useCopy({ source: jsOutput, text: 'JS 字符串已复制到剪贴板' });
const { copy: copyHtml } = useCopy({ source: htmlOutput, text: 'HTML 已复制到剪贴板' });
</script>
