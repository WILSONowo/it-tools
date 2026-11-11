import type { OGSchemaType } from '../OGSchemaType.type';

export const twitter: OGSchemaType = {
  name: 'Twitter',
  elements: [
    {
      type: 'select',
      options: [
        { label: '摘要', value: 'summary' },
        { label: '大图摘要', value: 'summary_large_image' },
        { label: '应用', value: 'app' },
        { label: '播放器', value: 'player' },
      ],
      label: '卡片类型',
      placeholder: 'Twitter 卡片类型...',
      key: 'twitter:card',
    },
    {
      type: 'input',
      label: '站点账号',
      placeholder: '站点的 Twitter 账号名称（例如：@ittoolsdottech）...',
      key: 'twitter:site',
    },
    {
      type: 'input',
      label: '作者账号',
      placeholder: '作者的 Twitter 账号名称（例如：@cthmsst）...',
      key: 'twitter:creator',
    },
  ],
};
