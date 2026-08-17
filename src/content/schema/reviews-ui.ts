import { z } from 'astro:content';

/** Place reviews: the list, the form and its signed-out state. */
export const reviewsUi = z.object({
  title: z.string(), none: z.string(), rating: z.string(), comment: z.string(),
  submit: z.string(), signIn: z.string(), remove: z.string(), yours: z.string(),
});
