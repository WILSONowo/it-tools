<template>
  <div>
    <n-card>
      <div v-if="styleStore.isSmallScreen">
        <n-input-group>
          <n-input-group-label style="flex: 0 0 120px">输入数字:</n-input-group-label>
          <n-input v-model:value="input" w-full :status="error ? 'error' : undefined" />
        </n-input-group>
        <n-input-group>
          <n-input-group-label style="flex: 0 0 120px">输入进制:</n-input-group-label>
          <n-input-number v-model:value="inputBase" max="64" min="2" w-full />
        </n-input-group>
      </div>

      <n-input-group v-else>
        <n-input-group-label style="flex: 0 0 120px">输入数字:</n-input-group-label>
        <n-input v-model:value="input" :status="error ? 'error' : undefined" />
        <n-input-group-label style="flex: 0 0 120px">输入进制:</n-input-group-label>
        <n-input-number v-model:value="inputBase" max="64" min="2" />
      </n-input-group>

      <n-alert v-if="error" style="margin-top: 25px" type="error">{{ error }}</n-alert>
      <n-divider />

      <n-input-group>
        <n-input-group-label style="flex: 0 0 170px">二进制 (2):</n-input-group-label>
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: 2 })"
          readonly
          placeholder="二进制结果将显示在此..."
        />
      </n-input-group>

      <n-input-group>
        <n-input-group-label style="flex: 0 0 170px">八进制 (8):</n-input-group-label>
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: 8 })"
          readonly
          placeholder="八进制结果将显示在此..."
        />
      </n-input-group>

      <n-input-group>
        <n-input-group-label style="flex: 0 0 170px">十进制 (10):</n-input-group-label>
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: 10 })"
          readonly
          placeholder="十进制结果将显示在此..."
        />
      </n-input-group>

      <n-input-group>
        <n-input-group-label style="flex: 0 0 170px">十六进制 (16):</n-input-group-label>
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: 16 })"
          readonly
          placeholder="十六进制结果将显示在此..."
        />
      </n-input-group>

      <n-input-group>
        <n-input-group-label style="flex: 0 0 170px">Base64 (64 进制):</n-input-group-label>
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: 64 })"
          readonly
          placeholder="Base64 结果将显示在此..."
        />
      </n-input-group>
      <n-input-group>
        <n-input-group-label style="flex: 0 0 85px">自定义:</n-input-group-label>
        <n-input-number v-model:value="outputBase" style="flex: 0 0 86px" max="64" min="2" />
        <input-copyable
          :value="errorlessConvert({ value: input, fromBase: inputBase, toBase: outputBase })"
          readonly
          :placeholder="`${outputBase} 进制结果将显示在此...`"
        />
      </n-input-group>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStyleStore } from '@/stores/style.store';
import { getErrorMessageIfThrows } from '@/utils/error';
import { convertBase } from './integer-base-converter.model';
import InputCopyable from '../../components/InputCopyable.vue';

const styleStore = useStyleStore();

const input = ref('42');
const inputBase = ref(10);
const outputBase = ref(42);

function errorlessConvert(...args: Parameters<typeof convertBase>) {
  try {
    return convertBase(...args);
  } catch (err) {
    return '';
  }
}

const error = computed(() =>
  getErrorMessageIfThrows(() =>
    convertBase({ value: input.value, fromBase: inputBase.value, toBase: outputBase.value }),
  ),
);
</script>

<style lang="less" scoped>
.n-input-group:not(:first-child) {
  margin-top: 5px;
}
</style>
