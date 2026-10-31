/**
 * The feed days a reader has folded, read from what was stored: only ISO days,
 * so nothing stored can turn into a selector, and none before `today` (pass ''
 * to keep them all). Anything unreadable is nothing folded.
 *
 * Self-contained on purpose: it is also printed into the page as part of an
 * inline script (FeedDaysBoot), so it must not reach outside itself.
 */
export const shutDaysOf = (raw: string | undefined, today: string): readonly string[] => {
  try {
    const parsed: unknown = JSON.parse(raw ?? '[]');
    return [parsed]
      .filter((value) => Array.isArray(value))
      .flat()
      .filter((day): day is string => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= today);
  } catch {
    return [];
  }
};
