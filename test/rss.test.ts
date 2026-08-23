import { describe, test } from 'bun:test';
import assert from 'node:assert/strict';
import { eventRssItems } from '../src/lib/seo/event-rss-items.ts';
import { rssXml } from '../src/lib/seo/rss-xml.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');
const TODAY = '2026-08-23';

const ev = (over: Partial<CompactEvent> & Pick<CompactEvent, 'id'>): CompactEvent => ({
  t: 'Concerto',
  s: '2026-08-25',
  c: ['music'],
  u: 'https://source/1',
  ...over,
});

describe('eventRssItems', () => {
  test('soonest first, linking to the event’s own page', () => {
    const items = eventRssItems(
      [ev({ id: 'later', s: '2026-09-01' }), ev({ id: 'sooner', s: '2026-08-24' })],
      TODAY,
      SITE,
    );
    assert.deepEqual(items.map((item) => item.guid), ['sooner', 'later']);
    assert.equal(items[0]?.link, 'https://dovego.it/event/sooner/');
  });

  test('what has already happened is not news', () => {
    const items = eventRssItems([ev({ id: 'past', s: '2026-08-01' }), ev({ id: 'next' })], TODAY, SITE);
    assert.deepEqual(items.map((item) => item.guid), ['next']);
  });

  test('a container is judged by its programme here too', () => {
    const spent = ev({ id: 'spent', s: '2026-08-01', e: '2026-09-30', k: true, p: [{ date: '2026-08-05' }] });
    assert.deepEqual(eventRssItems([spent], TODAY, SITE), []);
  });

  test('the feed stays a feed rather than a dump of the corpus', () => {
    const many = Array.from({ length: 80 }, (_, i) => ev({ id: `e${i}` }));
    assert.equal(eventRssItems(many, TODAY, SITE).length, 50);
  });
});

describe('rssXml', () => {
  const channel = {
    title: 'Liguria — Dove Go',
    link: 'https://dovego.it/liguria/',
    self: 'https://dovego.it/liguria/rss.xml',
    description: 'Upcoming events in Liguria.',
  };

  test('a valid channel whose self link is the feed, not the page', () => {
    const xml = rssXml(channel, eventRssItems([ev({ id: 'a' })], TODAY, SITE));
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"'));
    // Validators reject a self link that points at the page it describes.
    assert.ok(xml.includes('href="https://dovego.it/liguria/rss.xml" rel="self"'));
    assert.ok(xml.includes('<item>'));
    assert.ok(xml.endsWith('</channel></rss>'));
  });

  test('an ampersand in a title cannot break the document', () => {
    const xml = rssXml(channel, [
      { title: 'Rock & Roll', link: 'https://x/?a=1&b=2', description: '', pubDate: '', guid: 'g' },
    ]);
    assert.ok(xml.includes('<title>Rock &amp; Roll</title>'));
    assert.equal(xml.includes('&b=2'), false);
  });

  test('an empty feed is still a well-formed document', () => {
    assert.ok(rssXml(channel, []).endsWith('</channel></rss>'));
  });
});
