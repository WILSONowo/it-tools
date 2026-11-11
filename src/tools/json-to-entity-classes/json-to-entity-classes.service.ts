export type EntityLanguage = 'java' | 'csharp' | 'go';

type TypeRef =
  | { kind: 'string' | 'bool' | 'long' | 'double' | 'any' }
  | { kind: 'list'; item: TypeRef }
  | { kind: 'class'; name: string };

interface FieldDef {
  key: string;
  type: TypeRef;
}

interface ClassDef {
  name: string;
  fields: FieldDef[];
}

type JsonObject = Map<string, unknown>;

const JAVA_KEYWORDS = new Set(
  (
    'abstract assert boolean break byte case catch char class const continue default do double else enum extends final ' +
    'finally float for goto if implements import instanceof int interface long native new package private protected ' +
    'public return short static strictfp super switch synchronized this throw throws transient try void volatile while ' +
    'true false null var record yield _'
  ).split(' '),
);

// Class names that would shadow types used by the generated code.
const RESERVED_CLASS_NAMES = new Set([
  'String',
  'Object',
  'List',
  'Long',
  'Double',
  'Boolean',
  'Integer',
  'Map',
  'JsonProperty',
  'JsonPropertyName',
]);

function isObjectLike(value: unknown): value is Record<string, unknown> | JsonObject {
  return value instanceof Map || (typeof value === 'object' && value !== null && !Array.isArray(value));
}

function toMap(value: Record<string, unknown> | JsonObject): JsonObject {
  return value instanceof Map ? value : new Map(Object.entries(value));
}

/** Split a JSON key into ASCII word parts; returns null when the key can't be turned into a readable identifier (e.g. Chinese). */
function splitWords(key: string): string[] | null {
  if (/[^\w\s.$-]/.test(key)) {
    return null;
  }
  const parts = key.split(/[^A-Za-z0-9]+/).filter(Boolean);
  return parts.length > 0 ? parts : null;
}

export function toPascal(key: string): string | null {
  const parts = splitWords(key);
  return parts ? parts.map((p) => p[0].toUpperCase() + p.slice(1)).join('') : null;
}

export function toCamel(key: string): string | null {
  const parts = splitWords(key);
  if (!parts) {
    return null;
  }
  const [first, ...rest] = parts;
  const head = first === first.toUpperCase() ? first.toLowerCase() : first[0].toLowerCase() + first.slice(1);
  return head + rest.map((p) => p[0].toUpperCase() + p.slice(1)).join('');
}

