import { feedState } from './feed-state.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

const idOf = (chip: HTMLElement): string => chip.dataset['feedHoliday'] ?? '';

const paint = (chip: HTMLElement): void => {
  chip.setAttribute('aria-pressed', String(feedState.holiday === idOf(chip)));
};

/**
 * The holiday chip, when the page has one: it keeps the events the job gave
 * the holiday (their ids ride on the chip). A holiday in the URL that the page
 * no longer offers is dropped, so an old link does not empty the feed.
 */
export const wireFeedHoliday = (refresh: () => void): void => {
  // The page carries a chip for each coming holiday; only the one on today counts.
  const chips = queryAll(document, '[data-feed-holiday]').filter((chip) => idOf(chip) === document.documentElement.dataset['holiday']);
  feedState.holidayIds = new Set(chips.flatMap((chip) => (chip.dataset['ids'] ?? '').split(' ')).filter((id) => id !== ''));
  feedState.holiday = chips.map(idOf).find((id) => id === feedState.holiday) ?? '';
  chips.forEach((chip) => {
    paint(chip);
    chip.addEventListener('click', () => {
      feedState.holiday = [idOf(chip)].find(() => feedState.holiday === '') ?? '';
      paint(chip);
      refresh();
    });
  });
};
