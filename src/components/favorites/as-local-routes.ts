import { asArray } from './as-array.ts';
import { fieldOf } from './field-of.ts';
import { isString } from './is-string.ts';
import { routeNameOf } from './route-name-of.ts';
import type { MyRoute } from './my-route-types.ts';

/** The device's remembered route links. They are always shareable and never
 *  owned — the account copy, when there is one, carries the real state. */
export const asLocalRoutes = (raw: unknown): readonly MyRoute[] =>
  asArray(raw).flatMap((row) =>
    [fieldOf(row, 'id')]
      .filter(isString)
      .map((id): MyRoute => ({ id, name: routeNameOf(row, id), public: true, owned: false })),
  );
