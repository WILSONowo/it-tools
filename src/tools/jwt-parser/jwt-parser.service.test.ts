import { describe, expect, it } from 'vitest';
import { decodeJwt, formatClaimValue } from './jwt-parser.service';

// header {"alg":"HS256","typ":"JWT"}
// payload {"sub":"123","aud":["a","b"],"ctx":{"role":"admin","n":1},"nul":null,"ok":true,"iat":1516239022}
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJhdWQiOlsiYSIsImIiXSwiY3R4Ijp7InJvbGUiOiJhZG1pbiIsIm4iOjF9LCJudWwiOm51bGwsIm9rIjp0cnVlLCJpYXQiOjE1MTYyMzkwMjJ9.sig';

describe('jwt-parser service', () => {
  it('formats claim values without flattening arrays or objects', () => {
    expect(formatClaimValue('abc')).toBe('abc');
    expect(formatClaimValue(42)).toBe('42');
    expect(formatClaimValue(true)).toBe('true');
    expect(formatClaimValue(null)).toBe('null');
    expect(formatClaimValue(['a', 'b'])).toBe('[\n  "a",\n  "b"\n]');
    expect(formatClaimValue({ role: 'admin' })).toBe('{\n  "role": "admin"\n}');
    expect(formatClaimValue([{ a: 1 }])).not.toContain('[object Object]');
  });

  it('decodes header and payload claims', () => {
    const { header, payload } = decodeJwt({ jwt });
    expect(header.find((c) => c.claim === 'alg')?.value).toBe('HS256');

    const byClaim = Object.fromEntries(payload.map((c) => [c.claim, c]));
    expect(byClaim.sub.value).toBe('123');
    expect(JSON.parse(byClaim.aud.value)).toEqual(['a', 'b']);
    expect(JSON.parse(byClaim.ctx.value)).toEqual({ role: 'admin', n: 1 });
    expect(byClaim.nul.value).toBe('null');
    expect(byClaim.ok.value).toBe('true');
    expect(byClaim.iat.value).toBe('1516239022');
    expect(byClaim.iat.friendlyValue).toBeDefined();
  });
});
