<template>
  <n-card title="Basic Auth 请求头生成">
    <n-form label-placement="top">
      <n-grid y-gap="16" cols="1 600:2" x-gap="12" responsive="screen">
        <n-gi>
          <n-form-item label="用户名">
            <n-input v-model:value="username" placeholder="用户名..." clearable />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="密码">
            <n-input
              v-model:value="password"
              placeholder="密码..."
              type="password"
              show-password-on="click"
              clearable
            />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>

    <n-form-item label="Authorization 请求头" label-placement="top" style="margin-top: 16px">
      <n-input
        :value="header"
        type="textarea"
        readonly
        :autosize="{ minRows: 2 }"
        placeholder="生成的请求头将显示在这里"
        spellcheck="false"
        style="font-family: monospace; font-size: 13px"
      />
    </n-form-item>

    <n-space justify="center" style="margin-top: 16px">
      <n-button secondary @click="copy">复制请求头</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { textToBase64 } from '@/utils/base64';
import { computed, ref } from 'vue';

const username = ref('');
const password = ref('');
const header = computed(() => `Authorization: Basic ${textToBase64(`${username.value}:${password.value}`)}`);

const { copy } = useCopy({ source: header, text: '请求头已复制到剪贴板' });
</script>
