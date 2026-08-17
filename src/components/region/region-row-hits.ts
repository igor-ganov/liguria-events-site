/** One row of the picker's server-rendered list: a region header, or one of the
 *  cities that belong to it. */
export type RegionRow = {
  readonly name: string;
  readonly region: string;
  readonly city: boolean;
  readonly header: boolean;
};

/** Which rows survive what you typed, in the order given. A region header stays
 *  visible when any of its cities matched, so a matched city never floats free
 *  of its group; an empty term matches everything. */
export const regionRowHits = (rows: readonly RegionRow[], term: string): readonly boolean[] => {
  const needle = term.trim().toLowerCase();
  const self = rows.map((row) => needle === '' || row.name.includes(needle));
  const grouped = new Set(
    rows.filter((row, index) => row.city && (self[index] ?? false)).map((row) => row.region),
  );
  return rows.map((row, index) => (self[index] ?? false) || (row.header && grouped.has(row.region)));
};
