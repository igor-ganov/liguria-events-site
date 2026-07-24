/*
 * One-off (and re-runnable) trim of the committed place shards to fit the
 * Cloudflare Workers 25 MiB per-asset limit. The Overture/OSM pipeline can't be
 * cheaply re-run here (needs python + duckdb + slow network), so this operates
 * on the already-built compact shards directly, applying the SAME size budget
 * and richness ranking as build-places.ts. The same id set is dropped from every
 * locale so worker-SSR detail pages never 404.
 *
 *   bun run scripts/cap-place-shards.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { REGION_GEO } from '../src/lib/region/region-bounds.ts';

const LANGS = ['en', 'it', 'ru'] as const;
type Lang = (typeof LANGS)[number];
type Row = Readonly<Record<string, unknown>> & { i: string };

const BUDGET = 22 * 1024 * 1024;
const shardPath = (region: string, lang: Lang): URL =>
  new URL(`../public/data/places/${region}.${lang}.json`, import.meta.url);

// Richer rows are kept first: a photo / description / wiki / contacts outrank a
// bare name+coords POI. Mirrors richness() in build-places.ts (compact keys).
const richness = (r: Row): number =>
  (r['m'] ? 4 : 0) +
  (r['d'] ? 3 : 0) +
  (r['k'] ? 3 : 0) +
  (r['q'] ? 2 : 0) +
  (r['w'] ? 1 : 0) +
  (r['p'] ? 1 : 0) +
  (r['so'] ? 1 : 0) +
  (r['ad'] ? 1 : 0) +
  (r['h'] ? 1 : 0);

const rowBytes = (r: Row): number => JSON.stringify(r).length + 1;
const fileBytes = (rows: readonly Row[]): number => rows.reduce((n, r) => n + rowBytes(r), 2);

const capRegion = (region: string): void => {
  const present = LANGS.filter((l) => existsSync(shardPath(region, l)));
  if (present.length === 0) return;
  const byLang = new Map<Lang, readonly Row[]>();
  for (const lang of present) byLang.set(lang, JSON.parse(readFileSync(shardPath(region, lang), 'utf8')) as Row[]);

  const worst = Math.max(...present.map((l) => fileBytes(byLang.get(l)!)));
  if (worst <= BUDGET) return;

  // Union of ids with a richness score (max across locales for stability).
  const score = new Map<string, number>();
  for (const rows of byLang.values()) {
    for (const r of rows) score.set(r.i, Math.max(score.get(r.i) ?? 0, richness(r)));
  }
  const ordered = [...score.keys()].sort((a, b) => (score.get(b)! - score.get(a)!) || a.localeCompare(b));

  // For each locale, how many of `ordered` fit the budget — take the tightest.
  let keep = ordered.length;
  for (const lang of present) {
    const rowOf = new Map((byLang.get(lang) ?? []).map((r) => [r.i, r]));
    let bytes = 2;
    let k = 0;
    for (; k < ordered.length; k += 1) {
      const r = rowOf.get(ordered[k]!);
      if (r) bytes += rowBytes(r);
      if (bytes > BUDGET) break;
    }
    keep = Math.min(keep, k);
  }
  const keptIds = new Set(ordered.slice(0, keep));

  for (const lang of present) {
    const rows = byLang.get(lang) ?? [];
    const view = rows.filter((r) => keptIds.has(r.i)); // preserve original order → small diff
    writeFileSync(shardPath(region, lang), `${JSON.stringify(view, undefined, 0)}\n`);
  }
  console.log(
    `· ${region}: capped ${byLang.get(present[0]!)!.length}→${keptIds.size} places ` +
      `(${(worst / 1048576).toFixed(1)} MiB → fits ${(BUDGET / 1048576) | 0} MiB/locale)`,
  );
};

for (const region of Object.keys(REGION_GEO)) capRegion(region);
console.log('✓ place shards within budget');
