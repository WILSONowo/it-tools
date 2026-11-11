<template>
  <div>
    <n-card title="阿拉伯数字 → 罗马数字">
      <n-form label-placement="left" label-width="200" :show-feedback="false">
        <n-form-item label="阿拉伯数字" v-bind="validationNumeral">
          <n-input-number
            v-model:value="inputNumeral"
            :min="1"
            :max="MAX_ARABIC_TO_ROMAN"
            style="width: 220px"
            :show-button="false"
          />
        </n-form-item>
      </n-form>
      <div class="result-line">
        <span class="result-label">罗马数字</span>
        <span class="result-value">{{ outputRoman || '—' }}</span>
        <n-button secondary :disabled="!outputRoman" @click="copyRoman">复制</n-button>
      </div>
    </n-card>

    <n-card title="罗马数字 → 阿拉伯数字" style="margin-top: 16px">
      <n-form label-placement="left" label-width="200" :show-feedback="false">
        <n-form-item label="罗马数字" v-bind="validationRoman">
          <n-input v-model:value="inputRoman" placeholder="如 XLII" style="width: 220px" spellcheck="false" />
        </n-form-item>
      </n-form>
      <div class="result-line">
        <span class="result-label">阿拉伯数字</span>
        <span class="result-value">{{ outputNumeral || '—' }}</span>
        <n-button secondary :disabled="!outputNumeral" @click="copyArabic">复制</n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { ref, computed } from 'vue';
import { useValidation } from '@/composable/validation';
import {
  arabicToRoman,
  romanToArabic,
  MAX_ARABIC_TO_ROMAN,
  MIN_ARABIC_TO_ROMAN,
  isValidRomanNumber,
} from './roman-numeral-converter.service';

const inputNumeral = ref(42);
const outputRoman = computed(() => arabicToRoman(inputNumeral.value));

const { attrs: validationNumeral } = useValidation({
  source: inputNumeral,
  rules: [
    {
      validator: (value) => value >= MIN_ARABIC_TO_ROMAN && value <= MAX_ARABIC_TO_ROMAN,
      message: `我们只能转换 ${MIN_ARABIC_TO_ROMAN.toLocaleString()} 到 ${MAX_ARABIC_TO_ROMAN.toLocaleString()} 之间的数字`,
    },
  ],
});

const inputRoman = ref('XLII');
const outputNumeral = computed(() => romanToArabic(inputRoman.value));

const { attrs: validationRoman } = useValidation({
  source: inputRoman,
  rules: [
    {
      validator: (value) => isValidRomanNumber(value),
      message: `您输入的不是有效的罗马数字`,
    },
  ],
});

const { copy: copyRoman } = useCopy({ source: outputRoman, text: '罗马数字已复制到剪贴板' });
const { copy: copyArabic } = useCopy({ source: outputNumeral, text: '阿拉伯数字已复制到剪贴板' });
</script>

<style lang="less" scoped>
.result-line {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.result-label {
  width: 200px;
  flex: none;
  font-size: 14px;
  color: rgba(128, 128, 128, 0.9);
  text-align: right;
  padding-right: 16px;
}

.result-value {
  flex: 1;
  font-size: 24px;
  font-family: 'Consolas', 'Courier New', monospace;
  word-break: break-all;
}
</style>
