<template>
  <n-card>
    <n-form label-placement="top">
      <n-form-item label="Cron 表达式" :feedback="cronValidation.message" :validation-status="cronValidation.status">
        <n-input v-model:value="cron" size="large" placeholder="* * * * *" class="cron" />
      </n-form-item>
    </n-form>
    <div class="cron-string">
      {{ cronString }}
    </div>

    <n-divider />

    <n-form :show-feedback="false" label-width="170" label-placement="left" class="cron-options">
      <n-form-item label="详细描述">
        <n-switch v-model:value="cronstrueConfig.verbose" />
      </n-form-item>
      <n-form-item label="使用 24 小时制">
        <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
      </n-form-item>
      <n-form-item label="星期序号从 0 开始">
        <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
      </n-form-item>
    </n-form>
    <n-space justify="center">
      <n-button secondary @click="cron = '* * * * *'">重置示例</n-button>
    </n-space>
  </n-card>
  <n-card>
    <pre>
┌──────────── 秒(0 - 59,可选)
| ┌────────── 分钟 (0 - 59)
| | ┌──────── 小时 (0 - 23)
| | | ┌────── 日 (1 - 31)
| | | | ┌──── 月 (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── 星期 (0 - 6,星期天=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre
    >

    <n-space v-if="styleStore.isSmallScreen" vertical>
      <n-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" embedded :bordered="false">
        <div>
          符号: <strong>{{ symbol }}</strong>
        </div>
        <div>
          含义: <strong>{{ meaning }}</strong>
        </div>
        <div>
          示例:
          <strong
            ><code>{{ example }}</code></strong
          >
        </div>
        <div>
          等价写法: <strong>{{ equivalent }}</strong>
        </div>
      </n-card>
    </n-space>
    <n-table v-else size="small">
      <thead>
        <tr>
          <th class="text-left" scope="col">符号</th>
          <th class="text-left" scope="col">含义</th>
          <th class="text-left" scope="col">示例</th>
          <th class="text-left" scope="col">等价写法</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol">
          <td>{{ symbol }}</td>
          <td>{{ meaning }}</td>
          <td>
            <code>{{ example }}</code>
          </td>
          <td>{{ equivalent }}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';
import { computed, reactive, ref } from 'vue';
import { useValidation } from '@/composable/validation';
import { useStyleStore } from '@/stores/style.store';

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const helpers = [
  {
    symbol: '*',
    meaning: '任意值',
    example: '* * * *',
    equivalent: '每分钟',
  },
  {
    symbol: '-',
    meaning: '取值范围',
    example: '1-10 * * *',
    equivalent: '第 1 到第 10 分钟',
  },
  {
    symbol: ',',
    meaning: '取值列表',
    example: '1,10 * * *',
    equivalent: '在第 1 和第 10 分钟',
  },
  {
    symbol: '/',
    meaning: '步进值',
    example: '*/10 * * *',
    equivalent: '每 10 分钟',
  },
  {
    symbol: '@yearly',
    meaning: '每年 1 月 1 日午夜执行一次',
    example: '@yearly',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaning: '同 @yearly',
    example: '@annually',
    equivalent: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaning: '每月第一天午夜执行一次',
    example: '@monthly',
    equivalent: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaning: '每周日午夜执行一次',
    example: '@weekly',
    equivalent: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaning: '每天午夜执行一次',
    example: '@daily',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaning: '同 @daily',
    example: '@midnight',
    equivalent: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaning: '每小时整点执行一次',
    example: '@hourly',
    equivalent: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaning: '系统启动时执行',
    example: '',
    equivalent: '',
  },
];

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, cronstrueConfig);
  }
  return ' ';
});

const cronValidation = useValidation({
  source: cron,
  rules: [
    {
      validator: (value) => isCronValid(value),
      message: 'Cron 表达式无效',
    },
  ],
});
</script>

<style lang="less" scoped>
.cron {
  font-size: 30px;
  font-family: monospace;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 16px 0;
}

.cron-options {
  max-width: 560px;
  margin: 0 auto;
}

pre {
  overflow: auto;
  padding: 10px 0;
}
</style>
