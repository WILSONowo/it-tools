import { describe, expect, it } from 'vitest';
import { diffArrays, type DiffChange } from './text-diff.service';

function apply<T>(changes: DiffChange<T>[]) {
  const oldSide = changes.filter((c) => !c.added).flatMap((c) => c.value);
  const newSide = changes.filter((c) => !c.removed).flatMap((c) => c.value);
  return { oldSide, newSide };
}

describe('diffArrays', () => {
  it('reports no change for identical input', () => {
    expect(diffArrays(['same'], ['same'])).toEqual([{ value: ['same'] }]);
    expect(diffArrays(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual([{ value: ['a', 'b', 'c'] }]);
  });

  it('handles empty sides', () => {
    expect(diffArrays([], [])).toEqual([]);
    expect(diffArrays([], ['a'])).toEqual([{ value: ['a'], added: true, removed: false }]);
    expect(diffArrays(['a'], [])).toEqual([{ value: ['a'], added: false, removed: true }]);
  });

  it('never emits undefined items', () => {
    const changes = diffArrays(['x', 'a', 'b'], ['a', 'b', 'y']);
    expect(changes.flatMap((c) => c.value)).not.toContain(undefined);
  });

  it('reconstructs both sides', () => {
    const cases: [string[], string[]][] = [
      [
        ['a', 'b', 'c'],
        ['a', 'x', 'c'],
      ],
      [
        ['The quick brown fox', 'jumps over the lazy dog.'],
        ['The quick brown fox', 'jumped over the lazy cat.'],
      ],
      [
        ['1', '2', '3', '4'],
        ['0', '1', '3', '4', '5'],
      ],
      [['a'], ['b']],
    ];
    for (const [oldItems, newItems] of cases) {
      const { oldSide, newSide } = apply(diffArrays(oldItems, newItems));
      expect(oldSide).toEqual(oldItems);
      expect(newSide).toEqual(newItems);
    }
  });
});
