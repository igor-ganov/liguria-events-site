import { isDefined } from '../is-defined.ts';

/** The `editToken` key, present only when there is a token to carry — spread
 *  into the saved row and into the answer, as the endpoint always did. */
export const editTokenPart = (token?: string): { editToken: string } | undefined =>
  [token].filter(isDefined).map((editToken) => ({ editToken })).at(0);
