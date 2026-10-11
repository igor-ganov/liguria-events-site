/*
 * After the build: every prerendered page asks for its module scripts at low
 * priority (see scriptsAfterPaint for why).
 *
 *   bun run scripts/scripts-after-paint.ts
 */
import { Glob } from 'bun';
import { scriptsAfterPaint } from '../src/lib/html/scripts-after-paint.ts';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const pages = await Array.fromAsync(new Glob('**/*.html').scan({ cwd: DIST }));
const changed = await Promise.all(
  pages.map(async (path) => {
    const html = await Bun.file(`${DIST}${path}`).text();
    const next = scriptsAfterPaint(html);
    if (next === html) return 0;
    await Bun.write(`${DIST}${path}`, next);
    return 1;
  }),
);
console.info(`scripts after paint: ${changed.reduce((sum: number, one) => sum + one, 0)} of ${pages.length} pages`);
