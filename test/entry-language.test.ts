// "/" used to send everybody to the English region, because a static redirect
// rule cannot read a header. The site is about events in Italy and its readers
// read Italian: a request that states no preference belongs on /it/.
import { describe, expect, test } from 'bun:test';
import { entryPath } from '../src/lib/i18n/entry-path.ts';
import { preferredLocale } from '../src/lib/i18n/preferred-locale.ts';
import { rankedLanguages } from '../src/lib/i18n/ranked-languages.ts';

describe('rankedLanguages', () => {
  test('orders the tags by the quality the browser attached', () => {
    expect(rankedLanguages('en;q=0.7,it-CH,ru;q=0.9')).toEqual(['it-ch', 'ru', 'en']);
  });
  test('drops what the browser refuses and what it cannot name', () => {
    expect(rankedLanguages('de;q=0, *;q=0.5, fr')).toEqual(['fr', '*']);
  });
  test('an absent header ranks nothing', () => {
    expect(rankedLanguages(undefined)).toEqual([]);
  });
});

describe('preferredLocale', () => {
  test('honours a stated preference, region and all', () => {
    expect(preferredLocale('it-CH,it;q=0.9')).toBe('it');
    expect(preferredLocale('en-GB,en;q=0.9')).toBe('en');
    expect(preferredLocale('ru-RU')).toBe('ru');
  });
  test('a preference we do not speak is not one we can honour', () => {
    expect(preferredLocale('de-DE,fr;q=0.8')).toBe('it');
  });
  test('and no preference at all is answered in Italian', () => {
    expect(preferredLocale(undefined)).toBe('it');
    expect(preferredLocale('')).toBe('it');
  });
  test('the second choice wins when the first is foreign', () => {
    expect(preferredLocale('de-DE,ru;q=0.8,en;q=0.5')).toBe('ru');
  });
});

describe('entryPath', () => {
  // The region is decided by the caller now — from the reader's own location, or
  // from where the events are. This file is about the language.
  test('sends the front door to the region it was given, in the reader language', () => {
    expect(entryPath('/', 'ru,en;q=0.8', 'lombardia')).toBe('/ru/lombardia/');
    expect(entryPath('/', undefined, 'lombardia')).toBe('/it/lombardia/');
    expect(entryPath('/', 'en-US', 'lombardia')).toBe('/lombardia/');
  });
  test('and leaves every other address alone', () => {
    expect(entryPath('/liguria/', undefined, 'lombardia')).toBeUndefined();
    expect(entryPath('/it/toscana/', undefined, 'lombardia')).toBeUndefined();
  });
});
