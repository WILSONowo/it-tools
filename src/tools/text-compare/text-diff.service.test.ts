import { describe, expect, it } from 'vitest';
import { diffArrays, diffCharsInline, type DiffChange } from './text-diff.service';

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

describe('diffCharsInline', () => {
  const rebuild = (segments: { type: string; value: string }[], side: 'old' | 'new') =>
    segments
      .filter((s) => s.type === 'equal' || s.type === (side === 'old' ? 'remove' : 'add'))
      .map((s) => s.value)
      .join('');

  it('diffs characters and keeps the common prefix and suffix', () => {
    const segments = diffCharsInline('jumps over the lazy dog.', 'jumped over the lazy cat.');
    expect(segments[0]).toEqual({ type: 'equal', value: 'jump' });
    expect(segments[segments.length - 1]).toEqual({ type: 'equal', value: '.' });
    expect(rebuild(segments, 'old')).toBe('jumps over the lazy dog.');
    expect(rebuild(segments, 'new')).toBe('jumped over the lazy cat.');
  });

  it('handles identical, empty and one-sided input', () => {
    expect(diffCharsInline('abc', 'abc')).toEqual([{ type: 'equal', value: 'abc' }]);
    expect(diffCharsInline('', '')).toEqual([]);
    expect(diffCharsInline('', 'x')).toEqual([{ type: 'add', value: 'x' }]);
    expect(diffCharsInline('ab', 'aXb')).toEqual([
      { type: 'equal', value: 'a' },
      { type: 'add', value: 'X' },
      { type: 'equal', value: 'b' },
    ]);
  });

  it('falls back to a whole-line change for very long, very different lines', () => {
    const oldLine = 'a'.repeat(2000);
    const newLine = 'b'.repeat(2000);
    expect(diffCharsInline(oldLine, newLine)).toEqual([
      { type: 'remove', value: oldLine },
      { type: 'add', value: newLine },
    ]);
  });

  it('still diffs long lines that differ in a small region', () => {
    const oldLine = `${'a'.repeat(5000)}X${'b'.repeat(5000)}`;
    const newLine = `${'a'.repeat(5000)}Y${'b'.repeat(5000)}`;
    expect(diffCharsInline(oldLine, newLine)).toHaveLength(4);
  });
});
