// The photographs a reader sees without scrolling are fetched with the page;
// the ones further down wait until they are scrolled to. A lazy picture on the
// first screen is the last thing the browser fetches, and on a phone it is the
// largest thing on that screen.
//
// A region or a city opens with its highlights, and the days come after them:
// the first card of the page is the first highlight, not the first of a day.
import { expect, test } from '@playwright/test';

// The large cards of a page in the order a reader meets them.
const CARDS = '.pick-hero, [data-feed-list] > .feed-group li[data-id]';

type Picture = Readonly<{ place: number; loading: string; priority: string }>;

// Read from the page as it was served, not as it stands: a photograph that
// fails to load is replaced by the mark of the site, and a test run reaches
// none of the sites the photographs are on.
const pictures = async (selector: string): Promise<readonly Picture[]> => {
  const served = new DOMParser().parseFromString(await (await fetch(location.href)).text(), 'text/html');
  return [...served.querySelectorAll(selector)].flatMap((card, place) =>
    [...card.querySelectorAll('img.photo-card-pic')].map((img) => ({
      place,
      loading: img.getAttribute('loading') ?? '',
      priority: img.getAttribute('fetchpriority') ?? '',
    })),
  );
};

const PAGES: readonly Readonly<{ name: string; path: string }>[] = [
  { name: 'a region', path: '/liguria/' },
  { name: 'a city', path: '/liguria/genova/' },
];

PAGES.forEach(({ name, path }) => {
  test(`${name}: the leading cards fetch their photograph at once, the rest when reached`, async ({ page }) => {
    await page.goto(path);
    const found = await page.evaluate(pictures, CARDS);
    const leading = found.filter((picture) => picture.place < 4);
    const further = found.filter((picture) => picture.place >= 4);
    expect(leading.length).toBeGreaterThan(0);
    expect(leading.every((picture) => picture.loading === 'eager')).toBe(true);
    expect(further.every((picture) => picture.loading === 'lazy')).toBe(true);
    // Only the very first goes ahead of everything else on the page.
    expect(found.filter((picture) => picture.priority === 'high').every((picture) => picture.place === 0)).toBe(true);
    expect(found.filter((picture) => picture.place === 0).every((picture) => picture.priority === 'high')).toBe(true);
  });
});
