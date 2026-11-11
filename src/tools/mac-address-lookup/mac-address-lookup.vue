<template>
  <div style="width: 100%">
    <n-card>
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
            style="max-width: 480px"
          />
        </n-form-item>
      </n-form>

      <n-form-item label="厂商信息:" label-placement="top">
        <n-input
          :value="details"
          type="textarea"
          readonly
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="该地址未知厂商"
          spellcheck="false"
        />
      </n-form-item>

      <n-space justify="center">
        <n-button :disabled="!details" secondary @click="copy">复制厂商信息</n-button>
      </n-space>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import db from 'oui/oui.json';
import { macAddressValidation } from '@/utils/macAddress';
import { useCopy } from '@/composable/copy';

const getVendorValue = (address: string) => address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6);

const macAddress = ref('20:37:06:12:34:56');
const details = computed<string | undefined>(() => db[getVendorValue(macAddress.value)]);

const { attrs: validationAttrs } = macAddressValidation(macAddress);

const { copy } = useCopy({ source: details, text: '厂商信息已复制到剪贴板' });
</script>

<style lang="less" scoped></style>
