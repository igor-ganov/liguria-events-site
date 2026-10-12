/** The file a page's own stylesheet is written to, named after the page:
 *  `src/pages/[lang]/event/[id].astro` → `_lang.event._id.css`. No brackets:
 *  the bundler reads them in a file name as a pattern of its own. */
export const pageSheetName = (page: string): string =>
  `${page
    .replace(/^src\/pages\//, '')
    .replace(/\.astro$/, '')
    .replaceAll('/', '.')
    .replaceAll('[', '_')
    .replaceAll(']', '')}.css`;
