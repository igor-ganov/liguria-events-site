import { queryAll } from '../../lib/dom/query-all.ts';

// Which photograph is in view: the strip snaps one per screen, so how far it
// has scrolled, in widths of itself, is the answer.
const shown = (strip: HTMLElement): number => Math.round(strip.scrollLeft / Math.max(strip.clientWidth, 1)) + 1;

const wire = (cover: HTMLElement): void =>
  queryAll(cover, '[data-shots]').forEach((strip) => {
    strip.addEventListener(
      'scroll',
      () => queryAll(cover, '[data-shot-at]').forEach((count) => (count.textContent = String(shown(strip)))),
      { passive: true },
    );
    queryAll(cover, '[data-shot-step]').forEach((button) =>
      button.addEventListener('click', () =>
        strip.scrollBy({ left: Number(button.dataset['shotStep'] ?? 0) * strip.clientWidth, behavior: 'smooth' }),
      ),
    );
  });

/**
 * The photographs at the top of an event page are one strip the browser
 * scrolls and snaps on its own. This only keeps the count beside them true,
 * and gives a reader with no finger on the screen two buttons to step with.
 */
export const wireEventShots = (): void => queryAll(document, '.event-cover').forEach(wire);
