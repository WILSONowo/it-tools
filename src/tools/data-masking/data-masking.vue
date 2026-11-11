<template>
  <n-card title="数据脱敏">
    <n-form label-placement="top" :show-feedback="false">
      <n-form-item label="输入文本">
        <n-input
          v-model:value="input"
          type="textarea"
          :autosize="{ minRows: 6 }"
          placeholder="联系人: 张三 电话: 13812345678 邮箱: zhangsan@example.com 身份证: 110101199001011234"
          spellcheck="false"
        />
      </n-form-item>
    </n-form>

    <n-form label-placement="left" label-width="120" :show-feedback="false" style="margin: 16px 0">
      <n-form-item label="脱敏规则">
        <n-checkbox-group v-model:value="rules">
          <n-grid y-gap="16" cols="2 600:3" x-gap="12" responsive="screen" style="width: 100%">
            <n-gi>
              <n-checkbox value="phone">手机号</n-checkbox>
            </n-gi>
            <n-gi>
              <n-checkbox value="card">银行卡(13-19位)</n-checkbox>
            </n-gi>
            <n-gi>
              <n-checkbox value="idcard">身份证(18位)</n-checkbox>
            </n-gi>
            <n-gi>
              <n-checkbox value="email">邮箱</n-checkbox>
            </n-gi>
            <n-gi>
              <n-checkbox value="ip">IP 地址</n-checkbox>
            </n-gi>
            <n-gi>
              <n-checkbox value="name">中文姓名(“姓名/联系人”等标签后或单独成行,保留姓氏)</n-checkbox>
            </n-gi>
          </n-grid>
        </n-checkbox-group>
      </n-form-item>
    </n-form>

    <n-space justify="center" style="margin: 0 0 16px">
      <n-button type="primary" @click="maskNow">脱敏</n-button>
      <n-button secondary :disabled="!output" @click="copy">复制结果</n-button>
      <n-button secondary @click="selectAll">全选</n-button>
      <n-button secondary @click="rules = []">清空</n-button>
    </n-space>

    <n-form-item label="脱敏结果" label-placement="top">
      <n-input
        :value="output"
        type="textarea"
        :autosize="{ minRows: 6 }"
        readonly
        spellcheck="false"
        style="font-family: monospace"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { MASK_RULES, maskText } from './data-masking.service';

const input = ref('联系人: 张三 电话: 13812345678 邮箱: zhangsan@example.com 身份证: 110101199001011234');
const rules = ref<string[]>([...MASK_RULES]);

const output = ref('');

function maskNow() {
  output.value = maskText(input.value, rules.value);
}
maskNow();

function selectAll() {
  rules.value = [...MASK_RULES];
  maskNow();
}

const { copy } = useCopy({ source: output, text: '脱敏文本已复制到剪贴板' });
</script>
