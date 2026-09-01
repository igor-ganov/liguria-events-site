import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventDetailView } from '../src/lib/events/event-detail-view.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Concerto',
  s: '2026-08-20',
  c: ['music'],
  u: 'https://source/1',
  ct: 'genova',
  rg: 'liguria',
  ...over,
});

const view = (event: CompactEvent, today: string) =>
  eventDetailView({ lang: 'en', event, address: undefined, site: SITE, today });

describe('eventDetailView', () => {
  test('an event still to come is not marked as passed', () => {
    assert.equal(view(ev({ id: 'a' }), '2026-08-18').passed, false);
  });

  test('an event that has happened is marked, so the page can say so', () => {
    // The page is kept alive on purpose — the link somebody shared has to keep
    // working — which makes saying "this is over" the whole job.
    assert.equal(view(ev({ id: 'a' }), '2026-08-21').passed, true);
  });

  test('a run is over only once its last day is', () => {
    const run = ev({ id: 'a', s: '2026-08-01', e: '2026-08-31' });
    assert.equal(view(run, '2026-08-21').passed, false);
    assert.equal(view(run, '2026-09-01').passed, true);
  });

  test('a container is judged by its programme, not by the run it advertises', () => {
    const spent = ev({ id: 'a', s: '2026-08-01', e: '2026-08-31', k: true, p: [{ date: '2026-08-05' }] });
    assert.equal(view(spent, '2026-08-21').passed, true);
  });

  test('the canonical URL and structured data are built from the same event', () => {
    const built = view(ev({ id: 'abc', v: 'Teatro' }), '2026-08-18');
    const json = JSON.parse(built.jsonLd.replace(/\\u003c/g, '<'));
    assert.equal(json['url'], 'https://dovego.it/event/concerto-teatro-2026-08-20-abc/');
    assert.equal(json['name'], built.title);
    assert.equal(built.region, 'liguria');
  });
});
