import { useMessage } from 'naive-ui';
import { ref, unref, type Ref } from 'vue';
import { copyToClipboard } from '@/utils/clipboard';

export const COPY_FAILED_TEXT = '复制失败:浏览器不允许访问剪贴板,请手动选择文本复制';

export function useCopy({ source, text = '已复制到剪贴板' }: { source: Ref; text?: string }) {
  const message = useMessage();

  return {
    async copy() {
      const value = unref(source);
      const ok = await copyToClipboard(value == null ? '' : String(value));
      if (ok) {
        message.success(text);
      } else {
        message.error(COPY_FAILED_TEXT);
      }
      return ok;
    },
  };
}

/**
 * Copy arbitrary text and expose the outcome for inline feedback (tooltips, button labels).
 * `status` is 'copied' or 'failed' for a moment after each attempt, then back to 'idle'.
 */
export function useCopyFeedback({ resetAfter = 1500 }: { resetAfter?: number } = {}) {
  const status = ref<'idle' | 'copied' | 'failed'>('idle');
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string) {
    const ok = await copyToClipboard(text);
    status.value = ok ? 'copied' : 'failed';
    clearTimeout(timer);
    timer = setTimeout(() => (status.value = 'idle'), resetAfter);
    return ok;
  }

  return { copy, status };
}
