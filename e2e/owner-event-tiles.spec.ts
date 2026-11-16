// The event page as the feed's tiles: under the photograph, when, where, how
// much and the month sit in a grid with no gaps and no margins, dressed with
// other events' photographs, one big outline of the site's mark running across
// them under the words; the heart and share are bold buttons on the photograph.
//
// Against the real worker and its real corpus: event pages are server-rendered.
import { expect, test } from '@playwright/test';
import { largeCover } from '../src/lib/img/large-cover.ts';
import type { APIRequestContext, Locator } from '@playwright/test';

type Wire = Readonly<{ id: string; s: string; e?: string; img?: string; th?: string; k?: boolean; h?: string; v?: string; ct?: string; rg?: string }>;

// The map corpus is trimmed to what a map needs; the worker reads its pages
// from the full one, so the events are picked from that.
const EVENTS_URL = process.env['EVENTS_URL'] ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';

const today = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });

const pick = async (request: APIRequestContext, wanted: (event: Wire) => boolean): Promise<Wire> => {
  const payload: { events: readonly Wire[] } = await (await request.get(EVENTS_URL)).json();
  const found = payload.events.filter((event) => (event.e ?? event.s) >= today()).find(wanted);
  expect(found, 'the corpus holds no such event').toBeDefined();
  return found ?? { id: '', s: '' };
};

const pictured = (event: Wire): boolean =>
  event.img !== undefined && event.v !== undefined && event.h !== undefined && event.ct === 'genova' && event.k !== true && event.e === undefined;

const boxOf = async (locator: Locator): Promise<Readonly<{ x: number; y: number; width: number; height: number }>> => {
  await expect(locator).toBeVisible();
  return (await locator.boundingBox()) ?? { x: -1, y: -1, width: 0, height: 0 };
};

test.beforeEach(async ({ page }) => page.setViewportSize({ width: 390, height: 844 }));

test('the facts are tiles edge to edge, with no gap between them or the photograph', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const [cover, when, where] = await Promise.all([boxOf(page.locator('.event-cover')), boxOf(page.locator('.ev-when')), boxOf(page.locator('.ev-where'))]);
  expect(Math.round(when.x)).toBe(0);
  expect(Math.round(when.y)).toBe(Math.round(cover.y + cover.height));
  expect(Math.round(where.x)).toBe(Math.round(when.x + when.width));
  expect(Math.round(where.y)).toBe(Math.round(when.y));
  expect(Math.round(where.x + where.width)).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test('tiles wear other events’ photographs, never this one’s, and only after the photograph', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const collage = page.locator('.ev-thread .ev-collage img');
  expect(await collage.count()).toBeGreaterThan(0);
  const own = [event.img ?? '', largeCover(event.img ?? ''), event.th ?? ''];
  const shown = await collage.evaluateAll((images) => images.map((image) => [image.getAttribute('src') ?? '', image.getAttribute('loading'), image.getAttribute('fetchpriority'), image.getAttribute('alt')]));
  shown.forEach(([src, loading, priority, alt]) => {
    expect(own).not.toContain(src);
    expect([loading, priority, alt]).toEqual(['lazy', 'low', '']);
  });
  await expect(page.locator('.event-cover img[fetchpriority="high"]')).toHaveCount(1);
});

test('one outline of the mark runs across the tiles, under the words', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const mark = page.locator('.ev-thread .ev-mark');
  await expect(mark).toHaveCount(1);
  await expect(mark).toHaveAttribute('aria-hidden', 'true');
  await expect(mark).toHaveCSS('mix-blend-mode', 'screen');
  await expect(mark).toHaveCSS('opacity', '0.32');
  await expect(mark).toHaveCSS('filter', /blur/);
  await expect(mark.locator('path').first()).toHaveAttribute('stroke-width', '2.6');
  // The words win wherever the outline crosses them.
  const hits = await page.locator('.ev-hour time, .ev-where h2, .ev-price b').evaluateAll((words) =>
    words.map((word) => {
      const box = word.getBoundingClientRect();
      return word.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }),
  );
  expect(hits.length).toBeGreaterThan(1);
  expect(hits.every(Boolean)).toBe(true);
});

test('the heart and share are bold buttons at the top right of the photograph, doing what they did', async ({ page, request }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async (data: ShareData) => document.documentElement.setAttribute('data-shared', data.url ?? '') });
  });
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const cover = await boxOf(page.locator('.event-cover'));
  const heart = page.locator('.event-cover').getByRole('button', { name: 'Favourites' });
  const share = page.locator('.event-cover').getByRole('button', { name: 'Share' });
  for (const button of [heart, share]) {
    const box = await boxOf(button);
    expect(Math.round(box.width)).toBeGreaterThanOrEqual(46);
    expect(box.y - cover.y).toBeLessThan(24);
    expect(box.x).toBeGreaterThan(cover.x + cover.width / 2);
  }
  await share.click();
  await expect(page.locator('html')).toHaveAttribute('data-shared', new RegExp(`/event/`));
  await heart.click();
  await expect(heart).toHaveAttribute('aria-pressed', 'true');
});

