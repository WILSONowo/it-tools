<template>
  <div style="width: 100%">
    <n-card style="text-align: center; padding: 40px 0; margin-bottom: 16px">
      <n-h2 v-if="event">{{ event.key }}</n-h2>
      <n-text strong depth="3">按下键盘上想要查询信息的按键</n-text>
    </n-card>

    <n-form label-placement="left" label-width="150">
      <n-form-item
        v-for="({ label, value, placeholder }, i) of fields"
        :key="i"
        :label="label"
        :show-feedback="false"
        style="margin: 0 0 12px"
      >
        <input-copyable :value="value" readonly :placeholder="placeholder" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { computed, ref } from 'vue';
import InputCopyable from '../../components/InputCopyable.vue';

const event = ref<KeyboardEvent>();

useEventListener(document, 'keydown', (e) => {
  event.value = e;
});

const fields = computed(() => {
  if (!event.value) return [];

  return [
    {
      label: '按键 :',
      value: event.value.key,
      placeholder: '按键名称...',
    },
    {
      label: '键码 :',
      value: String(event.value.keyCode),
      placeholder: '键码...',
    },
    {
      label: '代码 :',
      value: event.value.code,
      placeholder: '代码...',
    },
    {
      label: '位置 :',
      value: String(event.value.location),
      placeholder: '代码...',
    },

    {
      label: '修饰键 :',
      value: [
        event.value.metaKey && 'Meta',
        event.value.shiftKey && 'Shift',
        event.value.ctrlKey && 'Ctrl',
        event.value.altKey && 'Alt',
      ]
        .filter(Boolean)
        .join(' + '),
      placeholder: '无',
    },
  ];
});
</script>

<style lang="less" scoped></style>
