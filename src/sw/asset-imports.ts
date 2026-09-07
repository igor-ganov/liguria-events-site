const SPECIFIER = /(?:from|import)\s*["']([^"']+)["']/g;

/**
 * What a built module needs before it can run, as paths on this origin.
 *
 * Module specifiers live inside the file, not in the markup: a page kept with
 * only the scripts its HTML names is a page whose scripts fail on their first
 * import, which looks exactly like a page with no scripts at all.
 *
 * Static imports only. What a page loads with `import()` it loads because
 * somebody asked for it — the map engine is a megabyte behind one — and
 * fetching that on the chance of a tunnel is not a courtesy. The page is
 * expected to say so when it cannot get there.
 */
export const assetImports = (code: string, from: string, origin: string): readonly string[] => [
  ...new Set(
    [...code.matchAll(SPECIFIER)]
      .map((match) => match[1] ?? '')
      .filter((specifier) => specifier.startsWith('.') || specifier.startsWith('/'))
      .map((specifier) => new URL(specifier, `${origin}${from}`))
      .filter((url) => url.origin === origin)
      .filter((url) => url.pathname.endsWith('.js'))
      .map((url) => url.pathname),
  ),
];
