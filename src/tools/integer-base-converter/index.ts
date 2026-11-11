import { ArrowsLeftRight } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '整数进制转换器',
  path: '/base-converter',
  description: '在不同进制间转换数字(十进制、十六进制、二进制、八进制、Base64 等)。',
  keywords: ['integer', 'number', 'base', 'conversion', 'decimal', 'hexadecimal', 'binary', 'octal', 'base64'],
  explain: ['- 十进制转二进制:不断除以 2 取余;反向:按位权累加。', '- 十六进制一位对应二进制四位,便于阅读长二进制。'],
  component: () => import('./integer-base-converter.vue'),
  icon: ArrowsLeftRight,
});
