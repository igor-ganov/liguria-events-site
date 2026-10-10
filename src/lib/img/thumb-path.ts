/** Where a small copy is served from: the uploads route of our own origin,
 *  which reads the same storage the copies are written to. */
export const thumbPath = (key: string): string => `/uploads/thumbs/${key}.webp`;
