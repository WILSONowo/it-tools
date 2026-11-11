import { Scissors } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '音频裁剪',
  path: '/cut-audio',
  description: '裁剪音频片段(MP3/WAV/M4A/FLAC/OGG/AAC 等),基于 FFmpeg.wasm 在浏览器本地处理,不上传服务器。',
  keywords: ['audio', 'cut', 'trim', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', '剪辑', '裁剪', '提取'],
  component: () => import('./cut-audio.vue'),
  icon: Scissors,
  createdAt: new Date('2026-09-03'),
  explain: [
    '第一次使用此工具需要等待 FFmpeg.wasm 下载并加载完成。',
    '本工具基于 FFmpeg.wasm 构建,将业界标准的 FFmpeg 多媒体处理引擎通过 WebAssembly 技术移植到浏览器端运行。所有音频处理操作均在您的本地设备完成,无需上传至任何服务器,确保您的音频文件隐私安全。',
    '开始时间和结束时间的格式为:HH:mm:ss.SSS(小时:分钟:秒.毫秒),例如:00:05:30.123,表示 5 分钟 30 秒 123 毫秒。',
    '## 支持格式',
    '- **MP3** MPEG-1 Audio Layer 3,最通用的有损压缩格式',
    '- **WAV** 波形音频格式,无损未压缩',
    '- **M4A/AAC** MPEG-4 音频,Apple 设备常用',
    '- **FLAC** 自由无损音频编码,高品质无损压缩',
    '- **OGG** Ogg Vorbis,开源压缩格式',
    '- **WMA** Windows Media Audio',
    '- **AIFF** 音频交换文件格式,Apple 无损格式',
  ],
});
