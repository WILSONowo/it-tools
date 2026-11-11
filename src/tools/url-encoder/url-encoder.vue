<template>
  <n-grid y-gap="16" cols="1 1100:2" x-gap="16" responsive="screen" style="width: 100%">
    <n-gi>
      <n-card title="URL 编码">
        <n-form-item
          label="待编码的字符串"
          :feedback="encodedValidation.message"
          :validation-status="encodedValidation.status"
        >
          <n-input
            v-model:value="encodeInput"
            type="textarea"
            placeholder="要编码的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="编码后的字符串">
          <n-input
            :value="encodeOutput"
            type="textarea"
            readonly
            placeholder="编码后的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-space justify="center">
          <n-button secondary @click="copyEncoded">复制</n-button>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="URL 解码">
        <n-form-item
          label="待解码的字符串"
          :feedback="decodeValidation.message"
          :validation-status="decodeValidation.status"
        >
          <n-input
            v-model:value="decodeInput"
            type="textarea"
            placeholder="要解码的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="解码后的字符串">
          <n-input
            :value="decodeOutput"
            type="textarea"
            readonly
            placeholder="解码后的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-space justify="center">
          <n-button secondary @click="copyDecoded">复制</n-button>
        </n-space>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { computed, ref } from 'vue';

const encodeInput = ref('Hello world :)');
const encodeOutput = computed(() => withDefaultOnError(() => encodeURIComponent(encodeInput.value), ''));

const encodedValidation = useValidation({
  source: encodeInput,
  rules: [
    {
      validator: (value) => isNotThrowing(() => encodeURIComponent(value)),
      message: '无法解析此字符串',
    },
  ],
});

const { copy: copyEncoded } = useCopy({ source: encodeOutput, text: '编码后的字符串已复制到剪贴板' });

const decodeInput = ref('Hello%20world%20%3A)');
const decodeOutput = computed(() => withDefaultOnError(() => decodeURIComponent(decodeInput.value), ''));

const decodeValidation = useValidation({
  source: decodeInput,
  rules: [
    {
      validator: (value) => isNotThrowing(() => decodeURIComponent(value)),
      message: '无法解析此字符串',
    },
  ],
});

const { copy: copyDecoded } = useCopy({ source: decodeOutput, text: '解码后的字符串已复制到剪贴板' });
</script>
