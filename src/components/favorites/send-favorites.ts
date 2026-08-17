/** Shell: post a favourites change to the account. A failed request is not an
 *  error — localStorage still holds the change and the next sync reconciles. */
export const sendFavorites = async (method: string, body: object): Promise<Response | undefined> => {
  try {
    return await fetch('/api/favorites', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    return undefined;
  }
};
