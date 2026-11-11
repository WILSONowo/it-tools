<template>
  <n-card title="IPv6 压缩 / 展开">
    <n-form label-placement="top">
      <n-form-item label="IPv6 地址" :feedback="feedback" :validation-status="status">
        <n-input
          v-model:value="input"
          placeholder="2001:db8::1、::ffff:192.0.2.1 或 fe80::1%eth0"
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
      <n-space justify="center">
        <n-button type="primary" secondary @click="expand">展开 (全格式)</n-button>
        <n-button type="primary" secondary @click="compress">压缩 (最短)</n-button>
        <n-button secondary :disabled="!output" @click="copy">复制</n-button>
        <n-button secondary :disabled="!output" @click="clear">清空</n-button>
      </n-space>
    </n-form>
    <n-form-item label="结果" label-placement="top" style="margin: 16px 0 0">
      <n-input
        :value="output"
        type="textarea"
        readonly
        :autosize="{ minRows: 3 }"
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { compressIpv6, expandIpv6, type ParsedIpv6, parseIpv6 } from './ipv6-expand-compress.service';

const input = ref('2001:db8::1');
const output = ref('');
const feedback = ref('');
const status = ref<string | undefined>(undefined);

function convert(format: (parsed: ParsedIpv6) => string) {
  if (input.value.trim() === '') return;
  const parsed = parseIpv6(input.value);
  if (parsed === null) {
    feedback.value = '无效的 IPv6 地址';
    status.value = 'error';
    output.value = '';
    return;
  }
  feedback.value = '';
  status.value = undefined;
  output.value = format(parsed);
}

const expand = () => convert(expandIpv6);
const compress = () => convert(compressIpv6);

const { copy } = useCopy({ source: output, text: '结果已复制到剪贴板' });

function clear() {
  output.value = '';
  feedback.value = '';
  status.value = undefined;
}

expand();
</script>
