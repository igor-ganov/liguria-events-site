/*
 * Copies of the covers, kept on our own storage: a small one for a feed card
 * and a larger one for the top of an event page.
 *
 * A card used to fetch its photograph from the site the event was found on, at
 * whatever size that site serves: half a megabyte of JPEG for a picture drawn
 * 190 pixels wide, over that site's connection. This makes a 640-pixel WebP of
 * each cover once, stores it in R2 under `thumbs/`, and writes the list of the
 * ones that exist to src/data/thumbs.json, which the build reads (withThumbs).
 * The page-sized copy goes the same way under `covers/` and covers.json
 * (ownCover); a picture is fetched once for whichever of the two is missing.
 *
 *   bun run scripts/build-thumbs.ts
 *
 * Runs before the build of every deploy and only does what is missing. It
 * stops at a time budget — the nearest events first, the rest on a later run —
 * and nothing it fails at can fail the deploy: a cover without a copy is shown
 * from its source, as before. Without credentials it leaves the lists alone.
 */
import { Schema } from 'effect';
import sharp from 'sharp';
import { largeCover } from '../src/lib/img/large-cover.ts';
import { thumbKey } from '../src/lib/img/thumb-key.ts';
import { listKeys, putObject } from './lib/r2-objects.ts';
import type { R2Access } from './lib/r2-objects.ts';

const EVENTS_URL = process.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';
const BUDGET_MS = Number(process.env.THUMBS_BUDGET_MS ?? 8 * 60 * 1000);
const WORKERS = 8;
const UA = 'DoveGo-thumbs/1.0 (+https://dovego.it)';

type Size = Readonly<{ prefix: string; width: number; quality: number; out: URL }>;
const SIZES: readonly Size[] = [
  { prefix: 'thumbs/', width: 640, quality: 72, out: new URL('../src/data/thumbs.json', import.meta.url) },
  { prefix: 'covers/', width: 1024, quality: 76, out: new URL('../src/data/covers.json', import.meta.url) },
];
// One size, and the pictures that have a copy in it.
type Shelf = Readonly<{ size: Size; made: Set<string> }>;

const PayloadSchema = Schema.Struct({
  events: Schema.Array(Schema.Struct({ img: Schema.optional(Schema.String), s: Schema.String })),
});
type Listed = (typeof PayloadSchema.Type)['events'][number];
type Wanted = Readonly<{ key: string; url: string }>;

const access = (): R2Access | undefined => {
  const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_EMAIL: email, CLOUDFLARE_API_KEY: key } = process.env;
  return account && email && key
    ? { account, email, key, bucket: process.env.THUMBS_BUCKET ?? 'dovego-uploads' }
    : undefined;
};

// One entry per picture, the soonest event's first: when the budget runs out,
// what is left without a copy is what a reader reaches last.
const wanted = (events: readonly Listed[]): readonly Wanted[] => {
  const byKey = new Map<string, Wanted>();
  [...events]
    .sort((a, b) => a.s.localeCompare(b.s))
    .flatMap((event) => (event.img === undefined ? [] : [largeCover(event.img)]))
    .filter((url) => url.startsWith('https://'))
    .forEach((url) => byKey.has(thumbKey(url)) || byKey.set(thumbKey(url), { key: thumbKey(url), url }));
  return [...byKey.values()];
};

const original = async (url: string): Promise<ArrayBuffer> => {
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`answered ${res.status}`);
  return res.arrayBuffer();
};

const copy = (bytes: ArrayBuffer, size: Size): Promise<Uint8Array> =>
  sharp(bytes).rotate().resize({ width: size.width, withoutEnlargement: true }).webp({ quality: size.quality }).toBuffer();

const shelfOf = async (r2: R2Access, size: Size, all: readonly Wanted[]): Promise<Shelf> => {
  const stored = new Set((await listKeys(r2, size.prefix)).map((key) => key.slice(size.prefix.length, -'.webp'.length)));
  return { size, made: new Set(all.filter((item) => stored.has(item.key)).map((item) => item.key)) };
};

const make = async (r2: R2Access, queue: Wanted[], shelves: readonly Shelf[], until: number): Promise<void> => {
  for (let next = queue.shift(); next !== undefined && Date.now() < until; next = queue.shift()) {
    try {
      const { key, url } = next;
      const bytes = await original(url);
      for (const { size, made } of shelves.filter((shelf) => !shelf.made.has(key))) {
        await putObject(r2, `${size.prefix}${key}.webp`, await copy(bytes, size), 'image/webp');
        made.add(key);
      }
    } catch (cause) {
      console.warn(`skipped ${next.url}: ${String(cause)}`);
    }
  }
};

const main = async (): Promise<void> => {
  const r2 = access();
  if (r2 === undefined) return console.info('thumbs: no Cloudflare credentials, lists left as they are');
  const payload = Schema.decodeUnknownSync(PayloadSchema)(await (await fetch(EVENTS_URL)).json());
  const all = wanted(payload.events);
  const shelves = await Promise.all(SIZES.map((size) => shelfOf(r2, size, all)));
  const queue = all.filter((item) => shelves.some((shelf) => !shelf.made.has(item.key)));
  const missing = queue.length;
  const write = (): Promise<number[]> =>
    Promise.all(shelves.map(({ size, made }) => Bun.write(size.out, `${JSON.stringify([...made].sort())}\n`)));
  // Written before the slow part too: a run killed halfway still leaves the
  // build the copies that were already there.
  await write();
  await Promise.all(Array.from({ length: WORKERS }, () => make(r2, queue, shelves, Date.now() + BUDGET_MS)));
  await write();
  const have = shelves.map(({ size, made }) => `${made.size} under ${size.prefix}`).join(', ');
  console.info(`thumbs: ${all.length} covers, ${have}; ${missing} lacked a copy, ${queue.length} left for a later run`);
};

await main().catch((cause) => console.warn(`thumbs: gave up — ${String(cause)}`));
