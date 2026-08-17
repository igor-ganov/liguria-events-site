import { asIdList } from './as-id-list.ts';
import { parseJsonText } from './parse-json-text.ts';
import { readFavorites } from './init-favorites.ts';

/** Shell: the owner's favourites — the server island rendered into the page,
 *  plus whatever this device has in localStorage. */
export const ownerFavourites = (): ReadonlySet<string> => {
  const island = document.querySelector<HTMLElement>('#route-favorites')?.textContent;
  return new Set([...asIdList(parseJsonText(island ?? undefined)), ...readFavorites()]);
};
