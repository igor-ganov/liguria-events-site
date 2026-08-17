// The feed's pure decisions: URL state in and out, which cards survive the
// filters, which ids a query hit, and the within-day order.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { prepare } from '../src/lib/search/index.ts';
import { feedSortOf } from '../src/components/feed/feed-sort-of.ts';
import { parseFeedParams } from '../src/components/feed/parse-feed-params.ts';
import { feedQueryString } from '../src/components/feed/feed-query-string.ts';
import { feedUrl } from '../src/components/feed/feed-url.ts';
import { matchesFeedRow } from '../src/components/feed/matches-feed-row.ts';
import { feedHits } from '../src/components/feed/feed-hits.ts';
import { sortFeedCards } from '../src/components/feed/sort-feed-cards.ts';
import { feedDayOf } from '../src/components/feed/feed-day-of.ts';
import type { FeedCardKey } from '../src/components/feed/sort-feed-cards.ts';
import type { FeedRow } from '../src/components/feed/matches-feed-row.ts';
import type { FeedState } from '../src/components/feed/feed-state.ts';

const TODAY = '2026-07-06';

const state = (over: Partial<FeedState> = {}): FeedState => ({
  from: '',
  to: '',
  cats: new Set<string>(),
  free: false,
  gems: false,
  query: '',
  city: '',
  hits: undefined,
  sort: 'date',
  index: undefined,
  ...over,
});

const row = (over: Partial<FeedRow> = {}): FeedRow => ({
  id: 'e1',
  start: '2026-07-10',
  end: '2026-07-10',
  free: false,
  gem: false,
  city: '',
  cats: ['music'],
  ...over,
});

describe('feedSortOf', () => {
  test('an explicit created is newest-first', () => {
    assert.equal(feedSortOf('created'), 'created');
  });
  test('anything else is the default order', () => {
    assert.equal(feedSortOf('date'), 'date');
    assert.equal(feedSortOf(''), 'date');
    assert.equal(feedSortOf(undefined), 'date');
    assert.equal(feedSortOf('constructor'), 'date');
  });
});

describe('parseFeedParams', () => {
  test('an empty query means a pristine feed starting today', () => {
    assert.deepEqual(parseFeedParams('', TODAY), {
      query: '',
      cats: [],
      from: TODAY,
      to: '',
      free: false,
      gems: false,
      sort: 'date',
    });
  });
  test('reads every filter back', () => {
    assert.deepEqual(
      parseFeedParams('?q=jazz&cats=music,art&from=2026-08-01&to=2026-08-31&free=1&gems=1&sort=created', TODAY),
      {
        query: 'jazz',
        cats: ['music', 'art'],
        from: '2026-08-01',
        to: '2026-08-31',
        free: true,
        gems: true,
        sort: 'created',
      },
    );
  });
  test('an empty cats list yields no categories, not one empty one', () => {
    assert.deepEqual(parseFeedParams('?cats=', TODAY).cats, []);
    assert.deepEqual(parseFeedParams('?cats=,,music', TODAY).cats, ['music']);
  });
  test('a flag counts only for its exact value', () => {
    assert.equal(parseFeedParams('?free=0', TODAY).free, false);
    assert.equal(parseFeedParams('?free=yes', TODAY).free, false);
  });
});

describe('feedQueryString', () => {
  test('a pristine feed keeps a clean URL', () => {
    assert.equal(feedQueryString(state({ from: TODAY }), TODAY), '');
  });
  test('omits from while it equals today, and keeps it once moved', () => {
    assert.equal(feedQueryString(state({ from: '2026-08-01' }), TODAY), 'from=2026-08-01');
  });
  test('writes the filters in a stable order', () => {
    const filtered = state({
      query: ' jazz ',
      cats: new Set(['music', 'art']),
      from: '2026-08-01',
      to: '2026-08-31',
      free: true,
      gems: true,
      sort: 'created',
    });
    assert.equal(
      decodeURIComponent(feedQueryString(filtered, TODAY)),
      'q=jazz&cats=music,art&from=2026-08-01&to=2026-08-31&free=1&gems=1&sort=created',
    );
  });
  test('round-trips through parseFeedParams', () => {
    const filtered = state({ query: 'jazz', cats: new Set(['music']), to: '2026-08-31', gems: true });
    const parsed = parseFeedParams(`?${feedQueryString(filtered, TODAY)}`, TODAY);
    assert.equal(parsed.query, 'jazz');
    assert.deepEqual(parsed.cats, ['music']);
    assert.equal(parsed.to, '2026-08-31');
    assert.equal(parsed.gems, true);
    assert.equal(parsed.free, false);
  });
});

describe('feedUrl', () => {
  test('nothing filtered leaves the path bare', () => {
    assert.equal(feedUrl('/feed/', state({ from: TODAY }), TODAY), '/feed/');
  });
  test('a filter is appended as a query', () => {
    assert.equal(feedUrl('/feed/', state({ gems: true }), TODAY), '/feed/?gems=1');
  });
});

