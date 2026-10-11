// A card in the feed opens the page of its event, and the answer to that
// request is the page. A card for one night of a festival used to spell its
// own night and title, which is not where the page lives: the worker answered
// with a redirect, and the reader waited out a second round trip before the
// page they tapped began to arrive.
//
// The sitemap of the same build lists the address each event lives at, so the
// two are compared as built: asking the worker instead would read events that
// other specs are editing at that moment.
import { expect, test } from '@playwright/test';

const LINK = /href="\/it\/event\/([^"]+)\/"/g;
const LOC = /<loc>https:\/\/dovego\.it\/it\/event\/([^<]+)\/<\/loc>/g;
const idOf = (slug: string): string => slug.slice(-12);

test('every card in the feed spells the address its event lives at', async ({ request }) => {
  const feed = await (await request.get('/it/liguria/')).text();
  const sitemap = await (await request.get('/sitemap-upcoming.xml')).text();
  const home = new Map([...sitemap.matchAll(LOC)].map((match) => [idOf(match[1] ?? ''), match[1] ?? '']));
  const cards = [...new Set([...feed.matchAll(LINK)].map((match) => match[1] ?? ''))];
  const known = cards.filter((slug) => home.has(idOf(slug)));
  expect(known.length, 'the feed carries cards the sitemap knows').toBeGreaterThan(0);
  expect(known.filter((slug) => home.get(idOf(slug)) !== slug)).toEqual([]);
});
