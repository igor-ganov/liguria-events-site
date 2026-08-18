// What is left of an address once the city it repeats, any province code and
// the punctuation between them are taken out.
const remainder = (address: string, locality: string): string =>
  address
    .toLowerCase()
    .replace(locality.toLowerCase(), '')
    .replace(/\b[a-z]{2}\b/g, '')
    .replace(/[\s,.;-]+/g, '');

/**
 * The street line of an address, or nothing when the address only repeats the
 * city — "Genova, GE" is the locality twice over, and stating it as a street
 * makes the postal address read as a real one when it is not.
 */
export const streetLine = (
  address: string | undefined,
  locality: string,
): string | undefined =>
  [address ?? '']
    .filter((value) => value.trim() !== '')
    .filter((value) => remainder(value, locality) !== '')
    .at(0);
