// The event page says its facts as numbers on tiles and its programme as
// calendar leaves. Both are built from whatever the source happened to give,
// and most sources give little — so the rule that matters is that a tile
// exists only for a fact we hold. A tile reading "—" is worse than no tile.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventTiles } from '../src/lib/events/event-tiles.ts';
import { programmeLeaves } from '../src/lib/events/programme-leaves.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const labels = { starts: 'starts', dates: 'dates', duration: 'lasts', price: 'from' };
const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Orlando furioso',
  s: '2026-10-04',
  c: ['theatre'],
  u: 'https://example.test/e1',
  ...over,
});
const tiles = (over: Partial<CompactEvent> = {}, lang: 'en' | 'it' | 'ru' = 'en') =>
  eventTiles({ event: event(over), lang, labels });
const byKey = (list: ReturnType<typeof tiles>, key: string) => list.find((tile) => tile.key === key);

describe('the tiles of an event', () => {
  test('a bare event has one: the day, under its month', () => {
    assert.deepEqual(tiles(), [{ key: 'when', icon: 'calendar', value: '4', label: 'October' }]);
  });

  test('the month is named in the language of the page', () => {
    assert.equal(byKey(tiles({}, 'it'), 'when')?.label, 'ottobre');
    assert.equal(byKey(tiles({}, 'ru'), 'when')?.label, 'октябрь');
  });

  test('a run inside one month is two day numbers', () => {
    const when = byKey(tiles({ s: '2026-10-08', e: '2026-10-18' }), 'when');
    assert.equal(when?.value, '8–18');
    assert.equal(when?.label, 'October');
  });

  test('a run across months says both, under its year', () => {
    const when = byKey(tiles({ s: '2026-10-28', e: '2026-11-03' }), 'when');
    assert.equal(when?.value, '28.10–03.11');
    assert.equal(when?.label, '2026');
  });

  test('the hour gets a tile when there is one', () => {
    assert.deepEqual(byKey(tiles({ h: '20:30' }), 'starts'), { key: 'starts', icon: 'clock', value: '20:30', label: 'starts' });
    assert.equal(byKey(tiles(), 'starts'), undefined);
  });

  test('a programme is counted in days, not in sessions', () => {
    const p = [
      { date: '2026-10-08', time: '20:30' },
      { date: '2026-10-08', time: '22:30' },
      { date: '2026-10-09', time: '20:30' },
    ];
    assert.equal(byKey(tiles({ p }), 'dates')?.value, '2');
  });

  test('one date is not worth a tile', () => {
    assert.equal(byKey(tiles({ p: [{ date: '2026-10-08' }] }), 'dates'), undefined);
  });

  test('a duration is hours and minutes, and whole hours drop the minutes', () => {
    assert.match(byKey(tiles({ du: 90 }), 'duration')?.value ?? '', /^1\D+30\D*$/);
    assert.match(byKey(tiles({ du: 120 }), 'duration')?.value ?? '', /^2\D*$/);
    assert.match(byKey(tiles({ du: 45 }), 'duration')?.value ?? '', /^45\D*$/);
  });

  test('a price is in euro, with no cents nobody stated', () => {
    const price = byKey(tiles({ pr: 15 }), 'price');
    assert.match(price?.value ?? '', /15/);
    assert.match(price?.value ?? '', /€/);
    assert.ok(!(price?.value ?? '').includes('00'));
    assert.equal(price?.label, 'from');
  });

  test('they come in one order whatever the event holds', () => {
    const all = tiles({ h: '20:30', du: 90, pr: 15, p: [{ date: '2026-10-08' }, { date: '2026-10-09' }] });
    assert.deepEqual(all.map((tile) => tile.key), ['when', 'starts', 'dates', 'duration', 'price']);
  });
});

describe('the leaves of a programme', () => {
  const visit = event({
    p: [
      { date: '2026-10-04', time: '14:20', title: 'Ponte Monumentale' },
      { date: '2026-10-03', time: '14:30', title: 'Cittadella di Campi' },
      { date: '2026-10-03', time: '10:00', title: 'Cittadella di Campi' },
      { date: '2026-10-04', time: '11:00', title: 'Ponte Monumentale' },
      { date: '2026-10-04', title: 'Ponte Monumentale' },
    ],
  });

  test('are one per day and title, in the order they happen', () => {
    assert.deepEqual(
      programmeLeaves(visit, 'en').map((leaf) => `${leaf.iso} ${leaf.title}`),
      ['2026-10-03 Cittadella di Campi', '2026-10-04 Ponte Monumentale'],
    );
  });

  test('carry the weekday, the day number and every hour', () => {
    const [first] = programmeLeaves(visit, 'en');
    assert.equal(first?.weekday, 'Sat');
    assert.equal(first?.day, '3');
    assert.deepEqual(first?.times, ['10:00', '14:30']);
  });

  test('name the weekday in the language of the page', () => {
    assert.equal(programmeLeaves(visit, 'it')[0]?.weekday, 'sab');
  });

  test('an event with no programme has no leaves', () => {
    assert.deepEqual(programmeLeaves(event(), 'en'), []);
  });
});

describe('the leaves a reader still can go to', () => {
  const leaf = (iso: string) => ({ iso, weekday: '', day: '', month: '', times: [], title: undefined });
  test('are the ones from today on', async () => {
    const { upcomingLeaves } = await import('../src/lib/events/upcoming-leaves.ts');
    const kept = upcomingLeaves([leaf('2026-01-25'), leaf('2026-10-04'), leaf('2026-11-29')], '2026-10-04');
    assert.deepEqual(kept.map((item) => item.iso), ['2026-10-04', '2026-11-29']);
  });
  test('or all of them when the run is over, so the page of a past event still says when it was', async () => {
    const { upcomingLeaves } = await import('../src/lib/events/upcoming-leaves.ts');
    assert.equal(upcomingLeaves([leaf('2026-01-25'), leaf('2026-02-22')], '2026-10-04').length, 2);
  });
});
