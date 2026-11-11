import { runRegex, type RegexRunRequest } from './regex-tester.service';

const ctx = self as unknown as Worker;

ctx.addEventListener('message', (event: MessageEvent<{ id: number; request: RegexRunRequest }>) => {
  const { id, request } = event.data;
  try {
    ctx.postMessage({ id, result: runRegex(request) });
  } catch (e) {
    ctx.postMessage({ id, result: { error: (e as Error).message, matches: [], replaced: '' } });
  }
});
