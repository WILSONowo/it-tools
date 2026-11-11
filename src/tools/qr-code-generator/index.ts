import { Qrcode } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '二维码生成器',
  path: '/qrcode-generator',
  description: '为网址或文本生成并下载二维码,可自定义前景、背景与容错级别。',
  keywords: ['qr', 'code', 'generator', 'square', 'color', 'link', 'low', 'medium', 'quartile', 'high', 'transparent'],
  explain: ['- 二维码容错分 L/M/Q/H 四档,级别越高越耐遮挡。'],
  component: () => import('./qr-code-generator.vue'),
  icon: Qrcode,
});
