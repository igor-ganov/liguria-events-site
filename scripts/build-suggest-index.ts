/*
 * After the build: embed every upcoming event and every venue with Workers AI
 * (bge-m3) and leave the vectors beside the site, for /api/suggest.
 *
 *   bun run scripts/build-suggest-index.ts
 *
 * Reads dist/data/suggest-embed.json (src/pages/data/suggest-embed.json.ts),
 * writes dist/data/suggest-index.json (ids, regions, last days) and
 * dist/data/suggest-vectors.bin (one int8 row of 1024 per id), then removes
 * the input. Credentials are the deploy's own: CLOUDFLARE_ACCOUNT_ID with
 * either CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY + CLOUDFLARE_EMAIL.
 *
 * It never fails the build. Without credentials, or with the model down, no
 * index is written, the endpoint answers 503, and the search box suggests by
 * letters alone — which is what it did before this existed.
 *
 * Cost: ~1.8k documents of ~150 tokens is ~0.3M tokens a build, ~300 neurons
 * of the 10k free each day (bge-m3: 1,075 neurons per million tokens).
 */
import { rm } from 'node:fs/promises';
import { quantize } from '../src/lib/suggest/quantize.ts';
import { SUGGEST_MODEL } from '../src/lib/suggest/server/suggest-model.ts';
import type { EmbedDoc } from '../src/lib/suggest/suggest-doc.ts';

const DIST = new URL('../dist/data/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const INPUT = `${DIST}suggest-embed.json`;
const BATCH = 32;
const PARALLEL = 4;

const env = process.env;
const account = env['CLOUDFLARE_ACCOUNT_ID'] ?? '';
const token = env['CLOUDFLARE_API_TOKEN'] ?? '';
const AUTH: Readonly<Record<'true' | 'false', Record<string, string>>> = {
  true: { authorization: `Bearer ${token}` },
  false: { 'x-auth-key': env['CLOUDFLARE_API_KEY'] ?? '', 'x-auth-email': env['CLOUDFLARE_EMAIL'] ?? '' },
};
const auth = AUTH[`${token !== ''}`];
const hasAuth = account !== '' && Object.values(auth).every((value) => value !== '' && value !== 'Bearer ');

const isRows = (value: unknown): value is number[][] =>
  Array.isArray(value) && value.every((row) => Array.isArray(row) && row.every((item) => typeof item === 'number'));

const isDocs = (value: unknown): value is EmbedDoc[] =>
  Array.isArray(value) && value.every((doc) => ['id', 'region', 'until', 'text'].every((key) => typeof Reflect.get(Object(doc), key) === 'string'));

const embed = async (texts: readonly string[]): Promise<number[][]> => {
  const answer = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${SUGGEST_MODEL}`, {
    method: 'POST',
    headers: { ...auth, 'content-type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  });
  if (!answer.ok) throw new Error(`Workers AI ${answer.status}: ${(await answer.text()).slice(0, 200)}`);
  const data: unknown = Reflect.get(Object(Reflect.get(Object(await answer.json()), 'result')), 'data');
  const rows = [data].filter(isRows).at(0) ?? [];
  if (rows.length !== texts.length) throw new Error(`Workers AI answered ${rows.length} vectors for ${texts.length} texts`);
  return rows;
};

const embedAll = async (docs: readonly EmbedDoc[]): Promise<number[][]> => {
  const batches = Array.from({ length: Math.ceil(docs.length / BATCH) }, (_, at) => docs.slice(at * BATCH, at * BATCH + BATCH).map((doc) => doc.text));
  const out: number[][][] = [];
  for (let at = 0; at < batches.length; at += PARALLEL) {
    out.push(...(await Promise.all(batches.slice(at, at + PARALLEL).map(embed))));
  }
  return out.flat();
};

const run = async (): Promise<string> => {
  const docs = [await Bun.file(INPUT).json()].filter(isDocs).at(0) ?? [];
  if (!hasAuth) return `skipped, no Cloudflare credentials — ${docs.length} documents, letters only`;
  const started = performance.now();
  const vectors = await embedAll(docs);
  const dims = vectors[0]?.length ?? 0;
  const rows = new Int8Array(vectors.length * dims);
  vectors.forEach((vector, at) => rows.set(quantize(vector), at * dims));
  await Bun.write(`${DIST}suggest-vectors.bin`, rows);
  await Bun.write(
    `${DIST}suggest-index.json`,
    JSON.stringify({ model: SUGGEST_MODEL, dims, ids: docs.map((doc) => doc.id), regions: docs.map((doc) => doc.region), until: docs.map((doc) => doc.until) }),
  );
  return `${docs.length} documents × ${dims} dims, ${(rows.byteLength / 1024).toFixed(0)} KB, ${((performance.now() - started) / 1000).toFixed(1)} s`;
};

const outcome = await run().catch((error: unknown) => `not built — ${String(error)}; suggestions match letters only`);
await rm(INPUT, { force: true });
console.info(`suggest index: ${outcome}`);
