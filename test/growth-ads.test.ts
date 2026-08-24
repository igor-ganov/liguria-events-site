// Search and YouTube campaigns are built from the corpus rather than typed by
// hand: 110 cities and 130 venues is not a spreadsheet anybody maintains, and
// an asset one character over the limit is refused at upload — after the whole
// file is built.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { cityAdGroup } from '../scripts/growth/city-ad-group.ts';
import { venueAdGroup } from '../scripts/growth/venue-ad-group.ts';
import { adsCsv, keywordsCsv, negativesCsv } from '../scripts/growth/ads-csv.ts';
import { NEGATIVE_KEYWORDS } from '../scripts/growth/negatives.ts';
import { ADS } from '../scripts/growth/limits.ts';
import { toCsv } from '../scripts/growth/to-csv.ts';
import { runnable } from '../scripts/growth/runnable.ts';

const genova = { name: 'Genova', url: 'https://dovego.it/it/liguria/genova/', events: 120 };

describe('cityAdGroup', () => {
  test('builds keywords in the shape the site already ranks for', () => {
    const group = cityAdGroup(genova);
    assert.ok(group?.keywords.includes('eventi genova'));
    assert.ok(group?.keywords.includes('cosa fare a genova questo weekend'));
  });

  test('refuses to advertise a city with nothing on — that is paying for a dead end', () => {
    assert.equal(cityAdGroup({ ...genova, events: ADS.minCityEvents - 1 }), undefined);
  });

  test('every asset fits, for a long city name as well as a short one', () => {
    const long = cityAdGroup({ ...genova, name: "Reggio nell'Emilia" });
    for (const headline of long?.headlines ?? []) {
      assert.ok(headline.length <= ADS.headlineMax, `${headline} is ${headline.length}`);
    }
    for (const description of long?.descriptions ?? []) {
      assert.ok(description.length <= ADS.descriptionMax, `${description} is ${description.length}`);
    }
  });

  test('a long name loses the assets that do not fit, and still has enough to run', () => {
    const long = cityAdGroup({ ...genova, name: "Reggio nell'Emilia" });
    assert.ok((long?.headlines.length ?? 0) >= ADS.headlinesNeeded);
    assert.ok((long?.descriptions.length ?? 0) >= ADS.descriptionsNeeded);
  });

  test('duplicate assets are collapsed — Google rejects a repeated headline', () => {
    const group = cityAdGroup(genova);
    assert.equal(new Set(group?.headlines).size, group?.headlines.length);
  });
});

describe('venueAdGroup', () => {
  const teatro = {
    name: 'Teatro Carlo Felice',
    city: 'Genova',
    url: 'https://dovego.it/it/liguria/genova/teatro-carlo-felice/',
    events: 12,
  };

  test('asks the question people actually type about a venue', () => {
    const group = venueAdGroup(teatro);
    assert.ok(group?.keywords.includes('teatro carlo felice programma'));
  });

  test('a venue with nothing on keeps its page but gets no ad', () => {
    assert.equal(venueAdGroup({ ...teatro, events: 0 }), undefined);
  });

  test('a long venue name still yields a runnable ad', () => {
    const group = venueAdGroup({ ...teatro, name: 'Museo delle Illusioni di Genova Porto Antico' });
    assert.ok((group?.headlines.length ?? 0) >= ADS.headlinesNeeded);
    assert.ok((group?.descriptions.length ?? 0) >= ADS.descriptionsNeeded);
    for (const headline of group?.headlines ?? []) assert.ok(headline.length <= ADS.headlineMax);
  });
});

describe('the exported files', () => {
  const groups = [cityAdGroup(genova)].filter((group) => group !== undefined);

  test('each keyword is exported in phrase and exact match, never broad', () => {
    const csv = keywordsCsv(groups);
    assert.ok(csv.includes(',Phrase,'));
    assert.ok(csv.includes(',Exact,'));
    assert.ok(!csv.includes(',Broad,'));
  });

  test('the ad row carries the landing page and its assets', () => {
    const csv = adsCsv(groups);
    assert.ok(csv.includes('https://dovego.it/it/liguria/genova/'));
    assert.ok(csv.includes('Eventi a Genova'));
  });

  test('the industry meanings of "eventi" are excluded before a euro is spent', () => {
    const csv = negativesCsv(NEGATIVE_KEYWORDS);
    for (const term of ['organizzazione eventi', 'sala eventi', 'lavoro', 'eventi avversi']) {
      assert.ok(csv.includes(term), term);
    }
  });
});

describe('toCsv', () => {
  test('quotes a cell that would otherwise break the file', () => {
    assert.equal(toCsv([['a,b', 'c"d', 'plain']]), '"a,b","c""d",plain');
  });
});

describe('runnable', () => {
  test('a group that lost too many assets is not emitted at all', () => {
    // Better no ad for a place than an import Google refuses in full.
    assert.equal(
      runnable({ name: 'x', url: 'u', keywords: [], headlines: ['a', 'b'], descriptions: ['c', 'd'] }),
      undefined,
    );
    assert.equal(
      runnable({ name: 'x', url: 'u', keywords: [], headlines: ['a', 'b', 'c'], descriptions: ['d'] }),
      undefined,
    );
  });

  test('enough assets never mention the place, so even an absurd name still runs', () => {
    // The generic half of the set is what keeps a long name advertisable.
    const group = cityAdGroup({
      name: 'Un nome di città assurdamente lungo che non entra da nessuna parte',
      url: 'https://dovego.it/it/x/y/',
      events: 50,
    });
    assert.ok((group?.headlines.length ?? 0) >= ADS.headlinesNeeded);
    assert.ok((group?.descriptions.length ?? 0) >= ADS.descriptionsNeeded);
  });
});
