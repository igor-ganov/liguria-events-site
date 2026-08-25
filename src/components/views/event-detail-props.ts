import type { CompactEvent } from '../../lib/events/event-schema.ts';
import type { EventContacts } from '../../lib/events/d1-published.ts';
import type { Locale } from '../../lib/i18n/locales.ts';

/** What the event page is given. `visibility` is 'link' when the page exists
 *  only for whoever holds its URL; a crawled event has no row and no
 *  visibility, and is public by definition. */
export type EventDetailProps = Readonly<{
  lang: Locale;
  event: CompactEvent;
  editable?: boolean | undefined;
  status?: string | undefined;
  visibility?: string | undefined;
  contacts?: EventContacts | undefined;
}>;
