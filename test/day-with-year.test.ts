// The archive spans months and seasons, so a date without its year reads as
// this year — and "12 Settembre" for something that happened in 2025 is a lie
// the feed's own headings never had to tell.
import { describe, expect, test } from 'bun:test';
import { dayWithYear } from '../src/lib/calendar/day-with-year.ts';
import type { Ui } from '../src/lib/i18n/ui-schema.ts';

// monthsIn, not months: this label is read inside a sentence, and Italian
// writes "5 ottobre" with a small letter where a heading writes "Ottobre".
const ui = {
  monthsIn: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
} as unknown as Ui;

describe('dayWithYear', () => {
  test('names the day, the month and the year', () => {
    expect(dayWithYear(ui)('2026-09-12')).toBe('12 settembre 2026');
    expect(dayWithYear(ui)('2025-01-01')).toBe('1 gennaio 2025');
  });

  test('a run says both ends', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-08-31')).toBe('1 luglio – 31 agosto 2026');
  });

  test('a run inside one month does not repeat the month', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-07-05')).toBe('1 – 5 luglio 2026');
  });

  test('a one-day run is one day', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-07-01')).toBe('1 luglio 2026');
  });
});
