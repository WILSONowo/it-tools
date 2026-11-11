<template>
  <n-card title="汉字转拼音">
    <n-form label-placement="top">
      <n-form-item label="中文输入">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 3 }"
          placeholder="例如: 你好，世界 IT-Tools"
          spellcheck="false"
        />
      </n-form-item>
    </n-form>

    <n-grid y-gap="16" cols="1 600:2" x-gap="12" responsive="screen" style="margin-top: 16px">
      <n-gi>
        <n-form label-placement="left" label-width="64">
          <n-form-item label="模式">
            <n-radio-group v-model:value="mode">
              <n-radio-button value="tone">带声调</n-radio-button>
              <n-radio-button value="none">无声调</n-radio-button>
              <n-radio-button value="first">首字母</n-radio-button>
            </n-radio-group>
          </n-form-item>
        </n-form>
      </n-gi>
      <n-gi>
        <n-form label-placement="left" label-width="64">
          <n-form-item label="分隔符">
            <n-select v-model:value="separator" :options="separatorOptions" style="width: 160px" />
          </n-form-item>
        </n-form>
      </n-gi>
    </n-grid>
    <div style="margin-top: 8px">
      <n-checkbox v-model:value="nonZhSpace">中英文间加空格</n-checkbox>
    </div>

    <n-space justify="center" style="margin: 12px 0">
      <n-button type="primary" @click="refresh">转换</n-button>
      <n-button secondary @click="copy">复制结果</n-button>
    </n-space>

    <n-form label-placement="top">
      <n-form-item label="转换结果">
        <n-input
          :value="output"
          type="textarea"
          :autosize="{ minRows: 4 }"
          readonly
          spellcheck="false"
          style="font-family: monospace; font-size: 13px"
        />
      </n-form-item>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { pinyin } from 'pinyin-pro';
import { useCopy } from '@/composable/copy';

const input = ref('重庆银行 好便宜 快乐 音乐 重要');
const mode = ref<'tone' | 'none' | 'first'>('tone');
const separator = ref(' ');
const nonZhSpace = ref(false);

const separatorOptions = [
  { label: '空格', value: ' ' },
  { label: '无', value: '' },
  { label: '- 连字符', value: '-' },
  { label: '_ 下划线', value: '_' },
];

const output = computed(() =>
  pinyin(input.value, {
    toneType: mode.value === 'tone' ? 'symbol' : 'none',
    pattern: mode.value === 'first' ? 'first' : 'pinyin',
    separator: mode.value === 'first' ? '' : separator.value,
    nonZh: nonZhSpace.value ? 'spaced' : 'consecutive',
  }),
);

const { copy } = useCopy({ source: output, text: 'Pinyin copied to the clipboard' });

function refresh() {
  void output.value;
}
</script>
