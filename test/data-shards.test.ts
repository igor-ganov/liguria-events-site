import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { REGION_NAMES } from '../src/lib/region/regions.ts';
import { commonsImg } from '../src/lib/img/commons-img.ts';
import { decodePlaces } from '../src/lib/places/decode-places.ts';
import { decodeLandmarks } from '../src/lib/landmarks/decode-landmarks.ts';
import { indexLandmarks, isLandmarkDuplicate, type LandmarkPoint } from '../scripts/lib/place-landmark-dup.ts';

// Guards the DATA, not just the logic: a region that silently built empty, a
// half-added region (the "only Liguria" gap), or an image URL the render path
// can't fix. Reads the committed shards like redirects.test.ts reads _redirects.
const LANGS = ['en', 'it', 'ru'] as const;
const dir = (kind: string) => resolve('public', 'data', kind);
const read = (kind: string, region: string, lang: string): unknown[] =>
  JSON.parse(readFileSync(resolve(dir(kind), `${region}.${lang}.json`), 'utf8')) as unknown[];

describe('data shards: coverage', () => {
  test('every browsable region has all six shards (places + landmarks × 3 locales)', () => {
    for (const region of Object.keys(REGION_NAMES)) {
      for (const kind of ['places', 'landmarks']) {
        for (const lang of LANGS) {
          assert.ok(existsSync(resolve(dir(kind), `${region}.${lang}.json`)), `${kind}/${region}.${lang}.json missing`);
        }
      }
    }
  });
});

// Deep-parse a spread of regions (small + large + islands) rather than all 120
// files — enough to catch a structural break without a slow test.
const SAMPLE = ['liguria', 'lazio', 'lombardia', 'sicilia', 'valle-d-aosta'];

describe('data shards: structure', () => {
  test('sampled place shards decode to non-empty, well-formed rows', () => {
    for (const region of SAMPLE) {
      const places = decodePlaces(read('places', region, 'en'), region);
      assert.ok(places.length > 0, `${region} places empty`);
      for (const p of places.slice(0, 50)) {
        assert.ok(p.id && p.name && Number.isFinite(p.lat) && Number.isFinite(p.lng), `${region} bad place row`);
        assert.equal(p.region, region);
      }
    }
  });

  test('sampled landmark shards decode to non-empty, well-formed rows', () => {
    for (const region of SAMPLE) {
      const lms = decodeLandmarks(read('landmarks', region, 'en'), region);
      assert.ok(lms.length > 0, `${region} landmarks empty`);
      for (const l of lms.slice(0, 50)) {
        assert.ok(l.id && l.name && Number.isFinite(l.lat) && Number.isFinite(l.lng), `${region} bad landmark row`);
      }
    }
  });
});

// A museum/theatre/gallery collected by BOTH build-landmarks and build-places
// shows as two markers that only merge when zoomed in (the two map layers never
// co-cluster). build-places + dedupe-places-vs-landmarks strip the place-side
// duplicate; this guards that no such duplicate is reintroduced in any shard.
describe('data shards: no cross-layer landmark/place duplicates', () => {
  // One test per region — each reads only its six shards, so every case stays
  // well under the default timeout and a failure names the offending region.
  for (const region of Object.keys(REGION_NAMES)) {
    test(`${region}: no cultural place duplicates a same-named landmark within 45m`, () => {
      const lm = new Map<string, { lat: number; lng: number; names: Set<string> }>();
      for (const lang of LANGS) {
        for (const r of read('landmarks', region, lang) as { id: string; name: string; lat: number; lng: number }[]) {
          const cur = lm.get(r.id) ?? { lat: r.lat, lng: r.lng, names: new Set<string>() };
          cur.names.add(r.name);
          lm.set(r.id, cur);
        }
      }
      const landmarks: LandmarkPoint[] = [...lm.values()].map((v) => ({ lat: v.lat, lng: v.lng, names: [...v.names] }));
      const index = indexLandmarks(landmarks);
      const places = new Map<string, { cat: string; lat: number; lng: number; names: Set<string> }>();
      for (const lang of LANGS) {
        for (const r of read('places', region, lang) as { i: string; n: string; c: string; a: number; o: number }[]) {
          const cur = places.get(r.i) ?? { cat: r.c, lat: r.a, lng: r.o, names: new Set<string>() };
          cur.names.add(r.n);
          places.set(r.i, cur);
        }
      }
      for (const [id, p] of places) {
        assert.ok(
          !isLandmarkDuplicate({ cat: p.cat, names: [...p.names], lat: p.lat, lng: p.lng }, index),
          `${region}: place ${id} "${[...p.names][0]}" duplicates a landmark`,
        );
      }
    });
  }
});

describe('data shards: every image survives commonsImg (no http, no rejected width)', () => {
  test('committed landmark/place images render to https Special:FilePath', () => {
    for (const region of SAMPLE) {
      const rows = [
        ...decodeLandmarks(read('landmarks', region, 'en'), region),
        ...decodePlaces(read('places', region, 'en'), region),
      ];
      const withImg = rows.filter((r) => r.img).slice(0, 200);
      assert.ok(withImg.length > 0, `${region}: expected some images to check`);
      for (const r of withImg) {
        const out = commonsImg(r.img as string, 96);
        assert.ok(out.startsWith('https://'), `mixed-content: ${out}`);
        assert.ok(!/\/\d+px-/.test(out), `rejected /thumb/ width form: ${out}`);
      }
    }
  });
});
