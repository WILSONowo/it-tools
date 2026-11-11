<template>
  <div>
    <n-form-item label="IPv4 地址(可带掩码)" v-bind="validationAttrs">
      <n-input v-model:value="ip" />
    </n-form-item>

    <div v-if="networkInfo">
      <n-table>
        <tbody>
          <tr v-for="{ getValue, label, undefinedFallback } in sections" :key="label">
            <td>
              <n-text strong>{{ label }}</n-text>
            </td>
            <td>
              <copyable-ip-like v-if="getValue(networkInfo)" :ip="getValue(networkInfo)"></copyable-ip-like>
              <n-text v-else depth="3">{{ undefinedFallback }}</n-text>
            </td>
          </tr>
        </tbody>
      </n-table>

      <n-space style="margin-top: 14px" justify="space-between">
        <n-button tertiary :disabled="!canSwitch(-1)" @click="switchToBlock({ count: -1 })">
          <n-icon :component="ArrowLeft" />
          上一个子网
        </n-button>
        <n-button tertiary :disabled="!canSwitch(1)" @click="switchToBlock({ count: 1 })">
          下一个子网
          <n-icon :component="ArrowRight" />
        </n-button>
      </n-space>
      <n-text v-if="!canSwitch(-1) || !canSwitch(1)" depth="3" style="display: block; margin-top: 8px; font-size: 12px">
        已到达 IPv4 地址空间的{{
          !canSwitch(-1) && !canSwitch(1) ? '两端' : !canSwitch(-1) ? '起始' : '末尾'
        }},没有更多子网
      </n-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Netmask } from 'netmask';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { useStorage } from '@vueuse/core';
import { ArrowLeft, ArrowRight } from '@vicons/tabler';
import { formatIpv4, parseIpv4 } from '@/utils/ipv4';
import { getAdjacentBlockBase, getIPClass } from './ipv4-subnet-calculator.models';
import CopyableIpLike from './copyable-ip-like.vue';

const ip = useStorage('ipv4-subnet-calculator:ip', '192.168.0.1/24');

const getNetworkInfo = (address: string) => new Netmask(address.trim());

const networkInfo = computed(() => withDefaultOnError(() => getNetworkInfo(ip.value), undefined));

const { attrs: validationAttrs } = useValidation({
  source: ip,
  rules: [
    {
      message: '无法解析该地址,请检查格式',
      validator: (value) => isNotThrowing(() => getNetworkInfo(value.trim())),
    },
  ],
});

const sections: {
  label: string;
  getValue: (blocks: Netmask) => string | undefined;
  undefinedFallback?: string;
}[] = [
  {
    label: '网络块',
    getValue: (block) => block.toString(),
  },
  {
    label: '网络地址',
    getValue: ({ base }) => base,
  },
  {
    label: '子网掩码',
    getValue: ({ mask }) => mask,
  },
  {
    label: '二进制掩码',
    getValue: ({ bitmask }) => ('1'.repeat(bitmask) + '0'.repeat(32 - bitmask)).match(/.{8}/g)?.join('.') ?? '',
  },
  {
    label: 'CIDR 表示法',
    getValue: ({ bitmask }) => `/${bitmask}`,
  },
  {
    label: '通配符掩码',
    getValue: ({ hostmask }) => hostmask,
  },
  {
    label: '网络大小',
    getValue: ({ size }) => String(size),
  },
  {
    label: '起始地址',
    getValue: ({ first }) => first,
  },
  {
    label: '结束地址',
    getValue: ({ last }) => last,
  },
  {
    label: '广播地址',
    getValue: ({ broadcast }) => broadcast,
    undefinedFallback: '此掩码下无广播地址',
  },
  {
    label: 'IP 类别',
    getValue: ({ base: ip }) => getIPClass({ ip }),
    undefinedFallback: '未知类别',
  },
];

function getAdjacentBlock(count: number) {
  const info = networkInfo.value;
  if (!info) return null;

  const current = parseIpv4(info.base);
  if (current === null) return null;

  const base = getAdjacentBlockBase({ base: current, size: info.size, count });
  return base === null ? null : `${formatIpv4(base)}/${info.bitmask}`;
}

function canSwitch(count: number) {
  return getAdjacentBlock(count) !== null;
}

function switchToBlock({ count = 1 }: { count?: number }) {
  const next = getAdjacentBlock(count);

  if (next) {
    ip.value = next;
  }
}
</script>

<style lang="less" scoped></style>
