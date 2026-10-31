import { feedState } from './feed-state.ts';

/** Show the range the state holds in the two date inputs. */
export const syncFeedDates = (): void => {
  document.querySelectorAll<HTMLInputElement>('[data-feed-from]').forEach((input) => {
    input.value = feedState.from;
  });
  document.querySelectorAll<HTMLInputElement>('[data-feed-to]').forEach((input) => {
    input.value = feedState.to;
  });
};
