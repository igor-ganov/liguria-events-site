/** The venue a host page asked for: region, city, slug. */
export type EmbedTarget = Readonly<{ region: string; city: string; slug: string }>;

const SLUG = /^[a-z0-9-]+$/u;

/**
 * Reads `liguria/genova/teatro-carlo-felice` out of whatever a venue pasted.
 *
 * Three segments, each a slug we mint — anything else is refused rather than
 * reinterpreted: this value arrives from somebody else's web page, and it ends
 * up in a lookup and in markup.
 */
export const embedTarget = (value: string): EmbedTarget | undefined => {
  const parts = value.split('/').filter((part) => part !== '');
  const [region = '', city = '', slug = ''] = parts;
  return [parts]
    .filter((found) => found.length === 3)
    .filter(() => [region, city, slug].every((part) => SLUG.test(part)))
    .map(() => ({ region, city, slug }))
    .at(0);
};
