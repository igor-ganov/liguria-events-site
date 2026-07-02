/** Later of two ISO dates — string order is date order. */
export const maxIso = (a: string, b: string): string => [a, b].toSorted().at(-1) ?? a;
