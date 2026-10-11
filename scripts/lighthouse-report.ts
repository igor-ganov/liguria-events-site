/*
 * The site as Lighthouse scores it, once a day, published where the morning
 * report can read it: https://dovego.it/uploads/reports/lighthouse.json.
 *
 *   bun run scripts/lighthouse-report.ts
 *
 * Four pages stand for the four kinds the site has — a feed, an event, the map
 * and the calendar — audited as a phone on a slow connection, which is how
 * Lighthouse scores by default and how most readers arrive. Each page is run
 * RUNS times and the median of every figure is kept: one run of a throttled
 * audit moves by ten points on its own.
 *
 * Without Cloudflare credentials it prints the report and stores nothing.
 */
import { Schema } from 'effect';
import { putObject } from './lib/r2-objects.ts';
import type { R2Access } from './lib/r2-objects.ts';

const BASE = (process.env.LIGHTHOUSE_BASE ?? 'https://dovego.it').replace(/\/$/, '');
const RUNS = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const KEY = 'reports/lighthouse.json';

const Audit = Schema.Struct({ numericValue: Schema.optional(Schema.Number) });
// A category Lighthouse could not score carries no number; it counts as zero.
const Category = Schema.Struct({ score: Schema.Unknown });
const ResultSchema = Schema.Struct({
  categories: Schema.Struct({
    performance: Category,
    accessibility: Category,
    'best-practices': Category,
    seo: Category,
  }),
  audits: Schema.Struct({
    'first-contentful-paint': Audit,
    'largest-contentful-paint': Audit,
    'total-blocking-time': Audit,
    'cumulative-layout-shift': Audit,
    'speed-index': Audit,
  }),
});
type Result = typeof ResultSchema.Type;

type Figures = Readonly<{
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fcpMs: number;
  lcpMs: number;
  tbtMs: number;
  cls: number;
  siMs: number;
}>;

const pct = (score: unknown): number => Math.round(([score].filter((value) => typeof value === 'number')[0] ?? 0) * 100);

const figuresOf = (result: Result): Figures => ({
  performance: pct(result.categories.performance.score),
  accessibility: pct(result.categories.accessibility.score),
  bestPractices: pct(result.categories['best-practices'].score),
  seo: pct(result.categories.seo.score),
  fcpMs: Math.round(result.audits['first-contentful-paint'].numericValue ?? 0),
  lcpMs: Math.round(result.audits['largest-contentful-paint'].numericValue ?? 0),
  tbtMs: Math.round(result.audits['total-blocking-time'].numericValue ?? 0),
  cls: Math.round((result.audits['cumulative-layout-shift'].numericValue ?? 0) * 1000) / 1000,
  siMs: Math.round(result.audits['speed-index'].numericValue ?? 0),
});

const median = (values: readonly number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

const FIELDS = ['performance', 'accessibility', 'bestPractices', 'seo', 'fcpMs', 'lcpMs', 'tbtMs', 'cls', 'siMs'] as const;

const middle = (runs: readonly Figures[]): Figures => {
  const of = (field: (typeof FIELDS)[number]): number => median(runs.map((run) => run[field]));
  return {
    performance: of('performance'),
    accessibility: of('accessibility'),
    bestPractices: of('bestPractices'),
    seo: of('seo'),
    fcpMs: of('fcpMs'),
    lcpMs: of('lcpMs'),
    tbtMs: of('tbtMs'),
    cls: of('cls'),
    siMs: of('siMs'),
  };
};

// What a page loses points for outside speed: the checks of the three other
// categories that did not pass. A score says something is wrong; this says what.
const ChecksSchema = Schema.Struct({
  categories: Schema.Record({
    key: Schema.String,
    value: Schema.Struct({ auditRefs: Schema.Array(Schema.Struct({ id: Schema.String, weight: Schema.Number })) }),
  }),
  audits: Schema.Record({ key: Schema.String, value: Schema.Struct({ score: Schema.Unknown }) }),
});
const CHECKED = ['accessibility', 'best-practices', 'seo'];

const failingOf = (raw: unknown): readonly string[] => {
  const { categories, audits } = Schema.decodeUnknownSync(ChecksSchema)(raw);
  return CHECKED.flatMap((name) => categories[name]?.auditRefs ?? [])
    .filter((ref) => ref.weight > 0)
    .map((ref) => ref.id)
    .filter((id) => typeof audits[id]?.score === 'number' && audits[id].score < 1);
};

type Audited = Readonly<{ figures: Figures; failing: readonly string[] }>;

const audit = async (url: string): Promise<Audited> => {
  const run = Bun.spawn(
    ['bunx', 'lighthouse', url, '--quiet', '--output=json', '--output-path=stdout', '--chrome-flags=--headless=new --no-sandbox'],
    { stdout: 'pipe', stderr: 'ignore' },
  );
  const text = await new Response(run.stdout).text();
  await run.exited;
  const raw: unknown = JSON.parse(text);
  return { figures: figuresOf(Schema.decodeUnknownSync(ResultSchema)(raw)), failing: failingOf(raw) };
};

// One at a time: two audits at once share the processor each is measuring.
const several = async (url: string, left: number, done: readonly Audited[] = []): Promise<readonly Audited[]> =>
  left === 0 ? done : several(url, left - 1, [...done, await audit(url)]);

// An event that is still ahead, so the page is the live one and not an archive.
const anEvent = async (): Promise<string> => {
  const sitemap = await (await fetch(`${BASE}/sitemap-upcoming.xml`)).text();
  return /<loc>([^<]+)<\/loc>/.exec(sitemap)?.[1] ?? `${BASE}/it/liguria/`;
};

const access = (): R2Access | undefined => {
  const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_EMAIL: email, CLOUDFLARE_API_KEY: key } = process.env;
  return account && email && key ? { account, email, key, bucket: process.env.REPORTS_BUCKET ?? 'dovego-uploads' } : undefined;
};

const main = async (): Promise<void> => {
  const targets = [
    { name: 'feed', url: `${BASE}/it/liguria/` },
    { name: 'event', url: await anEvent() },
    { name: 'map', url: `${BASE}/it/liguria/map/` },
    { name: 'calendar', url: `${BASE}/it/liguria/calendar/` },
  ];
  const pages: Readonly<Record<string, unknown>>[] = [];
  for (const target of targets) {
    const runs = await several(target.url, RUNS);
    const failing = [...new Set(runs.flatMap((run) => run.failing))].sort();
    pages.push({ ...target, ...middle(runs.map((run) => run.figures)), failing });
    console.info(JSON.stringify(pages.at(-1)));
  }
  const report = JSON.stringify({ at: new Date().toISOString(), runs: RUNS, pages });
  const r2 = access();
  if (r2 === undefined) return console.info('lighthouse: no Cloudflare credentials, nothing stored');
  await putObject(r2, KEY, new TextEncoder().encode(report), 'application/json');
  console.info(`lighthouse: stored ${KEY}`);
};

await main();
