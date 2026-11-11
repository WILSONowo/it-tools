import { Video } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: '视频格式转换',
  path: '/video-converter',
  description: '视频格式互转:MP4/WEBM/MKV/MOV/AVI 等,可选 H.264/H.265/VP9 编码,基于 FFmpeg.wasm 本地处理。',
  keywords: ['video', 'convert', 'mp4', 'webm', 'mkv', 'mov', 'avi', 'h264', 'h265', 'vp9', '转换'],
  component: () => import('./video-converter.vue'),
  icon: Video,
  createdAt: new Date('2026-09-03'),
  explain: [
    '第一次使用此工具需要等待 FFmpeg.wasm 下载并加载完成。视频转换使用多线程版本,并默认快速编码。若源编码与目标编码相同,会直接复制流,速度会快很多。',
    '本工具基于 FFmpeg.wasm 构建,将业界标准的 FFmpeg 多媒体处理引擎通过 WebAssembly 技术移植到浏览器端运行。所有音视频处理操作均在您的本地设备完成,无需上传至任何服务器,确保您的文件隐私安全。',
    '**视频编码说明**:H.264 兼容性最好;H.265/HEVC 同画质体积更小但兼容稍弱;VP9 为 Web 优化开源编码(本工具内置的 FFmpeg 不含 AV1 编码器)。',
  ],
});
