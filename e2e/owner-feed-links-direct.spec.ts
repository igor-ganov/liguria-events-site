// A card in the feed opens the page of its event, and the answer to that
// request is the page. A card for one night of a festival used to spell its
// own night and title, which is not where the page lives: the worker answered
// with a redirect, and the reader waited out a second round trip before the
// page they tapped began to arrive.
import { expect, test } from '@playwright/test';

const LINK = /href="(\/it\/event\/[^"]+)"/g;

test('no card in the feed leads to an address that sends the reader on', async ({ request }) => {
  const feed = await (await request.get('/it/liguria/')).text();
  const links = [...new Set([...feed.matchAll(LINK)].map((match) => match[1] ?? ''))];
  expect(links.length, 'the feed carries cards').toBeGreaterThan(0);

  const answers = await Promise.all(
    links.map(async (link) => ({ link, status: (await request.get(link, { maxRedirects: 0 })).status() })),
  );
  expect(answers.filter((answer) => answer.status !== 200)).toEqual([]);
});
