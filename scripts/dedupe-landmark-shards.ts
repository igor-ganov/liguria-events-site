/*
 * One-off (re-runnable) dedupe of the committed landmark shards. The landmark
 * refresh runs off the deploy path, so fixing build-landmarks.ts only takes
 * effect on the next refresh; this applies the SAME rule to the shards already
 * shipped, dropping Wikidata-vs-Wikidata duplicates (same Commons photo at one
 * spot, or the same name a few dozen metres apart). The same id set is dropped
 * from every locale.
 *
 *   bun run scripts/dedupe-landmark-shards.ts
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { REGION_GEO } from '../src/lib/region/region-bounds.ts';

const LANGS = ['en', 'it', 'ru'] as const;
type Lang = (typeof LANGS)[number];
type Row = { id: string; name: string; lat: number; lng: number; img?: string; desc?: string; wiki?: string; wd?: string };

const shardPath = (region: string, lang: Lang): URL =>
  new URL(`../public/data/landmarks/${region}.${lang}.json`, import.meta.url);

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const imgKey = (url: string | undefined): string | undefined => {
  if (url === undefined) return undefined;
  const m = url.match(/(?:Special:FilePath\/|\/)([^/?]+\.(?:jpe?g|png|svg|webp|tiff?|gif))/i);
  return m ? decodeURIComponent(m[1]).toLowerCase().replace(/^file:/, '') : url;
};

const same = (a: Row, b: Row): boolean => {
  const dLat = Math.abs(a.lat - b.lat);
  const dLng = Math.abs(a.lng - b.lng);
  const ka = imgKey(a.img);
  if (ka !== undefined && ka === imgKey(b.img) && dLat < 0.0025 && dLng < 0.0035) return true;
  if (dLat < 0.0004 && dLng < 0.0006) {
    const na = norm(a.name);
    const nb = norm(b.name);
    return na.length > 3 && nb.length > 3 && (na === nb || na.includes(nb) || nb.includes(na));
  }
  return false;
};

const score = (r: Row): number => (r.img ? 4 : 0) + (r.wiki ? 3 : 0) + (r.desc ? 2 : 0) + r.name.length / 1000;

const dedupeRegion = (region: string): number => {
  if (!existsSync(shardPath(region, 'en'))) return 0;
  const en = JSON.parse(readFileSync(shardPath(region, 'en'), 'utf8')) as Row[];
  const kept: Row[] = [];
  const drop = new Set<string>();
  for (const r of en) {
    const dup = kept.find((k) => same(k, r));
    if (dup === undefined) {
      kept.push(r);
      continue;
    }
    if (score(r) > score(dup)) {
      drop.add(dup.id);
      kept[kept.indexOf(dup)] = r;
    } else {
      drop.add(r.id);
    }
  }
  if (drop.size === 0) return 0;
  for (const lang of LANGS) {
    if (!existsSync(shardPath(region, lang))) continue;
    const rows = JSON.parse(readFileSync(shardPath(region, lang), 'utf8')) as Row[];
    const view = rows.filter((r) => !drop.has(r.id));
    writeFileSync(shardPath(region, lang), `${JSON.stringify(view, undefined, 0)}\n`);
  }
  console.log(`· ${region}: dropped ${drop.size} duplicates (${en.length} → ${en.length - drop.size})`);
  return drop.size;
};

let total = 0;
for (const region of Object.keys(REGION_GEO)) total += dedupeRegion(region);
console.log(`✓ removed ${total} duplicate landmarks across all regions`);