test('today is a chip on the photograph', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.s <= today() && (candidate.e ?? candidate.s) >= today() && candidate.k !== true);
  await page.goto(`/en/event/${event.id}/`);
  await expect(page.locator('.event-cover-tags .ev-today')).toHaveText('today');
});

test('a single date shows the week it falls in, the day filled', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.k !== true && candidate.e === undefined && candidate.s > today());
  await page.goto(`/en/event/${event.id}/`);
  const filled = page.locator('.ev-cal td[data-mark="next"] time');
  await expect(filled).toHaveCount(1);
  await expect(filled).toHaveAttribute('datetime', event.s);
});

test('the menu button covers none of the words at the end of the page', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const fab = await boxOf(page.locator('.mobile-fab'));
  const words = await page.locator('.ev-foot a, .ev-foot button, .ev-foot p').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  expect(words.length).toBeGreaterThan(0);
  const overlaps = words.filter((box) => box.x < fab.x + fab.width && fab.x < box.x + box.width && box.y < fab.y + fab.height && fab.y < box.y + box.height);
  expect(overlaps).toEqual([]);
});

test('the menu button steps aside while the page is read, and comes back on the way up', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const fab = page.locator('.mobile-fab');
  await page.mouse.wheel(0, 600);
  await expect(fab).toBeHidden();
  await page.mouse.wheel(0, -200);
  await expect(fab).toBeVisible();
});

test('what else is on is photograph tiles, two to a row, touching', async ({ page, request }) => {
  const event = await pick(request, pictured);
  await page.goto(`/en/event/${event.id}/`);
  const tiles = page.locator('.ev-also-list > li');
  expect(await tiles.count()).toBeGreaterThan(1);
  const [first, second] = await Promise.all([boxOf(tiles.nth(0)), boxOf(tiles.nth(1))]);
  expect(Math.round(first.x)).toBe(0);
  expect(Math.round(second.x)).toBe(Math.round(first.width));
  expect(Math.round(second.y)).toBe(Math.round(first.y));
});

test('the page draws its arrows and marks as icons, never as special characters', async ({ page, request }) => {
  const event = await pick(request, (candidate) => pictured(candidate) && candidate.e === undefined);
  await page.goto(`/en/event/${event.id}/`);
  // The event's own words (its name, its description, other events' names) are
  // the source's; everything else on the page is ours.
  const ours = await page.locator('.event-page').evaluate((article) => {
    const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
    const texts = Array.from({ length: 5000 }, () => walker.nextNode()).filter((node): node is Text => node instanceof Text);
    return texts.filter((text) => text.parentElement?.closest('h1, .ev-text, .ev-also-title, .event-editions a') === null).map((text) => text.data).join(' ');
  });
  expect(ours.match(/[←-⇿✕×✓✔▲-▿‹›]|\p{Extended_Pictographic}/gu) ?? []).toEqual([]);
});

test('on the first screen the menu button covers none of the words', async ({ page, request }) => {
  for (const event of [await pick(request, pictured), await pick(request, (candidate) => candidate.img === undefined && candidate.k !== true && candidate.rg === 'liguria')]) {
    await page.goto(`/en/event/${event.id}/`);
    await page.waitForLoadState('load');
    const covered = await page.evaluate(() => {
      const fab = document.querySelector('.mobile-fab');
      const shown = [fab].filter((button): button is Element => button !== null && getComputedStyle(button).visibility !== 'hidden' && Number(getComputedStyle(button).opacity) > 0);
      const words = [...document.querySelectorAll('.event-page h1, .event-page h2, .event-page p, .event-page time, .event-page td, .event-page th, .event-page a, .event-page address')];
      return shown.flatMap((button) => {
        const box = button.getBoundingClientRect();
        return words
          .map((word) => word.getBoundingClientRect())
          .filter((word) => word.width > 0 && word.x < box.right && box.x < word.right && word.y < box.bottom && box.y < word.bottom)
          .map((word) => `${Math.round(word.x)},${Math.round(word.y)}`);
      });
    });
    expect(covered, `event ${event.id}`).toEqual([]);
  }
});

test('a list of other events with nothing in it says nothing, but its way onward stays', async ({ page, request }) => {
  const event = await pick(request, (candidate) => candidate.img === undefined && candidate.k !== true && candidate.rg === 'liguria' && candidate.ct === 'la-spezia');
  await page.goto(`/en/event/${event.id}/`);
  const blocks = page.locator('.ev-also');
  expect(await blocks.count()).toBeGreaterThan(0);
  const shape = await blocks.evaluateAll((all) => all.map((block) => [block.querySelectorAll('h2').length, Number(block.querySelectorAll('.ev-also-item').length > 0)]));
  shape.forEach(([heading, items]) => expect(heading).toBe(items));
  await expect(page.locator('.event-also .ev-onward a')).toHaveCount(1);
});
