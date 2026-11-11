export type DiffChange<T> = {
  value: T[];
  added?: boolean;
  removed?: boolean;
};

export function diffArrays<T>(oldItems: T[], newItems: T[]): DiffChange<T>[] {
  const oldLength = oldItems.length;
  const newLength = newItems.length;
  const max = Math.min(oldLength + newLength + 1, 2000);
  const offset = max + 1;
  const v: number[] = new Array(2 * max + 2).fill(0);
  const trace: number[][] = [];

  let found = false;
  for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      const index = k + offset;
      let x;
      if (k === -d || (k !== d && v[index - 1] < v[index + 1])) {
        x = v[index + 1];
      } else {
        x = v[index - 1] + 1;
      }
      let y = x - k;
      while (x < oldLength && y < newLength && oldItems[x] === newItems[y]) {
        x++;
        y++;
      }
      v[index] = x;
      if (x >= oldLength && y >= newLength) {
        found = true;
        break;
      }
    }
    if (found) break;
  }

  let x = oldLength;
  let y = newLength;
  const path: Array<{ type: 'delete' | 'insert' | 'equal'; item: T }> = [];
  for (let d = trace.length - 1; d >= 0; d--) {
    const vPrev = trace[d];
    const k = x - y;
    const index = k + offset;
    const prevK = k === -d || (k !== d && vPrev[index - 1] < vPrev[index + 1]) ? k + 1 : k - 1;
    const prevX = vPrev[prevK + offset];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      path.push({ type: 'equal', item: oldItems[x - 1] });
      x--;
      y--;
    }
    // d = 0 is the initial snake: there is no edit before it.
    if (d === 0) {
      break;
    }
    if (x === prevX) {
      path.push({ type: 'insert', item: newItems[y - 1] });
      y--;
    } else {
      path.push({ type: 'delete', item: oldItems[x - 1] });
      x--;
    }
  }
  path.reverse();

  const result: DiffChange<T>[] = [];
  for (const step of path) {
    const last = result[result.length - 1];
    const isInsert = step.type === 'insert';
    const isDelete = step.type === 'delete';
    if (last && (last.added === isInsert) === true && (last.removed === isDelete) === true) {
      if (step.type === 'equal' && !last.added && !last.removed) {
        last.value.push(step.item);
      } else if (isInsert && last.added) {
        last.value.push(step.item);
      } else if (isDelete && last.removed) {
        last.value.push(step.item);
      } else {
        result.push({ value: [step.item], added: isInsert, removed: isDelete });
      }
    } else if (step.type === 'equal') {
      if (last && !last.added && !last.removed) {
        last.value.push(step.item);
      } else {
        result.push({ value: [step.item] });
      }
    } else {
      result.push({ value: [step.item], added: isInsert, removed: isDelete });
    }
  }

  return result;
}

export type DiffSegment = { type: 'equal' | 'add' | 'remove'; value: string };

/** Above this many DP cells (length product after trimming the common prefix/suffix), lines are shown as a whole-line change. */
export const MAX_CHAR_DIFF_CELLS = 1e6;

export function diffCharsInline(oldText: string, newText: string): DiffSegment[] {
  // Strip the common prefix and suffix: cheap, and usually leaves a small middle to diff.
  let prefix = 0;
  const minLength = Math.min(oldText.length, newText.length);
  while (prefix < minLength && oldText[prefix] === newText[prefix]) prefix++;
  let suffix = 0;
  while (suffix < minLength - prefix && oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]) {
    suffix++;
  }

  const head: DiffSegment[] = prefix ? [{ type: 'equal', value: oldText.slice(0, prefix) }] : [];
  const tail: DiffSegment[] = suffix ? [{ type: 'equal', value: oldText.slice(oldText.length - suffix) }] : [];
  const oldMiddle = oldText.slice(prefix, oldText.length - suffix);
  const newMiddle = newText.slice(prefix, newText.length - suffix);

  if (oldMiddle.length * newMiddle.length > MAX_CHAR_DIFF_CELLS) {
    const segs: DiffSegment[] = [];
    if (oldText) segs.push({ type: 'remove', value: oldText });
    if (newText) segs.push({ type: 'add', value: newText });
    return segs;
  }

  return [...head, ...diffCharsLcs(oldMiddle, newMiddle), ...tail];
}

function diffCharsLcs(oldText: string, newText: string): DiffSegment[] {
  const n = oldText.length;
  const m = newText.length;
  if (n === 0 && m === 0) return [];
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = oldText[i] === newText[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldText[i] === newText[j]) {
      let run = '';
      while (i < n && j < m && oldText[i] === newText[j]) {
        run += oldText[i];
        i++;
        j++;
      }
      segments.push({ type: 'equal', value: run });
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      let run = oldText[i];
      i++;
      while (i < n && j < m && oldText[i] !== newText[j] && dp[i + 1][j] >= dp[i][j + 1]) {
        run += oldText[i];
        i++;
      }
      segments.push({ type: 'remove', value: run });
    } else {
      let run = newText[j];
      j++;
      while (i < n && j < m && oldText[i] !== newText[j] && dp[i][j + 1] > dp[i + 1][j]) {
        run += newText[j];
        j++;
      }
      segments.push({ type: 'add', value: run });
    }
  }
  if (i < n) segments.push({ type: 'remove', value: oldText.slice(i) });
  if (j < m) segments.push({ type: 'add', value: newText.slice(j) });

  return segments;
}
