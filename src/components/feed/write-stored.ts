/** Keep `value` under `key` on this device; a storage that refuses it (private
 *  modes, a full quota) leaves the page working as it is. */
export const writeStored = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* nothing remembered, nothing broken */
  }
};
