import { branch } from '../branch.ts';

type Seo = Readonly<{ title: string; description: string }>;

// Italian says "a Genova" but "in Liguria". The facet copy is written for a
// city; on a region page its " a {place}" becomes " in {place}". The other
// languages already say "in" / "в" for both and pass through unchanged.
const inRegion = (text: string): string => text.replaceAll(' a {place}', ' in {place}');

/** A facet's copy as it reads for the scope: a city's as written, a region's
 *  with the region's preposition. */
export const regionPhrase =
  (city: string | undefined) =>
  (seo: Seo): Seo =>
    branch((city ?? '') !== '')(
      () => seo,
      () => ({ title: inRegion(seo.title), description: inRegion(seo.description) }),
    );