describe('matchesFeedRow', () => {
  test('an untouched filter matches everything', () => {
    assert.equal(matchesFeedRow(state(), row()), true);
  });
  test('the search hits gate every other rule', () => {
    assert.equal(matchesFeedRow(state({ hits: new Set(['e1']) }), row()), true);
    assert.equal(matchesFeedRow(state({ hits: new Set(['other']) }), row()), false);
  });
  test('an empty hit set hides everything — it is not "no search"', () => {
    assert.equal(matchesFeedRow(state({ hits: new Set() }), row()), false);
  });
  test('an event running across the window is inside it', () => {
    const long = row({ start: '2026-06-01', end: '2026-12-31' });
    assert.equal(matchesFeedRow(state({ from: TODAY, to: '2026-07-31' }), long), true);
  });
  test('the window excludes what ends before it or starts after it', () => {
    assert.equal(matchesFeedRow(state({ from: '2026-07-11' }), row()), false);
    assert.equal(matchesFeedRow(state({ to: '2026-07-09' }), row()), false);
  });
  test('the window edges are inclusive', () => {
    assert.equal(matchesFeedRow(state({ from: '2026-07-10', to: '2026-07-10' }), row()), true);
  });
  test('the flag filters keep only flagged cards', () => {
    assert.equal(matchesFeedRow(state({ free: true }), row()), false);
    assert.equal(matchesFeedRow(state({ free: true }), row({ free: true })), true);
    assert.equal(matchesFeedRow(state({ gems: true }), row()), false);
    assert.equal(matchesFeedRow(state({ gems: true }), row({ gem: true })), true);
  });
  test('a city page drops what belongs to another city, or to none', () => {
    assert.equal(matchesFeedRow(state({ city: 'genova' }), row({ city: 'genova' })), true);
    assert.equal(matchesFeedRow(state({ city: 'genova' }), row({ city: 'savona' })), false);
    assert.equal(matchesFeedRow(state({ city: 'genova' }), row()), false);
  });
  test('any chosen category matching is enough', () => {
    const chips = state({ cats: new Set(['art', 'music']) });
    assert.equal(matchesFeedRow(chips, row({ cats: ['music'] })), true);
    assert.equal(matchesFeedRow(chips, row({ cats: ['sport'] })), false);
    assert.equal(matchesFeedRow(chips, row({ cats: [''] })), false);
  });
});

describe('feedHits', () => {
  const index = prepare({
    lang: 'en',
    docs: [
      { id: 'e1', lang: 'en', section: 'event', url: '', title: 'Jazz night', description: '', body: 'quartet' },
      { id: 'e2', lang: 'en', section: 'event', url: '', title: 'Opera gala', description: '', body: 'verdi' },
    ],
  });

  test('no query means no filter at all', () => {
    assert.equal(feedHits(index, ''), undefined);
    assert.equal(feedHits(index, '   '), undefined);
  });
  test('no index yet means no filter either', () => {
    assert.equal(feedHits(undefined, 'jazz'), undefined);
  });
  test('a query yields the ids it matched', () => {
    assert.deepEqual([...(feedHits(index, 'jazz') ?? [])], ['e1']);
  });
  test('a query is trimmed before it is run', () => {
    assert.deepEqual([...(feedHits(index, '  jazz  ') ?? [])], ['e1']);
  });
  test('a query nothing matches is an empty set, not undefined', () => {
    assert.deepEqual([...(feedHits(index, 'zzzzzz') ?? ['unset'])], []);
  });
});

describe('sortFeedCards', () => {
  const key = (card: FeedCardKey): FeedCardKey => card;
  const card = (over: Partial<FeedCardKey> = {}): FeedCardKey => ({
    ord: 0,
    created: 0,
    span: 0,
    ...over,
  });

  test('by date lifts the short, time-pinned events above the long runs', () => {
    const cards = [card({ ord: 0, span: 30 }), card({ ord: 1, span: 0 })];
    assert.deepEqual(sortFeedCards('date', cards, key), [cards[1], cards[0]]);
  });
  test('equal spans keep the order the server rendered', () => {
    const cards = [card({ ord: 1 }), card({ ord: 0 })];
    assert.deepEqual(sortFeedCards('date', cards, key), [cards[1], cards[0]]);
  });
  test('newest first orders by first-seen time, descending', () => {
    const cards = [card({ ord: 0, created: 10 }), card({ ord: 1, created: 20 })];
    assert.deepEqual(sortFeedCards('created', cards, key), [cards[1], cards[0]]);
  });
  test('equal creation times fall back to the rendered order', () => {
    const cards = [card({ ord: 1, created: 5 }), card({ ord: 0, created: 5 })];
    assert.deepEqual(sortFeedCards('created', cards, key), [cards[1], cards[0]]);
  });
  test('the input is left alone', () => {
    const cards = [card({ ord: 1, span: 9 }), card({ ord: 0, span: 1 })];
    const before = [...cards];
    sortFeedCards('date', cards, key);
    assert.deepEqual(cards, before);
  });
});

describe('feedDayOf', () => {
  test('an event starting later keeps its own day', () => {
    assert.equal(feedDayOf('2026-07-10', TODAY), '2026-07-10');
  });
  test('one already running lands under today', () => {
    assert.equal(feedDayOf('2026-06-01', TODAY), TODAY);
  });
  test('one starting today is today', () => {
    assert.equal(feedDayOf(TODAY, TODAY), TODAY);
  });
});
