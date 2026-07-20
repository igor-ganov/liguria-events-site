/*
 * Post-deploy smoke check — hits the LIVE site and fails (exit 1) if a class of
 * bug that unit tests can't see has shipped: a region shard gone missing/empty,
 * the worker-SSR detail route broken, or a hero image URL that's http or a
 * Wikimedia-rejected /<N>px- thumb (the bugs that actually reached users).
 *
 *   SMOKE_BASE=https://dovego.it bun run scripts/smoke.ts
 *
 * External image hosts are NOT fetched (Wikimedia 429s under load and that's
 * not our regression) — we assert the URL our page emits is well-formed.
 */
import { slug } from '../src/lib/slug.ts';

const BASE = (process.env.SMOKE_BASE ?? 'https://dovego.it').replace(/\/$/, '');
const TILES = process.env.SMOKE_TILES ?? 'https://tiles.dovego.it';
const UA = 'DoveGo-smoke/1.0 (+https://dovego.it)';

type Check = Readonly<{ name: string; run: () => Promise<void> }>;
const ok = (cond: boolean, msg: string): void => { if (!cond) throw new Error(msg); };
const get = (url: string): Promise<Response> => fetch(url, { headers: { 'user-agent': UA } });

const shardCheck = (kind: string, region: string): Check => ({
  name: `${kind}/${region} shard`,
  run: async () => {
    const res = await get(`${BASE}/data/${kind}/${region}.en.json`);
    ok(res.ok, `${kind}/${region}.en.json → ${res.status}`);
    const rows = (await res.json()) as unknown[];
    ok(Array.isArray(rows) && rows.length > 0, `${kind}/${region}.en.json empty`);
  },
});

const detailCheck = (region: string): Check => ({
  name: `SSR landmark detail (${region})`,
  run: async () => {
    const rows = (await (await get(`${BASE}/data/landmarks/${region}.en.json`)).json()) as
      ReadonlyArray<{ id: string; name: string; img?: string }>;
    const item = rows.find((l) => l.img);
    ok(item !== undefined, `${region}: no landmark with an image`);
    const url = `${BASE}/landmark/${region}/${slug.of(item.name, item.id)}/`;
    const res = await get(url);
    ok(res.ok, `${url} → ${res.status}`);
    const html = await res.text();
    ok(html.includes(item.name), `${url}: name not server-rendered`);
    const m = html.match(/class="event-hero"[^>]*>\s*<img src="([^"]+)"/);
    ok(m !== null, `${url}: no hero image`);
    const src = (m?.[1] ?? '').replace(/&amp;/g, '&');
    ok(src.startsWith('https://'), `hero image not https: ${src}`);
    ok(!/\/\d+px-/.test(src), `hero image is a rejected thumb width: ${src}`);
  },
});

const pageCheck = (path: string): Check => ({
  name: `page ${path}`,
  run: async () => {
    const res = await get(`${BASE}${path}`);
    ok(res.ok, `${path} → ${res.status}`);
  },
});

const tilesCheck: Check = {
  name: 'detail basemap tiles',
  run: async () => {
    const res = await fetch(`${TILES}/liguria.pmtiles`, { headers: { range: 'bytes=0-99', 'user-agent': UA } });
    ok(res.status === 206 || res.status === 200, `liguria.pmtiles → ${res.status}`);
  },
};

// Cover the north AND the south — a north-only smoke is why a south-wide outage
// once slipped through green.
const CHECKS: readonly Check[] = [
  pageCheck('/liguria/map/'),
  shardCheck('places', 'lombardia'),
  shardCheck('places', 'sicilia'),
  shardCheck('landmarks', 'lazio'),
  shardCheck('landmarks', 'campania'),
  detailCheck('lazio'),
  detailCheck('sicilia'),
  tilesCheck,
];

const runAll = async (): Promise<string[]> => {
  const results = await Promise.all(
    CHECKS.map(async (c) => {
      try {
        await c.run();
        console.log(`  ✓ ${c.name}`);
        return undefined;
      } catch (e) {
        return `${c.name}: ${e instanceof Error ? e.message : String(e)}`;
      }
    }),
  );
  return results.filter((r): r is string => r !== undefined);
};

// A fresh deploy takes a moment to propagate on the edge — retry the whole set.
const ATTEMPTS = 4;
let failures: string[] = [];
for (let i = 1; i <= ATTEMPTS; i += 1) {
  console.log(`\nSmoke against ${BASE} (attempt ${i}/${ATTEMPTS})`);
  failures = await runAll();
  if (failures.length === 0) break;
  if (i < ATTEMPTS) {
    console.log(`  … ${failures.length} failing, waiting for propagation`);
    await new Promise((r) => setTimeout(r, 15000));
  }
}

if (failures.length > 0) {
  console.error(`\n✗ smoke failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\n✓ all smoke checks passed');
