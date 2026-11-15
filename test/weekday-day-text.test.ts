import { describe, expect, test } from 'bun:test';
import { weekdayDayText } from '../src/lib/events/thread/weekday-day-text.ts';
import type { Locale } from '../src/lib/i18n/locales.ts';

const LANGS: readonly Locale[] = ['en', 'it', 'ru'];

describe('weekdayDayText', () => {
  test('says the weekday and the date the same way whatever ICU the runtime carries', () => {
    expect(LANGS.map((lang) => weekdayDayText(lang)('2026-11-15'))).toEqual([
      'Sun, 15 November',
      'dom 15 novembre',
      'вс, 15 ноября',
    ]);
  });
});