function mergeObjects(objects: Array<Record<string, unknown> | JsonObject>): JsonObject {
  const merged: JsonObject = new Map();
  for (const obj of objects) {
    for (const [key, value] of toMap(obj)) {
      if (!merged.has(key) || merged.get(key) === null) {
        merged.set(key, value);
        continue;
      }
      const current = merged.get(key);
      if (isObjectLike(current) && isObjectLike(value)) {
        merged.set(key, mergeObjects([current, value]));
      } else if (Array.isArray(current) && Array.isArray(value)) {
        merged.set(key, [...current, ...value]);
      } else if (typeof current === 'number' && typeof value === 'number' && !Number.isInteger(value)) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class ModelBuilder {
  classes: ClassDef[] = [];
  private usedNames = new Set<string>();

  private uniqueClassName(hint: string) {
    let name = /^\d/.test(hint) ? `C${hint}` : hint;
    if (RESERVED_CLASS_NAMES.has(name)) {
      name = `${name}Data`;
    }
    let candidate = name;
    let i = 2;
    while (this.usedNames.has(candidate)) {
      candidate = `${name}${i++}`;
    }
    this.usedNames.add(candidate);
    return candidate;
  }

  addClass(value: Record<string, unknown> | JsonObject, hint: string): string {
    const name = this.uniqueClassName(hint);
    const def: ClassDef = { name, fields: [] };
    this.classes.push(def);
    for (const [key, val] of toMap(value)) {
      def.fields.push({ key, type: this.inferType(val, toPascal(key) ?? 'Nested') });
    }
    return name;
  }

  inferType(value: unknown, hint: string): TypeRef {
    if (value === null || value === undefined) {
      return { kind: 'any' };
    }
    if (Array.isArray(value)) {
      return { kind: 'list', item: this.inferArrayItem(value, `${hint}Item`) };
    }
    if (isObjectLike(value)) {
      return { kind: 'class', name: this.addClass(value, hint) };
    }
    switch (typeof value) {
      case 'string':
        return { kind: 'string' };
      case 'boolean':
        return { kind: 'bool' };
      case 'number':
        return { kind: Number.isInteger(value) ? 'long' : 'double' };
      default:
        return { kind: 'any' };
    }
  }

  private inferArrayItem(items: unknown[], hint: string): TypeRef {
    const values = items.filter((v) => v !== null && v !== undefined);
    if (values.length === 0) {
      return { kind: 'any' };
    }
    if (values.every(isObjectLike)) {
      return { kind: 'class', name: this.addClass(mergeObjects(values as Record<string, unknown>[]), hint) };
    }
    if (values.every((v) => typeof v === 'number')) {
      return { kind: values.every((v) => Number.isInteger(v)) ? 'long' : 'double' };
    }
    if (values.every(Array.isArray)) {
      return { kind: 'list', item: this.inferArrayItem((values as unknown[][]).flat(), hint) };
    }
    return this.inferType(values[0], hint);
  }
}

function buildModel(value: unknown, rootName: string): ClassDef[] {
  const builder = new ModelBuilder();
  let root: Record<string, unknown> | JsonObject;
  if (isObjectLike(value)) {
    root = value;
  } else if (Array.isArray(value) && value.length > 0 && value.every(isObjectLike)) {
    root = mergeObjects(value as Record<string, unknown>[]);
  } else {
    throw new Error('输入必须是 JSON 对象(或对象数组)。');
  }
  builder.addClass(root, rootName);
  return builder.classes;
}

function quote(str: string) {
  return JSON.stringify(str);
}

function makeUnique(name: string, used: Set<string>) {
  let candidate = name;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${name}${i++}`;
  }
  used.add(candidate);
  return candidate;
}

function fieldIdentifier(key: string, index: number, language: EntityLanguage, className: string) {
  if (language === 'java') {
    let name = toCamel(key) ?? `field${index + 1}`;
    if (/^\d/.test(name)) {
      name = `_${name}`;
    }
    if (JAVA_KEYWORDS.has(name)) {
      name = `${name}_`;
    }
    return name;
  }
  let name = toPascal(key) ?? `Field${index + 1}`;
  if (/^\d/.test(name)) {
    // Go fields must start with an upper-case letter to be exported (and serialized).
    name = language === 'go' ? `F${name}` : `_${name}`;
  }
  if (language === 'csharp' && name === className) {
    name = `${name}_`;
  }
  return name;
}

function renderType(type: TypeRef, language: EntityLanguage): string {
  switch (type.kind) {
    case 'string':
      return { java: 'String', csharp: 'string', go: 'string' }[language];
    case 'bool':
      return { java: 'Boolean', csharp: 'bool', go: 'bool' }[language];
    case 'long':
      return { java: 'Long', csharp: 'long', go: 'int64' }[language];
    case 'double':
      return { java: 'Double', csharp: 'double', go: 'float64' }[language];
    case 'any':
      return { java: 'Object', csharp: 'object', go: 'interface{}' }[language];
    case 'class':
      return type.name;
    case 'list': {
      const item = renderType(type.item, language);
      return { java: `List<${item}>`, csharp: `List<${item}>`, go: `[]${item}` }[language];
    }
  }
}

function hasList(classes: ClassDef[]) {
  return classes.some((c) => c.fields.some((f) => f.type.kind === 'list'));
}

function renderFields(def: ClassDef, language: EntityLanguage) {
  const used = new Set<string>();
  return def.fields.map((field, index) => {
    const name = makeUnique(fieldIdentifier(field.key, index, language, def.name), used);
    return { name, key: field.key, type: renderType(field.type, language), renamed: name !== field.key };
  });
}

function generateJava(classes: ClassDef[]): string {
  const renderClass = (def: ClassDef, indent: string, modifiers: string) => {
    const lines = [`${indent}${modifiers} class ${def.name} {`];
    for (const field of renderFields(def, 'java')) {
      if (field.renamed) {
        lines.push(`${indent}    @JsonProperty(${quote(field.key)})`);
      }
      lines.push(`${indent}    private ${field.type} ${field.name};`);
    }
    return lines;
  };

  const [root, ...nested] = classes;
  const needsAnnotation = classes.some((def) => renderFields(def, 'java').some((f) => f.renamed));
  const imports = [
    ...(hasList(classes) ? ['import java.util.List;'] : []),
    ...(needsAnnotation ? ['import com.fasterxml.jackson.annotation.JsonProperty;'] : []),
  ];

  const lines = [...(imports.length ? [...imports, ''] : []), ...renderClass(root, '', 'public')];
  for (const def of nested) {
    lines.push('', ...renderClass(def, '    ', 'public static'), '    }');
  }
  lines.push('}');
  return lines.join('\n');
}

function generateCsharp(classes: ClassDef[]): string {
  // C# properties are PascalCase, so only annotate keys that are not a simple case change.
  const needsAttribute = (field: { name: string; key: string }) => field.name.toLowerCase() !== field.key.toLowerCase();
  const needsAnnotation = classes.some((def) => renderFields(def, 'csharp').some(needsAttribute));
  const imports = [
    ...(hasList(classes) ? ['using System.Collections.Generic;'] : []),
    ...(needsAnnotation ? ['using System.Text.Json.Serialization;'] : []),
  ];

  const blocks = classes.map((def) => {
    const lines = [`public class ${def.name} {`];
    for (const field of renderFields(def, 'csharp')) {
      if (needsAttribute(field)) {
        lines.push(`    [JsonPropertyName(${quote(field.key)})]`);
      }
      lines.push(`    public ${field.type} ${field.name} { get; set; }`);
    }
    lines.push('}');
    return lines.join('\n');
  });

  return [...(imports.length ? [imports.join('\n')] : []), ...blocks].join('\n\n');
}

function generateGo(classes: ClassDef[]): string {
  return classes
    .map((def) => {
      const lines = [`type ${def.name} struct {`];
      for (const field of renderFields(def, 'go')) {
        lines.push(`\t${field.name} ${field.type} \`json:${quote(field.key)}\``);
      }
      lines.push('}');
      return lines.join('\n');
    })
    .join('\n\n');
}

export function generateEntityCode({
  value,
  language,
  className,
}: {
  value: unknown;
  language: EntityLanguage;
  className: string;
}) {
  const rootName = toPascal(className) ?? 'GeneratedEntity';
  const classes = buildModel(value, /^\d/.test(rootName) ? `C${rootName}` : rootName);
  if (language === 'java') {
    return generateJava(classes);
  }
  if (language === 'csharp') {
    return generateCsharp(classes);
  }
  return generateGo(classes);
}
