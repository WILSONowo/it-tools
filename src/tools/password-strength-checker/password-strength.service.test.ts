import { describe, expect, it } from 'vitest';
import { analyzePassword, estimateEntropy, scorePassword, timeToCrackLabel } from './password-strength.service';

const isWeak = (password: string) => scorePassword(password) < 30;
const isStrong = (password: string) => scorePassword(password) >= 80;

describe('password-strength service', () => {
  it('rates common passwords with decorations as weak', () => {
    for (const password of [
      'Password123!',
      'P@ssw0rd!',
      'password',
      '123456789',
      'qwertyuiop',
      'Iloveyou2024',
      'admin888888',
      'woaini1314',
    ]) {
      expect(isWeak(password), password).toBe(true);
      expect(timeToCrackLabel(estimateEntropy(password)), password).toBe('瞬时');
    }
  });

  it('penalises sequences, repeats, keyboard rows and years in the entropy', () => {
    const naive = (p: string, pool: number) => p.length * Math.log2(pool);
    expect(estimateEntropy('abcdefghijkl')).toBeLessThan(naive('abcdefghijkl', 26) / 4);
    expect(estimateEntropy('aaaaaaaaaaaa')).toBeLessThan(10);
    expect(estimateEntropy('abcabcabcabc')).toBeLessThan(15);
    expect(estimateEntropy('1qaz2wsx3edc')).toBeLessThan(15);
    expect(estimateEntropy('zxcvbnm')).toBeLessThan(15);
    expect(estimateEntropy('19901990')).toBeLessThan(15);

    expect(analyzePassword('Password123!').patterns.map((p) => p.kind)).toEqual(['dictionary', 'sequence']);
  });

  it('rates a random 20-character mixed password as strong', () => {
    for (const password of ['k9#Vq2!mZx7$Lr4@Tb8w', 'R7v!pQ2zL#x9Md$4Kt6&', 'h%T3eW9q!Zc6Lm@2Rx8B']) {
      expect(isStrong(password), password).toBe(true);
      expect(timeToCrackLabel(estimateEntropy(password))).toBe('超过 1 亿年');
    }
  });

  it('never estimates more than the naive charset entropy', () => {
    for (const password of ['Tr0ub4dour&3', 'correcthorsebatterystaple', 'zQ8!']) {
      const pool =
        26 * (/[a-z]/.test(password) ? 1 : 0) +
        26 * (/[A-Z]/.test(password) ? 1 : 0) +
        10 * (/\d/.test(password) ? 1 : 0) +
        33 * (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
      expect(estimateEntropy(password)).toBeLessThanOrEqual(password.length * Math.log2(pool) + 1e-9);
    }
  });

  it('caps the crack time display instead of showing Infinity', () => {
    expect(timeToCrackLabel(0)).toBe('瞬时');
    expect(timeToCrackLabel(50)).toBe('1 天');
    expect(timeToCrackLabel(60)).toBe('3 年');
    expect(timeToCrackLabel(70)).toBe('3743 年');
    expect(timeToCrackLabel(80)).toBe('383 万年');
    expect(timeToCrackLabel(100)).toBe('超过 1 亿年');
    expect(timeToCrackLabel(5000)).toBe('超过 1 亿年');
    expect(timeToCrackLabel(estimateEntropy('x'.repeat(300) + 'Y!1'))).not.toContain('Infinity');
  });

  it('stays fast on long repetitive input', () => {
    const start = Date.now();
    estimateEntropy('a'.repeat(256));
    estimateEntropy('ab'.repeat(128));
    expect(Date.now() - start).toBeLessThan(1000);
  });
});
