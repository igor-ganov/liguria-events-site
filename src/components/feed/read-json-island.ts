/** Read a `<script type="application/json">` island the page embedded. Anything
 *  missing or malformed falls back, so a broken island never breaks the feed. */
export const readJsonIsland = <T>(id: string, fallback: T): T => {
  try {
    const value: T = JSON.parse(document.getElementById(id)?.textContent ?? '');
    return value;
  } catch {
    return fallback;
  }
};
