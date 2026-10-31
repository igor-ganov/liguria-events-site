// A reader folds a feed day into a strip and finds it folded the next time.
// What is remembered is a list of days; what the page builds is one markup.
import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { feedDayHtml } from '../src/components/feed/feed-day-html.ts';
import { shutDaysOf } from '../src/components/feed/shut-days-of.ts';
import { sortFeedCards } from '../src/components/feed/sort-feed-cards.ts';
import { toggleShutDay } from '../src/components/feed/toggle-shut-day.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';
import type { FeedCardKey } from '../src/components/feed/sort-feed-cards.ts';

describe('shutDaysOf', () => {
  test('nothing stored, or something unreadable, is nothing folded', () => {
    assert.deepEqual(shutDaysOf(undefined, ''), []);
    assert.deepEqual(shutDaysOf('{oops', ''), []);
    assert.deepEqual(shutDaysOf('{"a":1}', ''), []);
  });

  test('only days are kept — nothing that could be read as a selector', () => {
    assert.deepEqual(shutDaysOf('["2026-10-31","x\\"]","2026-11-1",7]', ''), ['2026-10-31']);
  });

  test('days gone by are dropped', () => {
    assert.deepEqual(shutDaysOf('["2026-10-30","2026-10-31","2026-11-02"]', '2026-10-31'), ['2026-10-31', '2026-11-02']);
  });
});

describe('toggleShutDay', () => {
  test('folding adds the day once, opening removes it', () => {
    assert.deepEqual(toggleShutDay(['2026-11-02'], '2026-10-31', true), ['2026-10-31', '2026-11-02']);
    assert.deepEqual(toggleShutDay(['2026-10-31'], '2026-10-31', true), ['2026-10-31']);
    assert.deepEqual(toggleShutDay(['2026-10-31', '2026-11-02'], '2026-10-31', false), ['2026-11-02']);
  });
});

describe('sortFeedCards by date', () => {
  const key = (card: FeedCardKey): FeedCardKey => card;
  const card = (at: string, ord: number): FeedCardKey => ({ at, ord, created: 0 });

  test('the server order is kept as it is', () => {
    const cards = [card('09:00', 0), card('21:00', 1), card('21:00', 2)];
    assert.deepEqual(sortFeedCards('date', cards, key), cards);
  });

  test('a card added later finds its hour', () => {
    const late = card('12:00', 9);
    assert.deepEqual(sortFeedCards('date', [card('09:00', 0), card('21:00', 1), late], key).map(({ at }) => at), [
      '09:00',
      '12:00',
      '21:00',
    ]);
  });
});

describe('feedDayHtml', () => {
  const html = feedDayHtml({ day: '2026-10-31', heading: 'Sat, 31 <October>', allDay: 'All day' }, '<li>a</li>', '<li>b</li>');

  test('the heading is a button that says whether the day is open and what it opens', () => {
    assert.match(html, /<h3 class="feed-day-head"><button type="button" class="feed-day-toggle" data-day-toggle aria-expanded="true" aria-controls="fd-2026-10-31 fd-2026-10-31-all">/);
    assert.match(html, /Sat, 31 &lt;October&gt;/);
  });

  test('the timed list and the all-day part each hold their cards', () => {
    assert.match(html, /<ul class="feed-list feed-day-part" id="fd-2026-10-31"><li>a<\/li><\/ul>/);
    assert.match(html, /<h4 class="feed-allday-head" id="fd-2026-10-31-all-h">All day<\/h4><ul class="feed-list"><li>b<\/li><\/ul>/);
  });
});

describe('feedItemHtml', () => {
  test('every attribute is escaped', async () => {
    const { feedItemHtml } = await import('../src/components/feed/feed-item-html.ts');
    assert.equal(feedItemHtml({ class: 'fermata', 'data-at': '"21:00"' }, '<a></a>'), '<li class="fermata" data-at="&quot;21:00&quot;"><a></a></li>');
  });
});

describe('feedGroupsHtml', () => {
  test('a timed card carries its hour and sits in the timed list; the rest go to all day', async () => {
    const { feedGroupsHtml } = await import('../src/components/feed/feed-groups-html.ts');
    const { DEFAULT_PAGE_DATA } = await import('../src/components/shared/default-page-data.ts');
    const context = { lang: 'en' as const, ui: DEFAULT_PAGE_DATA.ui, icons: {}, today: '' };
    const night: CompactEvent = { t: 'T', c: ['music'], u: 'https://x', s: '2026-10-31', id: 'night', h: '21:00' };
    const expo: CompactEvent = { ...night, id: 'expo', h: undefined, e: '2026-12-31' };
    const html = feedGroupsHtml({ context, heading: (day) => day, ahead: 0 }, [['2026-10-31', [night, expo]]]);
    assert.match(html, /id="fd-2026-10-31"><li class="fermata" data-id="night"[^>]* data-at="21:00">/);
    assert.match(html, /All day<\/h4><ul class="feed-list"><li class="fermata" data-id="expo"/);
    assert.doesNotMatch(html, /data-id="expo"[^>]*data-at/);
  });
});

describe('feedDaysBoot', () => {
  test('prints a script that parses, built on the stored key', async () => {
    const { feedDaysBoot } = await import('../src/components/feed/feed-days-boot.ts');
    const source = feedDaysBoot();
    assert.doesNotThrow(() => new Function(source));
    assert.match(source, /"dovego:feed-shut"/);
  });
});
