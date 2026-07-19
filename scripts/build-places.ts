/*
 * Build src/../public/data/places.{en,it,ru}.json — the "things to do / worth
 * visiting" layer — by merging several open sources:
 *
 *   Overture Maps  — aggregates Meta, Microsoft, TomTom & others (scripts/
 *                    overture-places.py extracts Liguria to a local ndjson).
 *   OpenStreetMap  — Overpass, our venue categories; carries wiki* + website.
 *   Wikidata/Wikipedia — image + short description for the notable ones.
 *
 * Google Places is deliberately NOT a source: its terms forbid storing/showing
 * its POI data outside a Google map. Run overture-places.py first (or this
 * spawns it), then: bun run scripts/build-places.ts
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { REGION_GEO } from '../src/lib/region/region-bounds.ts';
import { commonsImg } from '../src/lib/img/commons-img.ts';

const UA = 'DoveGo-places/1.0 (https://dovego.it; igor.ganov@gmail.com)';
// One region per invocation (CI matrixes over all 20); no arg → every region.
const ARG_REGIONS = process.argv.slice(2).filter((a) => a in REGION_GEO);
const REGIONS = ARG_REGIONS.length > 0 ? ARG_REGIONS : Object.keys(REGION_GEO);
const overtureCache = (region: string): URL =>
  new URL(`./.cache/overture-${region}.ndjson`, import.meta.url);

type Lang = 'en' | 'it' | 'ru';
const LANGS: readonly Lang[] = ['en', 'it', 'ru'];
type Cat =
  | 'restaurant' | 'cafe' | 'bar' | 'fastfood' | 'icecream' | 'nightlife'
  | 'fitness' | 'climbing' | 'sport' | 'cinema' | 'entertainment'
  | 'museum' | 'gallery' | 'wellness' | 'kids' | 'shopping';

type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  cat: Cat;
  region: string;
  website?: string;
  img?: string;
  hours?: string;
  rating?: number;
  desc?: Record<Lang, string | undefined>;
  wiki?: Record<Lang, string | undefined>;
  wd?: string;
};

/* ── category mapping ───────────────────────────────────────────────────────── */

// Overture `categories.primary` → our taxonomy (undefined = drop). Order matters.
const overtureCat = (raw: string): Cat | undefined => {
  const c = raw.toLowerCase();
  if (/climb/.test(c)) return 'climbing';
  if (/gym|fitness|crossfit|pilates|yoga|martial_art/.test(c)) return 'fitness';
  if (/museum/.test(c)) return 'museum';
  if (/art_gallery|(^|_)gallery/.test(c)) return 'gallery';
  if (/cinema|movie_theat/.test(c)) return 'cinema';
  if (/night_club|nightlife|disco|dance_club|karaoke|cabaret/.test(c)) return 'nightlife';
  if (/bowling|arcade|escape_room|laser_tag|amusement|theme_park|water_park|go_kart|mini_golf|billiard|trampoline|paintball|entertainment|casino/.test(c)) return 'entertainment';
  if (/spa|sauna|thermal|hammam|wellness|onsen|turkish_bath/.test(c)) return 'wellness';
  if (/ice_cream|gelato|frozen_yogurt/.test(c)) return 'icecream';
  if (/cafe|coffee|tea_room|patisserie|bakery|creperie|bagel/.test(c)) return 'cafe';
  if (/(^|_)bar$|_bar$|\bpub|brewery|winery|beer|taproom|cocktail|enoteca|birreria|distillery/.test(c)) return 'bar';
  if (/fast_food|street_food|burger|kebab|sandwich|hot_dog|food_court|food_stand|takeaway|fish_and_chips|taco|falafel|pretzel/.test(c)) return 'fastfood';
  if (/restaurant|trattoria|osteria|steakhouse|pizzeria|bistro|diner|eatery|ristorante|brasserie/.test(c)) return 'restaurant';
  if (/zoo|aquarium|playground|children|kids|family_fun|petting|water_park/.test(c)) return 'kids';
  if (/shopping_(center|mall)|(^|_)mall$|marketplace|(^|_)market$|department_store|flea_market|outlet/.test(c)) return 'shopping';
  if (/sport|stadium|arena|swimming|(^|_)pool|gymnasium|tennis|golf|skate|ice_rink|athletic|recreation_center|active_life|dance_studio|bowling/.test(c)) return 'sport';
  return undefined;
};

