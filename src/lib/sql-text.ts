/** A form field as the value bound to a nullable text column. A field that is
 *  empty — or that `allow` rejects — becomes the database's own empty marker,
 *  which the D1 driver requires verbatim: it refuses an absent binding, so this
 *  is deliberately not the project's usual absent-value convention. */
export const sqlText = (
  value: string,
  allow: (value: string) => boolean = (candidate) => candidate !== '',
): string | null => [value].filter(allow).at(0) ?? null;
