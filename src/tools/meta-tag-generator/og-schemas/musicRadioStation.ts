import type { OGSchemaType } from '../OGSchemaType.type';

export const musicRadioStation: OGSchemaType = {
  name: '广播电台详情',
  elements: [{ type: 'input', label: '创建者', key: 'music:creator', placeholder: '这个广播电台的创建者...' }],
};
