/*
 * Build src/data/landmarks.json by merging two open sources into one dataset:
 *
 *   Wikidata  — authoritative names (en/it/ru), coordinates, an image and the
 *               Wikipedia article title per language (for the description).
 *   OSM       — broad coverage; its `wikidata` tag is the join key, so an OSM
 *               feature that names a Wikidata item folds into that entry rather
 *               than duplicating it, and everything else lands as an OSM entry.
 *
 * Descriptions come from a batched Wikipedia extract call per language.
 *
 * Run:  bun run scripts/build-landmarks.ts   (writes the JSON, prints a summary)
 * External APIs are hit at BUILD time only — the site imports the committed JSON.
 */
import { writeFile } from 'node:fs/promises';

const UA = 'DoveGo-landmarks/1.0 (https://dovego.it; igor.ganov@gmail.com)';
const REGION = 'liguria';
// Liguria bounding box (lon/lat), a touch generous; entries are tagged `liguria`.
const BOX = { swLon: 7.49, swLat: 43.75, neLon: 10.07, neLat: 44.68 };

type Lang = 'en' | 'it' | 'ru';
const LANGS: readonly Lang[] = ['en', 'it', 'ru'];

type Text = { en: string; it?: string; ru?: string };
type Kind =
  | 'castle' | 'church' | 'museum' | 'palace' | 'monument' | 'tower'
  | 'lighthouse' | 'square' | 'park' | 'heritage' | 'beach' | 'attraction';

type Landmark = {
  id: string;
  name: Text;
  lat: number;
  lng: number;
  kind: Kind;
  region: string;
  img?: string;
  desc?: Text;
  wiki?: Text;
  wd?: string;
  src: ('wikidata' | 'osm')[];
};

/* ── Wikidata ─────────────────────────────────────────────────────────────── */

// Landmark classes (instance-of). Order matters: earlier wins when an item
// carries several, so `castle` beats a generic `attraction`.
const WD_KIND: Record<string, Kind> = {
  Q23413: 'castle', Q57821: 'castle', Q12518: 'tower',
  Q16970: 'church', Q2977: 'church', Q163687: 'church', Q44613: 'church',
  Q160742: 'church', Q33506: 'museum', Q16560: 'palace', Q1440476: 'palace',
  Q4989906: 'monument', Q5003624: 'monument', Q39715: 'lighthouse',
  Q174782: 'square', Q22698: 'park', Q1107656: 'park', Q167346: 'park',
  Q839954: 'heritage', Q40080: 'beach',
  Q207694: 'attraction', Q43501: 'attraction', Q24354: 'attraction',
  Q153562: 'attraction', Q570116: 'attraction',
};
const WD_VALUES = Object.keys(WD_KIND).map((q) => `wd:${q}`).join(' ');

const SPARQL = `SELECT ?item ?kind ?lat ?lon ?nameEn ?nameIt ?nameRu ?image ?enTitle ?itTitle ?ruTitle WHERE {
  SERVICE wikibase:box {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:cornerSouthWest "Point(${BOX.swLon} ${BOX.swLat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:cornerNorthEast "Point(${BOX.neLon} ${BOX.neLat})"^^geo:wktLiteral .
  }
  ?item wdt:P31 ?kind . VALUES ?kind { ${WD_VALUES} }
  ?item p:P625/psv:P625 ?node .
  ?node wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon .
  OPTIONAL { ?item rdfs:label ?nameEn FILTER(LANG(?nameEn)="en") }
  OPTIONAL { ?item rdfs:label ?nameIt FILTER(LANG(?nameIt)="it") }
  OPTIONAL { ?item rdfs:label ?nameRu FILTER(LANG(?nameRu)="ru") }
  OPTIONAL { ?item wdt:P18 ?image }
  OPTIONAL { ?a schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?enTitle }
  OPTIONAL { ?b schema:about ?item ; schema:isPartOf <https://it.wikipedia.org/> ; schema:name ?itTitle }
  OPTIONAL { ?c schema:about ?item ; schema:isPartOf <https://ru.wikipedia.org/> ; schema:name ?ruTitle }
}`;

type Cell = { value: string } | undefined;
type Row = Record<string, Cell>;

const cell = (row: Row, key: string): string | undefined => row[key]?.value;
const qid = (uri: string): string => uri.split('/').pop() ?? uri;
const commons = (url: string): string =>
  `${url}${url.includes('?') ? '&' : '?'}width=800`;

