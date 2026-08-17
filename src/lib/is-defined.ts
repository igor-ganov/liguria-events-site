/** Narrow `undefined` away. The branch-free stand-in for a guard clause:
 *  `[value].filter(isDefined).map(use).at(0) ?? fallback`. */
export const isDefined = <T>(value: T | undefined): value is T => value !== undefined;
