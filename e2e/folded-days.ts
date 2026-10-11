import type { Page } from '@playwright/test';

/**
 * The days a feed page keeps folded away, as the markup of the file they are
 * served in. The page names that file in a hint and does not carry the days
 * itself, so a spec that wants to know what is folded reads the file — the
 * address stays on the page after the days have been brought in, which makes
 * this answer the same before and after.
 */
export const foldedDays = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const hint = document.querySelector<HTMLLinkElement>('link[rel="prefetch"][href^="/data/tails/"]');
    const answer = await fetch(hint?.getAttribute('href') ?? '/data/tails/none');
    const text = await answer.text();
    return [text].filter(() => answer.ok).join('');
  });
