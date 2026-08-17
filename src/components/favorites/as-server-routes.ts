import { asArray } from './as-array.ts';
import { fieldOf } from './field-of.ts';
import { isString } from './is-string.ts';
import { routeNameOf } from './route-name-of.ts';
import type { MyRoute } from './my-route-types.ts';

/** The signed-in account's stored routes, with their real privacy state. */
export const asServerRoutes = (raw: unknown): readonly MyRoute[] =>
  asArray(raw).flatMap((row) =>
    [fieldOf(row, 'id')].filter(isString).map(
      (id): MyRoute => ({
        id,
        name: routeNameOf(row, id),
        public: fieldOf(row, 'public') === true,
        owned: true,
      }),
    ),
  );
