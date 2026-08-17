import type { ContactRow, EventContacts } from './event-row-types.ts';
import { truthy } from '../truthy.ts';

/** The contact block for the detail page. An empty column leaves its key out, so
 *  the template's presence checks see an absent field rather than a blank one. */
export const eventContactsOf = (row: ContactRow): EventContacts => ({
  ...truthy(row.address).map((address) => ({ address })).at(0),
  ...truthy(row.phone).map((phone) => ({ phone })).at(0),
  ...truthy(row.website).map((website) => ({ website })).at(0),
});
