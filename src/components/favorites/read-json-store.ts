/** Shell: read one localStorage key as parsed JSON. A blocked store or a
 *  corrupted value yields undefined, which every `as…Map` reader turns into an
 *  empty map. */
export const readJsonStore = (key: string): unknown => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? '0');
    return raw;
  } catch {
    return undefined;
  }
};
