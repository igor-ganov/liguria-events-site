// Pure pieces of the landmarks grid: the escaper the cards are built with, the
// search doc, the card markup, the kind guard, the selection and the counter.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { escapeMarkup } from '../src/lib/escape-markup.ts';
import { prepare } from '../src/lib/search/index.ts';
import { isLandmarkKind } from '../src/components/landmarks/is-landmark-kind.ts';
import { landmarkDoc } from '../src/components/landmarks/landmark-doc.ts';
import { landmarkThumbHtml } from '../src/components/landmarks/landmark-thumb-html.ts';
import { landmarkCardHtml } from '../src/components/landmarks/landmark-card-html.ts';
import { landmarkCountLabel } from '../src/components/landmarks/landmark-count-label.ts';
import { visibleLandmarks } from '../src/components/landmarks/visible-landmarks.ts';
import { DEFAULT_PAGE_DATA } from '../src/components/shared/default-page-data.ts';
import type { Landmark } from '../src/lib/landmarks/landmark-schema.ts';
import type { LandmarkKind } from '../src/lib/landmarks/landmark-kinds.ts';
import type { LandmarksState } from '../src/components/landmarks/landmarks-state.ts';

const ui = DEFAULT_PAGE_DATA.ui;

const landmark = (over: Partial<Landmark> = {}): Landmark => ({
  id: 'wd:Q1',
  name: 'Castello della Pietra',
  lat: 44.6,
  lng: 9.0,
  kind: 'castle',
  region: 'liguria',
  ...over,
});

const state = (over: Partial<LandmarksState> = {}): LandmarksState => ({
  kinds: new Set(),
  query: '',
  ...over,
});

describe('escapeMarkup', () => {
  test('escapes the characters that break out of text or an attribute', () => {
    assert.equal(escapeMarkup('<b>'), '&lt;b&gt;');
    assert.equal(escapeMarkup('a & b'), 'a &amp; b');
    assert.equal(escapeMarkup('say "hi"'), 'say &quot;hi&quot;');
  });
  test('leaves ordinary text untouched', () => {
    assert.equal(escapeMarkup("Chiesa di San Luca"), 'Chiesa di San Luca');
  });
  test('escapes every occurrence, not only the first', () => {
    assert.equal(escapeMarkup('&&'), '&amp;&amp;');
  });
});

describe('isLandmarkKind', () => {
  test('accepts a kind we have', () => {
    assert.equal(isLandmarkKind('castle'), true);
    assert.equal(isLandmarkKind('lighthouse'), true);
  });
  test('rejects anything else', () => {
    assert.equal(isLandmarkKind('bakery'), false);
    assert.equal(isLandmarkKind(''), false);
    assert.equal(isLandmarkKind(undefined), false);
  });
});

describe('landmarkDoc', () => {
  test('indexes the name, the kind label and the summary', () => {
    const doc = landmarkDoc('it', ui)(
      landmark({ desc: 'Un castello su una rupe.', wiki: 'https://it.wikipedia.org/x' }),
    );
    assert.equal(doc.id, 'wd:Q1');
    assert.equal(doc.lang, 'it');
    assert.equal(doc.section, 'page');
    assert.equal(doc.url, 'https://it.wikipedia.org/x');
    assert.equal(doc.title, 'Castello della Pietra');
    assert.equal(doc.description, ui.landmarks.kinds.castle);
    assert.equal(doc.body, 'Un castello su una rupe.');
  });
  test('falls back to the Wikidata link, then to no link at all', () => {
    assert.equal(landmarkDoc('en', ui)(landmark({ wd: 'https://wikidata/Q1' })).url, 'https://wikidata/Q1');
    assert.equal(landmarkDoc('en', ui)(landmark()).url, '');
  });
  test('a landmark with no summary indexes an empty body', () => {
    assert.equal(landmarkDoc('en', ui)(landmark()).body, '');
  });
});

