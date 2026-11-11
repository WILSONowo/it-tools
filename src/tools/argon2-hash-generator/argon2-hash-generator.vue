<template>
  <n-card title="生成哈希">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="input"
          placeholder="输入要哈希的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'input',
          }"
        />
      </n-form-item>
      <n-grid y-gap="16" cols="1 600:2" x-gap="12" responsive="screen" style="margin-top: 16px">
        <n-gi>
          <n-form-item label="迭代次数" label-placement="left" label-width="100">
            <n-input-number v-model:value="iterations" placeholder="迭代次数..." :min="0" style="width: 100%" />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="内存大小" label-placement="left" label-width="100">
            <n-input-number v-model:value="memorySize" placeholder="内存大小..." :min="0" style="width: 100%" />
          </n-form-item>
        </n-gi>
      </n-grid>
      <n-form-item label="哈希结果" label-placement="top" style="margin-top: 16px">
        <n-input
          :value="hashed"
          readonly
          type="textarea"
          :autosize="{ minRows: 3 }"
          style="font-family: 'Consolas', monospace; font-size: 14px"
          placeholder="在上方输入字符串以生成哈希..."
          :input-props="{
            'data-test-id': 'hash',
          }"
        />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin-top: 16px">
      <n-button secondary @click="copy"> 复制哈希 </n-button>
    </n-space>
  </n-card>

  <n-card title="字符串与哈希比对">
    <n-form label-placement="top">
      <n-form-item label="字符串">
        <n-input
          v-model:value="compareString"
          placeholder="输入要比对的字符串..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'compare-string',
          }"
        />
      </n-form-item>
      <n-form-item label="哈希" label-placement="top" style="margin-top: 16px">
        <n-input
          v-model:value="compareHash"
          placeholder="输入要比对的哈希..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          :input-props="{
            'data-test-id': 'compare-hash',
          }"
        />
      </n-form-item>
      <n-form-item label="是否匹配" label-placement="top" style="margin-top: 16px" :show-feedback="false">
        <span data-test-id="do-they-match">
          <n-tag v-if="compareMatch" :bordered="false" type="success" round>匹配</n-tag>
          <n-tag v-else :bordered="false" type="error" round>不匹配</n-tag>
        </span>
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { argon2id, argon2Verify } from 'hash-wasm';

const input = ref('');
const iterations = ref(32);
const memorySize = ref(512);
const hashLength = ref(32);

const hashed = computedAsync(
  async () =>
    argon2id({
      password: input.value,
      salt: window.crypto.getRandomValues(new Uint8Array(16)),
      parallelism: 1,
      iterations: iterations.value,
      memorySize: memorySize.value,
      hashLength: hashLength.value,
      outputType: 'encoded',
    }),
  '',
);
const { copy } = useCopy({ source: hashed, text: '哈希字符串已复制到剪贴板' });

const compareString = ref('');
const compareHash = ref('');
const compareMatch = computedAsync(
  () => argon2Verify({ password: compareString.value, hash: compareHash.value }),
  false,
);
</script>