type WdEntry = Landmark & { enTitle?: string; itTitle?: string; ruTitle?: string };

const fetchWikidata = async (): Promise<Map<string, WdEntry>> => {
  const res = await fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/sparql-results+json',
      'user-agent': UA,
    },
    body: new URLSearchParams({ query: SPARQL }),
  });
  if (!res.ok) throw new Error(`Wikidata ${res.status}`);
  const json = (await res.json()) as { results: { bindings: Row[] } };
  const out = new Map<string, WdEntry>();
  for (const row of json.results.bindings) {
    const id = qid(cell(row, 'item') ?? '');
    const kind = WD_KIND[qid(cell(row, 'kind') ?? '')] ?? 'attraction';
    const en = cell(row, 'nameEn');
    const existing = out.get(id);
    // Keep the higher-priority kind (lower index in WD_KIND insertion order).
    if (existing) {
      const rank = (k: Kind): number => Object.values(WD_KIND).indexOf(k);
      if (rank(kind) < rank(existing.kind)) existing.kind = kind;
      existing.img ??= cell(row, 'image') ? commons(cell(row, 'image') ?? '') : undefined;
      continue;
    }
    out.set(id, {
      id: `wd:${id}`,
      name: { en: en ?? cell(row, 'nameIt') ?? cell(row, 'nameRu') ?? id, it: cell(row, 'nameIt'), ru: cell(row, 'nameRu') },
      lat: Number(cell(row, 'lat')),
      lng: Number(cell(row, 'lon')),
      kind,
      region: REGION,
      img: cell(row, 'image') ? commons(cell(row, 'image') ?? '') : undefined,
      wd: `https://www.wikidata.org/wiki/${id}`,
      src: ['wikidata'],
      enTitle: cell(row, 'enTitle'),
      itTitle: cell(row, 'itTitle'),
      ruTitle: cell(row, 'ruTitle'),
    });
  }
  return out;
};

/* ── OpenStreetMap (Overpass) ─────────────────────────────────────────────── */

const OVERPASS = `[out:json][timeout:120];
area["ISO3166-2"="IT-42"]->.lig;
(
  nwr["tourism"~"^(attraction|museum|viewpoint|artwork|gallery|aquarium|zoo|theme_park)$"](area.lig);
  nwr["historic"]["name"](area.lig);
  nwr["man_made"~"^(lighthouse|tower)$"]["name"](area.lig);
  nwr["heritage"]["name"](area.lig);
  nwr["amenity"="theatre"]["name"](area.lig);
  nwr["leisure"~"^(park|garden)$"]["name"]["wikidata"](area.lig);
  nwr["natural"="beach"]["name"]["wikidata"](area.lig);
);
out center tags;`;

type OsmEl = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const osmKind = (t: Record<string, string>): Kind => {
  const h = t['historic'] ?? '';
  if (t['man_made'] === 'lighthouse') return 'lighthouse';
  if (t['man_made'] === 'tower' || h === 'tower') return 'tower';
  if (h === 'castle' || h === 'fort' || h === 'city_gate') return 'castle';
  if (t['tourism'] === 'museum' || t['tourism'] === 'gallery') return 'museum';
  if (t['amenity'] === 'place_of_worship' || h === 'church' || h === 'monastery') return 'church';
  if (h === 'monument' || h === 'memorial') return 'monument';
  if (t['historic'] === 'archaeological_site' || t['historic'] === 'ruins' || t['heritage']) return 'heritage';
  if (t['natural'] === 'beach') return 'beach';
  if (t['leisure'] === 'park' || t['leisure'] === 'garden') return 'park';
  return 'attraction';
};

const osmName = (t: Record<string, string>): Text | undefined => {
  const en = t['name:en'] ?? t['int_name'];
  const base = t['name'] ?? en ?? t['name:it'];
  if (!base) return undefined;
  return { en: en ?? base, it: t['name:it'], ru: t['name:ru'] };
};

type OsmParsed = { el: OsmEl; lat: number; lng: number; tags: Record<string, string>; name: Text };

const fetchOverpass = async (): Promise<OsmParsed[]> => {
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': UA },
    body: new URLSearchParams({ data: OVERPASS }),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const json = (await res.json()) as { elements: OsmEl[] };
  const out: OsmParsed[] = [];
  for (const el of json.elements) {
    const tags = el.tags ?? {};
    const name = osmName(tags);
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!name || lat === undefined || lng === undefined) continue;
    out.push({ el, lat, lng, tags, name });
  }
  return out;
};

