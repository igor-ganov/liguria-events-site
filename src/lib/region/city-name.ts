const cap = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** Turn a city slug into a display name: `la-spezia` → `La Spezia`. */
export const cityName = (slug: string): string => slug.split('-').map(cap).join(' ');
