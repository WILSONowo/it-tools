import type { OGSchemaType } from '../OGSchemaType.type';

const typeOptions = [
  { label: '网站', value: 'website' },
  { label: '文章', value: 'article' },
  { label: '图书', value: 'book' },
  { label: '个人资料', value: 'profile' },
  {
    type: 'group',
    label: '音乐',
    key: 'Music',
    children: [
      { label: '歌曲', value: 'music.song' },
      { label: '音乐专辑', value: 'music.album' },
      { label: '播放列表', value: 'music.playlist' },
      { label: '广播电台', value: 'music.radio_station' },
    ],
  },
  {
    type: 'group',
    label: '视频',
    key: 'Video',
    children: [
      { label: '电影', value: 'video.movie' },
      { label: '剧集', value: 'video.episode' },
      { label: '电视节目', value: 'video.tv_show' },
      { label: '其他视频', value: 'video.other' },
    ],
  },
];

export const website: OGSchemaType = {
  name: '通用信息',
  elements: [
    {
      type: 'select',
      label: '页面类型',
      placeholder: '选择您的网站类型...',
      key: 'type',
      options: typeOptions,
    },
    { type: 'input', label: '标题', placeholder: '输入您的网站标题...', key: 'title' },
    {
      type: 'input',
      label: '描述',
      placeholder: '输入您的网站描述...',
      key: 'description',
    },
    {
      type: 'input',
      label: '页面 URL',
      placeholder: '输入您的网站 URL...',
      key: 'url',
    },
  ],
};
