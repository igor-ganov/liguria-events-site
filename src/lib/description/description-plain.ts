/** Strip the Markdown (and any leading type tag) to a single-line plain string
 *  for meta tags, cards and search — where the markers would otherwise leak. */
export const descriptionPlain = (markdown: string): string =>
  markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[[a-z-]+\]\s*/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
