/** In-site path of a venue page, for localizedUrl(lang, …). */
export const venuePath = (region: string, city: string, slug: string): string =>
  `${region}/${city}/${slug}/`;
