<template>
  <n-card title="数学小工具包">
    <n-tabs type="line" default-value="percent">
      <n-tab-pane name="percent" tab="百分比">
        <n-form label-placement="top">
          <n-grid y-gap="16" cols="2 600:4" x-gap="12" responsive="screen">
            <n-gi>
              <n-form-item label="数值">
                <n-input-number v-model:value="pValue" style="width: 100%" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item label="百分比(%)">
                <n-input-number v-model:value="pPercent" style="width: 100%" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </n-form>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button type="primary" secondary @click="percentOf">求百分比</n-button>
          <n-button secondary @click="valueOfPercent">百分比对应的值</n-button>
        </n-space>
        <n-form-item label="计算结果" label-placement="top">
          <n-input
            :value="percentResult"
            type="textarea"
            readonly
            :autosize="{ minRows: 2 }"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="stats" tab="平均数 / 方差">
        <n-form label-placement="top">
          <n-form-item label="数值(逗号或空格分隔)">
            <n-input
              v-model:value="numbersInput"
              placeholder="1, 2, 3, 4, 5"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button secondary @click="computeStats">开始计算</n-button>
        </n-space>
        <n-form-item label="计算结果" label-placement="top">
          <n-input
            :value="statsResult"
            readonly
            type="textarea"
            :autosize="{ minRows: 3 }"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="gcd" tab="最大公约数 / 最小公倍数">
        <n-form label-placement="top">
          <n-form-item label="整数(逗号分隔)">
            <n-input
              v-model:value="gcdInput"
              placeholder="12, 18, 24"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button secondary @click="computeGcdLcm">开始计算</n-button>
        </n-space>
        <n-form-item label="计算结果" label-placement="top">
          <n-input
            :value="gcdResult"
            readonly
            type="textarea"
            :autosize="{ minRows: 2 }"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="fraction" tab="分数">
        <n-form label-placement="top">
          <n-form-item label="分子 / 分母">
            <div class="fraction-inputs">
              <n-input-number v-model:value="fNumerator" style="width: 160px" />
              <n-text class="fraction-slash">/</n-text>
              <n-input-number v-model:value="fDenominator" :min="1" style="width: 160px" />
            </div>
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button type="primary" secondary @click="simplifyFraction">约分</n-button>
        </n-space>
        <n-form-item label="计算结果" label-placement="top">
          <n-input
            :value="fractionResult"
            readonly
            type="textarea"
            :autosize="{ minRows: 2 }"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>

      <n-tab-pane name="prime" tab="素数 / 分解质因数">
        <n-form label-placement="top">
          <n-form-item label="整数">
            <n-input-number v-model:value="primeN" :min="1" style="width: 200px" />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-bottom: 12px">
          <n-button type="primary" secondary @click="factorize">检查并分解</n-button>
        </n-space>
        <n-form-item label="计算结果" label-placement="top">
          <n-input
            :value="primeResult"
            readonly
            type="textarea"
            :autosize="{ minRows: 3 }"
            style="font-family: monospace"
          />
        </n-form-item>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// percentages
const pValue = ref(200);
const pPercent = ref(15);
const percentResult = ref('');

function percentOf() {
  percentResult.value = `${pValue.value} 的 ${pPercent.value}% = ${(pValue.value * pPercent.value) / 100}`;
}
function valueOfPercent() {
  percentResult.value = `${pValue.value} 占 ${pPercent.value}% → 总值 = ${(pValue.value * 100) / pPercent.value}`;
}

// stats
const numbersInput = ref('1, 2, 3, 4, 5');
const statsResult = ref('');

function parseNumbers(text: string): number[] {
  return text
    .split(/[,\s;]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

function computeStats() {
  const nums = parseNumbers(numbersInput.value);
  if (nums.length === 0) {
    statsResult.value = '';
    return;
  }
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const stddev = Math.sqrt(variance);
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  statsResult.value = `数量: ${nums.length}\n总和: ${sum}\n平均数: ${mean.toFixed(
    4,
  )}\n中位数: ${median}\n方差: ${variance.toFixed(4)}\n标准差: ${stddev.toFixed(4)}\n最小: ${min}  最大: ${max}`;
}

// gcd/lcm
const gcdInput = ref('12, 18, 24');
const gcdResult = ref('');

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function computeGcdLcm() {
  const nums = parseNumbers(gcdInput.value).filter((n) => Number.isInteger(n));
  if (nums.length === 0) {
    gcdResult.value = '';
    return;
  }
  const gcdValue = nums.reduce((a, b) => gcd(a, b));
  const lcmValue = nums.reduce((a, b) => Math.abs(a * b) / gcd(a, b));
  gcdResult.value = `最大公约数 (GCD): ${gcdValue}\n最小公倍数 (LCM): ${lcmValue}`;
}

// fractions
const fNumerator = ref(12);
const fDenominator = ref(18);
const fractionResult = ref('');

function simplifyFraction() {
  if (fDenominator.value === 0) {
    fractionResult.value = '分母不能为 0';
    return;
  }
  const g = gcd(fNumerator.value, fDenominator.value);
  const n = fNumerator.value / g;
  const d = fDenominator.value / g;
  const decimal = (fNumerator.value / fDenominator.value).toFixed(4);
  fractionResult.value = `${fNumerator.value}/${fDenominator.value} = ${n}/${d} ≈ ${decimal}`;
}

// prime
const primeN = ref(360);
const primeResult = ref('');

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function factorize() {
  const n = primeN.value;
  if (n < 2) {
    primeResult.value = `${n} 不是素数(≥2 才能分解)`;
    return;
  }
  const prime = isPrime(n);
  if (prime) {
    primeResult.value = `${n} 是素数。`;
    return;
  }
  let value = n;
  const factors: { factor: number; count: number }[] = [];
  for (let i = 2; i * i <= value; i++) {
    if (value % i === 0) {
      let count = 0;
      while (value % i === 0) {
        value /= i;
        count++;
      }
      factors.push({ factor: i, count });
    }
  }
  if (value > 1) factors.push({ factor: value, count: 1 });
  primeResult.value = `${n} 不是素数。\n分解质因数: ${factors
    .map((f) => `${f.factor}${f.count > 1 ? `^${f.count}` : ''}`)
    .join(' × ')}`;
}

// initial
percentOf();
computeStats();
computeGcdLcm();
simplifyFraction();
factorize();
</script>

<style lang="less" scoped>
.fraction-inputs {
  display: flex;
  align-items: center;
  gap: 8px;

  .fraction-slash {
    flex: 0 0 auto;
  }
}
</style>
