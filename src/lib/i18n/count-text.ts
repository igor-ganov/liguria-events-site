import { pluralForm } from './plural-form.ts';
import type { Locale } from './locales.ts';

/** A phrase about a number, in the forms the language needs. */
export type CountForms = Readonly<
  Partial<Record<Intl.LDMLPluralRule, string | undefined>> & { other: string }
>;

/**
 * The phrase for this many things. A language that does not need a form simply
 * leaves it out, and `other` carries whatever is left — so a dictionary can
 * grow a form without every locale having to.
 */
export const countText = (
  lang: Locale,
  forms: CountForms,
  count: number,
  place: string,
): string =>
  (forms[pluralForm(lang, count)] ?? forms.other)
    .replace('{n}', String(count))
    .replace('{place}', place);
