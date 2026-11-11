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

          <n-form-item label="大小写转换(应用于映射之外的键)">
            <n-select v-model:value="caseMode" :options="caseOptions" clearable placeholder="无" />
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
          {{ lastAction === 'override' ? `已替换 ${changes} 个值。` : `已重命名 ${changes} 个键。` }}
        </n-alert>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { overrideValues, parseKeyMap, renameKeys } from './json-key-renamer.service';

const jsonInput = ref(
  '{\n  "user_name": "john",\n  "user_email": "john@example.com",\n  "profile": { "user_age": 30 }\n}',
);
const mapInput = ref('user_name => username\nuser_email => email\nuser_age => age');
const caseMode = ref<string | null>(null);

const caseOptions = [
  { label: '驼峰式 (camelCase)', value: 'camelCase' },
  { label: '蛇形式 (snake_case)', value: 'snakeCase' },
  { label: '短横线式 (kebab-case)', value: 'kebabCase' },
  { label: '帕斯卡式 (PascalCase)', value: 'pascalCase' },
  { label: '常量式 (CONSTANT_CASE)', value: 'constantCase' },
  { label: '全大写 (UPPERCASE)', value: 'upperCase' },
  { label: '全小写 (lowercase)', value: 'lowerCase' },
];

const map = computed(() => parseKeyMap(mapInput.value));

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
const lastAction = ref<'rename' | 'override'>('rename');

function applyRename() {
  changes.value = 0;
  lastAction.value = 'rename';
  if (!parsed.value.ok) return;
  const result = renameKeys(parsed.value.value, { map: map.value, caseMode: caseMode.value });
  changes.value = result.changes;
  output.value = JSON.stringify(result.value, null, 2);
}

function applyOverride() {
  changes.value = 0;
  lastAction.value = 'override';
  if (!parsed.value.ok) return;
  const result = overrideValues(parsed.value.value, map.value);
  changes.value = result.changes;
  output.value = JSON.stringify(result.value, null, 2);
}

const { copy } = useCopy({ source: output, text: '输出已复制到剪贴板' });

function clearAll() {
  output.value = '';
  changes.value = 0;
}
</script>
