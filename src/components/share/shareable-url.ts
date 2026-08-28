/** The marker the redirect adds so the page knows to congratulate its author. */
const PRIVATE_MARK = 'created';

/**
 * The address to hand to somebody else. The page the author lands on carries a
 * note to itself in the query; friends were receiving it pasted into their chat.
 */
export const shareableUrl = (href: string): string => {
  const parsed = URL.parse(href);
  return [parsed]
    .filter((url): url is URL => url !== null)
    .map((url) => {
      url.searchParams.delete(PRIVATE_MARK);
      return url.toString();
    })
    .at(0) ?? href;
};
