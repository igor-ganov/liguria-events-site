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
import { stateRequest } from '../src/sw/state-request.ts';
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

  test('a reader is not made to download the whole site', () => {
    // Warming is a courtesy on somebody's data plan, not a mirror.
    const many = Array.from({ length: 200 }, (_, index) => `/event/x-2026-12-05-${index}aaaaaaaaaa/`);
    assert.ok(warmable(many, ORIGIN).length <= 12, String(warmable(many, ORIGIN).length));
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
