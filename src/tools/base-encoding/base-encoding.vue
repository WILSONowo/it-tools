<template>
  <n-card title="Base 编码转换">
    <n-grid cols="1 700:2" x-gap="20" y-gap="16" responsive="screen">
      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="编码类型" style="margin-bottom: 8px">
            <n-radio-group v-model:value="algo">
              <n-radio-button value="base16">Base16</n-radio-button>
              <n-radio-button value="base32">Base32</n-radio-button>
              <n-radio-button value="base58">Base58</n-radio-button>
              <n-radio-button value="base62">Base62</n-radio-button>
              <n-radio-button value="base85">Base85</n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item label="输入" style="margin-bottom: 8px">
            <n-input
              v-model:value="input"
              type="textarea"
              :autosize="{ minRows: 4 }"
              placeholder="要编码的文本"
              spellcheck="false"
            />
          </n-form-item>
          <n-space justify="center">
            <n-button type="primary" @click="doEncode">编码</n-button>
            <n-button secondary @click="doDecode">解码</n-button>
          </n-space>
        </n-form>
        <n-alert v-if="error" type="error" :show-icon="false" style="margin-top: 10px">{{ error }}</n-alert>
        <n-form-item label="输出" style="margin-top: 8px">
          <n-input
            :value="output"
            type="textarea"
            readonly
            :autosize="{ minRows: 4 }"
            spellcheck="false"
            style="font-family: monospace"
          />
        </n-form-item>
        <n-space justify="center">
          <n-button secondary :disabled="!output" @click="copy">复制</n-button>
        </n-space>
      </n-gi>

      <n-gi>
        <n-card title="说明" size="small">
          <n-text depth="3">
            <ul style="padding-left: 18px; line-height: 1.9">
              <li><b>Base16</b>:即十六进制,每字节两位</li>
              <li><b>Base32</b>:RFC 4648,字母 A-Z + 数字 2-7,常用于密钥/OTP</li>
              <li><b>Base58</b>:比特币字母表(去 0OIl),用于地址编码;每个前导 0x00 字节编码为一个 1</li>
              <li><b>Base62</b>:字母表顺序为 0-9 A-Z a-z,常用于短链/ID;每个前导 0x00 字节编码为一个 0</li>
              <li><b>Base85</b>:ASCII85 变体(Adobe),4 字节→5 字符,比 Base64 紧凑</li>
            </ul>
          </n-text>
        </n-card>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCopy } from '@/composable/copy';
import {
  encode16,
  decode16,
  encode32,
  decode32,
  encode58,
  decode58,
  encode62,
  decode62,
  encode85,
  decode85,
  utf8ToBytes,
  bytesToUtf8,
} from './base.service';

const algo = ref('base58');
const input = ref('Hello IT-Tools!');
const output = ref('');
const error = ref('');

function encoder(): (b: Uint8Array) => string {
  switch (algo.value) {
    case 'base16':
      return encode16;
    case 'base32':
      return encode32;
    case 'base62':
      return encode62;
    case 'base85':
      return encode85;
    default:
      return encode58;
  }
}
function decoder(): (s: string) => Uint8Array {
  switch (algo.value) {
    case 'base16':
      return decode16;
    case 'base32':
      return decode32;
    case 'base62':
      return decode62;
    case 'base85':
      return decode85;
    default:
      return decode58;
  }
}

function doEncode() {
  error.value = '';
  try {
    output.value = encoder()(utf8ToBytes(input.value));
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
}
function doDecode() {
  error.value = '';
  try {
    output.value = bytesToUtf8(decoder()(input.value));
  } catch (e) {
    error.value = (e as Error).message;
    output.value = '';
  }
}

const { copy } = useCopy({ source: output, text: '已复制到剪贴板' });
</script>
