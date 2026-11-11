<template>
  <n-grid y-gap="16" cols="1 1100:2" x-gap="16" responsive="screen" style="width: 100%">
    <n-gi>
      <n-card title="转义 HTML 实体">
        <n-form-item label="输入字符串">
          <n-input
            v-model:value="escapeInput"
            type="textarea"
            placeholder="要转义的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="转义结果">
          <n-input
            type="textarea"
            readonly
            placeholder="转义后的字符串"
            :value="escapeOutput"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-space justify="center">
          <n-button secondary @click="copyEscaped">复制</n-button>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="反转义 HTML 实体">
        <n-form-item label="输入已转义字符串">
          <n-input
            v-model:value="unescapeInput"
            type="textarea"
            placeholder="要反转义的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-form-item label="反转义结果">
          <n-input
            :value="unescapeOutput"
            type="textarea"
            readonly
            placeholder="反转义后的字符串"
            :autosize="{ minRows: 4 }"
          />
        </n-form-item>

        <n-space justify="center">
          <n-button secondary @click="copyUnescaped">复制</n-button>
        </n-space>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { decodeHtmlEntities, escapeHtmlEntities } from './html-entities.service';

const escapeInput = ref('<title>IT Tool</title>');
const escapeOutput = computed(() => escapeHtmlEntities(escapeInput.value));
const { copy: copyEscaped } = useCopy({ source: escapeOutput });

const unescapeInput = ref('&lt;title&gt;IT Tool&lt;/title');
const unescapeOutput = computed(() => decodeHtmlEntities(unescapeInput.value));
const { copy: copyUnescaped } = useCopy({ source: unescapeOutput });
</script>
