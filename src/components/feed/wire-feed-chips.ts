import { branch } from '../../lib/branch.ts';
import { feedState } from './feed-state.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { queryAll } from '../../lib/dom/query-all.ts';

const wireCat =
  (refresh: () => void) =>
  (chip: HTMLElement): void => {
    const cat = chip.dataset['feedCat'] ?? '';
    chip.setAttribute('aria-pressed', String(feedState.cats.has(cat)));
    chip.addEventListener('click', () => {
      const on = !feedState.cats.has(cat);
      branch(on)(
        () => {
          feedState.cats.add(cat);
        },
        () => {
          feedState.cats.delete(cat);
        },
      );
      chip.setAttribute('aria-pressed', String(on));
      refresh();
    });
  };

const wireToggle = (selector: string, key: 'free' | 'gems', refresh: () => void): void => {
  [document.querySelector<HTMLElement>(selector) ?? undefined]
    .filter(isDefined)
    .forEach((button) => {
      button.setAttribute('aria-pressed', String(feedState[key]));
      button.addEventListener('click', () => {
        feedState[key] = !feedState[key];
        button.setAttribute('aria-pressed', String(feedState[key]));
        refresh();
      });
    });
};

const clearAll = (refresh: () => void): void => {
  feedState.cats.clear();
  feedState.free = false;
  feedState.gems = false;
  queryAll(document, '[data-feed-cat], [data-feed-free], [data-feed-gems]').forEach((chip) =>
    chip.setAttribute('aria-pressed', 'false'),
  );
  refresh();
};

/** The category chips, the two flag toggles and the clear button. */
export const wireFeedChips = (refresh: () => void): void => {
  queryAll(document, '[data-feed-cat]').forEach(wireCat(refresh));
  wireToggle('[data-feed-free]', 'free', refresh);
  wireToggle('[data-feed-gems]', 'gems', refresh);
  document.querySelector('[data-feed-clear]')?.addEventListener('click', () => clearAll(refresh));
};