describe('landmarkThumbHtml', () => {
  test('renders the photo when there is one', () => {
    const html = landmarkThumbHtml(
      landmark({ img: 'https://commons.wikimedia.org/wiki/Special:FilePath/A.jpg' }),
    );
    assert.ok(html.startsWith('<img class="lm-thumb-img"'));
    assert.ok(html.includes('width=400'));
    assert.ok(html.includes('loading="lazy"'));
  });
  test('falls back to the kind icon without one', () => {
    assert.ok(landmarkThumbHtml(landmark()).startsWith('<span class="lm-thumb-icon"'));
    assert.ok(landmarkThumbHtml(landmark({ img: '' })).includes('<svg'));
  });
});

describe('landmarkCardHtml', () => {
  test('links to the detail page and carries the kind colour and label', () => {
    const html = landmarkCardHtml('en', ui)(landmark({ desc: 'On a rock.' }));
    assert.ok(html.includes('href="/landmark/liguria/castello-della-pietra--'));
    assert.ok(html.includes('style="--lm:#8d6e63"'));
    assert.ok(html.includes('<span class="lm-name">Castello della Pietra</span>'));
    assert.ok(html.includes(ui.landmarks.kinds.castle));
    assert.ok(html.includes('<p class="lm-desc">On a rock.</p>'));
  });
  test('a non-default locale keeps its prefix', () => {
    assert.ok(landmarkCardHtml('it', ui)(landmark()).includes('href="/it/landmark/'));
  });
  test('omits the description paragraph when there is none', () => {
    assert.ok(!landmarkCardHtml('en', ui)(landmark()).includes('lm-desc'));
  });
  test('escapes the name, so data cannot inject markup', () => {
    const html = landmarkCardHtml('en', ui)(landmark({ name: 'A "<b>" name' }));
    assert.ok(html.includes('A &quot;&lt;b&gt;&quot; name'));
    assert.ok(!html.includes('<b>'));
  });
});

describe('landmarkCountLabel', () => {
  test('below the cap it is a plain count', () => {
    assert.equal(landmarkCountLabel(12, 600), '12');
    assert.equal(landmarkCountLabel(600, 600), '600');
    assert.equal(landmarkCountLabel(0, 600), '0');
  });
  test('past the cap it says how much is on screen', () => {
    assert.equal(landmarkCountLabel(601, 600), '600 / 601');
  });
});

describe('visibleLandmarks', () => {
  const all: readonly Landmark[] = [
    landmark({ id: 'a', name: 'Castello della Pietra', kind: 'castle' }),
    landmark({ id: 'b', name: 'Faro della Lanterna', kind: 'lighthouse' }),
    landmark({ id: 'c', name: 'Museo di Palazzo Reale', kind: 'museum' }),
  ];
  const byId = new Map(all.map((one) => [one.id, one]));
  const index = prepare({ lang: 'it', docs: all.map(landmarkDoc('it', ui)) });
  const ids = (found: readonly Landmark[]): readonly string[] => found.map((one) => one.id);

  test('an untouched filter keeps every landmark, in the order given', () => {
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, state())), ['a', 'b', 'c']);
  });
  test('a query ranks by the fuzzy scorer', () => {
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, state({ query: 'lanterna' }))), ['b']);
  });
  test('a whitespace-only query is no query at all', () => {
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, state({ query: '  ' }))), ['a', 'b', 'c']);
  });
  test('the kind chips narrow whatever the search left', () => {
    const kinds = state({ kinds: new Set<LandmarkKind>(['castle', 'museum']) });
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, kinds)), ['a', 'c']);
  });
  test('search and chips together must both agree', () => {
    const both = state({ query: 'lanterna', kinds: new Set<LandmarkKind>(['castle']) });
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, both)), []);
  });
  test('a query nothing matches shows nothing', () => {
    assert.deepEqual(ids(visibleLandmarks(all, index, byId, state({ query: 'zzzzzz' }))), []);
  });
});
