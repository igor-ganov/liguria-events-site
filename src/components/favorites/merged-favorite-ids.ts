import { asIdList } from './as-id-list.ts';
import { favoritesState } from './favorites-state.ts';
import { fieldOf } from './field-of.ts';
import { isDefined } from '../../lib/is-defined.ts';
import { sendFavorites } from './send-favorites.ts';

const body = async (res: Response | undefined): Promise<unknown> => {
  const parsed = await Promise.all(
    [res].filter(isDefined).filter((r) => r.ok).map((r) => r.json().catch((): unknown => undefined)),
  );
  return parsed.at(0);
};

/** Shell: hand the anonymous set to the account and read the merged result back
 *  — as a 0-or-1 list, so a failed or malformed answer changes nothing. */
export const mergedFavoriteIds = async (): Promise<readonly (readonly string[])[]> => {
  const answer = await body(await sendFavorites('POST', { sync: [...favoritesState.ids] }));
  return [fieldOf(answer, 'favorites')].filter((list) => Array.isArray(list)).map(asIdList);
};
