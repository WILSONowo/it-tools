import type { OGSchemaType } from '../OGSchemaType.type';
import { videoMovie } from './videoMovie';

export const videoEpisode: OGSchemaType = {
  name: '视频剧集详情',
  elements: [
    ...videoMovie.elements,
    { type: 'input', label: '剧集', key: 'video:series', placeholder: '这一集属于哪个剧集系列...' },
  ],
};
