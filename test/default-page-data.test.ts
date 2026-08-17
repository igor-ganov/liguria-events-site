// The English safety net behind the #ui-data island. It is now assembled from
// per-section modules, so the guarantee worth testing is that the assembled
// whole still satisfies the very schema the island is decoded with.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { Schema } from 'effect';
import { PageDataSchema } from '../src/lib/i18n/ui-schema.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';

const decode = Schema.decodeUnknownSync(PageDataSchema);

describe('DEFAULT_PAGE_DATA', () => {
  test('satisfies the island schema, section by section', () => {
    assert.deepEqual(decode(DEFAULT_PAGE_DATA), DEFAULT_PAGE_DATA);
  });
  test('is English', () => {
    assert.equal(DEFAULT_PAGE_DATA.lang, 'en');
  });

  const ui = DEFAULT_PAGE_DATA.ui;
  test('carries the sections that live in their own modules', () => {
    assert.equal(ui.landmarks.kinds.castle, 'Castles');
    assert.equal(ui.places.categories.restaurant, 'Restaurants');
    assert.equal(ui.auth.signIn, 'Sign in');
    assert.equal(ui.route.walk, 'Walking');
    assert.equal(ui.cat.music, 'Music');
  });
  test('keeps the calendar vocabulary complete and in order', () => {
    assert.equal(ui.weekdays.length, 7);
    assert.equal(ui.weekdays[0], 'Mon');
    assert.equal(ui.months.length, 12);
    assert.equal(ui.months[11], 'December');
  });
  test('keeps the small top-level strings the shell reads', () => {
    assert.equal(ui.nav.feed, 'Feed');
    assert.equal(ui.theme.system, 'System');
    assert.equal(ui.mapLink, 'View on map');
    assert.equal(ui.footer, '');
  });
});
