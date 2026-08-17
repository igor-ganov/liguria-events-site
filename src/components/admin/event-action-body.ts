import { isDefined } from '../../lib/is-defined.ts';

/** The body POSTed to /api/admin/action. */
export type EventActionBody = Readonly<{ id: string; action: string }>;

/** The 0-or-1 request a clicked submission asks for: a row without an id, or a
 *  button without an action, yields none. */
export const eventActionBody = (
  id: string | undefined,
  action: string | undefined,
): readonly EventActionBody[] =>
  [id]
    .filter(isDefined)
    .filter((value) => value !== '')
    .flatMap((event) =>
      [action]
        .filter(isDefined)
        .filter((value) => value !== '')
        .map((act) => ({ id: event, action: act })),
    );
