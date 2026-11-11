import type { OGSchemaType } from '../OGSchemaType.type';

export const musicAlbum: OGSchemaType = {
  name: '专辑详情',
  elements: [
    { type: 'input', label: '歌曲', key: 'music:song', placeholder: '这张专辑中的歌曲...' },
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
    { type: 'input', label: '音乐人', key: 'music:musician', placeholder: '创作这首歌的音乐人...' },
    {
      type: 'input',
      label: '发行日期',
      key: 'music:release_date',
      placeholder: '这张专辑的发行日期...',
    },
  ],
};
