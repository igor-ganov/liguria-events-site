/** Where a dragged block lands in the day's sequence: after every neighbour
 *  whose centre it has passed. */
export const reorderIndex = (centres: readonly number[], dragged: number): number =>
  centres.filter((centre) => centre < dragged).length;
