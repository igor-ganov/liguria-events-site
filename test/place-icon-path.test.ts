import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { PLACE_ICON_PATHS } from '../src/lib/places/place-icon-paths.ts';
import { placeIconPath } from '../src/lib/places/place-icon-path.ts';
import { PLACE_CATEGORIES } from '../src/lib/places/place-categories.ts';

describe('placeIconPath', () => {
  test('every category has its own glyph', () => {
    assert.deepEqual(Object.keys(PLACE_ICON_PATHS).sort(), [...PLACE_CATEGORIES].sort());
  });

  test('returns the category glyph', () => {
    assert.equal(placeIconPath('museum'), PLACE_ICON_PATHS.museum);
  });

  test('every glyph is drawable SVG markup', () => {
    assert.ok(Object.values(PLACE_ICON_PATHS).every((markup) => /^<(path|rect|circle)/.test(markup)));
  });
});
