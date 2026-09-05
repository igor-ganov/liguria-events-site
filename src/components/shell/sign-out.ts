import { forgetCachedPages } from '../pwa/forget-cached-pages.ts';

/** Drop the session server-side, forget the pages kept for offline reading,
 *  then land on the feed as a stranger. The cache holds pages meant for
 *  everybody, but emptying it here is what makes that claim cheap to keep. */
export const signOut = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
  await forgetCachedPages();
  location.href = '/';
};
