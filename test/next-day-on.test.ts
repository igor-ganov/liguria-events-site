import { describe, expect, test } from 'bun:test';
import { nextDayOn } from '../src/lib/events/next-day-on.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const event = (over: Partial<CompactEvent>): CompactEvent => ({ id: 'e', t: 'Show', s: '2026-02-06', c: ['theatre'], u: '', ...over });

describe('nextDayOn', () => {
  test('a run that opened in February is on today', () => {
    expect(nextDayOn('2026-10-25')(event({ e: '2026-12-31' }))).toBe('2026-10-25');
  });

  test('an event still ahead is on its first day', () => {
    expect(nextDayOn('2026-10-25')(event({ s: '2026-10-30' }))).toBe('2026-10-30');
  });

  test('a container is on its next session, not on the days between', () => {
    const series = event({ s: '2026-10-20', e: '2026-11-20', k: true, p: [{ date: '2026-10-20' }, { date: '2026-11-03' }, { date: '2026-11-20' }] });
    expect(nextDayOn('2026-10-25')(series)).toBe('2026-11-03');
  });
});
