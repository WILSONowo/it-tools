import type { OGSchemaType } from '../OGSchemaType.type';

export const image: OGSchemaType = {
  name: '图片',
  elements: [
    {
      type: 'input',
      label: '图片 URL',
      placeholder: '您的网站社交分享图片的 URL...',
      key: 'image',
    },
    {
      type: 'input',
      label: '图片替代文本',
      placeholder: '您的网站社交分享图片的替代文本...',
      key: 'image:alt',
    },
    {
      type: 'input',
      label: '宽度',
      placeholder: '您的网站社交分享图片的宽度（像素）...',
      key: 'image:width',
    },
    {
      type: 'input',
      label: '高度',
      placeholder: '您的网站社交分享图片的高度（像素）...',
      key: 'image:height',
    },
  ],
};
