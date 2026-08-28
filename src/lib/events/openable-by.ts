/**
 * Whether somebody holding the link may open the page.
 *
 * An event is reachable by its own URL from the moment it is made — that is
 * what the author was told when they were handed the link, and an invitation
 * that stops working while a machine thinks is not an invitation. Only a
 * rejection takes it down, because a link is shared onward.
 *
 * Being reachable is not being listed: feeds, sitemap and digest are gated
 * separately, on status AND visibility.
 */
export const openableBy = (status: string, owned: boolean): boolean =>
  status !== 'rejected' || owned;
