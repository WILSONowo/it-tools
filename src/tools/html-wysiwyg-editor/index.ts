import { Edit } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'HTML 富文本编辑器',
  path: '/html-wysiwyg-editor',
  description: '功能丰富的在线所见即所得 HTML 编辑器,可即时获取源码。',
  keywords: ['html', 'wysiwyg', 'editor', 'p', 'ul', 'ol', 'converter', 'live'],
  component: () => import('./html-wysiwyg-editor.vue'),
  icon: Edit,
});
