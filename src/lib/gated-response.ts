import { isDefined } from './is-defined.ts';

/** The branch-free guard clause for an endpoint. The handler runs for a present
 *  value that satisfies `allow`; otherwise `rejected()` is returned verbatim, so
 *  the status, the body and the order of the checks are exactly those of the
 *  `if (…) return …` it replaces. The handler is never invoked for a rejected
 *  caller — an empty 0-or-1 array maps over nothing. */
export const gatedResponse =
  <T>(value: T | undefined, allow: (value: T) => boolean = () => true) =>
  (rejected: () => Response) =>
  async (handler: (value: T) => Response | Promise<Response>): Promise<Response> =>
    (await Promise.all([value].filter(isDefined).filter(allow).map(handler))).at(0) ?? rejected();
