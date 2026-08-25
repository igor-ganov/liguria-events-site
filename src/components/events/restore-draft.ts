import { isDefined } from '../../lib/is-defined.ts';
import { jsonField } from '../../lib/json-field.ts';
import { jsonValue } from '../../lib/json-value.ts';
import { takeDraft } from './take-draft.ts';

const TEXT: readonly string[] = [
  'title',
  'description',
  'startDate',
  'endDate',
  'venue',
  'address',
  'phone',
  'website',
  'coverImage',
  'lat',
  'lng',
];

const setText = (form: HTMLFormElement, draft: Record<string, unknown>, name: string): void =>
  [form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name=${name}]`) ?? undefined]
    .filter(isDefined)
    .forEach((field) => {
      field.value = jsonField(draft, name) ?? field.value;
    });

const setChecks = (form: HTMLFormElement, draft: Record<string, unknown>): void => {
  const chosen = [jsonValue(draft, 'categories')]
    .filter((value): value is readonly unknown[] => Array.isArray(value))
    .flat()
    .map(String);
  form.querySelectorAll<HTMLInputElement>('input[name=category]').forEach((box) => {
    box.checked = chosen.includes(box.value);
  });
  [form.querySelector<HTMLInputElement>('input[name=free]') ?? undefined]
    .filter(isDefined)
    .forEach((box) => {
      box.checked = jsonValue(draft, 'free') === true;
    });
};

/**
 * Put a half-written submission back after its author has signed in.
 *
 * The programme rows are not restored: they are built by their own widget, and
 * a container is the rarer submission. Everything typed into a plain field
 * comes back, which is what makes offering the form before the sign-in an
 * improvement rather than a way to waste somebody's afternoon.
 */
export const restoreDraft = (form: HTMLFormElement): void =>
  [takeDraft()]
    .filter(isDefined)
    .forEach((draft) => {
      TEXT.forEach((name) => setText(form, draft, name));
      setChecks(form, draft);
    });
