import type { OGSchemaType } from '../OGSchemaType.type';

export const musicPlaylist: OGSchemaType = {
  name: '播放列表详情',
  elements: [
    { type: 'input', label: '歌曲', key: 'music:song', placeholder: '这个播放列表中的歌曲...' },
    {
      type: 'input',
      label: '碟片',
      key: 'music:song:disc',
      placeholder: '与 music:album:disc 相同，但顺序相反...',
    },
    {
      type: 'input',
      label: '音轨',
      key: 'music:song:track',
      placeholder: '与 music:album:track 相同，但顺序相反...',
    },
    { type: 'input', label: '创建者', key: 'music:creator', placeholder: '这个播放列表的创建者...' },
  ],
};
