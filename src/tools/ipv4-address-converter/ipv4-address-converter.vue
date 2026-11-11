<template>
  <div>
    <n-form-item label="IPv4 地址:" v-bind="validationAttrs">
      <n-input v-model:value="rawIpAddress" placeholder="输入 IPv4 地址..." />
    </n-form-item>

    <n-divider style="margin-top: 0" mt-0 />

    <n-form-item
      v-for="{ label, value } of convertedSections"
      :key="label"
      :label="label"
      label-placement="left"
      label-width="150"
    >
      <input-copyable
        :value="validationAttrs.validationStatus === 'error' ? '' : value"
        placeholder="请输入正确的 IPv4 地址"
      />
    </n-form-item>
  </div>
</template>

<script setup lang="ts">
import { useValidation } from '@/composable/validation';
import { convertBase } from '../integer-base-converter/integer-base-converter.model';
import { ipv4ToInt, ipv4ToIpv6, isValidIpv4 } from './ipv4-address-converter.service';

const rawIpAddress = useStorage('ipv4-converter:ip', '192.168.1.1');

const convertedSections = computed(() => {
  const ipInDecimal = ipv4ToInt({ ip: rawIpAddress.value });

  return [
    {
      label: '十进制: ',
      value: String(ipInDecimal),
    },
    {
      label: '十六进制: ',
      value: convertBase({ fromBase: 10, toBase: 16, value: String(ipInDecimal) }).toUpperCase(),
    },
    {
      label: '二进制: ',
      value: convertBase({ fromBase: 10, toBase: 2, value: String(ipInDecimal) }),
    },
    {
      label: 'IPv6: ',
      value: ipv4ToIpv6({ ip: rawIpAddress.value }),
    },
    {
      label: 'IPv6 (短格式): ',
      value: ipv4ToIpv6({ ip: rawIpAddress.value, prefix: '::ffff:' }),
    },
  ];
});

const { attrs: validationAttrs } = useValidation({
  source: rawIpAddress,
  rules: [{ message: '无效的 IPv4 地址', validator: (ip) => isValidIpv4({ ip }) }],
});
</script>

<style lang="less" scoped></style>
