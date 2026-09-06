// A service worker is the one piece of a site that outlives a bad deploy: it
// sits in front of every request the browser makes, and a caching rule that is
// wrong serves the wrong page until the user clears storage. So the routing
// table is a pure function with a test, not a chain of conditions inside a
// fetch listener nobody can run.
//
// The shape of the rules: pages go to the network first (this site is server
// rendered — a cached HTML page is a stale event), hashed assets come from the
// cache, and anything that carries a session or a mutation is never touched.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { strategyOf } from '../src/sw/strategy-of.ts';
import { CACHE_NAME } from '../src/sw/cache-name.ts';
import { PRECACHE_URLS } from '../src/sw/precache-urls.ts';

const ORIGIN = 'https://dovego.it';
const nav = (path: string) => ({ method: 'GET', mode: 'navigate', url: `${ORIGIN}${path}` });
const get = (path: string) => ({ method: 'GET', mode: 'no-cors', url: `${ORIGIN}${path}` });

describe('strategyOf', () => {
  test('a page is fetched from the network, with the cache only as a fallback', () => {
    assert.equal(strategyOf(nav('/liguria/'), ORIGIN), 'network-first');
    assert.equal(strategyOf(nav('/event/concerto-2026-12-05-51a5e3abbc8f/'), ORIGIN), 'network-first');
    assert.equal(strategyOf(nav('/submit/'), ORIGIN), 'network-first');
  });

  test('hashed and long-lived assets come from the cache', () => {
    assert.equal(strategyOf(get('/_astro/map.DhX1.js'), ORIGIN), 'cache-first');
    assert.equal(strategyOf(get('/fonts/rubik-latin.woff2'), ORIGIN), 'cache-first');
    assert.equal(strategyOf(get('/sprite/icons.svg'), ORIGIN), 'cache-first');
    assert.equal(strategyOf(get('/icons/icon-192.png'), ORIGIN), 'cache-first');
  });

  test("the offline page's own script comes from the cache", () => {
    // Precached with the page. Left to the network it is fetched over a
    // connection that, by the time anybody sees that page, is not there.
    assert.equal(strategyOf(get('/offline.js'), ORIGIN), 'cache-first');
  });

  test('the shard data is served from the cache and refreshed behind it', () => {
    assert.equal(strategyOf(get('/data/places-liguria.json'), ORIGIN), 'stale-while-revalidate');
  });

  test('anything carrying a session or a mutation is never intercepted', () => {
    assert.equal(strategyOf(nav('/admin/'), ORIGIN), 'network-only');
    assert.equal(strategyOf(get('/api/favorites'), ORIGIN), 'network-only');
    assert.equal(strategyOf(nav('/auth/verify'), ORIGIN), 'network-only');
    // A POST is a mutation whatever it addresses.
    assert.equal(strategyOf({ ...nav('/submit/'), method: 'POST' }, ORIGIN), 'network-only');
  });

  test('the link-preview card and user uploads are left to the server', () => {
    assert.equal(strategyOf(get('/og/51a5e3abbc8f.png'), ORIGIN), 'network-only');
    assert.equal(strategyOf(get('/uploads/abc.jpg'), ORIGIN), 'network-only');
  });

  test('another origin is none of our business', () => {
    // The map tiles are on tiles.dovego.it and the browser caches them itself.
    assert.equal(strategyOf({ ...get('/italy.pmtiles'), url: 'https://tiles.dovego.it/italy.pmtiles' }, ORIGIN), 'network-only');
    // A prefix match must be on the origin, not on the string starting with it.
    assert.equal(strategyOf({ ...get('/_astro/x.js'), url: 'https://dovego.it.evil.example/_astro/x.js' }, ORIGIN), 'network-only');
  });

  test('an unrecognised same-origin request is left alone rather than guessed at', () => {
    assert.equal(strategyOf(get('/robots.txt'), ORIGIN), 'network-only');
  });
});

describe('the precache', () => {
  test('holds the offline page, and stays small enough to be worth precaching', () => {
    assert.ok(PRECACHE_URLS.includes('/offline/'), PRECACHE_URLS.join(' '));
    assert.ok(PRECACHE_URLS.length <= 4, `${PRECACHE_URLS.length} urls precached`);
    PRECACHE_URLS.forEach((url) => assert.ok(url.startsWith('/'), url));
  });

  test('the cache name carries a version, so a new worker can drop the old one', () => {
    assert.match(CACHE_NAME, /^dovego-v\d+$/);
  });
});
