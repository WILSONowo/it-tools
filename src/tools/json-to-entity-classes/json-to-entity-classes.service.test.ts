import { describe, expect, it } from 'vitest';
import { generateEntityCode, toCamel, toPascal } from './json-to-entity-classes.service';

describe('json-to-entity-classes', () => {
  it('converts keys to identifiers', () => {
    expect(toPascal('user_name')).toBe('UserName');
    expect(toCamel('user-name')).toBe('userName');
    expect(toCamel('URL')).toBe('url');
    expect(toPascal('名字')).toBeNull();
  });

  it('generates nested classes for arrays of objects with merged keys (Java)', () => {
    const code = generateEntityCode({
      value: { items: [{ id: 1 }, { id: 2, label: 'x' }], meta: { count: 1 } },
      language: 'java',
      className: 'Root',
    });
    expect(code).toBe(
      [
        'import java.util.List;',
        '',
        'public class Root {',
        '    private List<ItemsItem> items;',
        '    private Meta meta;',
        '',
        '    public static class ItemsItem {',
        '        private Long id;',
        '        private String label;',
        '    }',
        '',
        '    public static class Meta {',
        '        private Long count;',
        '    }',
        '}',
      ].join('\n'),
    );
    expect(code.match(/public class/g)).toHaveLength(1);
  });

  it('sanitizes invalid identifiers and keeps the original key (Java)', () => {
    const code = generateEntityCode({
      value: { class: 'a', '2fa': true, 名字: 'x', user_name: 'y' },
      language: 'java',
      className: 'User',
    });
    expect(code).toContain('import com.fasterxml.jackson.annotation.JsonProperty;');
    expect(code).toContain('    @JsonProperty("class")\n    private String class_;');
    expect(code).toContain('    @JsonProperty("2fa")\n    private Boolean _2fa;');
    expect(code).toContain('    @JsonProperty("名字")\n    private String field3;');
    expect(code).toContain('    @JsonProperty("user_name")\n    private String userName;');
  });

  it('generates C# with JsonPropertyName attributes where needed', () => {
    const code = generateEntityCode({
      value: { name: 'a', 名字: 'x', tags: ['a'], '1st': 1 },
      language: 'csharp',
      className: 'Demo',
    });
    expect(code).toContain('using System.Collections.Generic;');
    expect(code).toContain('using System.Text.Json.Serialization;');
    expect(code).toContain('    public string Name { get; set; }');
    expect(code).toContain('    [JsonPropertyName("名字")]\n    public string Field2 { get; set; }');
    expect(code).toContain('    public List<string> Tags { get; set; }');
    expect(code).toContain('    [JsonPropertyName("1st")]\n    public long _1st { get; set; }');
  });

  it('generates Go structs with exported names and json tags', () => {
    const code = generateEntityCode({
      value: { users: [{ id: 1, 姓名: 'a' }], '2fa': false, score: 4.5 },
      language: 'go',
      className: 'Payload',
    });
    expect(code).toBe(
      [
        'type Payload struct {',
        '\tUsers []UsersItem `json:"users"`',
        '\tF2fa bool `json:"2fa"`',
        '\tScore float64 `json:"score"`',
        '}',
        '',
        'type UsersItem struct {',
        '\tId int64 `json:"id"`',
        '\tField2 string `json:"姓名"`',
        '}',
      ].join('\n'),
    );
  });

  it('avoids class name collisions and shadowing built-in types', () => {
    const code = generateEntityCode({
      value: { object: { a: 1 }, nested: { object: { b: 2 } } },
      language: 'java',
      className: 'Root',
    });
    expect(code).toContain('public static class ObjectData {');
    expect(code).toContain('public static class ObjectData2 {');
  });

  it('accepts an array of objects as root and rejects primitives', () => {
    expect(generateEntityCode({ value: [{ a: 1 }, { b: 'x' }], language: 'go', className: 'R' })).toContain('B string');
    expect(() => generateEntityCode({ value: 42, language: 'go', className: 'R' })).toThrow();
  });
});
