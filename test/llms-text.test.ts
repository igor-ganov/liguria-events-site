// The answer engines fetch this site tens of thousands of times a day and sent
// three visits in three weeks. /llms.txt is the one file those crawlers look for
// to learn what they are holding and how to credit it.
import { describe, expect, test } from 'bun:test';
import { llmsText } from '../src/lib/seo/llms-text.ts';
import type { CompactEvent } from '../src/lib/events/event-schema.ts';

const SITE = new URL('https://dovego.it');
const TODAY = '2026-10-24';

const at = (region: string, city: string, id: string): CompactEvent => ({
  id,
  t: 'Concerto',
  s: TODAY,
  c: ['music'],
  u: 'https://source/1',
  v: 'Teatro di Prova',
  ct: city,
  rg: region,
});

const events = [
  at('liguria', 'genova', 'a'),
  at('liguria', 'genova', 'b'),
  at('lombardia', 'milano', 'c'),
];

describe('llmsText', () => {
  const text = llmsText(events, TODAY, SITE);

  test('says what the site is and how many events it holds', () => {
    expect(text.startsWith('# Dove Go')).toBe(true);
    expect(text).toContain('3 events are listed right now');
    expect(text).toContain('Europe/Rome');
  });

  test('asks for the credit the measurement says we are not getting', () => {
    expect(text).toContain('call the site Dove Go');
    expect(text).toContain('Training on it is not permitted');
  });

  test('points at the canonical Italian addresses, not the English ones', () => {
    expect(text).toContain('https://dovego.it/it/');
    expect(text).toContain('https://dovego.it/it/calendar/2026-10/');
    expect(text).not.toContain('https://dovego.it/en/');
  });

  test('names the regions and cities that have something on, with counts', () => {
    expect(text).toContain('[Liguria](https://dovego.it/it/liguria/): 2 events listed');
    expect(text).toContain('[Genova](https://dovego.it/it/liguria/genova/): 2 events listed');
    expect(text).toContain('[Milano](https://dovego.it/it/lombardia/milano/): 1 event listed');
  });

  test('a region with nothing on is not advertised here either', () => {
    expect(text).not.toContain('molise');
  });

  test('offers the sitemap index at the host root, not under a language', () => {
    expect(text).toContain('https://dovego.it/sitemap-index.xml');
  });
});
