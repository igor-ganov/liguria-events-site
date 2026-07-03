// i18n Phase S — locale helpers (AC-1.x, AC-3.1, AC-5.1).
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { isLocale } from '../src/lib/i18n/is-locale.ts';
import { localizedUrl } from '../src/lib/i18n/localized-url.ts';
import { descriptionOf } from '../src/lib/events/description-of.ts';
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
