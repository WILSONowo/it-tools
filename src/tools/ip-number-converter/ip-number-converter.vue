<template>
  <n-card title="IP ↔ 数字">
    <n-tabs type="line" default-value="ip2num">
      <n-tab-pane name="ip2num" tab="IP → 数字">
        <n-form label-placement="top">
          <n-form-item label="IP 地址 (IPv4 或 IPv6)" :feedback="ipFeedback" :validation-status="ipStatus">
            <n-input
              v-model:value="ipInput"
              placeholder="192.168.1.1 或 2001:db8::1"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-space justify="center" style="margin-bottom: 12px">
            <n-button type="primary" secondary @click="convertToNumber">转换</n-button>
          </n-space>
        </n-form>
        <n-form-item label="十进制数字">
          <n-input :value="decimalOutput" readonly style="font-family: monospace" />
        </n-form-item>
        <n-form-item label="十六进制">
          <n-input :value="hexOutput" readonly style="font-family: monospace" />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="num2ip" tab="数字 → IP">
        <n-form label-placement="top">
          <n-form-item label="数字" :feedback="numFeedback" :validation-status="numStatus">
            <n-input
              v-model:value="numInput"
              placeholder="3232235777"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
          <n-form-item label="类型">
            <n-radio-group v-model:value="targetKind">
              <n-radio-button value="ipv4">IPv4</n-radio-button>
              <n-radio-button value="ipv6">IPv6</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-space justify="center" style="margin-bottom: 12px">
            <n-button type="primary" secondary @click="convertToIp">转换</n-button>
          </n-space>
        </n-form>
        <n-form-item label="IP 地址">
          <n-input :value="ipOutput" readonly style="font-family: monospace" />
        </n-form-item>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { parseIpToBigInt, parseNonNegativeBigInt, bigIntToIpv4, bigIntToIpv6 } from './ip-number-converter.service';

const ipInput = ref('192.168.1.1');
const decimalOutput = ref('');
const hexOutput = ref('');
const ipFeedback = ref('');
const ipStatus = ref<'error' | undefined>(undefined);

const numInput = ref('3232235777');
const targetKind = ref<'ipv4' | 'ipv6'>('ipv4');
const ipOutput = ref('');
const numFeedback = ref('');
const numStatus = ref<'error' | undefined>(undefined);

function convertToNumber() {
  const value = ipInput.value.trim();
  if (value === '') {
    ipFeedback.value = '';
    ipStatus.value = undefined;
    decimalOutput.value = '';
    hexOutput.value = '';
    return;
  }
  const big = parseIpToBigInt(value);
  if (big === null) {
    ipFeedback.value = '无效的 IP 地址';
    ipStatus.value = 'error';
    decimalOutput.value = '';
    hexOutput.value = '';
    return;
  }
  ipFeedback.value = '';
  ipStatus.value = undefined;
  decimalOutput.value = big.toString();
  hexOutput.value = big.toString(16).toUpperCase();
}

function convertToIp() {
  const value = numInput.value.trim();
  if (value === '') {
    numFeedback.value = '';
    numStatus.value = undefined;
    ipOutput.value = '';
    return;
  }
  const big = parseNonNegativeBigInt(value);
  const v4max = BigInt('4294967295');
  const v6max = BigInt('340282366920938463463374607431768211455');
  if (big === null) {
    numFeedback.value = '请输入非负整数(十进制,或以 0x 开头的十六进制)';
    numStatus.value = 'error';
    ipOutput.value = '';
    return;
  }
  numFeedback.value = '';
  numStatus.value = undefined;
  if (targetKind.value === 'ipv4') {
    if (big > v4max) {
      numFeedback.value = '超出 IPv4 范围 (0 ~ 4294967295)';
      numStatus.value = 'error';
      ipOutput.value = '';
      return;
    }
    ipOutput.value = bigIntToIpv4(big);
  } else {
    if (big > v6max) {
      numFeedback.value = '超出 IPv6 范围';
      numStatus.value = 'error';
      ipOutput.value = '';
      return;
    }
    ipOutput.value = bigIntToIpv6(big);
  }
}

convertToNumber();
convertToIp();
</script>
