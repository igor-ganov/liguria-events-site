type StoredRoute = { id?: string; editToken?: string };

const KEY = 'dovego:routes';

/** The routes this device saved locally; unreadable storage means none. */
const readRows = (): readonly StoredRoute[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return [parsed].filter(Array.isArray).flat();
  } catch {
    return [];
  }
};

/** A route saved before edit tokens existed: mint one now, kept locally; the
 *  server claims it (edit_token was empty) on first save. */
const mint = (rows: readonly StoredRoute[], row: StoredRoute): string => {
  const token = crypto.randomUUID().replace(/-/g, '');
  row.editToken = token;
  localStorage.setItem(KEY, JSON.stringify(rows));
  return token;
};

const tokenOf =
  (rows: readonly StoredRoute[]) =>
  (row: StoredRoute): string =>
    row.editToken ?? mint(rows, row);

/** The secret edit token this device stored for the route it created — zero or
 *  one, so a device that never saved this route simply gets nothing. */
export const authorToken = (id: string): readonly string[] => {
  const rows = readRows();
  return rows
    .filter((row) => row?.id === id)
    .slice(0, 1)
    .map(tokenOf(rows));
};
