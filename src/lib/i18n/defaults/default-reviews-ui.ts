import type { Ui } from '../ui-schema.ts';

/** Review vocabulary, in its own module like the other sections that carry
 *  their own words rather than borrowing the page's. */
export const DEFAULT_REVIEWS_UI: Ui['reviews'] = {
  title: 'Reviews',
  none: 'No reviews yet — be the first.',
  rating: 'Your rating',
  comment: 'Add a comment (optional)',
  submit: 'Post review',
  signIn: 'Sign in to leave a review',
  remove: 'Remove',
  yours: 'Your review',
};
