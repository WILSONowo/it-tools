<template>
  <n-card title="哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="input"
          placeholder="要使用 bcrypt 哈希的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-form-item label="盐迭代次数" label-placement="left" label-width="120" style="margin-top: 16px">
        <n-input-number v-model:value="saltCount" placeholder="盐迭代次数..." :max="10" :min="0" style="width: 200px" />
      </n-form-item>
      <n-form-item label="哈希结果" label-placement="top" style="margin-top: 16px">
        <n-input
          :value="hashed"
          readonly
          type="textarea"
          :autosize="{ minRows: 2 }"
          style="font-family: 'Consolas', monospace; font-size: 14px"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin-top: 16px">
      <n-button secondary @click="copy"> 复制哈希 </n-button>
    </n-space>
  </n-card>

  <n-card title="比对字符串与哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="compareString"
          placeholder="用于比对的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-form-item label="哈希" label-placement="top" style="margin-top: 16px">
        <n-input
          v-model:value="compareHash"
          placeholder="用于比对的哈希..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
      </n-form-item>
      <n-form-item label="是否匹配" label-placement="top" style="margin-top: 16px" :show-feedback="false">
        <n-tag v-if="compareMatch" :bordered="false" type="success" round>是</n-tag>
        <n-tag v-else :bordered="false" type="error" round>否</n-tag>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { hashSync, compareSync } from 'bcryptjs';
import { useCopy } from '@/composable/copy';

const input = ref('');
const saltCount = ref(10);
const hashed = computed(() => hashSync(input.value, saltCount.value));
const { copy } = useCopy({ source: hashed, text: '哈希字符串已复制到剪贴板' });

const compareString = ref('');
const compareHash = ref('');
const compareMatch = computed(() => compareSync(compareString.value, compareHash.value));
</script>
