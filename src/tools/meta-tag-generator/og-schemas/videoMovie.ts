import type { OGSchemaType } from '../OGSchemaType.type';

export const videoMovie: OGSchemaType = {
  name: '电影详情',
  elements: [
    {
      type: 'input-multiple',
      label: '演员',
      key: 'video:actor',
      placeholder: '男演员/女演员的姓名...',
    },
    // { type: 'input', label: 'Actor role', key: 'video:actor:role', placeholder: 'The role they played...' },
    {
      type: 'input-multiple',
      label: '导演',
      key: 'video:director',
      placeholder: '导演的姓名...',
    },
    { type: 'input-multiple', label: '编剧', key: 'video:writer', placeholder: '这部电影的编剧...' },
    { type: 'input', label: '时长', key: 'video:duration', placeholder: '电影的长度（秒）...' },
    {
      type: 'input',
      label: '发行日期',
      key: 'video:release_date',
      placeholder: '这部电影的发行日期...',
    },
    { type: 'input', label: '标签', key: 'video:tag', placeholder: '与这部电影关联的关键词标签...' },
  ],
};
