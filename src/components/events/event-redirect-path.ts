import type { EventFormMode } from './event-form-mode.ts';

const ID_OF: Readonly<Record<EventFormMode, (id: string, created: string) => string>> = {
  edit: (id) => id,
  create: (_id, created) => created,
};

// A freshly created event arrives with `?created`, which is how the page knows
// to lead with its link. The whole point of making one here is having something
// to send, and until now the author was dropped on the page with no way to get
// the URL out of it but the address bar.
const MARK: Readonly<Record<EventFormMode, string>> = { edit: '', create: '?created=1' };

/** Where the browser goes once the endpoint accepted the form: back to the
 *  edited event, or to the freshly created one. */
export const eventRedirectPath = (mode: EventFormMode, id: string, created: string): string =>
  `/event/${ID_OF[mode](id, created)}${MARK[mode]}`;
