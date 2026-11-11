import { Fingerprint } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '摩斯密码翻译',
  path: '/morse-code-translator',
  description: '将文本翻译为摩斯电码(· —),也可将摩斯电码解码为文本。',
  keywords: ['morse', 'code', 'translate', 'encode', 'decode', 'signal', 'telegraph', 'dot', 'dash'],
  explain: [
    '- 摩斯电码由点(.)与划(-)组成,字母间空一格,单词间空三格(或用 /)。',
    '- SOS 是 ... --- ...,不是缩写而是便于识别的信号。',
  ],
  component: () => import('./morse-code-translator.vue'),
  icon: Fingerprint,
  createdAt: new Date('2026-09-03'),
});
