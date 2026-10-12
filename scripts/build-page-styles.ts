/*
 * The stylesheet of each page, cut from the stylesheets of the site.
 *
 *   bun run scripts/build-page-styles.ts
 *
 * The styles are put into the page itself (no request stands between a reader
 * and the first paint), which means every page carried all of them: a feed
 * carried the route editor, an event carried the calendar. This writes, for
 * every page, the rules it can be shown to use — see pageCss for what "shown"
 * means — in the order the sheets are written in, into src/styles/pages/.
 * Each page imports its own file and nothing else; the layout imports none.
 *
 * The files are made, not kept: they are written before a build, before the
 * dev server starts and before a type check, and git does not track them.
 */
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { LAYOUT, pagesWithLayout } from './lib/page-styles/pages-with-layout.ts';
import { pageCss } from './lib/page-styles/page-css.ts';
import { pageSheetName } from './lib/page-styles/page-sheet-name.ts';
import { SHEETS } from './lib/page-styles/sheets.ts';
import { leadsTo, sourceFiles } from './lib/page-styles/source-files.ts';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'src/styles/pages');

const files = sourceFiles(ROOT);
const css = pageCss({
  sheets: SHEETS.map((name) => readFileSync(join(ROOT, 'src/styles', name), 'utf8').replace(/\r\n/g, '\n')),
  files,
  resolve: leadsTo(files),
});
const pages = pagesWithLayout(files, leadsTo(files));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sizes = pages.map((page) => {
  const sheet = css(page);
  writeFileSync(join(OUT, pageSheetName(page)), sheet);
  return sheet.length;
});
const whole = SHEETS.reduce((sum, name) => sum + statSync(join(ROOT, 'src/styles', name)).size, 0);
const mean = Math.round(sizes.reduce((sum, size) => sum + size, 0) / Math.max(sizes.length, 1));
console.info(`page styles: ${pages.length} pages reach ${LAYOUT}; ${Math.round((mean / whole) * 100)}% of the ${whole} bytes each, on average`);
