import type { EventFormMode } from './event-form-mode.ts';

/** Where a submit goes, how, and what the status line says while it is in
 *  flight. */
export type SubmitTarget = {
  readonly url: string;
  readonly method: 'PATCH' | 'POST';
  readonly pending: string;
};

const TARGETS: Readonly<Record<EventFormMode, (id: string) => SubmitTarget>> = {
  edit: (id) => ({ url: `/api/events/${id}`, method: 'PATCH', pending: 'Saving…' }),
  create: () => ({ url: '/api/events/submit', method: 'POST', pending: 'Submitting…' }),
};

export const eventSubmitTarget = (mode: EventFormMode, id: string): SubmitTarget =>
  TARGETS[mode](id);
