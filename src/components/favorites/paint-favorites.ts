import { favCountLabel } from './fav-count-label.ts';
import { favoritesState } from './favorites-state.ts';

/** Shell: reflect the held ids in every toggle button and count badge on the
 *  page — cards rendered now and after any SPA nav. */
export const paintFavorites = (): void => {
  const ids = favoritesState.ids;
  document.querySelectorAll<HTMLElement>('[data-fav-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(ids.has(button.dataset['favId'] ?? '')));
  });
  document.querySelectorAll<HTMLElement>('[data-fav-count]').forEach((badge) => {
    badge.textContent = favCountLabel(ids.size);
    badge.hidden = ids.size === 0;
  });
};
