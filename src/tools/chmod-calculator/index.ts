import { FileInvoice } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Chmod 权限计算器',
  path: '/chmod-calculator',
  description: '用这个在线 chmod 计算器计算文件权限与 chmod 命令。',
  keywords: [
    'chmod',
    'calculator',
    'file',
    'permission',
    'files',
    'directory',
    'folder',
    'recursive',
    'generator',
    'octal',
  ],
  explain: ['- 权限分三组:所有者/组/其他,每组读(4)写(2)执行(1)相加。', '- 如 755 = 所有者 7、组 5、其他 5。'],
  component: () => import('./chmod-calculator.vue'),
  icon: FileInvoice,
});
