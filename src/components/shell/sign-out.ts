/** Drop the session server-side, then land on the feed as a stranger. */
export const signOut = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.href = '/';
};
