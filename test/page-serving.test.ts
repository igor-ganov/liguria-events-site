// How a page reaches the reader.
//
// The first version answered pages from the network and kept a copy for the
// case where there was none. That is a fallback, not an offline app: every
// navigation still waited for a server, and a page nobody had opened yet was
// simply missing.
//
// It is the other way round now. A page the device has is shown immediately,
// the network is asked behind it, and the reader is told how old what they are
// looking at is — always, not only when the signal is gone. The rules that
// decide all of that are here.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { freshnessLine } from '../src/lib/pwa/freshness-line.ts';
import { freshnessOver } from '../src/lib/pwa/freshness-over.ts';
import { assetImports } from '../src/sw/asset-imports.ts';
import { pageAssets } from '../src/sw/page-assets.ts';
import { stateRequest } from '../src/sw/state-request.ts';
import { warmRequest } from '../src/sw/warm-request.ts';
import { strategyOf } from '../src/sw/strategy-of.ts';
import { warmable } from '../src/sw/warmable.ts';

const ORIGIN = 'https://dovego.it';
const nav = (path: string) => ({ method: 'GET', mode: 'navigate', url: `${ORIGIN}${path}` });

describe('strategyOf', () => {
  test('a public page comes from the device first, and the network catches up', () => {
    // The whole point: no navigation waits for a server it may not reach.
    assert.equal(strategyOf(nav('/liguria/'), ORIGIN), 'page-first');
    assert.equal(strategyOf(nav('/liguria/calendar/'), ORIGIN), 'page-first');
    assert.equal(strategyOf(nav('/event/concerto-2026-12-05-51a5e3abbc8f/'), ORIGIN), 'page-first');
  });

  test('a page belonging to one person is still never touched', () => {
    ['/submit/', '/admin/', '/auth/verify'].forEach((path) => {
      assert.equal(strategyOf(nav(path), ORIGIN), 'network-only', path);
    });
  });
});

describe('warmable', () => {
  const links = [
    '/liguria/',
    '/liguria/calendar/',
    '/liguria/map/',
    '/event/fiera-2026-12-05-51a5e3abbc8f/',
    '/submit/',
    '/api/auth/me',
    'https://tiles.dovego.it/italy.pmtiles',
    '/liguria/',
  ];

  test('the pages a reader can reach from here, ready before they ask', () => {
    // Fetched quietly after the page they are on has finished loading, so the
    // next tap is instant whether or not there is a signal by then.
    const warm = warmable(links, ORIGIN);
    assert.ok(warm.includes('/liguria/calendar/'));
    assert.ok(warm.includes('/liguria/map/'));
    assert.ok(warm.includes('/event/fiera-2026-12-05-51a5e3abbc8f/'));
  });

  test('nothing personal and nothing off-site is warmed', () => {
    const warm = warmable(links, ORIGIN);
    assert.ok(!warm.includes('/submit/'));
    assert.ok(!warm.includes('/api/auth/me'));
    assert.ok(!warm.some((url) => url.includes('tiles.dovego.it')));
  });

  test('each page once, however many links point at it', () => {
    assert.equal(warmable(links, ORIGIN).filter((url) => url === '/liguria/').length, 1);
  });

  test('the events on the feed are not crowded out by the region switcher', () => {
    // Every page carries a list of every region in its header, and those come
    // first in the markup. Taking the first handful in document order meant a
    // reader offline had eleven region feeds and not one of the events they
    // were actually looking at.
    const header = Array.from({ length: 20 }, (_, index) => `/region-${index}/`);
    const events = Array.from({ length: 20 }, (_, index) => `/event/x-2026-12-05-${index}aaaaaaaaaa/`);
    const warm = warmable([...header, ...events], ORIGIN);
    assert.ok(warm.filter((path) => path.startsWith('/event/')).length >= 5, warm.join(' '));
    assert.ok(warm.filter((path) => !path.startsWith('/event/')).length >= 5, warm.join(' '));
  });

  test('a reader is not made to download the whole site', () => {
    // Warming is a courtesy on somebody's data plan, not a mirror.
    const many = Array.from({ length: 200 }, (_, index) => `/event/x-2026-12-05-${index}aaaaaaaaaa/`);
    assert.ok(warmable(many, ORIGIN).length <= 20, String(warmable(many, ORIGIN).length));
  });
});

describe('freshnessLine', () => {
  const words = {
    offline: 'No connection. Showing what was saved {when}.',
    saved: 'Showing what was saved {when}.',
    updated: 'A newer version is ready.',
  };

  test('a page from the network says nothing at all', () => {
    assert.equal(freshnessLine(words, { from: 'network', age: 'now', updated: false }), '');
  });

  test('a stored page always says how old it is, signal or no signal', () => {
    // The part that must never be skipped. A reader looking at yesterday's
    // events has to be told, and being online does not make a stored page
    // current — the copy is as old as it is either way.
    assert.equal(
      freshnessLine(words, { from: 'store', age: '2 hours ago', updated: false }),
      'Showing what was saved 2 hours ago.',
    );
  });

  test('with no connection it says that too, because it changes what to do', () => {
    assert.equal(
      freshnessLine(words, { from: 'store', age: '2 hours ago', updated: false, offline: true }),
      'No connection. Showing what was saved 2 hours ago.',
    );
  });

  test('once something newer has arrived, that is the thing worth saying', () => {
    assert.equal(freshnessLine(words, { from: 'store', age: '2 hours ago', updated: true }), 'A newer version is ready.');
  });
});

