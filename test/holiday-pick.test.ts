// On a holiday the event of the day is the holiday's. On Halloween 2026 the
// site wore pumpkins while its event of the day was a plant sale: the pick
// scored both 14 and the id settled the tie.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { picksOf } from '../src/lib/picks/picks-of.ts';
import { festiveIds } from '../src/lib/holidays/festive-ids.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { Holiday } from '../src/lib/holidays/decode-holidays.ts';

const TODAY = '2026-10-31';
const event = (id: string, over: Partial<CompactEvent> = {}): CompactEvent => ({
  id,
  t: `Event ${id}`,
  s: TODAY,
  c: ['music'],
  u: `https://example.test/${id}`,
  img: `https://img.test/${id}.jpg`,
  ...over,
});
const holiday = (themeFrom: string, themeTo: string, events: readonly string[]): Holiday => ({
  id: 'halloween',
  name: { en: 'Halloween', it: 'Halloween', ru: 'Halloween' },
  themeFrom,
  themeTo,
  theme: { accent: '#b34700', accentDark: '#ffcc00', motif: 'pumpkin' },
  events,
});

describe('the event of the day on a holiday', () => {
  test('is the holiday’s even when another event scores as well or better', () => {
    const picks = picksOf([event('a-plant-sale', { x: true }), event('z-halloween')], TODAY, new Set(['z-halloween']));
    assert.equal(picks.day?.id, 'z-halloween');
  });

  test('is the best of the holiday’s events', () => {
    const picks = picksOf([event('party'), event('ghost-tour', { h: '21:00' })], TODAY, new Set(['party', 'ghost-tour']));
    assert.equal(picks.day?.id, 'ghost-tour');
  });

  test('is still on today and has a photograph', () => {
    const festive = new Set(['tomorrow', 'bare', 'tonight']);
    const corpus = [event('tomorrow', { s: '2026-11-01' }), event('bare', { img: undefined }), event('tonight'), event('other', { x: true })];
    assert.equal(picksOf(corpus, TODAY, festive).day?.id, 'tonight');
  });

  test('falls back to the usual pick when none of the holiday’s events is on', () => {
    assert.equal(picksOf([event('plain'), event('gem', { x: true })], TODAY, new Set(['gone'])).day?.id, 'gem');
  });

  test('leaves the week and the month to the usual rule', () => {
    const corpus = [event('party'), event('gem', { x: true }), event('later', { s: '2026-11-03', x: true })];
    const picks = picksOf(corpus, TODAY, new Set(['party']));
    assert.deepEqual([picks.day?.id, picks.week?.id], ['party', 'gem']);
  });
});

describe('the holiday’s events on a day', () => {
  const halloween = holiday('2026-10-29', '2026-10-31', ['p', 'q']);

  test('are those of a holiday whose window holds the day', () => {
    assert.deepEqual([...festiveIds([halloween], TODAY)], ['p', 'q']);
  });

  test('are none the day after it', () => {
    assert.equal(festiveIds([halloween], '2026-11-01').size, 0);
  });

  test('are none before it begins', () => {
    assert.equal(festiveIds([halloween], '2026-10-28').size, 0);
  });
});
