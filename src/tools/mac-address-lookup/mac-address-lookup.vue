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
        <n-alert v-if="loadError" type="error" :show-icon="false" style="width: 100%">
          厂商数据库加载失败:{{ loadError }}
          <n-button size="small" secondary style="margin-left: 8px" @click="loadDatabase">重试</n-button>
        </n-alert>
        <n-space v-else-if="db === null" align="center" style="width: 100%; min-height: 80px">
          <n-spin size="small" />
          <n-text depth="3">正在加载厂商数据库(约 3 MB)...</n-text>
        </n-space>
        <n-input
          v-else
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
import { computed, onMounted, ref, shallowRef } from 'vue';
import { macAddressValidation } from '@/utils/macAddress';
import { useCopy } from '@/composable/copy';

const getVendorValue = (address: string) => address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6);

// The OUI database is ~3.4 MB: load it lazily in its own chunk instead of bundling it into the route chunk.
const db = shallowRef<Record<string, string> | null>(null);
const loadError = ref('');

async function loadDatabase() {
  loadError.value = '';
  try {
    db.value = (await import('oui/oui.json')).default;
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(loadDatabase);

const macAddress = ref('20:37:06:12:34:56');
const details = computed<string | undefined>(() => db.value?.[getVendorValue(macAddress.value)]);

const { attrs: validationAttrs } = macAddressValidation(macAddress);

const { copy } = useCopy({ source: details, text: '厂商信息已复制到剪贴板' });
</script>

<style lang="less" scoped></style>