describe('warmRequest into warmable', () => {
  test('the events at the bottom of a long page are still reachable', () => {
    // A feed carries four hundred links: the header repeats the navigation on
    // every card, and the events themselves come last. Reading only the first
    // few dozen meant a reader offline held the navigation and nothing else.
    const links = [
      ...Array.from({ length: 300 }, (_, index) => `/region-${index}/`),
      '/event/fiera-2026-12-05-51a5e3abbc8f/',
    ];
    const warm = warmable(warmRequest({ kind: 'warm', links }), ORIGIN);
    assert.ok(warm.includes('/event/fiera-2026-12-05-51a5e3abbc8f/'), warm.join(' '));
  });
});

describe('pageAssets', () => {
  const html = [
    '<html><head>',
    '<link rel="stylesheet" href="/_astro/page.abc.css" />',
    '<link rel="canonical" href="https://dovego.it/liguria/map/" />',
    '<script type="module" src="/_astro/map.def.js"></script>',
    '<script type="module" src="https://dovego.it/_astro/map.def.js"></script>',
    '<script src="https://tiles.dovego.it/other.js"></script>',
    '<img src="/uploads/a.jpg" />',
    '</head></html>',
  ].join('');

  test('a stored page keeps what makes it work', () => {
    // Without this the map page came off the device and sat on its loading
    // skeleton: the file that starts the map had never been fetched.
    const assets = pageAssets(html, ORIGIN);
    assert.ok(assets.includes('/_astro/map.def.js'));
    assert.ok(assets.includes('/_astro/page.abc.css'));
  });

  test('nothing off-site, nothing that is not a script or a stylesheet', () => {
    const assets = pageAssets(html, ORIGIN);
    assert.ok(!assets.some((path) => path.includes('tiles.dovego.it')));
    assert.ok(!assets.includes('/liguria/map/'));
    assert.ok(!assets.includes('/uploads/a.jpg'));
  });

  test('each file once, however it was written', () => {
    assert.equal(pageAssets(html, ORIGIN).filter((path) => path === '/_astro/map.def.js').length, 1);
  });
});

describe('assetImports', () => {
  const code = [
    'import{a as b}from"./chunk.DEF.js";',
    'import"/_astro/side.GHI.js";',
    'const later=()=>import("./engine.JKL.js");',
    'import x from"https://cdn.example.com/thing.js";',
    'const url="./style.MNO.css";',
  ].join('');

  test('what a module needs before it can run', () => {
    // A chunk whose first import is missing fails as completely as one that
    // was never fetched, and the page then behaves as if it had no scripts.
    const found = assetImports(code, '/_astro/entry.ABC.js', ORIGIN);
    assert.ok(found.includes('/_astro/chunk.DEF.js'));
    assert.ok(found.includes('/_astro/side.GHI.js'));
  });

  test('what it only loads when asked is left to be asked for', () => {
    // The map engine is a megabyte behind an `import()`. Fetching it on the
    // chance of a tunnel is not a courtesy, and the page says so when it
    // cannot reach it.
    assert.ok(!assetImports(code, '/_astro/entry.ABC.js', ORIGIN).includes('/_astro/engine.JKL.js'));
  });

  test('nothing off-site, and nothing that is not a module', () => {
    const found = assetImports(code, '/_astro/entry.ABC.js', ORIGIN);
    assert.ok(!found.some((path) => path.includes('cdn.example.com')));
    assert.ok(!found.some((path) => path.endsWith('.css')));
  });
});

describe('freshnessOver', () => {
  // What the worker found behind the page, turned into what the bar adds to
  // the age it is already showing.
  test('something newer behind the page is offered', () => {
    assert.deepEqual(freshnessOver('fresh'), { updated: true, offline: false });
  });

  test('checked and unchanged claims nothing', () => {
    // The bug this exists to prevent: a check that reached the site and found
    // the same page used to be reported as "no connection", so a reader with a
    // perfectly good connection was told they had none.
    assert.deepEqual(freshnessOver('same'), { updated: false, offline: false });
  });

  test('a check that could not reach the site is the only thing that says so', () => {
    assert.deepEqual(freshnessOver('offline'), { updated: false, offline: true });
  });

  test('anything else says nothing', () => {
    assert.deepEqual(freshnessOver('nonsense'), { updated: false, offline: false });
  });
});

describe('stateRequest', () => {
  // A page asks what became of the copy it is showing. It has to ask: while
  // the worker answers a navigation, the document that navigation produces is
  // not a client yet, so there is nobody to push the outcome to.
  test('the page a document is asking about', () => {
    assert.equal(stateRequest({ kind: 'state', url: 'https://dovego.it/liguria/' }), 'https://dovego.it/liguria/');
  });

  test('anything else is not an answerable question', () => {
    [{ kind: 'warm', links: ['/liguria/'] }, { kind: 'state' }, 'state', undefined].forEach((data) => {
      assert.equal(stateRequest(data), undefined, JSON.stringify(data));
    });
  });
});
