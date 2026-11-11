import type { OGSchemaType } from '../OGSchemaType.type';

export const profile: OGSchemaType = {
  name: '个人资料',
  elements: [
    {
      type: 'input',
      label: '名字',
      placeholder: '输入此人的名字...',
      key: 'profile:first_name',
    },
    {
      type: 'input',
      label: '姓氏',
      placeholder: '输入此人的姓氏...',
      key: 'profile:last_name',
    },
    { type: 'input', label: '用户名', placeholder: '输入此人的用户名...', key: 'profile:username' },
    { type: 'input', label: '性别', placeholder: '输入此人的性别...', key: 'profile:gender' },
  ],
};
