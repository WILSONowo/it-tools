import { Fingerprint } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '摩斯密码翻译',
  path: '/morse-code-translator',
  description: '将文本翻译为摩斯电码(· —),也可将摩斯电码解码为文本。',
  keywords: ['morse', 'code', 'translate', 'encode', 'decode', 'signal', 'telegraph', 'dot', 'dash'],
  explain: [
    '- 摩斯电码由点(.)与划(-)组成;本工具中字母之间用一个空格分隔,单词之间用 / 或两个及以上空格分隔(对应标准中 3 个单位的字母间隔与 7 个单位的单词间隔)。',
    '- SOS 是 ... --- ...,不是缩写而是便于识别的信号。',
  ],
  component: () => import('./morse-code-translator.vue'),
  icon: Fingerprint,
  createdAt: new Date('2026-09-03'),
});
