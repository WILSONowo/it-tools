<template>
  <n-card title="人民币大小写转换">
    <n-tabs type="line" default-value="num2cn">
      <n-tab-pane name="num2cn" tab="数字 → 大写">
        <n-form label-placement="left" label-width="120" :show-feedback="false">
          <n-form-item label="金额(数字)" :feedback="numFeedback" :validation-status="numStatus">
            <n-input v-model:value="numberInput" placeholder="例如 123456.78" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 8px 0 16px">
          <n-button secondary type="primary" @click="toCapital">转换为大写</n-button>
          <n-button secondary @click="sampleNumbers">常用示例</n-button>
        </n-space>
        <n-form label-placement="left" label-width="120" :show-feedback="false">
          <n-form-item label="大写金额">
            <n-input
              :value="capitalOutput"
              type="textarea"
              :autosize="{ minRows: 3 }"
              readonly
              placeholder="壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 8px">
          <n-button secondary @click="copyCapital">复制</n-button>
        </n-space>
      </n-tab-pane>

      <n-tab-pane name="cn2num" tab="大写 → 数字">
        <n-form label-placement="left" label-width="120" :show-feedback="false">
          <n-form-item label="大写金额" :feedback="cnFeedback" :validation-status="cnStatus">
            <n-input v-model:value="cnInput" placeholder="例如 壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin: 8px 0 16px">
          <n-button secondary type="primary" @click="toNumber">转换为数字</n-button>
        </n-space>
        <n-form label-placement="left" label-width="120" :show-feedback="false">
          <n-form-item label="数字金额">
            <n-input :value="numberOutput" readonly placeholder="123456.78" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 8px">
          <n-button secondary @click="copyNumber">复制</n-button>
        </n-space>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { numberToRmbCapital, rmbCapitalToNumber } from './rmb-case.service';

const numberInput = ref('123456.78');
const capitalOutput = ref('');
const numFeedback = ref('');
const numStatus = ref<string | undefined>(undefined);

const cnInput = ref('壹佰贰拾叁万肆仟伍佰陆拾柒元捌角玖分');
const numberOutput = ref('');
const cnFeedback = ref('');
const cnStatus = ref<string | undefined>(undefined);

function toCapital() {
  try {
    capitalOutput.value = numberToRmbCapital(numberInput.value);
    numFeedback.value = '';
    numStatus.value = undefined;
  } catch (e) {
    capitalOutput.value = '';
    numFeedback.value = (e as Error).message;
    numStatus.value = 'error';
  }
}

function toNumber() {
  try {
    numberOutput.value = rmbCapitalToNumber(cnInput.value);
    cnFeedback.value = '';
    cnStatus.value = undefined;
  } catch (e) {
    numberOutput.value = '';
    cnFeedback.value = (e as Error).message;
    cnStatus.value = 'error';
  }
}

function sampleNumbers() {
  const samples = ['0.05', '10', '100000000.01', '15.3', '2008.08', '0.10'];
  const index = Math.floor(Math.random() * samples.length);
  numberInput.value = samples[index];
  toCapital();
}

const { copy: copyCapital } = useCopy({ source: capitalOutput, text: '大写金额已复制' });
const { copy: copyNumber } = useCopy({ source: numberOutput, text: '数字金额已复制' });
</script>
