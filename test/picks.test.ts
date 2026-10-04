// The event of the day, of the week and of the month, and the strip of what is
// on this week. Nobody curates these, so the rule has to be one a reader would
// agree with: it is really on in that period, it has a photograph (it is shown
// as one), the hidden gems and the things several sources wrote about come
// first, and the same event is not offered three times.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { picksOf } from '../src/lib/picks/picks-of.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const TODAY = '2026-10-05';
const event = (id: string, over: Partial<CompactEvent> = {}): CompactEvent => ({
  id,
  t: `Event ${id}`,
  s: TODAY,
  c: ['music'],
  u: `https://example.test/${id}`,
  img: `https://img.test/${id}.jpg`,
  ...over,
});

describe('the event of the day', () => {
  test('is on today', () => {
    const picks = picksOf([event('tomorrow', { s: '2026-10-06', x: true }), event('today')], TODAY);
    assert.equal(picks.day?.id, 'today');
  });

  test('has a photograph, because it is shown as one', () => {
    const picks = picksOf([event('bare', { img: undefined, x: true }), event('pictured')], TODAY);
    assert.equal(picks.day?.id, 'pictured');
  });

  test('is a hidden gem before it is anything else', () => {
    assert.equal(picksOf([event('plain'), event('gem', { x: true })], TODAY).day?.id, 'gem');
  });

  test('is what several sources wrote about before what one did', () => {
    const covered = event('covered', { l: [{ source: 'a', url: 'https://a', image: 'https://a/1.jpg' }] });
    assert.equal(picksOf([event('alone'), covered], TODAY).day?.id, 'covered');
  });

  test('is one evening before it is a three-month exhibition', () => {
    const picks = picksOf([event('show', { s: '2026-08-01', e: '2026-11-01' }), event('night', { h: '21:00' })], TODAY);
    assert.equal(picks.day?.id, 'night');
  });

  test('is nothing when nothing with a photograph is on', () => {
    assert.equal(picksOf([event('later', { s: '2026-12-01' })], TODAY).day, undefined);
  });

  test('is the same every time it is asked on the same day', () => {
    const corpus = ['a', 'b', 'c', 'd'].map((id) => event(id));
    assert.equal(picksOf(corpus, TODAY).day?.id, picksOf([...corpus].reverse(), TODAY).day?.id);
  });
});

describe('the week and the month', () => {
  const corpus = [
    event('today', { x: true }),
    event('thisweek', { s: '2026-10-08', x: true }),
    event('thismonth', { s: '2026-10-25', x: true }),
    event('nextyear', { s: '2027-03-01', x: true }),
  ];
  const picks = picksOf(corpus, TODAY);

  test('each get their own event: nothing is offered twice', () => {
    assert.deepEqual([picks.day?.id, picks.week?.id, picks.month?.id], ['today', 'thisweek', 'thismonth']);
  });

  test('stay inside their period', () => {
    const far = picksOf([event('nextyear', { s: '2027-03-01', x: true })], TODAY);
    assert.deepEqual([far.day, far.week, far.month], [undefined, undefined, undefined]);
  });
});

describe('the strip of this week', () => {
  const week = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'];

  test('lists what is on in the next seven days, without the three already picked', () => {
    const corpus = week.map((day, n) => event(`e${n}`, { s: day }));
    const picks = picksOf(corpus, TODAY);
    const picked = [picks.day?.id, picks.week?.id, picks.month?.id];
    assert.equal(picks.strip.some((item) => picked.includes(item.id)), false);
    assert.equal(picks.strip.every((item) => item.s >= TODAY && item.s <= '2026-10-11'), true);
  });

  test('is empty rather than thin: fewer than four is not a selection', () => {
    assert.deepEqual(picksOf([event('a'), event('b'), event('c')], TODAY).strip, []);
  });

  test('says one event once, though its programme has several evenings', () => {
    const run = week.map((day) => event('same', { s: day }));
    const others = ['p', 'q', 'r', 's', 't', 'u'].map((id) => event(id));
    const ids = picksOf([...run, ...others], TODAY).strip.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});

describe('the order of the strip', () => {
  test('is the order of the week, not the order of merit', () => {
    const days = ['2026-10-09', '2026-10-06', '2026-10-10', '2026-10-07', '2026-10-08', '2026-10-05', '2026-10-11'];
    // The later ones are the gems, so merit alone would put them first.
    const corpus = days.map((day, n) => event(`e${n}`, { s: day, x: day > '2026-10-08' }));
    const dates = picksOf(corpus, TODAY).strip.map((item) => item.s);
    assert.deepEqual(dates, [...dates].sort());
    assert.ok(dates.length >= 4);
  });
});
