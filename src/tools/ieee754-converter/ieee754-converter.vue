<template>
  <n-card title="IEEE 754 浮点转换">
    <n-form label-placement="top">
      <n-form-item label="数值">
        <n-input v-model:value="valueInput" placeholder="如 3.14、-0.5、1e10" style="font-family: monospace" />
      </n-form-item>
      <n-space justify="center" style="margin: 8px 0 14px">
        <n-button type="primary" @click="parse">转换</n-button>
        <n-button
          secondary
          @click="
            valueInput = '3.14';
            parse();
          "
          >示例</n-button
        >
      </n-space>
    </n-form>

    <n-alert v-if="error" type="error" :show-icon="false" style="margin-bottom: 10px">{{ error }}</n-alert>

    <template v-if="result">
      <n-grid cols="1 700:2" x-gap="16" y-gap="16" responsive="screen">
        <n-gi v-for="item in result" :key="item.name">
          <n-card :title="item.name" size="small">
            <div v-if="item.fields" style="line-height: 1.9">
              <div>
                <b>二进制:</b> <span style="font-family: monospace; word-break: break-all">{{ item.bits }}</span>
              </div>
              <div>
                <b>十六进制:</b> <span style="font-family: monospace">{{ item.hex }}</span>
              </div>
              <div><b>符号位:</b> {{ item.fields.sign }}</div>
              <div><b>指数:</b> {{ item.fields.exponentBits }}<sub>(2)</sub> = {{ item.fields.exponent }}</div>
              <div>
                <b>尾数:</b> <span style="font-family: monospace">{{ item.fields.mantissaBits }}</span>
              </div>
            </div>
            <div v-else>
              <div>
                二进制:<span style="font-family: monospace">{{ item.bits }}</span>
              </div>
              <div>
                十六进制:<span style="font-family: monospace">{{ item.hex }}</span>
              </div>
            </div>
          </n-card>
        </n-gi>
      </n-grid>
      <n-text depth="3" style="display: block; margin-top: 8px"
        >特殊值说明:全 0 尾数+指数为 0 表示 ±0;指数全 1、尾数全 0 表示 ±Infinity;指数全 1、尾数非 0 表示 NaN。</n-text
      >
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const valueInput = ref('3.14');
const result = ref<
  {
    name: string;
    bits: string;
    hex: string;
    fields: { sign: string; exponentBits: string; exponent: string; mantissaBits: string } | null;
  }[]
>([]);
const error = ref('');

function numberToIEEE(
  value: number,
  double: boolean,
): { bits: string; hex: string; sign: string; exponentBits: string; exponent: string; mantissaBits: string } {
  if (!Number.isFinite(value)) {
    // NaN / Infinity
    const isInf = value === Infinity || value === -Infinity;
    const sign = value < 0 || Object.is(value, -0) ? '1' : '0';
    if (double) {
      const exp = '1'.repeat(11);
      const man = isInf ? '0'.repeat(52) : '1' + '0'.repeat(51);
      const bits = sign + exp + man;
      return { bits, hex: bitsToHex(bits), sign, exponentBits: exp, exponent: '特殊', mantissaBits: man };
    }
    const exp = '1'.repeat(8);
    const man = isInf ? '0'.repeat(23) : '1' + '0'.repeat(22);
    const bits = sign + exp + man;
    return { bits, hex: bitsToHex(bits), sign, exponentBits: exp, exponent: '特殊', mantissaBits: man };
  }
  const buf = new ArrayBuffer(double ? 8 : 4);
  const f32 = new Float32Array(buf);
  const f64 = new Float64Array(buf);
  const u32 = new Uint32Array(buf);
  const u64 = new BigUint64Array(buf);
  if (double) f64[0] = value;
  else f32[0] = value;
  const raw = double ? u64[0].toString(2).padStart(64, '0') : u32[0].toString(2).padStart(32, '0');
  const sign = raw[0];
  const expBits = double ? raw.slice(1, 12) : raw.slice(1, 9);
  const manBits = double ? raw.slice(12) : raw.slice(9);
  const expBias = double ? 1023 : 127;
  const expVal = parseInt(expBits, 2) - expBias;
  return {
    bits: raw,
    hex: bitsToHex(raw),
    sign,
    exponentBits: expBits,
    exponent: String(expVal),
    mantissaBits: manBits,
  };
}

function bitsToHex(bits: string): string {
  const bytes: string[] = [];
  for (let i = 0; i < bits.length; i += 4) bytes.push(parseInt(bits.slice(i, i + 4), 2).toString(16));
  return '0x' + bytes.join('');
}

function parse() {
  error.value = '';
  const v = Number(valueInput.value);
  if (Number.isNaN(v)) {
    error.value = '请输入有效数字(支持 NaN 之外的有限数或 Infinity)';
    result.value = [];
    return;
  }
  result.value = [
    { name: '单精度 float32', ...numberToIEEE(v, false) },
    { name: '双精度 float64', ...numberToIEEE(v, true) },
  ].map(({ name, ...rest }) => ({
    name,
    ...rest,
    fields: {
      sign: rest.sign,
      exponentBits: rest.exponentBits,
      exponent: rest.exponent,
      mantissaBits: rest.mantissaBits,
    },
  }));
}
</script>
