// Client side of EventForm (create + edit). Uploads the chosen image to R2 via
// /api/events/image first, then on submit navigates to the event's own page —
// which, for a fresh submission, shows the author their pending event.
import { isDefined } from '../../lib/is-defined.ts';
import { eventFormMode } from './event-form-mode.ts';
import { restoreDraft } from './restore-draft.ts';
import { wireEventSubmit } from './wire-event-submit.ts';
import { wireImageUpload } from './wire-image-upload.ts';
import { wireProgramme } from './wire-programme.ts';

// A build pinned to a fixed "today" (the dev/preview builds) must not date the
// form from the visitor's clock, or the two disagree.
const today = (): string =>
  import.meta.env.PUBLIC_FIXED_TODAY ?? new Date().toISOString().slice(0, 10);

// Only an untouched start date is dated for the author — an edit keeps its own.
const fillStart = (form: HTMLFormElement): void => {
  [form.querySelector<HTMLInputElement>('input[name=startDate]') ?? undefined]
    .filter(isDefined)
    .filter((input) => input.value === '')
    .forEach((input) => {
      input.value = today();
    });
};

const setup = (form: HTMLFormElement): void => {
  form.dataset['ready'] = 'true';
  fillStart(form);
  // Before the widgets: a restored value must not be overwritten by a default.
  restoreDraft(form);
  wireImageUpload(form);
  wireProgramme(form);
  wireEventSubmit({
    form,
    status: document.getElementById('submit-status') ?? undefined,
    mode: eventFormMode(form.dataset['mode']),
    id: form.dataset['id'] ?? '',
    signinNote: form.dataset['signinNote'] ?? '',
  });
};

const isForm = (node: HTMLElement | undefined): node is HTMLFormElement =>
  node instanceof HTMLFormElement;

/** Wire the event form once — an SPA swap re-runs this against a fresh form. */
export const initEventForm = (): void => {
  [document.getElementById('event-form') ?? undefined]
    .filter(isForm)
    .filter((form) => form.dataset['ready'] !== 'true')
    .forEach(setup);
};
