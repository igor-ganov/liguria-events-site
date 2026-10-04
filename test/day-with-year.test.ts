// The archive spans months and seasons, so a date without its year reads as
// this year — and "12 Settembre" for something that happened in 2025 is a lie
// the feed's own headings never had to tell.
import { describe, expect, test } from 'bun:test';
import { dayWithYear } from '../src/lib/calendar/day-with-year.ts';
import type { Ui } from '../src/lib/i18n/ui-schema.ts';

const ui = {
  months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
} as unknown as Ui;

describe('dayWithYear', () => {
  test('names the day, the month and the year', () => {
    expect(dayWithYear(ui)('2026-09-12')).toBe('12 Settembre 2026');
    expect(dayWithYear(ui)('2025-01-01')).toBe('1 Gennaio 2025');
  });

  test('a run says both ends', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-08-31')).toBe('1 Luglio – 31 Agosto 2026');
  });

  test('a run inside one month does not repeat the month', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-07-05')).toBe('1 – 5 Luglio 2026');
  });

  test('a one-day run is one day', () => {
    expect(dayWithYear(ui)('2026-07-01', '2026-07-01')).toBe('1 Luglio 2026');
  });
});
