<template>
  <n-card title="世界时钟">
    <template #header-extra>
      <n-tag :bordered="false">{{ now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} (本机)</n-tag>
    </template>

    <n-form label-placement="left" label-width="90" :show-feedback="false" style="margin-bottom: 14px">
      <n-form-item label="添加时区">
        <n-space align="center" :size="12">
          <n-select
            v-model:value="selectedZone"
            :options="zoneOptions"
            filterable
            style="width: 320px"
            placeholder="选择要添加的时区..."
            @update:value="addZone"
          />
          <n-button secondary @click="resetDefault">重置默认</n-button>
        </n-space>
      </n-form-item>
    </n-form>

    <n-grid cols="1 500:2 900:3 1400:4" x-gap="14" y-gap="14" responsive="screen">
      <n-gi v-for="zone in zones" :key="zone">
        <n-card size="small" style="text-align: center">
          <n-text depth="3" style="font-size: 12px">{{ zone }}</n-text>
          <div style="font-size: 26px; font-weight: 600; font-family: monospace">{{ formatZone(zone) }}</div>
          <div style="opacity: 0.7">{{ weekdayIn(zone) }}</div>
          <n-button
            quaternary
            circle
            size="small"
            style="position: absolute; top: 4px; right: 4px"
            @click="removeZone(zone)"
          >
            <template #icon
              ><n-icon><X /></n-icon
            ></template>
          </n-button>
        </n-card>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X } from '@vicons/tabler';
import { useNow } from '@vueuse/core';

const now = useNow({ interval: 1000 });

const defaultZones = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
];
const zones = ref<string[]>([...defaultZones]);
const selectedZone = ref<string | null>(null);

const timezoneList = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Africa/Cairo',
  'Australia/Sydney',
  'Australia/Perth',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];
const zoneOptions = timezoneList.map((tz) => ({ label: tz, value: tz }));

function addZone(value: string) {
  if (value && !zones.value.includes(value)) zones.value.push(value);
}

function removeZone(zone: string) {
  zones.value = zones.value.filter((z) => z !== zone);
}

function resetDefault() {
  zones.value = [...defaultZones];
}

function formatZone(zone: string): string {
  try {
    return now.value.toLocaleTimeString('en-GB', {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--:--';
  }
}

function weekdayIn(zone: string): string {
  try {
    return now.value.toLocaleDateString('zh-CN', { timeZone: zone, weekday: 'short' });
  } catch {
    return '';
  }
}
</script>
