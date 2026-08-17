import { z } from 'astro:content';

/** Landmark kind labels — one per member of LANDMARK_KINDS. */
const landmarkKinds = z.object({
  castle: z.string(), church: z.string(), museum: z.string(), palace: z.string(),
  monument: z.string(), tower: z.string(), lighthouse: z.string(), square: z.string(),
  park: z.string(), heritage: z.string(), beach: z.string(), attraction: z.string(),
});

/** Copy for the landmarks catalogue and its map layer. */
export const landmarksUi = z.object({
  title: z.string(), intro: z.string(), more: z.string(), empty: z.string(),
  search: z.string(), kinds: landmarkKinds,
});
