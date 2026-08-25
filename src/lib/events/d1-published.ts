// D1 event rows → the feed's CompactEvent wire shape. Shared by the
// published-events API (feed augmentation) and the SSR event-detail route, so a
// user-submitted event resolves the same way in both places. Every query and
// every piece of row shaping now lives in its own module; this file stays the
// import surface the API endpoints and the .astro pages already use.
export type { EventContacts, EventRow } from './event-row-types.ts';
export type { EventFormValues } from './detail-row-types.ts';
export type { EventDetail } from './event-for-detail.ts';
export { toCompact } from './to-compact.ts';
export { publishedEvents } from './published-events.ts';
export { publishedEventById } from './published-event-by-id.ts';
export { eventForDetail } from './event-for-detail.ts';
export { editableEventById } from './editable-event-by-id.ts';
