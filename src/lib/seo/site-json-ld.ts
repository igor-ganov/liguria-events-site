/**
 * WebSite (with a sitewide SearchAction) + Organization for the site's home /
 * region feed; `<` escaped so the string is safe inside the ld+json script.
 */
export const siteJsonLd = (): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Dove Go',
        url: 'https://dovego.it',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://dovego.it/liguria/?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      { '@type': 'Organization', name: 'Dove Go', url: 'https://dovego.it' },
    ],
  }).replace(/</g, '\\u003c');