/* ── Wikipedia extracts (batched, 2 sentences) ────────────────────────────── */

const chunk = <T>(xs: readonly T[], size: number): T[][] =>
  xs.reduce<T[][]>((acc, x, i) => {
    if (i % size === 0) acc.push([]);
    (acc.at(-1) ?? []).push(x);
    return acc;
  }, []);

type Extract = { extract?: string; thumb?: string };

const fetchExtracts = async (lang: Lang, titles: readonly string[]): Promise<Map<string, Extract>> => {
  const found = new Map<string, Extract>();
  for (const batch of chunk([...new Set(titles)], 20)) {
    const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
    url.search = new URLSearchParams({
      action: 'query', format: 'json', prop: 'extracts|pageimages',
      exintro: '1', explaintext: '1', exsentences: '2',
      piprop: 'thumbnail', pithumbsize: '800', redirects: '1',
      titles: batch.join('|'),
    }).toString();
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      const json = (await res.json()) as {
        query?: {
          pages?: Record<string, { title: string; extract?: string; thumbnail?: { source: string } }>;
          normalized?: { from: string; to: string }[];
          redirects?: { from: string; to: string }[];
        };
      };
      const pages = Object.values(json.query?.pages ?? {});
      const alias = new Map<string, string>();
      for (const n of [...(json.query?.normalized ?? []), ...(json.query?.redirects ?? [])]) alias.set(n.to, n.from);
      for (const p of pages) {
        const entry: Extract = { extract: p.extract?.trim() || undefined, thumb: p.thumbnail?.source };
        found.set(p.title, entry);
        const from = alias.get(p.title);
        if (from) found.set(from, entry);
      }
    } catch {
      /* skip a failed batch — descriptions are best-effort */
    }
  }
  return found;
};

/* ── merge ────────────────────────────────────────────────────────────────── */

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// ~45 m at Liguria's latitude — close enough to be the same place.
const near = (a: Landmark, b: OsmParsed): boolean =>
  Math.abs(a.lat - b.lat) < 0.0004 && Math.abs(a.lng - b.lng) < 0.0006;

const wikiTag = (tags: Record<string, string>): { lang: Lang; title: string } | undefined => {
  const raw = tags['wikipedia'];
  const [lang, ...rest] = (raw ?? '').split(':');
  if (rest.length === 0 || !LANGS.includes(lang as Lang)) return undefined;
  return { lang: lang as Lang, title: rest.join(':') };
};

