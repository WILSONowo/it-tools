<template>
  <format-transformer
    input-label="输入 YAML"
    input-placeholder="在此粘贴输入 YAML..."
    output-label="由 YAML 转换的 JSON"
    output-language="json"
    :input-validation-rules="rules"
    :transformer="transformer"
  />
</template>

<script setup lang="ts">
import type { UseValidationRule } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { parse as parseYaml } from 'yaml';

const transformer = (value: string) =>
  withDefaultOnError(() => {
    const obj = parseYaml(value);
    return obj ? JSON.stringify(obj, null, 3) : '';
  }, '');

const rules: UseValidationRule<string>[] = [
  {
    validator: (value: string) => isNotThrowing(() => parseYaml(value)),
    message: '提供的 YAML 无效。',
  },
];
</script>

<style lang="less" scoped></style>
