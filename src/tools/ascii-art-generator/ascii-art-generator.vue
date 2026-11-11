<template>
  <n-card title="ASCII 艺术字">
    <n-form label-placement="top">
      <n-form-item label="文本">
        <n-input v-model:value="text" placeholder="输入一些内容..." @keyup.enter="refresh" />
      </n-form-item>
      <n-form-item label="字体" label-placement="top" style="margin-top: 16px">
        <n-select v-model:value="font" :options="fontOptions" style="max-width: 300px" @update:value="refresh" />
      </n-form-item>
    </n-form>
    <n-space justify="center" style="margin: 16px 0">
      <n-button type="primary" @click="refresh">生成</n-button>
      <n-button secondary @click="copy">复制</n-button>
    </n-space>

    <n-alert v-if="fontUnavailable" type="warning" :show-icon="false" style="margin-bottom: 12px">
      当前构建中不提供字体 "{{ font }}",已改用 "standard"。
    </n-alert>

    <n-form-item label="生成结果" label-placement="top">
      <n-input
        :value="art"
        type="textarea"
        readonly
        :autosize="{ minRows: 6 }"
        placeholder="ASCII 艺术字..."
        spellcheck="false"
        style="font-family: monospace; font-size: 13px; line-height: 1.3"
      />
    </n-form-item>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import figlet from 'figlet';
import standardFont from 'figlet/importable-fonts/Standard';
import bannerFont from 'figlet/importable-fonts/Banner';
import bigFont from 'figlet/importable-fonts/Big';
import blockFont from 'figlet/importable-fonts/Block';
import doomFont from 'figlet/importable-fonts/Doom';
import ghostFont from 'figlet/importable-fonts/Ghost';
import leanFont from 'figlet/importable-fonts/Lean';
import miniFont from 'figlet/importable-fonts/Mini';
import slantFont from 'figlet/importable-fonts/Slant';
import smallFont from 'figlet/importable-fonts/Small';
import { useCopy } from '@/composable/copy';

function registerFonts() {
  const fonts: Record<string, unknown> = {
    Standard: standardFont,
    Banner: bannerFont,
    Big: bigFont,
    Block: blockFont,
    Doom: doomFont,
    Ghost: ghostFont,
    Lean: leanFont,
    Mini: miniFont,
    Slant: slantFont,
    Small: smallFont,
  };
  for (const [name, mod] of Object.entries(fonts)) {
    (figlet as unknown as { parseFont: (n: string, c: string) => void }).parseFont(name, mod as string);
  }
}
registerFonts();

const text = ref('IT-Tools');
const font = ref('Standard');
const fontUnavailable = ref(false);

const fontOptions = [
  { label: 'Standard', value: 'Standard' },
  { label: 'Banner', value: 'Banner' },
  { label: 'Big', value: 'Big' },
  { label: 'Block', value: 'Block' },
  { label: 'Doom', value: 'Doom' },
  { label: 'Ghost', value: 'Ghost' },
  { label: 'Lean', value: 'Lean' },
  { label: 'Mini', value: 'Mini' },
  { label: 'Slant', value: 'Slant' },
  { label: 'Small', value: 'Small' },
];

const art = ref('');
function refresh() {
  figlet.text(text.value || ' ', { font: font.value }, (err, result) => {
    if (err || !result) {
      fontUnavailable.value = true;
      figlet.text(text.value || ' ', { font: 'Standard' }, (_err2, fallback) => {
        art.value = fallback ?? '';
      });
      return;
    }
    fontUnavailable.value = false;
    art.value = result.replace(/\n$/, '');
  });
}

refresh();

const { copy } = useCopy({ source: art, text: 'ASCII 艺术字已复制到剪贴板' });
</script>
