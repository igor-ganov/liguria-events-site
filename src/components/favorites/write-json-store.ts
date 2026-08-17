/** Shell: persist a value under one localStorage key; a blocked store is not an
 *  error, the arrangement simply does not survive the session. */
export const writeJsonStore = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked — ignore */
  }
};
