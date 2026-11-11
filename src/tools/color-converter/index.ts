import { Palette } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '颜色转换器',
  path: '/color-converter',
  description: '在不同颜色格式(hex、rgb、hsl、css 颜色名等)之间转换。',
  keywords: ['color', 'converter'],
  explain: ['- HEX、RGB、HSL 是常见颜色表示,互为转换。'],
  component: () => import('./color-converter.vue'),
  icon: Palette,
  redirectFrom: ['/color-picker-converter'],
});
