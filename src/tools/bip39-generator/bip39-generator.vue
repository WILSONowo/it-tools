<template>
  <div>
    <n-card title="BIP39 助记词">
      <n-grid y-gap="16" cols="1 700:3" x-gap="12" responsive="screen">
        <n-gi>
          <n-form label-placement="top">
            <n-form-item label="语言">
              <n-select
                v-model:value="language"
                :options="Object.keys(languages).map((key) => ({ label: languageLabelMap[key], value: key }))"
              />
            </n-form-item>
            <n-form-item label="助记词数量">
              <n-select v-model:value="entropyBits" :options="wordCountOptions" @update:value="refreshEntropy" />
            </n-form-item>
          </n-form>
        </n-gi>
        <n-gi span="2">
          <n-form label-placement="top">
            <n-form-item
              label="熵(种子)"
              style="margin: 0"
              :feedback="entropyValidation.message"
              :validation-status="entropyValidation.status"
            >
              <n-input-group>
                <n-input v-model:value="entropy" placeholder="输入十六进制字符串..." style="font-family: monospace" />
                <n-button @click="refreshEntropy">
                  <n-icon size="22">
                    <Refresh />
                  </n-icon>
                </n-button>
                <n-button @click="copyEntropy">
                  <n-icon size="22">
                    <Copy />
                  </n-icon>
                </n-button>
              </n-input-group>
            </n-form-item>
          </n-form>
        </n-gi>
      </n-grid>
      <n-form label-placement="top" style="margin-top: 16px">
        <n-form-item
          label="口令(助记词)"
          :feedback="mnemonicValidation.message"
          :validation-status="mnemonicValidation.status"
        >
          <n-input-group>
            <n-input
              v-model:value="passphrase"
              style="text-align: center; flex: 1; font-family: monospace"
              placeholder="输入助记词..."
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
            />

            <n-button @click="copyPassphrase">
              <n-icon size="22" :component="Copy" />
            </n-button>
          </n-input-group>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import {
  chineseSimplifiedWordList,
  chineseTraditionalWordList,
  czechWordList,
  englishWordList,
  frenchWordList,
  italianWordList,
  japaneseWordList,
  koreanWordList,
  portugueseWordList,
  spanishWordList,
} from '@it-tools/bip39';
import { Copy, Refresh } from '@vicons/tabler';
import { computed, ref } from 'vue';
import {
  ALLOWED_ENTROPY_BITS,
  entropyToMnemonic,
  generateEntropy,
  getEntropyError,
  mnemonicToEntropy,
} from './bip39.service';

const languageLabelMap: Record<string, string> = {
  English: '英语',
  'Chinese simplified': '简体中文',
  'Chinese traditional': '繁体中文',
  Czech: '捷克语',
  French: '法语',
  Italian: '意大利语',
  Japanese: '日语',
  Korean: '韩语',
  Portuguese: '葡萄牙语',
  Spanish: '西班牙语',
};

const languages = {
  English: englishWordList,
  'Chinese simplified': chineseSimplifiedWordList,
  'Chinese traditional': chineseTraditionalWordList,
  Czech: czechWordList,
  French: frenchWordList,
  Italian: italianWordList,
  Japanese: japaneseWordList,
  Korean: koreanWordList,
  Portuguese: portugueseWordList,
  Spanish: spanishWordList,
};

const wordCountOptions = ALLOWED_ENTROPY_BITS.map((bits) => ({
  label: `${(bits * 33) / 32 / 11} 个(${bits} 位熵)`,
  value: bits,
}));
const entropyBits = ref(128);
const entropy = ref(generateEntropy(entropyBits.value));
const passphraseInput = ref('');

const language = ref<keyof typeof languages>('English');
const passphrase = computed({
  get() {
    return withDefaultOnError(() => entropyToMnemonic(entropy.value, languages[language.value]), passphraseInput.value);
  },
  set(value: string) {
    passphraseInput.value = value;
    entropy.value = withDefaultOnError(() => mnemonicToEntropy(value, languages[language.value]), '');
  },
});

const entropyValidation = useValidation({
  source: entropy,
  rules: [
    {
      validator: (value) => /^[a-fA-F0-9]*$/.test(value),
      message: '熵应为十六进制字符串',
    },
    {
      validator: (value) => getEntropyError(value) === undefined,
      message: '熵长度应为 32、40、48、56 或 64 个十六进制字符(128~256 位,步长 32 位)',
    },
  ],
});

const mnemonicValidation = useValidation({
  source: passphrase,
  rules: [
    {
      validator: (value) => isNotThrowing(() => mnemonicToEntropy(value, languages[language.value])),
      message: '无效的助记词',
    },
  ],
});

function refreshEntropy() {
  entropy.value = generateEntropy(entropyBits.value);
}

const { copy: copyEntropy } = useCopy({ source: entropy, text: '熵已复制到剪贴板' });
const { copy: copyPassphrase } = useCopy({ source: passphrase, text: '口令已复制到剪贴板' });
</script>
