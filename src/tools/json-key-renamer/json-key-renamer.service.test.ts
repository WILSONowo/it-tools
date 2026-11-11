import { describe, expect, it } from 'vitest';
import { convertCase, overrideValues, parseKeyMap, renameKeys } from './json-key-renamer.service';

describe('json-key-renamer', () => {
  it('converts key case', () => {
    expect(convertCase('user_name', 'camelCase')).toBe('userName');
    expect(convertCase('userName', 'snakeCase')).toBe('user_name');
    expect(convertCase('UserName', 'kebabCase')).toBe('user-name');
    expect(convertCase('user-name', 'pascalCase')).toBe('UserName');
    expect(convertCase('userName', 'constantCase')).toBe('USER_NAME');
    expect(convertCase('XMLHttpRequest', 'snakeCase')).toBe('xml_http_request');
    expect(convertCase('user_name', null)).toBe('user_name');
    expect(convertCase('__', 'camelCase')).toBe('__');
  });

  it('parses the key map', () => {
    expect(parseKeyMap('a => b\n bad line \nc=>d')).toEqual({ a: 'b', c: 'd' });
  });

  it('renames keys recursively, including inside arrays', () => {
    const input = { user_name: 'x', items: [{ item_id: 1 }], nested: { deep_key: { other_key: true } } };
    const { value, changes } = renameKeys(input, { map: { user_name: 'username' }, caseMode: 'camelCase' });
    expect(value).toEqual({ username: 'x', items: [{ itemId: 1 }], nested: { deepKey: { otherKey: true } } });
    expect(changes).toBe(4);
  });

  it('only applies the map when no case mode is set', () => {
    const { value, changes } = renameKeys([{ a_b: 1, c: 2 }], { map: { c: 'd' } });
    expect(value).toEqual([{ a_b: 1, d: 2 }]);
    expect(changes).toBe(1);
  });

  it('keeps a __proto__ key as a regular property', () => {
    const { value } = renameKeys(JSON.parse('{"__proto__": {"a_b": 1}}'), { map: { a_b: 'x' } });
    expect(JSON.stringify(value)).toBe('{"__proto__":{"x":1}}');
  });

  it('overrides mapped values', () => {
    const { value, changes } = overrideValues({ status: 'old', list: ['old', 'x'], n: { s: 'old' } }, { old: 'new' });
    expect(value).toEqual({ status: 'new', list: ['new', 'x'], n: { s: 'new' } });
    expect(changes).toBe(3);
  });
});
