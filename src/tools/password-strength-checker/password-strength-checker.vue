<template>
  <div>
    <n-card title="密码强度(安全/不安全)">
      <n-form label-placement="left" label-width="140" :show-feedback="false">
        <n-form-item label="输入密码" v-bind="validationAttrs">
          <n-input
            v-model:value="password"
            type="password"
            show-password-on="click"
            placeholder="输入要分析的密码..."
          />
        </n-form-item>
      </n-form>

      <n-alert v-if="validationAttrs.validationStatus === 'error'" type="error" :show-icon="false">
        密码长度应至少为 4 个字符。
      </n-alert>
      <div v-if="password.length >= 4">
        <n-progress
          type="line"
          :percentage="score"
          :status="score < 30 ? 'error' : score < 60 ? 'warning' : score < 80 ? 'info' : 'success'"
          :height="20"
        />
        <n-tag :type="scoreLabel.type" size="large">{{ scoreLabel.label }}</n-tag>

        <n-grid y-gap="16" cols="1 600:3" x-gap="12" responsive="screen" style="margin-top: 16px">
          <n-gi>
            <n-statistic label="长度" :value="password.length" />
          </n-gi>
          <n-gi>
            <n-statistic label="熵(Entropy)" :value="entropy.toFixed(1)" />
          </n-gi>
          <n-gi>
            <n-statistic label="破解所需时间" :value="timeToCrack" />
          </n-gi>
        </n-grid>
      </div>
    </n-card>

    <n-card title="密码生成器">
      <n-form label-placement="left" label-width="180" :show-feedback="false">
        <n-grid cols="2 800:3" x-gap="12" y-gap="0" responsive="screen">
          <n-gi>
            <n-form-item label="长度">
              <n-input-number v-model:value="genLength" :min="4" :max="64" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="数字">
              <n-switch v-model:value="withNumbers" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="符号">
              <n-switch v-model:value="withSymbols" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="大写字母">
              <n-switch v-model:value="withUppercase" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="排除易混淆字符(Il1O0o)">
              <n-switch v-model:value="noAmbiguous" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="避免相似密码">
              <n-switch v-model:value="avoidMatchesScore" />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>

      <n-form-item label="生成结果" label-placement="top" style="margin-top: 8px">
        <n-input
          :value="generated"
          type="textarea"
          :autosize="{ minRows: 3 }"
          readonly
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
      <n-space justify="center">
        <n-button type="primary" @click="regenerate">生成</n-button>
        <n-button secondary :disabled="!generated" @click="copyGenerated">复制</n-button>
      </n-space>
      <n-text v-if="generationWarning" depth="3" style="display: block; text-align: center; margin-top: 8px">
        {{ generationWarning }}
      </n-text>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { computed, ref, watch } from 'vue';
import { createToken } from '../token-generator/token-generator.service';
import { estimateEntropy, scorePassword, timeToCrackLabel } from './password-strength.service';

const password = ref('');

const validationAttrs = computed(() =>
  password.value.length >= 4
    ? { validationStatus: undefined, feedback: '' }
    : password.value.length === 0
    ? { validationStatus: undefined, feedback: '' }
    : { validationStatus: 'error', feedback: '密码长度应至少为 4 个字符。' },
);
const score = computed(() => {
  if (password.value.length < 4) return 0;

  return scorePassword(password.value);
});

const entropy = computed(() => {
  if (password.value.length < 4) return 0;

  return estimateEntropy(password.value);
});

const timeToCrack = computed(() => {
  if (password.value.length < 4) return '-';

  return timeToCrackLabel(entropy.value);
});

const scoreLabel = computed(() => {
  const value = score.value;
  if (value < 30) return { type: 'error' as const, label: '弱密码' };
  if (value < 60) return { type: 'warning' as const, label: '一般密码' };
  if (value < 80) return { type: 'info' as const, label: '良好密码' };

  return { type: 'success' as const, label: '强密码' };
});

const genLength = ref(16);
const withNumbers = ref(true);
const withSymbols = ref(true);
const withUppercase = ref(true);
const noAmbiguous = ref(false);
const avoidMatchesScore = ref(false);

const generationWarning = ref('');
const ambiguousChars = 'Il1O0o';
const generated = ref('');

function regenerate() {
  let candidate = '';
  const pool = {
    withUppercase: withUppercase.value,
    withLowercase: true,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
    exclude: noAmbiguous.value ? ambiguousChars : '',
  };

  for (let attempt = 0; attempt < 50; attempt++) {
    candidate = createToken({ length: genLength.value, ...pool });
    if (password.value.length < 4) break;
    if (avoidMatchesScore.value && scorePassword(candidate) >= score.value) break;
    if (!avoidMatchesScore.value) break;
  }
  if (avoidMatchesScore.value && scorePassword(candidate) < score.value) {
    generationWarning.value = '无法生成比所分析密码得分更高的密码。';
  } else {
    generationWarning.value = '';
  }

  generated.value = candidate;
}

watch([genLength, withNumbers, withSymbols, withUppercase, noAmbiguous], regenerate);
regenerate();

const { copy: copyGenerated } = useCopy({ source: generated, text: '密码已复制到剪贴板' });
</script>
