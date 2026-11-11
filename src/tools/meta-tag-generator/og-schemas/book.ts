import type { OGSchemaType } from '../OGSchemaType.type';

export const book: OGSchemaType = {
  name: '图书',
  elements: [
    { type: 'input', label: '作者', key: 'book:author', placeholder: '这本书的作者...' },
    { type: 'input', label: 'ISBN', key: 'book:isbn', placeholder: '国际标准书号（ISBN）...' },
    {
      type: 'input',
      label: '发行日期',
      key: 'book:release_date',
      placeholder: '这本书的发行日期...',
    },
    { type: 'input', label: '标签', key: 'book:tag', placeholder: '与这本书关联的关键词标签...' },
  ],
};
