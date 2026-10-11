/*
 * After the build: take the folded days out of every feed page and put them
 * in files of their own under dist/data/tails/ (see splitFeedTail for why).
 *
 *   bun run scripts/split-feed-tails.ts
 *
 * Plain text by name on purpose: a host that serves a site tidies `.html`
 * out of addresses, and answers the one a page asks for with a redirect.
 *
 * A file is named after what is in it, so a page always asks for exactly the
 * days it was built with, however long a browser has held either of them, and
 * two pages that fold the same days share one file.
 */
import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { Glob } from 'bun';
import { splitFeedTail } from '../src/lib/feed/split-feed-tail.ts';

const DIST = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const TAILS = 'data/tails';

const addressOf = (tail: string): string =>
  `/${TAILS}/${createHash('sha256').update(tail).digest('hex').slice(0, 16)}.txt`;

await mkdir(`${DIST}${TAILS}`, { recursive: true });
const pages = await Array.fromAsync(new Glob('**/index.html').scan({ cwd: DIST }));
const done = await Promise.all(
  pages.map(async (path) => {
    const split = splitFeedTail(await Bun.file(`${DIST}${path}`).text(), addressOf);
    if (split === undefined) return 0;
    await Bun.write(`${DIST}${addressOf(split.tail).slice(1)}`, split.tail);
    await Bun.write(`${DIST}${path}`, split.page);
    return 1;
  }),
);
console.info(`feed tails: ${done.reduce((sum: number, one) => sum + one, 0)} of ${pages.length} pages split`);
