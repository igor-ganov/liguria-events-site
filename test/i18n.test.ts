// i18n Phase S — locale helpers (AC-1.x, AC-3.1, AC-5.1).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isLocale } from '../src/lib/i18n/is-locale.ts';
import { localizedUrl } from '../src/lib/i18n/localized-url.ts';
import { descriptionOf } from '../src/lib/events/description-of.ts';
import { titleOf } from '../src/lib/events/title-of.ts';
import { mapQuery } from '../src/lib/events/map-query.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

describe('isLocale', () => {
  test('accepts the three locales, rejects others', () => {
    assert.equal(isLocale('en'), true);
    assert.equal(isLocale('it'), true);
    assert.equal(isLocale('ru'), true);
    assert.equal(isLocale('de'), false);
    assert.equal(isLocale(undefined), false);
  });
});

describe('localizedUrl', () => {
  test('en at root (no prefix), others prefixed', () => {
    assert.ok(localizedUrl('en').endsWith('/'));
    assert.equal(localizedUrl('en').includes('/en/'), false);
    assert.match(localizedUrl('it', 'feed/'), /\/it\/feed\/$/);
    assert.match(localizedUrl('ru', 'event/abc/'), /\/ru\/event\/abc\/$/);
  });
});

describe('descriptionOf', () => {
  const event = (d?: CompactEvent['d']): CompactEvent => ({
    id: 'a', t: 'T', s: '2026-07-04', c: ['music'], u: 'https://x', ...(d === undefined ? {} : { d }),
  });
  test('picks the locale, falls back to en, then empty', () => {
    const e = event({ en: 'English', it: 'Italiano', ru: 'Русский' });
    assert.equal(descriptionOf('it')(e), 'Italiano');
    assert.equal(descriptionOf('ru')(e), 'Русский');
    assert.equal(descriptionOf('en')(event({ en: 'only-en', it: '', ru: '' })), 'only-en');
    assert.equal(descriptionOf('en')(event()), '');
  });
});

describe('mapQuery', () => {
  const base: CompactEvent = { id: 'a', t: 'T', s: '2026-07-04', c: ['music'], u: 'https://x' };
  test('prefers the enriched address, else scopes venue to Genoa, else undefined', () => {
    assert.equal(mapQuery({ ...base, a: 'Teatro della Tosse, Genova' }), 'Teatro della Tosse, Genova');
    assert.equal(mapQuery({ ...base, v: 'Palazzo Ducale' }), 'Palazzo Ducale, Genova, Italy');
    assert.equal(mapQuery(base), undefined);
  });
});

describe('titleOf (AC-2b.2)', () => {
  const base: CompactEvent = { id: 'a', t: 'Sagra del pesto', s: '2026-07-04', c: ['food'], u: 'https://x' };
  test('localized title wins; missing/empty falls back to the original', () => {
    const withTl: CompactEvent = { ...base, tl: { en: 'Pesto festival', it: 'Sagra del pesto', ru: 'Фестиваль песто' } };
    assert.equal(titleOf('ru')(withTl), 'Фестиваль песто');
    assert.equal(titleOf('ru')(base), 'Sagra del pesto');
    assert.equal(titleOf('it')({ ...base, tl: { en: 'X', it: '', ru: '' } }), 'Sagra del pesto');
  });
});
