import { branch } from '../branch.ts';
import { photoKey } from './photo-key.ts';
import { sourceName } from './source-name.ts';
import { sourceOf } from './source-of.ts';
import type { CompactEvent, SourceLink } from './event-schema.ts';

/** One gallery photo: the image, the source it came from (for attribution) and
 *  a link back to that source's page. */
export type GalleryPhoto = Readonly<{ image: string; name: string; href: string }>;

const withImage = (link: SourceLink): boolean => typeof link.image === 'string' && link.image !== '';

// The cover and the photographs of the source page all come from the source the
// event was found at, so they share its credit and its link.
const ownPhotos = (event: CompactEvent): readonly GalleryPhoto[] =>
  [event.img ?? '', ...(event.ph ?? [])]
    .filter((image) => image !== '')
    .map((image) => ({ image, name: sourceName(sourceOf(event)), href: event.u }));

const fromOthers = (event: CompactEvent): readonly GalleryPhoto[] =>
  (event.l ?? [])
    .filter(withImage)
    .map((link) => ({ image: link.image ?? '', name: sourceName(link.source), href: link.url }));

/**
 * Every photograph of an event, cover first: then the ones its own source page
 * carried, then the cover of each other source that wrote about it. Each is
 * credited to and links back to where it came from, and one picture is shown
 * once however many addresses it has. Empty when the event has no image at all.
 */
export const eventGallery = (event: CompactEvent): readonly GalleryPhoto[] =>
  [...ownPhotos(event), ...fromOthers(event)].reduce<readonly GalleryPhoto[]>(
    (kept, photo) =>
      branch(kept.some((existing) => photoKey(existing.image) === photoKey(photo.image)))(
        () => kept,
        () => [...kept, photo],
      ),
    [],
  );
