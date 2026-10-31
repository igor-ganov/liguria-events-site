// Italian puts a city "a Genova" but a region "in Liguria": the facet copy is
// written for cities, and a region page titled "Cosa fare stasera a Liguria"
// reads as a mistake to every Italian searching for it.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { facetOf } from '../src/lib/events/facet-of.ts';
import { facetSeo } from '../src/lib/events/facet-seo.ts';
import { DEFAULT_UI } from '../src/lib/i18n/defaults/default-ui.ts';

const italian = {
  ...DEFAULT_UI,
  facets: {
    ...DEFAULT_UI.facets,
    tonight: { title: 'Cosa fare stasera a {place}', description: 'Eventi di stasera a {place}, dalle 18.' },
  },
};

describe('the place in a facet title', () => {
  test('is "in" a region in Italian', () => {
    assert.deepEqual(facetSeo({ region: 'liguria', facet: facetOf('tonight') }, italian), {
      title: 'Cosa fare stasera in {place}',
      description: 'Eventi di stasera in {place}, dalle 18.',
    });
  });

  test('stays "a" a city in Italian', () => {
    assert.deepEqual(facetSeo({ region: 'liguria', city: 'genova', facet: facetOf('tonight') }, italian), italian.facets.tonight);
  });

  test('is left alone in a language that already says "in"', () => {
    assert.deepEqual(facetSeo({ region: 'liguria', facet: facetOf('tonight') }, DEFAULT_UI), DEFAULT_UI.facets.tonight);
  });
});
