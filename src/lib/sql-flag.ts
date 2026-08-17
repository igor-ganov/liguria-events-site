// SQLite has no boolean column, so a flag is stored as the integer 0 or 1.
const FLAGS = new Map<boolean, 0 | 1>([
  [true, 1],
  [false, 0],
]);

/** A boolean as the 0/1 integer the database stores. */
export const sqlFlag = (value: boolean): 0 | 1 => FLAGS.get(value) ?? 0;
