import { Replace } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'JSON 键名重命名',
  path: '/json-key-renamer',
  description: '通过映射(旧 → 新)或大小写规则批量重命名 JSON 文档中的键。',
  keywords: ['json', 'key', 'rename', 'map', 'transform', 'case', 'snake', 'camel', 'recursive'],
  component: () => import('./json-key-renamer.vue'),
  icon: Replace,
  createdAt: new Date('2026-09-03'),
});
