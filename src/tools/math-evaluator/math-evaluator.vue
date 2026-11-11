<template>
  <div style="width: 100%">
    <n-card>
      <n-form label-placement="top">
        <n-form-item label="表达式">
          <n-input
            v-model:value="expression"
            rows="1"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="数学表达式（例如：2*sqrt(6)）..."
            size="large"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </n-form-item>
      </n-form>

      <n-space justify="center" style="margin: 12px 0 16px">
        <n-button secondary :disabled="!expression" @click="clearAll">清空</n-button>
      </n-space>

      <n-form-item label="计算结果" label-placement="top">
        <n-input
          :value="resultText"
          type="textarea"
          readonly
          :autosize="{ minRows: 3 }"
          placeholder="结果将显示在这里"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>

      <n-space justify="center" style="margin-top: 12px">
        <n-button secondary :disabled="result === ''" @click="copy">复制结果</n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { withDefaultOnError } from '@/utils/defaults';
import { evaluate } from 'mathjs';
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';

const expression = ref('');

const result = computed(() => withDefaultOnError(() => evaluate(expression.value) ?? '', ''));

const resultText = computed(() => (result.value === '' ? '' : String(result.value)));

const { copy } = useCopy({ source: resultText, text: '结果已复制到剪贴板' });

function clearAll() {
  expression.value = '';
}
</script>
