<template>
  <n-form-item :label="inputLabel" v-bind="validationAttrs">
    <n-input
      ref="inputElement"
      v-model:value="input"
      :placeholder="inputPlaceholder"
      type="textarea"
      rows="20"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :input-props="{ 'data-test-id': 'input' }"
    />
  </n-form-item>
  <div v-if="clearable" class="format-transformer-actions">
    <n-space justify="center">
      <n-button secondary :disabled="!input" @click="clearInput">清空</n-button>
    </n-space>
  </div>
  <n-form-item :label="outputLabel">
    <textarea-copyable :value="output" :language="outputLanguage" :follow-height-of="inputElement" />
  </n-form-item>
</template>

<script setup lang="ts">
import { useValidation, type UseValidationRule } from '@/composable/validation';

const props = withDefaults(
  defineProps<{
    transformer?: (v: string) => string;
    inputValidationRules?: UseValidationRule<string>[];
    inputLabel?: string;
    inputPlaceholder?: string;
    inputDefault?: string;
    outputLabel?: string;
    outputLanguage?: string;
    clearable?: boolean;
  }>(),
  {
    transformer: (value: string) => value,
    inputValidationRules: () => [],
    inputLabel: '输入',
    inputDefault: '',
    inputPlaceholder: '请输入...',
    outputLabel: '输出',
    outputLanguage: '',
    clearable: false,
  },
);

const {
  transformer,
  inputValidationRules,
  inputLabel,
  outputLabel,
  outputLanguage,
  inputPlaceholder,
  inputDefault,
  clearable,
} = toRefs(props);

const input = ref(inputDefault.value);
const output = computed(() => transformer.value(input.value));
const inputElement = ref<HTMLElement | null>(null);

const { attrs: validationAttrs } = useValidation({ source: input, rules: inputValidationRules.value });

function clearInput() {
  input.value = '';
}
</script>

<style lang="less" scoped>
.format-transformer-actions {
  display: flex;
  justify-content: center;
  margin: 12px 0 16px;
}
</style>
