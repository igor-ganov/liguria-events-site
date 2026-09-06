import { branch } from '../../lib/branch.ts';
import { setText } from '../../lib/dom/set-text.ts';
import { eventRedirectPath } from './event-redirect-path.ts';
import { eventSubmitTarget } from './event-submit-target.ts';
import { keepForLater } from './keep-for-later.ts';
import { sendVerdict } from '../../lib/outbox/send-verdict.ts';
import type { SubmitTarget } from './event-submit-target.ts';
import { jsonField } from '../../lib/json-field.ts';
import { openSignin } from '../shell/open-signin.ts';
import { stashDraft } from './stash-draft.ts';
import { submittedValues } from './submitted-values.ts';
import type { EventFormMode } from './event-form-mode.ts';

type SubmitResult = { readonly id: string | undefined; readonly detail: string | undefined };

type FormParts = {
  readonly form: HTMLFormElement;
  readonly status: HTMLElement | undefined;
  readonly mode: EventFormMode;
  readonly id: string;
  /** What to say when the API asks who they are. */
  readonly signinNote: string;
};

const settle = (parts: FormParts, ok: boolean, data: SubmitResult): void =>
  branch(ok)(
    () => {
      location.href = eventRedirectPath(parts.mode, parts.id, data.id ?? '');
    },
    () => setText(parts.status, data.detail ?? 'Please check the form and try again.'),
  );

const answered = async (parts: FormParts, target: SubmitTarget, values: Record<string, unknown>): Promise<void> => {
  const res = await fetch(target.url, {
    method: target.method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(values),
  }).catch(() => undefined);
  // Nothing came back: no signal, a captive portal, a tunnel that is up but
  // dead. The author's work goes in the queue rather than on the floor.
  switch (sendVerdict(res?.status)) {
    case 'queue':
      return keepForLater(target, values, parts.status);
  }
  // 401 is not a mistake in the form, and saying "check the form" would send
  // the author looking for one. Keep what they wrote and ask them to sign in.
  return branch(res?.status === 401)(
    () => {
      stashDraft(values);
      setText(parts.status, parts.signinNote);
      openSignin();
    },
    async () => {
      const data: unknown = await res?.json().catch(() => ({}));
      settle(parts, res?.ok === true, { id: jsonField(data, 'id'), detail: jsonField(data, 'detail') });
    },
  );
};

const send = async (parts: FormParts): Promise<void> => {
  const target = eventSubmitTarget(parts.mode, parts.id);
  setText(parts.status, target.pending);
  return answered(parts, target, submittedValues(parts.form));
};

/** Send the form to the API in JSON, then navigate to the event's own page. */
export const wireEventSubmit = (parts: FormParts): void => {
  parts.form.addEventListener('submit', (event) => {
    event.preventDefault();
    void send(parts);
  });
};
