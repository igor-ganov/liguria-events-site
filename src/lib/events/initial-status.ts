import { branch } from '../branch.ts';

/**
 * A link-only event is live the moment it is made: it appears in no feed, no
 * sitemap and no digest, so there is no public exposure for moderation to
 * gate, and an invitation that does not work until a machine approves it is
 * not an invitation. Asking for the city's feed is what waits.
 *
 * Moderation runs either way — a rejection takes the page down — because a
 * link is still shared onward.
 */
export const initialStatus = (visibility: string): string =>
  branch(visibility === 'public')(
    () => 'pending',
    () => 'published',
  );
