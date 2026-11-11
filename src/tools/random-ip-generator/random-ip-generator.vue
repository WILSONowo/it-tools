<template>
  <n-card title="随机 IP / MAC 生成器">
    <n-form label-placement="left" label-width="170">
      <n-form-item label="类型">
        <n-select v-model:value="kind" :options="kindOptions" />
      </n-form-item>

      <n-form-item label="数量">
        <n-input-number v-model:value="count" :min="1" :max="200" style="width: 140px" />
      </n-form-item>

      <template v-if="kind === 'mac'">
        <n-form-item label="格式">
          <n-radio-group v-model:value="macFormat">
            <n-radio-button value="aa:bb:cc:dd:ee:ff">xx:xx:xx:xx:xx:xx</n-radio-button>
            <n-radio-button value="aabb.ccdd.eeff">xxxx.xxxx.xxxx</n-radio-button>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="大小写">
          <n-radio-group v-model:value="macCase">
            <n-radio-button value="upper">大写</n-radio-button>
            <n-radio-button value="lower">小写</n-radio-button>
          </n-radio-group>
        </n-form-item>
      </template>
    </n-form>

    <n-input
      :value="output"
      type="textarea"
      :autosize="{ minRows: 6 }"
      readonly
      spellcheck="false"
      style="font-family: monospace"
    />
    <n-space justify="center" style="margin-top: 14px">
      <n-button type="primary" secondary @click="generate">生成</n-button>
      <n-button secondary @click="copy">复制</n-button>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { type MacFormat, randomIpv4, randomIpv6, randomMac } from './random-ip-generator.service';

const kind = ref('ipv4');
const count = ref(10);
const macFormat = ref<MacFormat>('aa:bb:cc:dd:ee:ff');
const macCase = ref<'upper' | 'lower'>('lower');

const kindOptions = [
  { label: 'IPv4', value: 'ipv4' },
  { label: 'IPv6', value: 'ipv6' },
  { label: 'MAC 地址', value: 'mac' },
];

const output = ref('');
function generate() {
  const lines: string[] = [];
  for (let i = 0; i < (count.value ?? 0); i++) {
    if (kind.value === 'ipv4') {
      lines.push(randomIpv4());
    } else if (kind.value === 'ipv6') {
      lines.push(randomIpv6());
    } else {
      lines.push(randomMac({ format: macFormat.value, uppercase: macCase.value === 'upper' }));
    }
  }
  output.value = lines.join('\n');
}

generate();

const { copy } = useCopy({ source: output, text: '地址已复制到剪贴板' });
</script>
