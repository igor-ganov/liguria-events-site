/*
 * One-off: strip cross-layer duplicates from the ALREADY-COMMITTED place shards
 * without re-running the (slow) Overture/DuckDB extract. For every region it
 * loads the landmark shards, finds places that duplicate a landmark (see
 * scripts/lib/place-landmark-dup.ts), and rewrites the place shards without
 * them. build-places.ts applies the same filter on every future refresh.
 *
 *   bun run scripts/dedupe-places-vs-landmarks.ts            # all regions
 *   bun run scripts/dedupe-places-vs-landmarks.ts liguria    # one region
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { REGION_GEO } from '../src/lib/region/region-bounds.ts';
import { indexLandmarks, isLandmarkDuplicate, type LandmarkPoint } from './lib/place-landmark-dup.ts';

type Lang = 'en' | 'it' | 'ru';
const LANGS: readonly Lang[] = ['en', 'it', 'ru'];

const ARG = process.argv.slice(2).filter((a) => a in REGION_GEO);
const REGIONS = ARG.length > 0 ? ARG : Object.keys(REGION_GEO);

const dataUrl = (kind: 'landmarks' | 'places', region: string, lang: Lang): URL =>
  new URL(`../public/data/${kind}/${region}.${lang}.json`, import.meta.url);

type LmRow = { id: string; name: string; lat: number; lng: number };
type PlRow = { i: string; n: string; c: string; a: number; o: number };

const readJson = <T>(url: URL): T[] => (existsSync(url) ? (JSON.parse(readFileSync(url, 'utf8')) as T[]) : []);

// Merge a landmark's name across locales; coords are locale-independent.
const landmarksOf = (region: string): LandmarkPoint[] => {
  const byId = new Map<string, { lat: number; lng: number; names: Set<string> }>();
  for (const lang of LANGS) {
    for (const r of readJson<LmRow>(dataUrl('landmarks', region, lang))) {
      const cur = byId.get(r.id) ?? { lat: r.lat, lng: r.lng, names: new Set<string>() };
      cur.names.add(r.name);
      byId.set(r.id, cur);
    }
  }
  return [...byId.values()].map((v) => ({ lat: v.lat, lng: v.lng, names: [...v.names] }));
};

// Merge a place's name across locales, keyed by id; cat/coords are shared.
const placesOf = (region: string): Map<string, { cat: string; lat: number; lng: number; names: Set<string> }> => {
  const byId = new Map<string, { cat: string; lat: number; lng: number; names: Set<string> }>();
  for (const lang of LANGS) {
    for (const r of readJson<PlRow>(dataUrl('places', region, lang))) {
      const cur = byId.get(r.i) ?? { cat: r.c, lat: r.a, lng: r.o, names: new Set<string>() };
      cur.names.add(r.n);
      byId.set(r.i, cur);
    }
  }
  return byId;
};

let grandTotal = 0;

for (const region of REGIONS) {
  const landmarks = landmarksOf(region);
  if (landmarks.length === 0) {
    console.log(`· ${region}: no landmark shard — skipped`);
    continue;
  }
  const index = indexLandmarks(landmarks);
  const places = placesOf(region);
  const drop = new Set<string>();
  const examples: string[] = [];
  for (const [id, p] of places) {
    if (isLandmarkDuplicate({ cat: p.cat, names: [...p.names], lat: p.lat, lng: p.lng }, index)) {
      drop.add(id);
      if (examples.length < 5) examples.push(`[${p.cat}] ${[...p.names][0]}`);
    }
  }
  if (drop.size === 0) {
    console.log(`· ${region}: 0 duplicates`);
    continue;
  }
  for (const lang of LANGS) {
    const url = dataUrl('places', region, lang);
    const rows = readJson<PlRow>(url);
    const kept = rows.filter((r) => !drop.has(r.i));
    writeFileSync(url, `${JSON.stringify(kept, undefined, 0)}\n`);
  }
  grandTotal += drop.size;
  console.log(`✓ ${region}: dropped ${drop.size} place duplicates (e.g. ${examples.join(', ')})`);
}

console.log(`\nTotal place duplicates removed: ${grandTotal}`);
