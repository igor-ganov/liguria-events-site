import { branch } from '../../lib/branch.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { eventFormValues } from './event-form-values.ts';
import { eventRedirectPath } from './event-redirect-path.ts';
import { eventSubmitTarget } from './event-submit-target.ts';
import type { EventFormMode } from './event-form-mode.ts';

type SubmitResult = { readonly id?: string; readonly detail?: string };

type FormParts = {
  readonly form: HTMLFormElement;
  readonly status: HTMLElement | undefined;
  readonly mode: EventFormMode;
  readonly id: string;
};

const settle = (parts: FormParts, ok: boolean, data: SubmitResult): void =>
  branch(ok)(
    () => {
      location.href = eventRedirectPath(parts.mode, parts.id, data.id ?? '');
    },
    () => setText(parts.status, data.detail ?? 'Please check the form and try again.'),
  );

const send = async (parts: FormParts): Promise<void> => {
  const target = eventSubmitTarget(parts.mode, parts.id);
  setText(parts.status, target.pending);
  const res = await fetch(target.url, {
    method: target.method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(eventFormValues(new FormData(parts.form))),
  });
  const data: SubmitResult = await res.json().catch(() => ({}));
  settle(parts, res.ok, data);
};

/** Send the form to the API in JSON, then navigate to the event's own page. */
export const wireEventSubmit = (parts: FormParts): void => {
  parts.form.addEventListener('submit', (event) => {
    event.preventDefault();
    void send(parts);
  });
};
