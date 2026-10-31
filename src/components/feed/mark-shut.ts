/** Fold, under `root`, every feed day in `days` not folded yet. The folding is
 *  passed in (setDayShut) so this stays self-contained: it is also printed into
 *  the page (feedDaysBoot). */
export const markShut = (
  days: readonly string[],
  root: ParentNode,
  shut: (group: Element, folded: boolean) => void,
): void => {
  days.forEach((day) => {
    root.querySelectorAll(`.feed-group[data-day="${day}"]:not([data-shut])`).forEach((group) => shut(group, true));
  });
};
