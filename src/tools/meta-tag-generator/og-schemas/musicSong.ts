import type { OGSchemaType } from '../OGSchemaType.type';

export const musicSong: OGSchemaType = {
  name: '歌曲详情',
  elements: [
    { type: 'input', label: '时长', placeholder: '歌曲的时长...', key: 'music:duration' },
    { type: 'input', label: '专辑', placeholder: '这首歌所属的专辑...', key: 'music:album' },
    {
      type: 'input',
      label: '碟片',
      placeholder: '这首歌属于专辑的哪张碟...',
      key: 'music:album:disk',
    },
    { type: 'input', label: '音轨', placeholder: '这首歌是专辑中的第几轨...', key: 'music:album:track' },
    {
      type: 'input-multiple',
      label: '音乐人',
      placeholder: '创作这首歌的音乐人...',
      key: 'music:musician',
    },
  ],
};
