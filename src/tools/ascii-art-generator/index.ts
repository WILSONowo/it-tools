import { FileText } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ASCII 艺术字生成器',
  path: '/ascii-art-generator',
  description: '用经典 figlet 字体把你的文字生成 ASCII 艺术字横幅。',
  keywords: ['ascii', 'art', 'figlet', 'banner', 'text', 'font', 'big', 'standard', 'generator'],
  component: () => import('./ascii-art-generator.vue'),
  icon: FileText,
  createdAt: new Date('2026-09-03'),
});
