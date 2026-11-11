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
      <n-button type="primary" :loading="loading" @click="refresh">生成</n-button>
      <n-button secondary @click="copy">复制</n-button>
    </n-space>

    <n-alert v-if="fontUnavailable" type="warning" :show-icon="false" style="margin-bottom: 12px">
      字体 "{{ font }}" 加载失败,已改用 "Standard"。
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
import { ref } from 'vue';
import figlet from 'figlet';
import { useCopy } from '@/composable/copy';

type FontModule = { default: string };

// 字体按需加载:只在选中时动态 import 并解析,避免首屏一次性加载全部字体(约 200 KB)
const FONT_LOADERS: Record<string, () => Promise<FontModule>> = {
  Standard: () => import('figlet/importable-fonts/Standard'),
  Banner: () => import('figlet/importable-fonts/Banner'),
  Big: () => import('figlet/importable-fonts/Big'),
  Block: () => import('figlet/importable-fonts/Block'),
  Doom: () => import('figlet/importable-fonts/Doom'),
  Ghost: () => import('figlet/importable-fonts/Ghost'),
  Lean: () => import('figlet/importable-fonts/Lean'),
  Mini: () => import('figlet/importable-fonts/Mini'),
  Slant: () => import('figlet/importable-fonts/Slant'),
  Small: () => import('figlet/importable-fonts/Small'),
};

const loadedFonts = new Set<string>();
const pendingFonts = new Map<string, Promise<void>>();

function ensureFont(name: string): Promise<void> {
  if (loadedFonts.has(name)) return Promise.resolve();
  const loader = FONT_LOADERS[name];
  if (!loader) return Promise.reject(new Error(`unknown font ${name}`));
  let pending = pendingFonts.get(name);
  if (!pending) {
    pending = loader()
      .then((mod) => {
        (figlet as unknown as { parseFont: (n: string, c: string) => void }).parseFont(name, mod.default);
        loadedFonts.add(name);
      })
      .finally(() => pendingFonts.delete(name));
    pendingFonts.set(name, pending);
  }
  return pending;
}

function renderText(txt: string, fontName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    figlet.text(txt, { font: fontName }, (err, result) => {
      if (err || result === undefined) reject(err ?? new Error('render failed'));
      else resolve(result);
    });
  });
}

const text = ref('IT-Tools');
const font = ref('Standard');
const fontUnavailable = ref(false);
const loading = ref(false);

const fontOptions = Object.keys(FONT_LOADERS).map((name) => ({ label: name, value: name }));

const art = ref('');
let renderId = 0;

async function refresh() {
  const id = ++renderId;
  const txt = text.value || ' ';
  const fontName = font.value;
  loading.value = true;
  try {
    let output: string;
    try {
      await ensureFont(fontName);
      output = await renderText(txt, fontName);
      if (id === renderId) fontUnavailable.value = false;
    } catch {
      await ensureFont('Standard');
      output = await renderText(txt, 'Standard');
      if (id === renderId) fontUnavailable.value = true;
    }
    if (id === renderId) art.value = output.replace(/\n$/, '');
  } catch {
    if (id === renderId) art.value = '';
  } finally {
    if (id === renderId) loading.value = false;
  }
}

void refresh();

const { copy } = useCopy({ source: art, text: 'ASCII 艺术字已复制到剪贴板' });
</script>
