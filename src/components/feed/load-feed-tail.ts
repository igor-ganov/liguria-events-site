import { queryAll } from '../../lib/dom/query-all.ts';
import { trackPending } from '../loading/track-pending.ts';

// One fetch per page, however many things ask for the folded days at once.
const held: { pending?: Promise<void> } = {};

const waiting = (): readonly HTMLTemplateElement[] =>
  queryAll(document, 'template[data-feed-tail][data-src]').filter(
    (fold): fold is HTMLTemplateElement => fold instanceof HTMLTemplateElement,
  );

// A fold that could not be fetched keeps its address, so the next thing that
// needs the days asks again; one that was fetched loses it and holds the days.
const fill = async (fold: HTMLTemplateElement): Promise<void> => {
  const answer = await fetch(fold.dataset['src'] ?? '').catch(() => undefined);
  const html = await [answer].filter((res) => res?.ok === true).map((res) => res?.text())[0];
  [html].filter((text) => text !== undefined).forEach((text) => {
    fold.innerHTML = text;
    fold.removeAttribute('data-src');
  });
};

const settle = (): void => {
  delete held.pending;
};

/**
 * Fetch the folded days of this page into the template that stands for them.
 * The page is served without them (splitFeedTail) and names the file they are
 * in; the browser has usually fetched it already, on a hint, by the time
 * anything asks. Resolves when there is nothing left to fetch — or nothing
 * could be, in which case the page keeps the days it has.
 */
export const loadFeedTail = (): Promise<void> => {
  const fetching = waiting().length > 0;
  held.pending ??= Promise.all(waiting().map(fill)).then(settle);
  // Whoever asks while the days are on their way — a chip, the search, the end
  // of the list coming into view — is told about the wait (trackPending): the
  // control just pressed shows it is busy, or else the list does.
  return [held.pending]
    .filter(() => fetching)
    .map((pending) => trackPending(pending, document.querySelector('[data-feed-list]') ?? undefined))
    .at(0) ?? held.pending;
};
