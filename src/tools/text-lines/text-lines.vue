<template>
  <n-card>
    <n-form label-placement="top">
      <n-form-item label="输入行">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="在此粘贴多行文本..."
          spellcheck="false"
        />
      </n-form-item>

      <n-tabs type="line" size="small" animated style="margin-top: 16px">
        <n-tab-pane name="number" tab="行号">
          <n-grid cols="1 600:2" x-gap="16" y-gap="8" responsive="screen">
            <n-gi>
              <n-form-item label="添加行号" style="margin-bottom: 8px">
                <n-button-group>
                  <n-button size="small" type="primary" ghost @click="addNumbers({ after: false })">加在行首</n-button>
                  <n-button size="small" type="primary" ghost @click="addNumbers({ after: true })">加在行尾</n-button>
                </n-button-group>
              </n-form-item>
              <n-form-item label="起始 / 步长" style="margin-bottom: 8px">
                <n-space>
                  <n-input-number v-model:value="numberStart" :min="0" style="width: 120px" size="small" />
                  <n-input-number v-model:value="numberStep" :min="1" style="width: 120px" size="small" />
                </n-space>
              </n-form-item>
              <n-form-item label="补位位数 / 分隔符" style="margin-bottom: 8px">
                <n-space>
                  <n-input-number v-model:value="numberPad" :min="0" :max="10" style="width: 120px" size="small" />
                  <n-input v-model:value="numberSeparator" style="width: 120px" size="small" placeholder=": " />
                </n-space>
              </n-form-item>
              <n-form-item label="移除现有行号" style="margin-bottom: 0">
                <n-space>
                  <n-input
                    v-model:value="removeNumberPattern"
                    size="small"
                    style="width: 220px"
                    placeholder="正则,例如 ^\d+\s*"
                  />
                  <n-button size="small" type="primary" ghost @click="removeNumbers">移除</n-button>
                </n-space>
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-tab-pane>

        <n-tab-pane name="clean" tab="清理">
          <n-form-item label="操作">
            <n-space>
              <n-button size="small" type="primary" ghost @click="trimAll">去除每行首尾空白</n-button>
              <n-button size="small" type="primary" ghost @click="trimAllEnd">去除行尾空格</n-button>
              <n-button size="small" type="primary" ghost @click="removeEmptyLines">移除空行</n-button>
              <n-button size="small" type="primary" ghost @click="dedupeAll">移除重复行</n-button>
              <n-button size="small" type="primary" ghost @click="dedupeConsecutive">移除连续重复行</n-button>
            </n-space>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="order" tab="排序">
          <n-form-item label="操作">
            <n-space>
              <n-button size="small" type="primary" ghost @click="sortLines('asc')">升序 A-Z</n-button>
              <n-button size="small" type="primary" ghost @click="sortLines('desc')">降序 Z-A</n-button>
              <n-button size="small" type="primary" ghost @click="shuffle">打乱</n-button>
              <n-button size="small" type="primary" ghost @click="reverse">反转顺序</n-button>
            </n-space>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="join" tab="合并 / 包裹">
          <n-form-item label="用分隔符合并">
            <n-input-group style="max-width: 420px">
              <n-input v-model:value="joinSeparator" placeholder=", " />
              <n-button type="primary" ghost @click="joinLinesBy">合并行</n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item label="前缀 / 后缀包裹">
            <n-space>
              <n-input v-model:value="wrapPrefix" style="width: 160px" placeholder="前缀" />
              <n-input v-model:value="wrapSuffix" style="width: 160px" placeholder="后缀" />
              <n-button type="primary" ghost @click="wrapAll">包裹</n-button>
            </n-space>
          </n-form-item>
        </n-tab-pane>

        <n-tab-pane name="filter" tab="筛选 / 提取">
          <n-form-item label="按子串筛选">
            <n-input-group style="max-width: 420px">
              <n-input v-model:value="filterSubstring" placeholder="保留包含...的行" />
              <n-button type="primary" ghost @click="filterBySubstring(false)">保留</n-button>
              <n-button type="error" ghost @click="filterBySubstring(true)">移除</n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item label="按正则筛选">
            <n-input-group style="max-width: 420px">
              <n-input v-model:value="filterRegex" placeholder="正则,例如 ^\d+$" />
              <n-button type="primary" ghost @click="filterByRegex(false)">保留</n-button>
              <n-button type="error" ghost @click="filterByRegex(true)">移除</n-button>
            </n-input-group>
          </n-form-item>
        </n-tab-pane>
      </n-tabs>

      <n-form-item label="输出" style="margin: 16px 0 0">
        <n-input
          :value="output"
          type="textarea"
          :autosize="{ minRows: 6 }"
          readonly
          placeholder="结果将显示在此处..."
          spellcheck="false"
          style="font-family: monospace; font-size: 13px"
        />
      </n-form-item>

      <n-space justify="center" style="margin-top: 12px">
        <n-button secondary @click="copyOutput">复制输出</n-button>
        <n-button secondary @click="reset">重置</n-button>
      </n-space>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { shuffleArray } from '@/utils/random';
