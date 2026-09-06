import { outcomes } from './outcomes.ts';
import type { PageMessage } from './page-message.ts';

/**
 * What the check behind this page found.
 *
 * Awaited, because a page asks the moment it runs and the site usually answers
 * after that. Nothing pending means the page did not come off the device, and
 * then there is nothing to add to what it already says.
 */
export const outcomeFor = async (url: string): Promise<PageMessage> =>
  (await outcomes.get(url)) ?? { kind: 'same', url };
