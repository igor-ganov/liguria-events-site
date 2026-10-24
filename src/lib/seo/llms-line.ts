/** One entry of an llms.txt section: a link and what is behind it. The
 *  convention is Markdown, read by a model rather than rendered. */
export const llmsLine = (label: string, url: string, note: string): string =>
  `- [${label}](${url}): ${note}`;
