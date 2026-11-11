import { describe, expect, it } from 'vitest';
import { caesarBruteForce, caesarShift, normalizeShift, parseVigenereKey, vigenere } from './classic-ciphers.service';

describe('classic-ciphers service', () => {
  describe('caesar', () => {
    it('shifts letters and keeps case and other characters', () => {
      expect(caesarShift('HELLO WORLD', 3)).toBe('KHOOR ZRUOG');
      expect(caesarShift('The quick brown fox jumps over the lazy dog.', 13)).toBe(
        'Gur dhvpx oebja sbk whzcf bire gur ynml qbt.',
      );
      expect(caesarShift('xyz XYZ 123 你好', 3)).toBe('abc ABC 123 你好');
    });

    it('decrypts with a negative shift and handles any integer shift', () => {
      expect(caesarShift('KHOOR ZRUOG', -3)).toBe('HELLO WORLD');
      expect(caesarShift('abc', 29)).toBe('def');
      expect(caesarShift('abc', -55)).toBe('xyz');
    });

    it('treats an empty shift as 0', () => {
      expect(normalizeShift(null)).toBe(0);
      expect(caesarShift('abc', null)).toBe('abc');
    });

    it('brute forces all 25 shifts', () => {
      const lines = caesarBruteForce('KHOOR').split('\n');
      expect(lines).toHaveLength(25);
      expect(lines[2]).toBe('偏移  3: HELLO');
    });
  });

  describe('vigenere', () => {
    it('matches the classic ATTACKATDAWN / LEMON vector', () => {
      expect(vigenere({ text: 'ATTACKATDAWN', key: 'LEMON', mode: 'encrypt' })).toEqual({ output: 'LXFOPVEFRNHR' });
      expect(vigenere({ text: 'LXFOPVEFRNHR', key: 'LEMON', mode: 'decrypt' })).toEqual({ output: 'ATTACKATDAWN' });
    });

    it('uses the cleaned key (surrounding spaces, lowercase)', () => {
      expect(vigenere({ text: 'ATTACKATDAWN', key: ' LEMON', mode: 'encrypt' }).output).toBe('LXFOPVEFRNHR');
      expect(vigenere({ text: 'ATTACKATDAWN', key: 'lemon ', mode: 'encrypt' }).output).toBe('LXFOPVEFRNHR');
      expect(vigenere({ text: 'ATTACKATDAWN', key: 'LE MON', mode: 'encrypt' }).output).toBe('LXFOPVEFRNHR');
    });

    it('preserves case and skips non-letters without consuming the key', () => {
      const encrypted = vigenere({ text: 'Attack at dawn!', key: 'LEMON', mode: 'encrypt' }).output;
      expect(encrypted).toBe('Lxfopv ef rnhr!');
      expect(vigenere({ text: encrypted, key: 'LEMON', mode: 'decrypt' }).output).toBe('Attack at dawn!');
    });

    it('reports key errors', () => {
      expect(vigenere({ text: 'abc', key: '  ', mode: 'encrypt' })).toEqual({ output: '', error: '请输入密钥' });
      expect(vigenere({ text: 'abc', key: 'LEM0N', mode: 'encrypt' })).toEqual({
        output: '',
        error: '密钥只能包含英文字母',
      });
      expect(parseVigenereKey('b').shifts).toEqual([1]);
    });
  });
});
