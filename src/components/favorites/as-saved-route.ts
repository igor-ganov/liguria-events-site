import { fieldOf } from './field-of.ts';
import { isString } from './is-string.ts';

/** What POST /api/routes hands back for a freshly saved route. */
export type SavedRoute = Readonly<{ id: string; url: string; editToken?: string }>;

/** The save response as a 0-or-1 list: nothing at all unless both the id and the
 *  share URL came back as strings. */
export const asSavedRoute = (body: unknown): readonly SavedRoute[] =>
  [fieldOf(body, 'id')].filter(isString).flatMap((id) =>
    [fieldOf(body, 'url')].filter(isString).map((url) => ({
      id,
      url,
      ...[fieldOf(body, 'editToken')].filter(isString).map((editToken) => ({ editToken })).at(0),
    })),
  );
