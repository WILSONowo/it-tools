import { Music } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '视频提取音频',
  path: '/video-to-audio',
  description: '从视频(MP4/WEBM/MKV/MOV/AVI 等)中提取音频,可转 MP3/WAV/M4A/FLAC/OGG/AAC,支持裁剪片段。',
  keywords: ['video', 'audio', 'extract', 'mp4', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', '提取', '音频'],
  component: () => import('./video-to-audio.vue'),
  icon: Music,
  createdAt: new Date('2026-09-03'),
  explain: [
    '第一次使用此工具需要等待 FFmpeg.wasm 下载并加载完成。',
    '本工具基于 FFmpeg.wasm 构建,将业界标准的 FFmpeg 多媒体处理引擎通过 WebAssembly 技术移植到浏览器端运行。所有音频处理操作均在您的本地设备完成,无需上传至任何服务器,确保您的音频文件隐私安全。',
    '开始时间和结束时间的格式为:HH:mm:ss.SSS(小时:分钟:秒.毫秒),例如:00:05:30.123,表示 5 分钟 30 秒 123 毫秒。',
    '**音频比特率(Audio Bitrate)**:单位时间内(每秒)处理或传输的音频数据量,单位通常是 kbps(千比特/秒)。它是影响音频质量和文件大小的核心参数。',
    '**以下是常见音频比特率及其适用场景的详细对比:**',
    '| 比特率 | 音质等级 | 格式示例 | 适用场景 |',
    '| --- | --- | --- | --- |',
    '| 32-64 kbps | 语音级 | MP3, AAC, Opus | 语音通话、播客、有声书、语音备忘录 |',
    '| 96-128 kbps | 标准音质 | MP3, AAC | 流媒体音乐(节省流量)、背景音乐、普通耳机收听 |',
    '| 192 kbps | 较好音质 | MP3, AAC | 日常音乐欣赏、在线音乐平台标准品质 |',
    '| 256 kbps | 高品质 | AAC (iTunes), MP3 | 主流音乐平台高品质选项、车载音响 |',
    '| 320 kbps | 极高品质 | MP3 (最高) | 发烧友入门、专业监听初步、本地音乐收藏 |',
    '| 500-1411 kbps | 无损/CD级 | FLAC, ALAC, WAV, AIFF | 专业音频制作、音乐存档、Hi-Fi 音响系统 |',
    '| >1411 kbps | 高解析度 | DSD, 24bit/96kHz+ FLAC | 母带处理、顶级发烧音响、专业录音室 |',
  ],
});
