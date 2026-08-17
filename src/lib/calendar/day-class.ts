/** Cell class per day kind (`dayKindOf`): days outside the month are dimmed,
 *  today is highlighted, every other in-month day is plain. */
export const DAY_CLASS: Record<string, string> = {
  out: 'cal-day cal-day--out',
  today: 'cal-day cal-day--today',
  in: 'cal-day',
};
