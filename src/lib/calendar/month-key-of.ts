/** 'YYYY-MM-DD' → 'YYYY-MM' month key. */
export const monthKeyOf = (isoDate: string): string => isoDate.slice(0, 7);
