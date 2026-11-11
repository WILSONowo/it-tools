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
            <n-button secondary :disabled="comboResults.length === 0" @click="copyOutput">复制</n-button>
          </n-space>
          <n-alert v-if="comboError" type="error" style="margin-bottom: 10px">{{ comboError }}</n-alert>
          <n-form-item :label="`生成结果(共 ${comboResults.length} 条)`">
            <n-input
              :value="comboText"
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
          <n-form-item label="模板(用 {{变量名}} 占位)" style="margin-bottom: 8px">
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
            <n-button secondary :disabled="templateResults.length === 0" @click="copyTemplateOutput">复制</n-button>
          </n-space>
          <n-alert v-if="templateError" type="error" style="margin-bottom: 10px">{{ templateError }}</n-alert>
          <n-form-item :label="`生成结果(共 ${templateResults.length} 条)`">
            <n-input
              :value="templateText"
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
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { MAX_GENERATED_URLS, generateComboUrls, generateTemplateUrls } from './url-batch-generator.service';

const base = ref('https://example.com/api');
const paramConfig = ref('id = 1 | 2 | 3\ntype = a | b');
const comboResults = ref<string[]>([]);
const comboError = ref('');
const template = ref('https://example.com/{{a}}-{{b}}');
const templateVars = ref('a = x | y\nb = 1 | 2');
const templateResults = ref<string[]>([]);
const templateError = ref('');

function generateCombos() {
  const { urls, error } = generateComboUrls({ base: base.value, config: paramConfig.value, max: MAX_GENERATED_URLS });
  comboResults.value = urls;
  comboError.value = error ?? '';
}

function generateTemplates() {
  const { urls, error } = generateTemplateUrls({
    template: template.value,
    config: templateVars.value,
    max: MAX_GENERATED_URLS,
  });
  templateResults.value = urls;
  templateError.value = error ?? '';
}

const comboText = computed(() => comboResults.value.join('\n'));
const templateText = computed(() => templateResults.value.join('\n'));

const { copy: copyOutput } = useCopy({ source: comboText, text: '已复制' });
const { copy: copyTemplateOutput } = useCopy({ source: templateText, text: '已复制' });
</script>
