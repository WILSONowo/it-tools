export type HtmlFormatter = (html: string) => string;

let formatterPromise: Promise<HtmlFormatter> | null = null;

/**
 * Lazily load prettier (≈ 900 KB) and its HTML parser only when the formatted code is actually needed,
 * so they stay out of the editor chunk. The loaded formatter is cached.
 */
export function loadHtmlFormatter(): Promise<HtmlFormatter> {
  if (!formatterPromise) {
    formatterPromise = Promise.all([import('prettier/standalone'), import('prettier/parser-html')])
      .then(([prettierModule, parserModule]) => {
        // CommonJS modules: depending on the bundler interop, the API is on `default` or on the namespace itself
        const prettier = prettierModule.default ?? prettierModule;
        const htmlParser = parserModule.default ?? parserModule;
        return (html: string) => prettier.format(html, { parser: 'html', plugins: [htmlParser] });
      })
      .catch((error) => {
        // allow a retry later (e.g. after a network error)
        formatterPromise = null;
        throw error;
      });
  }
  return formatterPromise;
}

/** Format HTML, falling back to the raw input when prettier can't be loaded or the HTML can't be parsed. */
export async function formatHtml(html: string): Promise<string> {
  try {
    const format = await loadHtmlFormatter();
    return format(html);
  } catch {
    return html;
  }
}
