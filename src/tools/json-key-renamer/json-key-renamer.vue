<template>
  <n-card title="JSON 键名重命名">
    <n-grid y-gap="16" cols="1 800:2" x-gap="20" responsive="screen">
      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="JSON 输入">
            <n-input
              v-model:value="jsonInput"
              type="textarea"
              :autosize="{ minRows: 10 }"
              placeholder='{"user_name": 1, "user_email": "a@b.c"}'
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-form-item label="键映射(每行一条:旧键 => 新键)">
            <n-input
              v-model:value="mapInput"
              type="textarea"
              :autosize="{ minRows: 4 }"
              placeholder="user_name => username"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-form-item label="或应用大小写转换">
            <n-select v-model:value="caseMode" :options="caseOptions" clearable placeholder="无" />
          </n-form-item>

          <n-form-item label="覆盖原值(保留键名)">
            <n-switch v-model:value="overrideValues" />
          </n-form-item>

          <n-space>
            <n-button secondary type="primary" @click="applyRename">重命名键</n-button>
            <n-button secondary @click="applyOverride">保留键,按映射改值</n-button>
          </n-space>
        </n-form>
      </n-gi>

      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="JSON 输出" :feedback="feedback" :validation-status="status">
            <n-input
              :value="output"
              type="textarea"
              readonly
              :autosize="{ minRows: 10 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 12px">
          <n-button secondary @click="copy">复制输出</n-button>
          <n-button secondary :disabled="!output" @click="clearAll">清空</n-button>
        </n-space>
        <n-alert v-if="changes" type="info" :show-icon="false" style="margin-top: 12px">
          已重命名 {{ changes }} 个键。
        </n-alert>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';

const jsonInput = ref(
  '{\n  "user_name": "john",\n  "user_email": "john@example.com",\n  "profile": { "user_age": 30 }\n}',
);
const mapInput = ref('user_name => username\nuser_email => email\nuser_age => age');
const caseMode = ref<string | null>(null);
const overrideValues = ref(false);

const caseOptions = [
  { label: '驼峰式 (camelCase)', value: 'camelCase' },
  { label: '蛇形式 (snake_case)', value: 'snakeCase' },
  { label: '短横线式 (kebab-case)', value: 'kebabCase' },
  { label: '帕斯卡式 (PascalCase)', value: 'pascalCase' },
  { label: '常量式 (CONSTANT_CASE)', value: 'constantCase' },
  { label: '全大写 (UPPERCASE)', value: 'upperCase' },
  { label: '全小写 (lowercase)', value: 'lowerCase' },
];

function convertCase(key: string, mode: string) {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s.]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean);

  switch (mode) {
    case 'camelCase':
      return words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');
    case 'snakeCase':
      return words.join('_');
    case 'kebabCase':
      return words.join('-');
    case 'pascalCase':
      return words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
    case 'constantCase':
      return words.join('_').toUpperCase();
    case 'upperCase':
      return key.toUpperCase();
    case 'lowerCase':
      return key.toLowerCase();
    default:
      return key;
  }
}

const map = computed<Record<string, string>>(() => {
  const result: Record<string, string> = {};
  mapInput.value.split('\n').forEach((line) => {
    const parts = line.split('=>');
    if (parts.length === 2) result[parts[0].trim()] = parts[1].trim();
  });

  return result;
});

const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON.parse(jsonInput.value) };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const status = computed(() => (parsed.value.ok ? undefined : 'error'));
const feedback = computed(() => (parsed.value.ok ? '' : parsed.value.error));

const output = ref('');
const changes = ref(0);

function transformKeys(node: unknown, mode: 'rename' | 'override'): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => transformKeys(item, mode));
  }
  if (node && typeof node === 'object') {
    const result: Record<string, unknown> = {};
    let renamed = 0;
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const newKey = mode === 'rename' ? map.value[key] ?? key : key;
      if (mode === 'rename' && newKey !== key) renamed++;
      if (mode === 'override' && overrideValues.value) {
        const mappedValue = map.value[String(value)];
        if (mappedValue !== undefined) {
          result[key] = mappedValue;
          renamed++;
          continue;
        }
      }
      result[newKey] = transformKeys(value, mode);
    }
    changes.value += renamed;
    return result;
  }

  return node;
}

function applyRename() {
  changes.value = 0;
  if (!parsed.value.ok) return;
  const result = transformKeys(parsed.value.value, 'rename');
  output.value = JSON.stringify(result, null, 2);
}

function applyOverride() {
  changes.value = 0;
  if (!parsed.value.ok) return;
  const result = transformKeys(parsed.value.value, 'override');
  output.value = JSON.stringify(result, null, 2);
}

const { copy } = useCopy({ source: output, text: '输出已复制到剪贴板' });

function clearAll() {
  output.value = '';
  changes.value = 0;
}
</script>
