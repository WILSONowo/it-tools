import { Globe } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Punycode / IDN 域名转换',
  path: '/punycode-converter',
  description: '在国际化域名(IDN)与 Punycode(xn--)之间互相转换。',
  keywords: ['punycode', 'idn', 'domain', 'xn--', 'unicode', 'international', 'convert', 'dns'],
  component: () => import('./punycode-converter.vue'),
  icon: Globe,
  createdAt: new Date('2026-09-03'),
});
