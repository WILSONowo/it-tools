<template>
  <n-card title="颜色格式转换">
    <n-form label-width="120" label-placement="left" :show-feedback="false">
      <n-form-item label="取色器" style="margin-top: 0">
        <n-color-picker
          v-model:value="hex"
          placement="bottom-end"
          @update:value="(v: string) => onInputUpdated(v, 'hex')"
        />
      </n-form-item>
      <n-form-item label="颜色名称">
        <input-copyable v-model:value="name" :on-input="(v: string) => onInputUpdated(v, 'name')" />
      </n-form-item>
      <n-form-item label="HEX">
        <input-copyable v-model:value="hex" :on-input="(v: string) => onInputUpdated(v, 'hex')" />
      </n-form-item>
      <n-form-item label="RGB">
        <input-copyable v-model:value="rgb" :on-input="(v: string) => onInputUpdated(v, 'rgb')" />
      </n-form-item>
      <n-form-item label="HSL">
        <input-copyable v-model:value="hsl" :on-input="(v: string) => onInputUpdated(v, 'hsl')" />
      </n-form-item>
      <n-form-item label="HWB">
        <input-copyable v-model:value="hwb" :on-input="(v: string) => onInputUpdated(v, 'hwb')" />
      </n-form-item>
      <n-form-item label="LCH">
        <input-copyable v-model:value="lch" :on-input="(v: string) => onInputUpdated(v, 'lch')" />
      </n-form-item>
      <n-form-item label="CMYK">
        <input-copyable v-model:value="cmyk" :on-input="(v: string) => onInputUpdated(v, 'cmyk')" />
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { colord, extend } from 'colord';

import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import InputCopyable from '../../components/InputCopyable.vue';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const name = ref('');
const hex = ref('#1ea54cff');
const rgb = ref('');
const hsl = ref('');
const hwb = ref('');
const cmyk = ref('');
const lch = ref('');

function onInputUpdated(value: string, omit: string) {
  const color = colord(value);
  // Partial input such as "#12" is not a valid color yet: keep the other fields untouched
  if (!color.isValid()) {
    return;
  }

  if (omit !== 'name') name.value = color.toName({ closest: true }) ?? '';
  if (omit !== 'hex') hex.value = color.toHex();
  if (omit !== 'rgb') rgb.value = color.toRgbString();
  if (omit !== 'hsl') hsl.value = color.toHslString();
  if (omit !== 'hwb') hwb.value = color.toHwbString();
  if (omit !== 'cmyk') cmyk.value = color.toCmykString();
  if (omit !== 'lch') lch.value = color.toLchString();
}

onInputUpdated(hex.value, 'hex');
</script>
