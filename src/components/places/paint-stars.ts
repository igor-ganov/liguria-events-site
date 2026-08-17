/** Light the first `rating` stars of the picker and dim the rest. */
export const paintStars = (stars: readonly HTMLElement[], rating: number): void => {
  stars.forEach((star, index) => star.classList.toggle('sel', index < rating));
};
