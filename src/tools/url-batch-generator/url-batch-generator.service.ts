export const MAX_GENERATED_URLS = 10000;

export function parseVarConfig(text: string): Map<string, string[]> {
  const vars = new Map<string, string[]>();
  for (const line of text.split('\n')) {
    const eq = line.indexOf('=');
    if (eq < 0) {
      continue;
    }
    const name = line.slice(0, eq).trim();
    if (!name) {
      continue;
    }
    const values = line
      .slice(eq + 1)
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);
    if (values.length) {
      vars.set(name, values);
    }
  }
  return vars;
}

export function countCombinations(vars: Map<string, string[]>) {
  let count = 1;
  for (const values of vars.values()) {
    count *= values.length;
  }
  return count;
}

function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>((acc, cur) => acc.flatMap((a) => cur.map((v) => [...a, v])), [[]]);
}

export interface GenerateResult {
  urls: string[];
  error?: string;
}

function guardedCombos(vars: Map<string, string[]>, max: number): { combos: string[][]; error?: string } {
  const count = countCombinations(vars);
  if (count > max) {
    return {
      combos: [],
      error: `组合数为 ${count.toLocaleString('en-US')} 条,超过上限 ${max.toLocaleString(
        'en-US',
      )} 条,请减少参数或取值。`,
    };
  }
  return { combos: cartesian([...vars.values()]) };
}

export function generateComboUrls({
  base,
  config,
  max = MAX_GENERATED_URLS,
}: {
  base: string;
  config: string;
  max?: number;
}): GenerateResult {
  const vars = parseVarConfig(config);
  if (vars.size === 0) {
    return { urls: [] };
  }
  const names = [...vars.keys()];
  const { combos, error } = guardedCombos(vars, max);
  if (error) {
    return { urls: [], error };
  }
  const separator = base.includes('?') ? '&' : '?';
  const urls = combos.map((combo) => {
    const pairs = names.map((n, i) => `${encodeURIComponent(n)}=${encodeURIComponent(combo[i])}`);
    return `${base}${separator}${pairs.join('&')}`;
  });
  return { urls };
}

export function generateTemplateUrls({
  template,
  config,
  max = MAX_GENERATED_URLS,
}: {
  template: string;
  config: string;
  max?: number;
}): GenerateResult {
  const vars = parseVarConfig(config);
  const names = [...vars.keys()];
  const { combos, error } = guardedCombos(vars, max);
  if (error) {
    return { urls: [], error };
  }
  const urls = combos.map((combo) => {
    let url = template;
    names.forEach((name, i) => {
      url = url.split(`{{${name}}}`).join(combo[i]);
    });
    return url;
  });
  return { urls };
}
