import type { OGSchemaType } from '../OGSchemaType.type';

export const article: OGSchemaType = {
  name: '文章',
  elements: [
    {
      type: 'input',
      label: '发布日期',
      key: 'article:published_time',
      placeholder: '文章的首次发布日期...',
    },
    {
      type: 'input',
      label: '修改日期',
      key: 'article:modified_time',
      placeholder: '文章的最后修改时间...',
    },
    {
      type: 'input',
      label: '过期日期',
      key: 'article:expiration_time',
      placeholder: '文章何时过期...',
    },
    { type: 'input', label: '作者', key: 'article:author', placeholder: '文章的作者...' },
    {
      type: 'input',
      label: '栏目',
      key: 'article:section',
      placeholder: '高层级栏目名称，例如：科技',
    },
    { type: 'input', label: '标签', key: 'article:tag', placeholder: '与文章关联的关键词标签...' },
  ],
};