import {
  addLineNumbers,
  deduplicateConsecutiveLines,
  deduplicateLines,
  filterLinesByRegex,
  filterLinesBySubstring,
  joinLines,
  removeBlankLines,
  removeLineNumbers,
  splitLines,
  trimLines,
  trimLinesEnd,
  wrapLines,
} from './text-lines.service';

const input = ref('apple\nbanana\ncherry\nbanana\n');
const output = ref('');

const numberStart = ref(1);
const numberStep = ref(1);
const numberPad = ref(0);
const numberSeparator = ref(': ');
const removeNumberPattern = ref('^\\d+\\s*');
const joinSeparator = ref(', ');
const wrapPrefix = ref('');
const wrapSuffix = ref('');
const filterSubstring = ref('');
const filterRegex = ref('^\\d+$');

const lines = computed(() => splitLines(input.value));
const lastResult = ref('');

function setOutput(value: string) {
  lastResult.value = value;
  output.value = value;
}

function apply(transform: (current: string[]) => string[]) {
  const base = output.value === '' ? lines.value : splitLines(output.value);

  setOutput(joinLines(transform(base), '\n'));
}

function addNumbers({ after }: { after: boolean }) {
  apply((base) =>
    addLineNumbers(base, {
      start: numberStart.value,
      step: numberStep.value,
      padding: numberPad.value,
      after,
      separator: numberSeparator.value,
    }),
  );
}

function removeNumbers() {
  apply((base) => {
    try {
      return removeLineNumbers(base, new RegExp(removeNumberPattern.value, 'g'));
    } catch (e) {
      return base;
    }
  });
}

const trimAll = () => apply(trimLines);
const trimAllEnd = () => apply(trimLinesEnd);
const removeEmptyLines = () => apply(removeBlankLines);
const dedupeAll = () => apply(deduplicateLines);
const dedupeConsecutive = () => apply(deduplicateConsecutiveLines);

const sortLines = (direction: 'asc' | 'desc') =>
  apply((base) => [...base].sort((a, b) => (direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a))));

const shuffle = () => apply((base) => shuffleArray(base));
const reverse = () => apply((base) => [...base].reverse());

function joinLinesBy() {
  const value = output.value === '' ? input.value : output.value;
  setOutput(joinLines(splitLines(value), joinSeparator.value));
}

const wrapAll = () => apply((base) => wrapLines(base, wrapPrefix.value, wrapSuffix.value));

function filterBySubstring(invert: boolean) {
  apply((base) => filterLinesBySubstring(base, filterSubstring.value, invert));
}

function filterByRegex(invert: boolean) {
  apply((base) => {
    try {
      return filterLinesByRegex(base, new RegExp(filterRegex.value), invert);
    } catch (e) {
      return base;
    }
  });
}

const { copy: copyOutput } = useCopy({ source: output, text: '输出已复制到剪贴板' });

function reset() {
  output.value = '';
  lastResult.value = '';
}
</script>
