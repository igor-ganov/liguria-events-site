/** The absolute URL of a page that is not in a language: one address, no
 *  prefix. The legal pages are the whole of this category. */
export const rootUrl = (path: string, site: URL | undefined): string =>
  new URL(`/${path}`, site).toString();
