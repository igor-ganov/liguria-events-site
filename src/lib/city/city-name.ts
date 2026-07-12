/** Display names for the cities the crawler files events under (the capitals of
 *  Italy's provinces). A slug missing from the table falls back to its own
 *  title-cased form rather than disappearing from the picker. */
const NAMES: Readonly<Record<string, string>> = {
  'reggio-calabria': 'Reggio Calabria',
  'reggio-emilia': 'Reggio Emilia',
  'ascoli-piceno': 'Ascoli Piceno',
  'vibo-valentia': 'Vibo Valentia',
  'la-spezia': 'La Spezia',
  'l-aquila': "L'Aquila",
  forli: 'Forlì',
};

const titleCase = (slug: string): string =>
  slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const cityName = (slug: string): string => NAMES[slug] ?? titleCase(slug);
