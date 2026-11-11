<template>
  <div style="width: 100%">
    <n-card>
      <n-alert title="说明" type="info" :show-icon="false" style="margin-bottom: 16px">
        本工具采用 IETF 建议的第一种方法:使用当前时间戳加上 MAC 地址,经 SHA1 哈希后取低 40 位,生成随机的 ULA 地址。
      </n-alert>

      <n-form label-placement="top">
        <n-form-item label="MAC 地址:" v-bind="validationAttrs">
          <n-input
            v-model:value="macAddress"
            size="large"
            placeholder="输入 MAC 地址"
            clearable
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
        </n-form-item>
      </n-form>

      <n-form v-if="validationAttrs.validationStatus !== 'error'" label-placement="left" label-width="200">
        <n-form-item
          v-for="{ label, value } in calculatedSections"
          :key="label"
          :label="label"
          style="margin: 0 0 12px"
        >
          <input-copyable :value="value" readonly />
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { SHA1 } from 'crypto-js';
import InputCopyable from '@/components/InputCopyable.vue';
import { macAddressValidation } from '@/utils/macAddress';

const macAddress = ref('20:37:06:12:34:56');
const calculatedSections = computed(() => {
  const timestamp = new Date().getTime();
  const hex40bit = SHA1(timestamp + macAddress.value)
    .toString()
    .substring(30);

  const ula = 'fd' + hex40bit.substring(0, 2) + ':' + hex40bit.substring(2, 6) + ':' + hex40bit.substring(6);

  return [
    {
      label: 'IPv6 ULA:',
      value: `${ula}::/48`,
    },
    {
      label: '第一个可路由网段:',
      value: `${ula}:0::/64`,
    },
    {
      label: '最后一个可路由网段:',
      value: `${ula}:ffff::/64`,
    },
  ];
});
const { attrs: validationAttrs } = macAddressValidation(macAddress);
</script>

<style lang="less" scoped></style>