const osmCat = (t: Record<string, string>): Cat | undefined => {
  const { amenity: a = '', leisure: l = '', tourism: tr = '', shop: sh = '', sport: sp = '', craft: cr = '' } = t;
  if (l === 'climbing' || sp === 'climbing') return 'climbing';
  if (l === 'fitness_centre' || l === 'fitness_station') return 'fitness';
  if (tr === 'museum') return 'museum';
  if (tr === 'gallery') return 'gallery';
  if (a === 'cinema') return 'cinema';
  if (a === 'nightclub') return 'nightlife';
  if (l === 'bowling_alley' || l === 'amusement_arcade' || l === 'escape_game' || l === 'water_park' || l === 'trampoline_park' || a === 'theatre' || a === 'arts_centre' || tr === 'theme_park') return 'entertainment';
  if (l === 'spa' || a === 'spa' || l === 'sauna' || a === 'public_bath') return 'wellness';
  if (a === 'ice_cream') return 'icecream';
  if (a === 'cafe' || sh === 'bakery' || sh === 'coffee' || sh === 'pastry') return 'cafe';
  if (a === 'bar' || a === 'pub' || a === 'biergarten' || cr === 'brewery' || sh === 'wine') return 'bar';
  if (a === 'fast_food' || a === 'food_court') return 'fastfood';
  if (a === 'restaurant') return 'restaurant';
  if (tr === 'zoo' || tr === 'aquarium' || l === 'playground') return 'kids';
  if (sh === 'mall' || sh === 'department_store' || a === 'marketplace') return 'shopping';
  if (l === 'sports_centre' || l === 'swimming_pool' || l === 'stadium' || l === 'ice_rink' || l === 'sports_hall' || l === 'track') return 'sport';
  return undefined;
};

/* ── sources ────────────────────────────────────────────────────────────────── */

const readOverture = (region: string): Place[] => {
  const cache = overtureCache(region);
  if (!existsSync(cache)) {
    console.log(`· overture cache missing for ${region} — running overture-places.py…`);
    const [w, s, e, n] = REGION_GEO[region]!.bbox;
    const r = spawnSync('python', ['scripts/overture-places.py', region, `${w}`, `${s}`, `${e}`, `${n}`], { stdio: 'inherit' });
    if (r.status !== 0) console.error('  overture extract failed; continuing without it');
  }
  if (!existsSync(cache)) return [];
  const out: Place[] = [];
  for (const line of readFileSync(cache, 'utf8').split('\n')) {
    if (line.trim() === '') continue;
    const r = JSON.parse(line) as { id: string; name: string; category: string; lat: number; lng: number; website?: string; confidence?: number };
    const cat = overtureCat(r.category);
    if (!cat || (r.confidence ?? 1) < 0.5) continue;
    out.push({ id: `ovt:${r.id}`, name: r.name, lat: r.lat, lng: r.lng, cat, region, website: r.website ?? undefined });
  }
  return out;
};

const overpassQuery = (iso: string): string => `[out:json][timeout:240];
area["ISO3166-2"="${iso}"]->.rg;
(
  nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|nightclub|cinema|theatre|biergarten|food_court|marketplace|spa|public_bath|arts_centre)$"]["name"](area.rg);
  nwr["leisure"~"^(fitness_centre|sports_centre|swimming_pool|climbing|bowling_alley|amusement_arcade|escape_game|water_park|trampoline_park|ice_rink|sports_hall|stadium|playground)$"]["name"](area.rg);
  nwr["tourism"~"^(museum|gallery|zoo|aquarium|theme_park)$"]["name"](area.rg);
  nwr["sport"="climbing"]["name"](area.rg);
  nwr["shop"~"^(mall|department_store|bakery)$"]["name"](area.rg);
);
out center tags;`;

