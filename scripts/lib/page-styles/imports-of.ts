// `import x from '…'`, `export … from '…'`, `import '…'` and `import('…')`.
const IMPORT =
  /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;

/** What a source file imports, as written. An Astro file is read whole, so the
 *  imports of its scripts count with those of its frontmatter. */
export const importsOf = (text: string): readonly string[] =>
  [...text.matchAll(IMPORT)].map((found) => found[1] ?? found[2] ?? found[3] ?? '');
