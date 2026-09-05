// What a page is allowed to cost, in every form factor.
//
// Two regressions this page has already suffered are guarded here, both
// invisible to a "does it render" check because the page renders correctly
// either way — it just takes twenty seconds on a real connection.
//
// The layout-shift budget earned its keep on 2026-09-05: it caught the header
// reflowing when the web fonts swapped in, a CLS of 0.79 that moved the whole
// page under the reader's thumb about a second into a Fast-3G load. See
// src/styles/filo-faces.css for what that cost and what fixed it.
import { expect, test } from './kit/index.ts';

const FEED = { cls: 0.1, lcpMs: 4000, biggestJsKb: 250 };

// Layout shift only. Under an artificially narrowed connection on a machine
// running four browsers, the largest paint says more about the machine than
// about the page — and a budget nobody can hold the product to is a budget
// people learn to rerun. What throttling DOES make meaningful is the shift:
// that is where the font swap showed up. The map's weight is guarded by the
// eager-bytes test below, which is a fact about the build and not about time.
const MAP = { cls: 0.1 };

test('the feed stays inside its budget, and the map bundle is not shipped here', async ({
  app,
  perf,
}) => {
  await app.open('/liguria/');
  await app.find('.feed-list').first().waitFor({ state: 'visible' });
  await app.quiet();
  await perf.within(FEED);
});

test('the map stays inside its budget once it has drawn, on a slow link', async ({
  app,
  connection,
  perf,
}) => {
  // Throttled on purpose: everything fits on a desktop connection, and the
  // shift this budget exists to catch only appeared when the pipe was narrow
  // enough for the fonts to land a second after the first paint.
  await connection.slow();
  await app.open('/liguria/map/');
  await app.find('canvas.maplibregl-canvas').waitFor({ state: 'visible' });
  // Not settled: a map streams tiles for as long as it is on screen, so there
  // is no moment when nothing is in flight. The canvas is the state that says
  // the page has done its job.
  await perf.within(MAP);
});

test('the corpus is not inlined and the engine is not on the critical path', async ({ app }) => {
  await app.open('/liguria/map/');
  const html = await app.page.content();

  // The corpus used to be inlined here: 2.6 MB of JSON ahead of first paint.
  expect(html, 'the corpus is fetched, not inlined').not.toContain('id="events-data"');

  // maplibre, pmtiles and the basemap style (~1.1 MB together) must stay behind
  // the dynamic import in init-map.ts, so no eager <script src> may pull them
  // in. Measured by bytes actually downloaded, not by counting files: a split
  // that produces two eager chunks instead of one is still a regression.
  const eager = await app
    .find('head script[src], body script[src]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('src') ?? ''));
  const eagerKb = await app.page.evaluate(
    (sources) =>
      Math.round(
        performance
          .getEntriesByType('resource')
          .filter((entry) => sources.some((src) => src !== '' && entry.name.endsWith(src)))
          .reduce((sum, entry) => sum + Number(Reflect.get(entry, 'encodedBodySize') ?? 0), 0) / 1024,
      ),
    eager,
  );
  expect(eagerKb, 'eagerly loaded script').toBeLessThan(150);
});