type OsmEl = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

const OVERPASS_HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const fetchOverpass = async (iso: string): Promise<{ elements: OsmEl[] }> => {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const host = OVERPASS_HOSTS[attempt % OVERPASS_HOSTS.length]!;
    try {
      const res = await fetch(host, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': UA },
        body: new URLSearchParams({ data: overpassQuery(iso) }),
      });
      if (res.ok) return (await res.json()) as { elements: OsmEl[] };
      lastErr = new Error(`Overpass ${res.status} @ ${host}`);
    } catch (e) {
      lastErr = e;
    }
    console.error(`  Overpass attempt ${attempt + 1} failed, retrying…`);
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  throw lastErr;
};

const readOsm = async (region: string): Promise<Place[]> => {
  const json = await fetchOverpass(REGION_GEO[region]!.iso);
  const out: Place[] = [];
  for (const el of json.elements) {
    const t = el.tags ?? {};
    const cat = osmCat(t);
    const name = t['name:en'] ?? t['name'];
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!cat || !name || lat === undefined || lng === undefined) continue;
    const wd = /^Q\d+$/.test(t['wikidata'] ?? '') ? t['wikidata'] : undefined;
    // OSM `description[:lang]` is a genuine short blurb where present — a base the
    // Wikipedia extract later overrides per-language when a page exists.
    const clean = (s: string | undefined): string | undefined => (s?.trim() ? s.trim() : undefined);
    const osmDesc = (lang: Lang): string | undefined => clean(t[`description:${lang}`]);
    const generic = clean(t['description']);
    const desc = { en: osmDesc('en') ?? generic, it: osmDesc('it') ?? generic, ru: osmDesc('ru') };
    const stars = Number.parseFloat(t['stars'] ?? '');
    out.push({
      id: `osm:${el.type}/${el.id}`,
      name,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      cat,
      region,
      website: t['website'] ?? t['contact:website'] ?? undefined,
      img: t['image'] ?? undefined,
      ...(t['opening_hours'] ? { hours: t['opening_hours'] } : {}),
      ...(Number.isFinite(stars) && stars > 0 ? { rating: stars } : {}),
      ...(desc.en || desc.it || desc.ru ? { desc } : {}),
      wd: wd ? `https://www.wikidata.org/wiki/${wd}` : undefined,
      ...(t['wikipedia'] ? { wpTag: t['wikipedia'] } : {}),
      ...(wd ? { qid: wd } : {}),
    } as Place & { wpTag?: string; qid?: string });
  }
  return out;
};

/* ── merge / dedup (grid buckets, name + proximity) ─────────────────────────── */

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const cellKey = (lat: number, lng: number): string => `${Math.round(lat / 0.0025)}:${Math.round(lng / 0.0025)}`;

// OSM wins over Overture on a match — it carries wiki*/wikidata we enrich from.
const merge = (osm: readonly Place[], overture: readonly Place[]): Place[] => {
  const grid = new Map<string, Place[]>();
  const put = (p: Place): void => {
    const k = cellKey(p.lat, p.lng);
    (grid.get(k) ?? grid.set(k, []).get(k)!).push(p);
  };
  osm.forEach(put);
  const near = (p: Place): boolean => {
    const [ci, cj] = cellKey(p.lat, p.lng).split(':').map(Number);
    for (let di = -1; di <= 1; di += 1) {
      for (let dj = -1; dj <= 1; dj += 1) {
        for (const q of grid.get(`${ci + di}:${cj + dj}`) ?? []) {
          const close = Math.abs(q.lat - p.lat) < 0.0006 && Math.abs(q.lng - p.lng) < 0.0009;
          if (close && norm(q.name) === norm(p.name)) return true;
        }
      }
    }
    return false;
  };
  const merged = [...osm];
  for (const p of overture) {
    if (near(p)) continue;
    merged.push(p);
    put(p);
  }
  return merged;
};

