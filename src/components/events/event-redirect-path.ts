import type { EventFormMode } from './event-form-mode.ts';

const ID_OF: Readonly<Record<EventFormMode, (id: string, created: string) => string>> = {
  edit: (id) => id,
  create: (_id, created) => created,
};

/** Where the browser goes once the endpoint accepted the form: back to the
 *  edited event, or to the freshly created one — which, for a submission, shows
 *  the author their pending event. */
export const eventRedirectPath = (mode: EventFormMode, id: string, created: string): string =>
  `/event/${ID_OF[mode](id, created)}`;
