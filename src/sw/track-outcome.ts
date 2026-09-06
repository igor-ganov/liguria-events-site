import { outcomes } from './outcomes.ts';
import type { PageMessage } from './page-message.ts';

/** Beyond this many pages the oldest answers are of no interest to anyone and
 *  the worker should not be holding them. */
const LIMIT = 32;

/** Remember what the check behind a page finds, for the document about to ask. */
export const trackOutcome = (url: string, work: Promise<PageMessage>): Promise<PageMessage> => {
  [outcomes].filter((held) => held.size >= LIMIT).forEach((held) => held.clear());
  outcomes.set(url, work);
  return work;
};
