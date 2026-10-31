/**
 * Fold a feed day into its strip of pictures (`shut`) or open it. The state is
 * on the day, on its button for assistive technology, and the cards are inert
 * while folded, so the keyboard skips what is only a picture.
 * Self-contained: it is also printed into the page (feedDaysBoot).
 */
export const setDayShut = (group: Element, shut: boolean): void => {
  group.toggleAttribute('data-shut', shut);
  group.querySelectorAll('[data-day-toggle]').forEach((toggle) => toggle.setAttribute('aria-expanded', String(!shut)));
  group.querySelectorAll('.feed-day-part').forEach((part) => part.toggleAttribute('inert', shut));
};
