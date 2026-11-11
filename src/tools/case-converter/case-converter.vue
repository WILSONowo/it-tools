<template>
  <n-card title="字符串大小写转换">
    <n-form label-width="150" label-placement="left" :show-feedback="false">
      <n-form-item label="输入字符串">
        <n-input v-model:value="input" placeholder="输入要转换的字符串..." />
      </n-form-item>

      <n-form-item label="驼峰 camelCase">
        <input-copyable :value="camelCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="首字母大写">
        <input-copyable :value="capitalCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="全大写常量">
        <input-copyable :value="constantCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="点号分隔">
        <input-copyable :value="dotCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="标题式 (每词大写)">
        <input-copyable :value="headerCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="去分隔小写">
        <input-copyable :value="noCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="中划线小写">
        <input-copyable :value="paramCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="帕斯卡 PascalCase">
        <input-copyable :value="pascalCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="路径式 (斜杠)">
        <input-copyable :value="pathCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="句子式 (句首大写)">
        <input-copyable :value="sentenceCase(input, baseConfig)" />
      </n-form-item>
      <n-form-item label="下划线 snake_case">
        <input-copyable :value="snakeCase(input, baseConfig)" />
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  camelCase,
  capitalCase,
  constantCase,
  dotCase,
  headerCase,
  noCase,
  paramCase,
  pascalCase,
  pathCase,
  sentenceCase,
  snakeCase,
} from 'change-case';
import InputCopyable from '../../components/InputCopyable.vue';
import { caseConverterConfig } from './case-converter.service';

const baseConfig = caseConverterConfig;

const input = ref('lorem ipsum dolor sit amet');
</script>