const build = async (): Promise<Landmark[]> => {
  console.log('· querying Wikidata…');
  const wd = await fetchWikidata().catch((e: unknown) => {
    console.error('  Wikidata failed:', e);
    return new Map<string, WdEntry>();
  });
  console.log(`  ${wd.size} Wikidata landmarks`);

  console.log('· querying Overpass…');
  const osm = await fetchOverpass().catch((e: unknown) => {
    console.error('  Overpass failed:', e);
    return [] as OsmParsed[];
  });
  console.log(`  ${osm.length} OSM features`);

  const byQid = new Map<string, WdEntry>();
  for (const e of wd.values()) byQid.set(e.id.slice(3), e);
  const landmarks: Landmark[] = [...wd.values()];

  // Titles the descriptions will be fetched for, per language.
  const titles: Record<Lang, string[]> = { en: [], it: [], ru: [] };
  const titleOf: Record<Lang, Map<string, string>> = { en: new Map(), it: new Map(), ru: new Map() };
  for (const e of wd.values()) {
    const t: Record<Lang, string | undefined> = { en: e.enTitle, it: e.itTitle, ru: e.ruTitle };
    for (const lang of LANGS) {
      const title = t[lang];
      if (title) { titles[lang].push(title); titleOf[lang].set(e.id, title); }
    }
  }

  let mergedOsm = 0;
  let addedOsm = 0;
  for (const o of osm) {
    const tagQid = o.tags['wikidata'];
    const anchor = tagQid && byQid.get(tagQid);
    if (anchor) {
      // Fold OSM names in where Wikidata is missing them; record provenance.
      anchor.name.en ||= o.name.en;
      anchor.name.it ??= o.name.it;
      anchor.name.ru ??= o.name.ru;
      if (!anchor.src.includes('osm')) anchor.src.push('osm');
      mergedOsm += 1;
      continue;
    }
    const dup = landmarks.find((l) => near(l, o) && norm(l.name.en) === norm(o.name.en));
    if (dup) { if (!dup.src.includes('osm')) dup.src.push('osm'); continue; }
    const kind = osmKind(o.tags);
    const entry: Landmark = {
      id: `osm:${o.el.type}/${o.el.id}`,
      name: o.name,
      lat: Number(o.lat.toFixed(6)),
      lng: Number(o.lng.toFixed(6)),
      kind,
      region: REGION,
      wd: tagQid ? `https://www.wikidata.org/wiki/${tagQid}` : undefined,
      src: ['osm'],
    };
    const wt = wikiTag(o.tags);
    if (wt) { titles[wt.lang].push(wt.title); titleOf[wt.lang].set(entry.id, wt.title); }
    landmarks.push(entry);
    addedOsm += 1;
  }
  console.log(`  merged ${mergedOsm} into Wikidata, added ${addedOsm} OSM-only`);

  console.log('· fetching Wikipedia extracts…');
  const extracts: Record<Lang, Map<string, Extract>> = {
    en: await fetchExtracts('en', titles.en),
    it: await fetchExtracts('it', titles.it),
    ru: await fetchExtracts('ru', titles.ru),
  };

  for (const l of landmarks) {
    const desc: Text = { en: '' };
    const wiki: Text = { en: '' };
    let any = false;
    let wikiAny = false;
    for (const lang of LANGS) {
      const title = titleOf[lang].get(l.id);
      if (!title) continue;
      wiki[lang] = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
      wikiAny = true;
      const ex = extracts[lang].get(title);
      if (ex?.extract) { desc[lang] = ex.extract; any = true; }
      if (!l.img && ex?.thumb) l.img = ex.thumb;
    }
    if (any) { desc.en ||= desc.it ?? desc.ru ?? ''; l.desc = desc; }
    if (wikiAny) { wiki.en ||= wiki.it ?? wiki.ru ?? ''; l.wiki = wiki; }
  }

  // Notability gate: keep only what is worth showing — an entry with a
  // Wikipedia article, a description or an image. A bare OSM name-point with
  // neither is noise on a "landmarks" showcase, and it triples the payload.
  const notable = landmarks.filter((l) => l.wiki || l.desc || l.img);

  // Strip the build-only helper fields before serialisation.
  const clean = notable.map((l) => {
    const { enTitle, itTitle, ruTitle, ...rest } = l as WdEntry;
    void enTitle; void itTitle; void ruTitle;
    return rest as Landmark;
  });
  clean.sort((a, b) => a.id.localeCompare(b.id));
  return clean;
};

const pick = (t: Text | undefined, lang: Lang): string | undefined =>
  t ? (t[lang] ?? t.en) : undefined;

// The site is browsed one locale at a time, so each locale ships only its own
// resolved strings — a third of the payload, and the only file the client fetches.
const localize = (l: Landmark, lang: Lang) => ({
  id: l.id,
  name: pick(l.name, lang) ?? l.name.en,
  lat: l.lat,
  lng: l.lng,
  kind: l.kind,
  region: l.region,
  ...(l.img ? { img: l.img } : {}),
  ...(pick(l.desc, lang) ? { desc: pick(l.desc, lang) } : {}),
  ...(pick(l.wiki, lang) ? { wiki: pick(l.wiki, lang) } : {}),
  ...(l.wd ? { wd: l.wd } : {}),
});

const main = async (): Promise<void> => {
  const landmarks = await build();
  // Per-locale compact assets are the committed runtime data, fetched on demand
  // by the map layer + page. Regenerated by re-running this script (see the
  // weekly refresh workflow); the prod deploy never hits these external APIs.
  for (const lang of LANGS) {
    const view = landmarks.map((l) => localize(l, lang));
    await writeFile(
      new URL(`../public/data/landmarks.${lang}.json`, import.meta.url),
      `${JSON.stringify(view, undefined, 0)}\n`,
    );
  }
  const withDesc = landmarks.filter((l) => l.desc).length;
  const withImg = landmarks.filter((l) => l.img).length;
  const byKind = landmarks.reduce<Record<string, number>>((acc, l) => {
    acc[l.kind] = (acc[l.kind] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n✓ ${landmarks.length} landmarks → master + ${LANGS.length} locale assets`);
  console.log(`  ${withImg} with image, ${withDesc} with description`);
  console.log(`  by kind:`, byKind);
};

await main();
