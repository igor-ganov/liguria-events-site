const isUnknownArray = (value: unknown): value is readonly unknown[] => Array.isArray(value);

/** An unknown (JSON-parsed) value as a list — empty when it is not an array. */
export const asArray = (raw: unknown): readonly unknown[] =>
  [raw].filter(isUnknownArray).at(0) ?? [];
