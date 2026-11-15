// Every hour the site prints is one somebody can turn up at, in Rome's own
// offset on the day it happens. A container's umbrella hour describes the run
// in general; where its sessions state other hours, printing the umbrella's
// sends a reader to the wrong one ("Mostra della Zucca" says 18:00, every
// morning of it starts at 10:00). The offsets are checked on the two nights the
// clocks change, and the feed of new events is stamped with Rome's offset, not
// with Greenwich mistaken for Rome.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { cardWhen } from '../src/lib/og/card-when.ts';
import { eventDateTime } from '../src/lib/seo/event-datetime.ts';
import { eventRssItems } from '../src/lib/seo/event-rss-items.ts';
import { eventTiles } from '../src/lib/events/event-tiles.ts';
import { formatWhen } from '../src/lib/events/format-when.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: `Event ${over.id}`,
  s: '2026-11-07',
  c: ['food'],
  u: 'https://example.org/e',
  ...over,
});

const zucca = ev({
  id: 'zucca',
  e: '2026-11-15',
  h: '18:00',
  k: true,
  p: [
    { date: '2026-11-07', time: '10:30' },
    { date: '2026-11-15', time: '10:00' },
  ],
});

const weekly = ev({
  id: 'weekly',
  e: '2026-11-24',
  h: '15:30',
  k: true,
  p: [{ date: '2026-11-10', time: '15:30' }, { date: '2026-11-17' }, { date: '2026-11-24', time: '15:30' }],
});

const labels = { starts: 'starts', dates: 'dates', duration: 'lasts', price: 'from' };
const startsTile = (event: CompactEvent): string | undefined =>
  eventTiles({ event, lang: 'en', labels }).find((tile) => tile.key === 'starts')?.value;

describe('the hour a container is printed with', () => {
  test('the event page states no single start when the sessions start at other hours', () => {
    assert.equal(startsTile(zucca), undefined);
  });
  test('…and states it when every session starts then', () => {
    assert.equal(startsTile(weekly), '15:30');
  });
  test('a standalone event keeps its own hour', () => {
    assert.equal(startsTile(ev({ id: 'one', h: '21:00' })), '21:00');
  });
  test('the map card and the share card say the run, not the umbrella hour', () => {
    assert.equal(formatWhen(zucca), '07.11–15.11');
    assert.equal(cardWhen(zucca), '07.11–15.11');
    assert.equal(formatWhen(weekly), '07.11–24.11 · 15:30');
  });
});

describe("Rome's offset on the nights the clocks change", () => {
  test('2026-10-25: before 03:00 it is still summer time', () => {
    assert.equal(eventDateTime('2026-10-25', '01:30'), '2026-10-25T01:30:00+02:00');
    assert.equal(eventDateTime('2026-10-25', '00:00'), '2026-10-25T00:00:00+02:00');
    assert.equal(eventDateTime('2026-10-25', '21:00'), '2026-10-25T21:00:00+01:00');
  });
  test('2027-03-28: before 02:00 it is still winter time', () => {
    assert.equal(eventDateTime('2027-03-28', '01:00'), '2027-03-28T01:00:00+01:00');
    assert.equal(eventDateTime('2027-03-28', '03:00'), '2027-03-28T03:00:00+02:00');
    assert.equal(eventDateTime('2027-03-28', '21:00'), '2027-03-28T21:00:00+02:00');
  });
  test('the hour that does not exist (02:30 on 2027-03-28) is read as summer time', () => {
    assert.equal(eventDateTime('2027-03-28', '02:30'), '2027-03-28T02:30:00+02:00');
  });
  test('ordinary days are untouched', () => {
    assert.equal(eventDateTime('2026-08-20', '21:00'), '2026-08-20T21:00:00+02:00');
    assert.equal(eventDateTime('2026-01-20', '00:30'), '2026-01-20T00:30:00+01:00');
  });
});

describe('the RSS feed', () => {
  const pub = (event: CompactEvent): string =>
    eventRssItems([event], '2026-01-01', new URL('https://dovego.it')).at(0)?.pubDate ?? '';
  test('a 21:00 concert in November is 20:00 GMT', () => {
    assert.equal(pub(ev({ id: 'a', s: '2026-11-20', h: '21:00' })), 'Fri, 20 Nov 2026 20:00:00 GMT');
  });
  test('a 21:00 concert in August is 19:00 GMT', () => {
    assert.equal(pub(ev({ id: 'b', s: '2026-08-20', h: '21:00' })), 'Thu, 20 Aug 2026 19:00:00 GMT');
  });
  test('an event with no hour is dated noon in Rome', () => {
    assert.equal(pub(ev({ id: 'c', s: '2026-11-20' })), 'Fri, 20 Nov 2026 11:00:00 GMT');
  });
});
