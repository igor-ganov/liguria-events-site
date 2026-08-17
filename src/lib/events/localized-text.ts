/** The three-locale text block, with English standing in wherever a translation
 *  is missing — a reader never sees an empty title because their locale was not
 *  filled in. */
export const localizedText = (
  en: string | null,
  it: string | null,
  ru: string | null,
): Readonly<{ en: string; it: string; ru: string }> => {
  const base = en ?? '';
  return { en: base, it: it ?? base, ru: ru ?? base };
};
