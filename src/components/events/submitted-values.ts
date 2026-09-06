import { eventFormValues } from './event-form-values.ts';
import { readProgramme } from './read-programme.ts';

/**
 * What the form sends.
 *
 * The version the author started from rides along on an edit, so that a change
 * which waited in the offline queue cannot land on top of a newer one without
 * anybody being asked. A create has no version to claim and sends none.
 */
export const submittedValues = (form: HTMLFormElement): Record<string, unknown> => ({
  ...eventFormValues(new FormData(form), readProgramme(form)),
  ...Object.fromEntries(
    [form.dataset['baseUpdated']].filter(Boolean).map((at) => ['baseUpdatedAt', at]),
  ),
});
