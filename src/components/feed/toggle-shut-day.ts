/** The folded days after one is folded (`shut`) or opened, in date order and
 *  each day once. */
export const toggleShutDay = (days: readonly string[], day: string, shut: boolean): readonly string[] =>
  [...new Set([...days.filter((each) => each !== day), ...[day].filter(() => shut)])].toSorted();
