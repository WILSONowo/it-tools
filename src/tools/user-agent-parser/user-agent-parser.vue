<template>
  <div>
    <n-form-item label="User-Agent 字符串">
      <n-input
        v-model:value="ua"
        type="textarea"
        placeholder="在此粘贴User-Agent..."
        clearable
        :autosize="{ minRows: 2 }"
      />
    </n-form-item>

    <user-agent-result-cards v-if="userAgentInfo" :user-agent-info="userAgentInfo" :sections="sections" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { UAParser } from 'ua-parser-js';
import { withDefaultOnError } from '@/utils/defaults';
import { Adjustments, Browser, Cpu, Devices, Engine } from '@vicons/tabler';
import UserAgentResultCards from './user-agent-result-cards.vue';
import type { UserAgentResultSection } from './user-agent-parser.types';

const ua = ref(navigator.userAgent as string);

// If not input in the ua field is present return an empty object of type UAParser.IResult because otherwise
// UAParser returns the values for the current Browser. This is confusing because results are shown for an empty
// UA field value.
const getUserAgentInfo = (userAgent: string) =>
  userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : ({ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult);
const userAgentInfo = computed(() => withDefaultOnError(() => getUserAgentInfo(ua.value), undefined));

const sections: UserAgentResultSection[] = [
  {
    heading: '浏览器',
    icon: Browser,
    content: [
      {
        label: '名称',
        getValue: (block) => block.browser.name,
        undefinedFallback: '没有可用的浏览器名称',
      },
      {
        label: '版本',
        getValue: (block) => block.browser.version,
        undefinedFallback: '没有可用的浏览器版本',
      },
    ],
  },
  {
    heading: '引擎',
    icon: Engine,
    content: [
      {
        label: '名称',
        getValue: (block) => block.engine.name,
        undefinedFallback: '没有可用的引擎名称',
      },
      {
        label: '版本',
        getValue: (block) => block.engine.version,
        undefinedFallback: '没有可用的引擎版本',
      },
    ],
  },
  {
    heading: '操作系统',
    icon: Adjustments,
    content: [
      {
        label: '名称',
        getValue: (block) => block.os.name,
        undefinedFallback: '没有可用的操作系统名称',
      },
      {
        label: '版本',
        getValue: (block) => block.os.version,
        undefinedFallback: '没有可用的操作系统版本',
      },
    ],
  },
  {
    heading: '设备',
    icon: Devices,
    content: [
      {
        label: '型号',
        getValue: (block) => block.device.model,
        undefinedFallback: '没有可用的设备型号',
      },
      {
        label: '类型',
        getValue: (block) => block.device.type,
        undefinedFallback: '没有可用的设备类型',
      },
      {
        label: '厂商',
        getValue: (block) => block.device.vendor,
        undefinedFallback: '没有可用的设备厂商',
      },
    ],
  },
  {
    heading: 'CPU',
    icon: Cpu,
    content: [
      {
        label: '架构',
        getValue: (block) => block.cpu.architecture,
        undefinedFallback: '没有可用的 CPU 架构',
      },
    ],
  },
];
</script>

<style lang="less" scoped></style>
