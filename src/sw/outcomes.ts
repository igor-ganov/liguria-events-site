import type { PageMessage } from './page-message.ts';

/**
 * What the worker is finding behind each page it has served from the device,
 * kept until somebody asks.
 *
 * It has to be kept rather than pushed: while the worker answers a navigation,
 * the document that navigation produces does not exist yet and is not a client,
 * so a message sent at that moment goes to the page being navigated AWAY from
 * and to nobody else. The new document asks the moment it runs.
 */
export const outcomes = new Map<string, Promise<PageMessage>>();
