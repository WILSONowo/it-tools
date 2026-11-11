<template>
  <n-card title="JSON → Java / C# / Go 实体">
    <n-grid y-gap="16" cols="1 700:2" x-gap="20" responsive="screen">
      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="JSON 输入" :feedback="feedback" :validation-status="status">
            <n-input
              v-model:value="jsonInput"
              type="textarea"
              :autosize="{ minRows: 12 }"
              placeholder='{ "id": 1, "name": "demo", "email": "a@b.c", "tags": ["x","y"], "meta": { "enabled": true, "score": 4.5 } }'
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>

          <n-form-item label="语言">
            <n-radio-group v-model:value="language" style="margin-bottom: 12px">
              <n-radio-button value="java">Java</n-radio-button>
              <n-radio-button value="csharp">C#</n-radio-button>
              <n-radio-button value="go">Go</n-radio-button>
            </n-radio-group>
          </n-form-item>

          <n-form-item label="类名">
            <n-input v-model:value="className" placeholder="MyEntity" style="font-family: monospace" />
          </n-form-item>

          <n-space>
            <n-button secondary type="primary" @click="generate">生成</n-button>
            <n-button secondary @click="copy">复制</n-button>
          </n-space>
        </n-form>
      </n-gi>

      <n-gi>
        <n-form label-placement="top">
          <n-form-item label="输出">
            <n-input
              :value="output"
              type="textarea"
              readonly
              :autosize="{ minRows: 12 }"
              spellcheck="false"
              style="font-family: monospace"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 12px">
          <n-button secondary @click="copy">复制输出</n-button>
          <n-button secondary :disabled="!output" @click="clear">清空</n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';

const jsonInput = ref(
  '{\n  "id": 1,\n  "name": "it-tools",\n  "email": "hello@example.com",\n  "active": true,\n  "score": 4.5,\n  "tags": ["dev", "tools"],\n  "meta": {\n    "created": "2023-01-01",\n    "count": 10\n  }\n}',
);
const language = ref<'java' | 'csharp' | 'go'>('java');
const className = ref('DemoData');
const output = ref('');

const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON.parse(jsonInput.value) };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
});

const status = computed(() => (parsed.value.ok ? undefined : 'error'));
const feedback = computed(() => (parsed.value.ok ? '' : parsed.value.error));

function toPascal(name: string) {
  return name.replace(/(?:^|[-_ ])([a-z0-9])/gi, (_, c: string) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
}

function toCamel(name: string) {
  const pascal = toPascal(name);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : name;
}

type TypeMap = { java: string; csharp: string; go: string };

function detectType(value: unknown): TypeMap | null {
  if (value === null) return { java: 'String', csharp: 'string?', go: 'interface{}' };
  if (Array.isArray(value)) {
    const itemType = value.length > 0 ? detectType(value[0]) : { java: 'String', csharp: 'object', go: 'interface{}' };
    if (!itemType) return null;
    return { java: `List<${itemType.java}>`, csharp: `List<${itemType.csharp}>`, go: `[]${itemType.go}` };
  }
  switch (typeof value) {
    case 'string':
      return { java: 'String', csharp: 'string', go: 'string' };
    case 'boolean':
      return { java: 'Boolean', csharp: 'bool', go: 'bool' };
    case 'number':
      return Number.isInteger(value)
        ? { java: 'Long', csharp: 'long', go: 'int64' }
        : { java: 'Double', csharp: 'double', go: 'float64' };
    default:
      return null;
  }
}

type Field = { name: string; javaName: string; type: TypeMap | null; nested: Record<string, unknown> | null };

function collectFields(value: Record<string, unknown>): Field[] {
  return Object.entries(value).map(([key, val]) => ({
    name: key,
    javaName: toCamel(key),
    type: detectType(val),
    nested: val && typeof val === 'object' && !Array.isArray(val) ? (val as Record<string, unknown>) : null,
  }));
}

function generateJava(fields: Field[], name: string): string {
  const importList = fields.some((f) => f.type?.java.startsWith('List<')) ? 'import java.util.List;\n' : '';
  const lines: string[] = [];
  lines.push(`public class ${name} {`);
  for (const field of fields) {
    const type = field.type?.java ?? 'Object';
    if (field.nested) {
      lines.push(`  private ${toPascal(field.name)} ${field.javaName};`);
    } else {
      lines.push(`  private ${type} ${field.javaName};`);
    }
  }
  lines.push('}');

  const nested = fields
    .filter((f) => f.nested)
    .map((f) => generateJava(collectFields(f.nested as Record<string, unknown>), toPascal(f.name)));

  return [importList, ...lines, '', ...nested].join('\n');
}

function generateCsharp(fields: Field[], name: string): string {
  const importList = fields.some((f) => f.type?.csharp.startsWith('List<'))
    ? 'using System.Collections.Generic;\n'
    : '';
  const lines: string[] = [];
  lines.push(`public class ${name} {`);
  for (const field of fields) {
    const type = field.type?.csharp ?? 'object';
    if (field.nested) {
      lines.push(`  public ${toPascal(field.name)} ${toPascal(field.name)} { get; set; }`);
    } else {
      lines.push(`  public ${type} ${toPascal(field.name)} { get; set; }`);
    }
  }
  lines.push('}');

  const nested = fields
    .filter((f) => f.nested)
    .map((f) => generateCsharp(collectFields(f.nested as Record<string, unknown>), toPascal(f.name)));

  return [importList, ...lines, '', ...nested].join('\n');
}

function generateGo(fields: Field[], name: string): string {
  const lines: string[] = [];
  lines.push(`type ${name} struct {`);
  for (const field of fields) {
    const type = field.type?.go ?? 'interface{}';
    if (field.nested) {
      lines.push(`\t${toPascal(field.name)} ${toPascal(field.name)} \`json:"${field.name}"\``);
    } else {
      lines.push(`\t${toPascal(field.name)} ${type} \`json:"${field.name}"\``);
    }
  }
  lines.push('}');

  const nested = fields
    .filter((f) => f.nested)
    .map((f) => generateGo(collectFields(f.nested as Record<string, unknown>), toPascal(f.name)));

  return [lines.join('\n'), '', ...nested].join('\n');
}

function generate() {
  if (!parsed.value.ok) return;
  const value = parsed.value.value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    output.value = '输入必须是 JSON 对象。';
    return;
  }
  const fields = collectFields(value as Record<string, unknown>);
  if (language.value === 'java') output.value = generateJava(fields, toPascal(className.value) || 'GeneratedEntity');
  else if (language.value === 'csharp')
    output.value = generateCsharp(fields, toPascal(className.value) || 'GeneratedEntity');
  else output.value = generateGo(fields, toPascal(className.value) || 'GeneratedEntity');
}

generate();

const { copy } = useCopy({ source: output, text: '代码已复制到剪贴板' });

function clear() {
  output.value = '';
}
</script>
