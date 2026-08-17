/** An average rating at one decimal place. No reviews means no average, so an
 *  absent or zero average reads as 0 rather than rounding into a fake score. */
export const roundedRating = (avg: number | null | undefined): number =>
  [avg ?? 0]
    .filter((value) => value !== 0)
    .map((value) => Math.round(value * 10) / 10)
    .at(0) ?? 0;
