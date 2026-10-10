/*
 * Small copies of the covers the feed shows, kept on our own storage.
 *
 * A card used to fetch its photograph from the site the event was found on, at
 * whatever size that site serves: half a megabyte of JPEG for a picture drawn
 * 190 pixels wide, over that site's connection. This makes a 640-pixel WebP of
 * each cover once, stores it in R2 under `thumbs/`, and writes the list of the
 * ones that exist to src/data/thumbs.json, which the build reads (withThumbs).
 *
 *   bun run scripts/build-thumbs.ts
 *
 * Runs before the build of every deploy and only does what is missing. It
 * stops at a time budget — the nearest events first, the rest on a later run —
 * and nothing it fails at can fail the deploy: a cover without a copy is shown
 * from its source, as before. Without credentials it leaves the list alone.
 */
import { Schema } from 'effect';
import sharp from 'sharp';
import { largeCover } from '../src/lib/img/large-cover.ts';
import { thumbKey } from '../src/lib/img/thumb-key.ts';
import { listKeys, putObject } from './lib/r2-objects.ts';
import type { R2Access } from './lib/r2-objects.ts';

const EVENTS_URL = process.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';
const BUDGET_MS = Number(process.env.THUMBS_BUDGET_MS ?? 8 * 60 * 1000);
const OUT = new URL('../src/data/thumbs.json', import.meta.url);
const PREFIX = 'thumbs/';
const WIDTH = 640;
const WORKERS = 8;
const UA = 'DoveGo-thumbs/1.0 (+https://dovego.it)';

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

const small = async (url: string): Promise<Uint8Array> => {
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`answered ${res.status}`);
  return sharp(await res.arrayBuffer())
    .rotate()
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
};

const make = async (r2: R2Access, queue: Wanted[], made: Set<string>, until: number): Promise<void> => {
  for (let next = queue.shift(); next !== undefined && Date.now() < until; next = queue.shift()) {
    try {
      await putObject(r2, `${PREFIX}${next.key}.webp`, await small(next.url), 'image/webp');
      made.add(next.key);
    } catch (cause) {
      console.warn(`skipped ${next.url}: ${String(cause)}`);
    }
  }
};

const main = async (): Promise<void> => {
  const r2 = access();
  if (r2 === undefined) return console.info('thumbs: no Cloudflare credentials, list left as it is');
  const payload = Schema.decodeUnknownSync(PayloadSchema)(await (await fetch(EVENTS_URL)).json());
  const all = wanted(payload.events);
  const stored = new Set((await listKeys(r2, PREFIX)).map((key) => key.slice(PREFIX.length).replace(/\.webp$/, '')));
  const made = new Set(all.filter((item) => stored.has(item.key)).map((item) => item.key));
  const queue = all.filter((item) => !stored.has(item.key));
  const missing = queue.length;
  const write = (): Promise<number> => Bun.write(OUT, `${JSON.stringify([...made].sort())}\n`);
  // Written before the slow part too: a run killed halfway still leaves the
  // build the copies that were already there.
  await write();
  await Promise.all(Array.from({ length: WORKERS }, () => make(r2, queue, made, Date.now() + BUDGET_MS)));
  await write();
  console.info(`thumbs: ${all.length} covers, ${made.size} have a copy, ${missing} were missing, ${queue.length} left for a later run`);
};

await main().catch((cause) => console.warn(`thumbs: gave up — ${String(cause)}`));