/* ── Wikipedia + Wikidata enrichment (OSM-tagged only) ──────────────────────── */

const chunk = <T>(xs: readonly T[], n: number): T[][] =>
  xs.reduce<T[][]>((a, x, i) => (i % n === 0 ? a.push([x]) : a[a.length - 1].push(x), a), []);

const fetchExtracts = async (lang: Lang, titles: readonly string[]): Promise<Map<string, { extract?: string; thumb?: string }>> => {
  const found = new Map<string, { extract?: string; thumb?: string }>();
  for (const batch of chunk([...new Set(titles)], 20)) {
    const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
    url.search = new URLSearchParams({
      action: 'query', format: 'json', prop: 'extracts|pageimages', exintro: '1',
      explaintext: '1', exsentences: '2', piprop: 'thumbnail', pithumbsize: '640', redirects: '1', titles: batch.join('|'),
    }).toString();
    try {
      const json = (await (await fetch(url, { headers: { 'user-agent': UA } })).json()) as {
        query?: { pages?: Record<string, { title: string; extract?: string; thumbnail?: { source: string } }>; normalized?: { from: string; to: string }[]; redirects?: { from: string; to: string }[] };
      };
      const alias = new Map<string, string>();
      for (const n of [...(json.query?.normalized ?? []), ...(json.query?.redirects ?? [])]) alias.set(n.to, n.from);
      for (const p of Object.values(json.query?.pages ?? {})) {
        const e = { extract: p.extract?.trim() || undefined, thumb: p.thumbnail?.source };
        found.set(p.title, e);
        const from = alias.get(p.title);
        if (from) found.set(from, e);
      }
    } catch {
      /* best-effort */
    }
  }
  return found;
};

// Wikidata P18 image (Commons) for a batch of QIDs, via wbgetentities.
const fetchWikidataImages = async (qids: readonly string[]): Promise<Map<string, string>> => {
  const img = new Map<string, string>();
  for (const batch of chunk([...new Set(qids)], 45)) {
    const url = new URL('https://www.wikidata.org/w/api.php');
    url.search = new URLSearchParams({ action: 'wbgetentities', format: 'json', ids: batch.join('|'), props: 'claims', languages: 'en' }).toString();
    try {
      const json = (await (await fetch(url, { headers: { 'user-agent': UA } })).json()) as {
        entities?: Record<string, { claims?: { P18?: { mainsnak?: { datavalue?: { value?: string } } }[] } }>;
      };
      for (const [qid, ent] of Object.entries(json.entities ?? {})) {
        const file = ent.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
        if (file) img.set(qid, `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`);
      }
    } catch {
      /* best-effort */
    }
  }
  return img;
};

