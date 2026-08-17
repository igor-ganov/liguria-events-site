// Pure helpers pulled out of EventDetail.astro: the owner bar's status label,
// the crawler address fallback, the programme's ordering and the OG image URL.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { statusLabel } from '../src/lib/events/status-label.ts';
import { crawlerAddress } from '../src/lib/events/crawler-address.ts';
import { bySessionOrder } from '../src/lib/events/by-session-order.ts';
import { programmeSessions } from '../src/lib/events/programme-sessions.ts';
import { absoluteImage } from '../src/lib/img/absolute-image.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Concerto',
  s: '2026-07-04',
  c: ['music'],
  u: 'https://example.test/e1',
  ...over,
});

describe('statusLabel', () => {
  test('spells out the known statuses', () => {
    assert.equal(statusLabel('pending'), 'Pending review');
    assert.equal(statusLabel('published'), 'Published');
  });
  test('shows an unknown status as it is, and nothing at all when absent', () => {
    assert.equal(statusLabel('draft'), 'draft');
    assert.equal(statusLabel(undefined), '');
  });
});

describe('crawlerAddress', () => {
  test('surfaces the crawler address when it adds detail', () => {
    assert.equal(crawlerAddress(event({ a: 'Via Roma 1', v: 'Teatro Carlo Felice' })), 'Via Roma 1');
  });
  test('yields to an owner-submitted address', () => {
    assert.equal(crawlerAddress(event({ a: 'Via Roma 1' }), 'Piazza De Ferrari 2'), undefined);
  });
  test('stays quiet when it only repeats the venue, or is missing', () => {
    assert.equal(crawlerAddress(event({ a: 'Teatro', v: 'Teatro' })), undefined);
    assert.equal(crawlerAddress(event({ v: 'Teatro' })), undefined);
  });
});

describe('bySessionOrder', () => {
  test('orders by date, then by time', () => {
    assert.ok(bySessionOrder({ date: '2026-07-04' }, { date: '2026-07-06' }) < 0);
    assert.ok(bySessionOrder({ date: '2026-07-06' }, { date: '2026-07-04' }) > 0);
    assert.ok(
      bySessionOrder({ date: '2026-07-04', time: '19:00' }, { date: '2026-07-04', time: '21:00' }) <
        0,
    );
    assert.equal(bySessionOrder({ date: '2026-07-04' }, { date: '2026-07-04' }), 0);
  });
});

describe('programmeSessions', () => {
  test('formats and sorts every occurrence, keeping its own time and title', () => {
    const sessions = programmeSessions(
      event({
        p: [
          { date: '2026-07-06', title: 'Second night' },
          { date: '2026-07-04', time: '21:00' },
        ],
      }),
      'en',
    );
    assert.equal(sessions.length, 2);
    assert.equal(sessions[0]?.time, '21:00');
    assert.equal(sessions[1]?.title, 'Second night');
    assert.ok((sessions[0]?.date ?? '').includes('Jul'));
  });
  test('is empty for an event without a programme', () => {
    assert.deepEqual(programmeSessions(event(), 'en'), []);
  });
});

describe('absoluteImage', () => {
  test('resolves the cover against the site origin', () => {
    const url = absoluteImage('https://img.test/a.jpg', new URL('https://dovego.it'));
    assert.ok((url ?? '').startsWith('http'));
  });
  test('is undefined without a cover', () => {
    assert.equal(absoluteImage(undefined, new URL('https://dovego.it')), undefined);
  });
});
