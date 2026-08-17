// Pure pieces of the places grid: the category guard, the search doc, the card
// markup, the selection and the counter.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { prepare } from '../src/lib/search/index.ts';
import { isPlaceCategory } from '../src/components/places/is-place-category.ts';
import { placeCardHtml } from '../src/components/places/place-card-html.ts';
import { placeCountLabel } from '../src/components/places/place-count-label.ts';
import { placeDoc } from '../src/components/places/place-doc.ts';
import { placeThumbHtml } from '../src/components/places/place-thumb-html.ts';
import { visiblePlaces } from '../src/components/places/visible-places.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import type { Place } from '../src/lib/places/place-schema.ts';
import type { PlaceCategory } from '../src/lib/places/place-categories.ts';
import type { PlacesState } from '../src/components/places/places-state.ts';

const ui = DEFAULT_PAGE_DATA.ui;

const place = (over: Partial<Place> = {}): Place => ({
  id: 'p1',
  name: 'Trattoria da Maria',
  lat: 44.4,
  lng: 8.9,
  cat: 'restaurant',
  region: 'liguria',
  ...over,
});

const state = (over: Partial<PlacesState> = {}): PlacesState => ({
  cats: new Set(),
  query: '',
  ...over,
});

describe('isPlaceCategory', () => {
  test('accepts a category we have', () => {
    assert.equal(isPlaceCategory('restaurant'), true);
    assert.equal(isPlaceCategory('shopping'), true);
  });
  test('rejects anything else', () => {
    assert.equal(isPlaceCategory('castle'), false);
    assert.equal(isPlaceCategory(''), false);
    assert.equal(isPlaceCategory(undefined), false);
  });
});

describe('placeDoc', () => {
  test('indexes the name, the category label and the blurb', () => {
    const doc = placeDoc('it', ui)(place({ desc: 'Cucina ligure.' }));
    assert.equal(doc.id, 'p1');
    assert.equal(doc.lang, 'it');
    assert.equal(doc.section, 'page');
    assert.equal(doc.url, '');
    assert.equal(doc.title, 'Trattoria da Maria');
    assert.equal(doc.description, ui.places.categories.restaurant);
    assert.equal(doc.body, 'Cucina ligure.');
  });
  test('a place with no blurb indexes an empty body', () => {
    assert.equal(placeDoc('en', ui)(place()).body, '');
  });
});

describe('placeThumbHtml', () => {
  test('renders the photo when there is one', () => {
    const html = placeThumbHtml(place({ img: 'https://commons.wikimedia.org/wiki/Special:FilePath/A.jpg' }));
    assert.ok(html.startsWith('<img class="lm-thumb-img"'));
    assert.ok(html.includes('loading="lazy"'));
  });
  test('falls back to the category icon without one', () => {
    assert.ok(placeThumbHtml(place()).startsWith('<span class="lm-thumb-icon"'));
    assert.ok(placeThumbHtml(place({ img: '' })).includes('<svg'));
  });
});

describe('placeCardHtml', () => {
  test('links to the detail page and carries the category colour and label', () => {
    const html = placeCardHtml('en', ui)(place({ desc: 'Fish and focaccia.' }));
    assert.ok(html.includes('href="/place/liguria/trattoria-da-maria--'));
    assert.ok(html.includes('style="--lm:#e0563b"'));
    assert.ok(html.includes('<span class="lm-name">Trattoria da Maria</span>'));
    assert.ok(html.includes(ui.places.categories.restaurant));
    assert.ok(html.includes('<p class="lm-desc">Fish and focaccia.</p>'));
  });
  test('a non-default locale keeps its prefix', () => {
    assert.ok(placeCardHtml('it', ui)(place()).includes('href="/it/place/'));
  });
  test('omits the description paragraph when there is none', () => {
    assert.ok(!placeCardHtml('en', ui)(place()).includes('lm-desc'));
  });
  test('escapes the name, so data cannot inject markup', () => {
    const html = placeCardHtml('en', ui)(place({ name: 'A "<b>" bar', cat: 'bar' }));
    assert.ok(html.includes('A &quot;&lt;b&gt;&quot; bar'));
    assert.ok(!html.includes('<b>'));
  });
});

describe('placeCountLabel', () => {
  test('below the cap it is a plain count', () => {
    assert.equal(placeCountLabel(12, 600), '12');
    assert.equal(placeCountLabel(600, 600), '600');
    assert.equal(placeCountLabel(0, 600), '0');
  });
  test('past the cap it says how much is on screen', () => {
    assert.equal(placeCountLabel(601, 600), '600 / 601');
  });
});

describe('visiblePlaces', () => {
  const all: readonly Place[] = [
    place({ id: 'a', name: 'Trattoria da Maria', cat: 'restaurant' }),
    place({ id: 'b', name: 'Bar Lanterna', cat: 'bar' }),
    place({ id: 'c', name: 'Museo del Mare', cat: 'museum' }),
  ];
  const byId = new Map(all.map((one) => [one.id, one]));
  const index = prepare({ lang: 'it', docs: all.map(placeDoc('it', ui)) });
  const ids = (found: readonly Place[]): readonly string[] => found.map((one) => one.id);

  test('an untouched filter keeps every place, in the order given', () => {
    assert.deepEqual(ids(visiblePlaces(all, index, byId, state())), ['a', 'b', 'c']);
  });
  test('a query ranks by the fuzzy scorer', () => {
    assert.deepEqual(ids(visiblePlaces(all, index, byId, state({ query: 'lanterna' }))), ['b']);
  });
  test('a whitespace-only query is no query at all', () => {
    assert.deepEqual(ids(visiblePlaces(all, index, byId, state({ query: '  ' }))), ['a', 'b', 'c']);
  });
  test('the category chips narrow whatever the search left', () => {
    const cats = state({ cats: new Set<PlaceCategory>(['restaurant', 'museum']) });
    assert.deepEqual(ids(visiblePlaces(all, index, byId, cats)), ['a', 'c']);
  });
  test('search and chips together must both agree', () => {
    const both = state({ query: 'lanterna', cats: new Set<PlaceCategory>(['restaurant']) });
    assert.deepEqual(ids(visiblePlaces(all, index, byId, both)), []);
  });
  test('a query nothing matches shows nothing', () => {
    assert.deepEqual(ids(visiblePlaces(all, index, byId, state({ query: 'zzzzzz' }))), []);
  });
});
