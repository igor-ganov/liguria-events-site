// The event page lists its programme as dated leaves, built from whatever the
// source happened to give.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { programmeLeaves } from '../src/lib/events/programme-leaves.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent> = {}): CompactEvent => ({
  id: 'e1',
  t: 'Orlando furioso',
  s: '2026-10-04',
  c: ['theatre'],
  u: 'https://example.test/e1',
  ...over,
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
