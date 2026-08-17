import { asArray } from './as-array.ts';
import { fieldOf } from './field-of.ts';

const KEEP = 50;

/** A route this device created, kept locally so an anonymous author still finds
 *  the links they made — and the secret token that authorises editing them. */
export type RememberedRoute = Readonly<{
  id: string;
  name: string;
  data: string;
  editToken?: string;
}>;

/** The local route list with this route on top; a previous copy of the same
 *  route drops out, and the list is capped. */
export const nextRememberedRoutes = (
  previous: unknown,
  route: RememberedRoute,
  createdAt: number,
): readonly unknown[] =>
  [
    { ...route, createdAt },
    ...asArray(previous).filter((row) => fieldOf(row, 'id') !== route.id),
  ].slice(0, KEEP);
