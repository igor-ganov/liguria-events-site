import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { favButtonHtml } from '../src/lib/favorites/fav-button.ts';
import { HEART } from '../src/lib/favorites/fav-button.ts';

describe('favButtonHtml', () => {
  test('renders an unpressed toggle carrying the id, the accessible name and the heart', () => {
    const html = favButtonHtml('ev1', 'Save Festa del Mare');
    assert.ok(html.includes('data-fav-id="ev1"'));
    assert.ok(html.includes('aria-pressed="false"'));
    assert.ok(html.includes('aria-label="Save Festa del Mare"'));
    assert.ok(html.includes(HEART));
  });

  test('a card without a POI emits no data-fav-poi attribute at all', () => {
    assert.equal(favButtonHtml('ev1', 'Save').includes('data-fav-poi'), false);
  });

  test('a POI is stashed as escaped JSON so the favourite can be re-rendered', () => {
    const html = favButtonHtml('pl1', 'Save', {
      id: 'pl1',
      kind: 'place',
      region: 'liguria',
      name: 'Trattoria',
      lat: 44.4,
      lng: 8.93,
      cat: 'restaurant',
      url: '/liguria/places/pl1',
    });
    assert.ok(html.includes('data-fav-poi='));
    assert.equal(html.includes('data-fav-poi="{"'), false, 'the JSON quotes must be escaped');
    assert.ok(html.includes('&#34;kind&#34;'));
  });

  test('markup in the id or the label cannot break out of the attribute', () => {
    const html = favButtonHtml('a"b', '<script>x</script>');
    assert.equal(html.includes('<script>'), false);
    assert.equal(html.includes('a"b'), false);
    assert.ok(html.includes('&#60;script&#62;'));
  });
});
