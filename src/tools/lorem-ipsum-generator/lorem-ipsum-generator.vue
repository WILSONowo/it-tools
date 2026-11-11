<template>
  <n-card>
    <n-form label-placement="left" label-width="200" :show-feedback="false">
      <n-form-item label="段落数">
        <n-slider v-model:value="paragraphs" :step="1" :min="1" :max="20" />
      </n-form-item>
      <n-form-item label="每段句子数">
        <n-slider v-model:value="sentences" range :step="1" :min="1" :max="50" />
      </n-form-item>
      <n-form-item label="每句单词数">
        <n-slider v-model:value="words" range :step="1" :min="1" :max="50" />
      </n-form-item>
      <n-form-item label="以 lorem ipsum 开头?">
        <n-switch v-model:value="startWithLoremIpsum" />
      </n-form-item>
      <n-form-item label="输出为 HTML?">
        <n-switch v-model:value="asHTML" />
      </n-form-item>

      <n-space justify="center" style="margin: 12px 0 16px">
        <n-button type="primary" secondary @click="regenerate">重新生成</n-button>
        <n-button secondary @click="copy">复制结果</n-button>
      </n-space>
    </n-form>

    <n-form-item label="生成的 Lorem ipsum 文本" label-placement="top">
      <n-input
        :value="loremIpsumText"
        type="textarea"
        placeholder="Lorem ipsum 文本..."
        readonly
        :autosize="{ minRows: 6 }"
        spellcheck="false"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { ref, computed } from 'vue';
import { randIntFromInterval } from '@/utils/random';
import { generateLoremIpsum } from './lorem-ipsum-generator.service';

const paragraphs = ref(1);
const sentences = ref([3, 8]);
const words = ref([8, 15]);
const startWithLoremIpsum = ref(true);
const asHTML = ref(false);

const tick = ref(0);

// randIntFromInterval is inclusive, so the slider maximums are reachable; sort in case the handles crossed.
const randInRange = ([a, b]: number[]) => randIntFromInterval(Math.min(a, b), Math.max(a, b));

const loremIpsumText = computed(() => {
  void tick.value;
  return generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randInRange(sentences.value),
    wordCount: randInRange(words.value),
    startWithLoremIpsum: startWithLoremIpsum.value,
  });
});

function regenerate() {
  tick.value++;
}

const { copy } = useCopy({ source: loremIpsumText, text: 'Lorem ipsum 已复制到剪贴板' });
</script>
