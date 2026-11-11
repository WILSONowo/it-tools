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
        <n-form-item
          label="JS 字符串(支持 '…'、&quot;…&quot;、`…` 及用 + 拼接,不会执行代码)"
          :feedback="jsToHtml.error"
          :validation-status="jsToHtml.error ? 'error' : undefined"
        >
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
import { type QuoteStyle, jsStringToText, textToJsString } from './html-js-converter.service';

const htmlInput = ref('<div class="card">\n  Hello &amp; welcome\n</div>');
const quote = ref<QuoteStyle>('double');
const jsInput = ref('\'<div class="card">\\n  Hello &amp; welcome\\n</div>\'');
const htmlOutput = ref('');

const htmlToJs = computed(() => textToJsString(htmlInput.value, quote.value));

const jsOutput = ref('');
function toJs() {
  jsOutput.value = htmlToJs.value;
}
toJs();

const jsToHtml = computed<{ value: string; error: string }>(() => {
  try {
    return { value: jsStringToText(jsInput.value), error: '' };
  } catch (e) {
    return { value: '', error: (e as Error).message };
  }
});

function toHtml() {
  htmlOutput.value = jsToHtml.value.value;
}
toHtml();

const { copy: copyJs } = useCopy({ source: jsOutput, text: 'JS 字符串已复制到剪贴板' });
const { copy: copyHtml } = useCopy({ source: htmlOutput, text: 'HTML 已复制到剪贴板' });
</script>