const enrich = async (places: Place[]): Promise<void> => {
  const titles: Record<Lang, string[]> = { en: [], it: [], ru: [] };
  const titleOf: Record<Lang, Map<string, string>> = { en: new Map(), it: new Map(), ru: new Map() };
  const qids: string[] = [];
  for (const p of places) {
    const tag = (p as Place & { wpTag?: string; qid?: string });
    if (tag.qid) qids.push(tag.qid);
    const [wl, ...rest] = (tag.wpTag ?? '').split(':');
    if (rest.length > 0 && LANGS.includes(wl as Lang)) {
      const lang = wl as Lang, title = rest.join(':');
      titles[lang].push(title);
      titleOf[lang].set(p.id, title);
      p.wiki = { ...(p.wiki ?? { en: undefined, it: undefined, ru: undefined }), [lang]: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}` } as Record<Lang, string | undefined>;
    }
  }
  console.log(`· enriching ${qids.length} wikidata + wiki extracts…`);
  const images = await fetchWikidataImages(qids);
  for (const p of places) {
    const qid = (p as Place & { qid?: string }).qid;
    if (qid && !p.img && images.has(qid)) p.img = images.get(qid);
  }
  const extracts: Record<Lang, Map<string, { extract?: string; thumb?: string }>> = {
    en: await fetchExtracts('en', titles.en),
    it: await fetchExtracts('it', titles.it),
    ru: await fetchExtracts('ru', titles.ru),
  };
  for (const p of places) {
    // Wikipedia extract wins per-language, but keep the OSM `description` base
    // for languages Wikipedia doesn't cover.
    const desc: Record<Lang, string | undefined> = { ...(p.desc ?? { en: undefined, it: undefined, ru: undefined }) };
    for (const lang of LANGS) {
      const title = titleOf[lang].get(p.id);
      const ex = title ? extracts[lang].get(title) : undefined;
      if (ex?.extract) desc[lang] = ex.extract;
      if (!p.img && ex?.thumb) p.img = ex.thumb;
    }
    if (desc.en || desc.it || desc.ru) p.desc = desc;
  }
};

/* ── write per-locale ───────────────────────────────────────────────────────── */

const pick = (m: Record<Lang, string | undefined> | undefined, lang: Lang): string | undefined =>
  m ? (m[lang] ?? m.en) : undefined;

// Compact rows (short keys, absent fields omitted) — the wire format follows
// CompactEvent's philosophy. decode-places.ts expands them. region is dropped
// (it IS the shard filename); Overture UUIDs shortened per region below.
const localize = (p: Place, lang: Lang) => ({
  i: p.id,
  n: p.name,
  c: p.cat,
  a: p.lat,
  o: p.lng,
  ...(p.website ? { w: p.website } : {}),
  ...(pick(p.desc, lang) ? { d: pick(p.desc, lang) } : {}),
  ...(p.hours ? { h: p.hours } : {}),
  ...(p.rating ? { r: p.rating } : {}),
  ...(pick(p.wiki, lang) ? { k: pick(p.wiki, lang) } : {}),
  ...(p.wd ? { q: p.wd } : {}),
  ...(p.img ? { m: commonsImg(p.img, 800) } : {}),
});

// Build ONE region → per-locale shards `public/data/places/<region>.<lang>.json`.
const buildRegion = async (region: string): Promise<void> => {
  console.log(`\n═══ ${region} (${REGION_GEO[region]!.iso}) ═══`);
  const overture = readOverture(region);
  console.log(`· Overture: ${overture.length} venue places (filtered)`);
  console.log('· querying Overpass…');
  const osm = await readOsm(region);
  console.log(`  OSM: ${osm.length} venue places`);
  // Refuse to write a degraded (Overture-only) shard over a good one.
  if (osm.length === 0) throw new Error(`${region}: OSM returned 0 places — aborting`);
  const merged = merge(osm, overture);
  console.log(`· merged: ${merged.length} places`);
  await enrich(merged);

  merged.sort((a, b) => a.id.localeCompare(b.id));
  // Shorten Overture UUIDs to `ovt:<base36>` (kept prefix for source detection);
  // OSM ids stay (they reconstruct the osm.org link). Counter is per region — a
  // token collision across regions is fine (the region is in the detail path).
  let oi = 0;
  for (const p of merged) if (p.id.startsWith('ovt:')) p.id = `ovt:${(oi++).toString(36)}`;
  mkdirSync(new URL('../public/data/places/', import.meta.url), { recursive: true });
  for (const lang of LANGS) {
    const view = merged.map((p) => localize(p, lang));
    writeFileSync(new URL(`../public/data/places/${region}.${lang}.json`, import.meta.url), `${JSON.stringify(view, undefined, 0)}\n`);
  }
  console.log(`✓ ${region}: ${merged.length} places → shards (${merged.filter((p) => p.img).length} img, ${merged.filter((p) => p.desc).length} desc, ${merged.filter((p) => p.hours).length} hours, ${merged.filter((p) => p.rating).length} rating)`);
};

const main = async (): Promise<void> => {
  console.log(`Building places for: ${REGIONS.join(', ')}`);
  for (const region of REGIONS) {
    try {
      await buildRegion(region);
    } catch (e) {
      console.error(`✗ ${region} failed:`, e instanceof Error ? e.message : e);
      process.exitCode = 1;
    }
  }
};

await main();
