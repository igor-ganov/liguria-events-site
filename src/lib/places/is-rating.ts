/** A rating a review may carry: a whole number of stars, 1 to 5. */
export const isRating = (rating: number): boolean =>
  Number.isInteger(rating) && rating >= 1 && rating <= 5;
