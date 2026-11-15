/** The month after a 'YYYY-MM' month, in the same form. */
export const monthAfter = (month: string): string => {
  const [year = 0, number = 1] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number, 1)).toISOString().slice(0, 7);
};
