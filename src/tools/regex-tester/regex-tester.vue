<template>
  <div>
    <n-card>
      <n-form label-placement="left" label-width="150" :show-feedback="false">
        <n-form-item label="Pattern(模式):" label-placement="top" v-bind="validation.attrs">
          <n-input
            v-model:value="pattern"
            placeholder="例如 (\d{4})-(\d{2})-(\d{2})"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-form-item label="标志(Flags):" label-placement="top">
          <n-space :wrap="true">
            <n-checkbox v-for="flag in flagList" :key="flag.value" v-model:checked="flag.enabled">
              {{ flag.label }}
            </n-checkbox>
          </n-space>
        </n-form-item>
        <n-form-item label="测试字符串:" label-placement="top">
          <n-input
            v-model:value="testString"
            type="textarea"
            :autosize="{ minRows: 5 }"
            placeholder="要测试的文本..."
            spellcheck="false"
          />
        </n-form-item>
        <n-form-item label="替换为:" label-placement="top">
          <n-input
            v-model:value="replacement"
            placeholder="可选:替换字符串,例如 YYYY-$2-$1 或 $1/$2"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card v-if="syntaxError" title="无效 pattern">
      <n-alert type="error" :show-icon="false">{{ syntaxError }}</n-alert>
    </n-card>

    <n-card v-else-if="runError" title="匹配失败">
      <n-alert type="warning" :show-icon="false">{{ runError }}</n-alert>
    </n-card>

    <n-grid v-else cols="1 800:2" x-gap="20" y-gap="20" responsive="screen">
      <n-gi>
        <n-card title="匹配项">
          <n-space vertical>
            <n-statistic v-if="matchCount === 0" label="无匹配" :value="0" />
            <template v-else>
              <n-statistic :label="`${matchCount} 个匹配`" :value="''" />
              <div
                v-for="(m, index) in matches"
                :key="index"
                style="
                  font-family: monospace;
                  white-space: pre-wrap;
                  background: rgba(128, 128, 128, 0.08);
                  border-radius: 4px;
                  padding: 6px 8px;
                "
              >
                <b>#{{ index + 1 }}</b> {{ m.match }}
                <div v-if="m.groups" style="opacity: 0.75; margin-top: 4px">
                  <div v-for="(value, key) in m.groups" :key="key">
                    <n-tag size="small" :bordered="false" type="info" style="margin-right: 6px">{{ key }}</n-tag
                    >{{ value }}
                  </div>
                </div>
              </div>
            </template>
          </n-space>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card title="替换结果">
          <n-input
            :value="replaced"
            type="textarea"
            readonly
            :autosize="{ minRows: 5 }"
            placeholder="替换结果将显示在此处..."
            spellcheck="false"
          />
          <n-space justify="center" style="margin-top: 12px">
            <n-button secondary @click="copyReplaced">复制结果</n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useValidation } from '@/composable/validation';
import { useCopy } from '@/composable/copy';
import type { RegexMatch } from './regex-tester.service';
import { createRegexRunner } from './regex-runner';

const pattern = ref('(\\d{4})-(\\d{2})-(\\d{2})');
const testString = ref('Today: 2023-11-15, and also 2023-11-16.');
const replacement = ref('$3/$2/$1');

const flagList = ref([
  { label: 'g (全局)', value: 'g', enabled: true },
  { label: 'i (忽略大小写)', value: 'i', enabled: false },
  { label: 'm (多行)', value: 'm', enabled: false },
  { label: 's (点号匹配换行)', value: 's', enabled: false },
  { label: 'u (Unicode)', value: 'u', enabled: false },
]);

const flags = computed(() =>
  flagList.value
    .filter((f) => f.enabled)
    .map((f) => f.value)
    .join(''),
);

// Compiling is cheap and cannot hang, so syntax errors are reported synchronously.
// Matching (which can backtrack catastrophically) runs in a Web Worker.
const syntaxError = computed(() => {
  try {
    new RegExp(pattern.value, flags.value);
    return '';
  } catch (e) {
    return (e as Error).message;
  }
});

const validation = useValidation({
  source: pattern,
  watch: [flags],
  rules: [
    {
      message: '正则表达式无效',
      validator: () => syntaxError.value === '',
    },
  ],
});

const matches = ref<RegexMatch[]>([]);
const replaced = ref('');
const runError = ref('');
const matchCount = computed(() => matches.value.length);

const runner = createRegexRunner();
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

async function execute() {
  if (syntaxError.value) {
    matches.value = [];
    replaced.value = '';
    runError.value = '';
    return;
  }

  const result = await runner.run({
    pattern: pattern.value,
    flags: flags.value,
    text: testString.value,
    replacement: replacement.value,
  });

  // null: superseded by a newer run
  if (!result) return;

  matches.value = result.matches;
  replaced.value = result.replaced;
  runError.value = result.error;
}

watch(
  [pattern, flags, testString, replacement],
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(execute, 200);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearTimeout(debounceTimer);
  runner.dispose();
});

const { copy: copyReplaced } = useCopy({ source: replaced, text: '替换后的文本已复制到剪贴板' });
</script>
