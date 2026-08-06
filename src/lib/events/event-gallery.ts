import { branch } from '../branch.ts';
import type { CompactEvent, SourceLink } from './event-schema.ts';
import { sourceName } from './source-name.ts';
import { sourceOf } from './source-of.ts';

/** One gallery photo: the image, the source it came from (for attribution) and
 *  a link back to that source's page. */
export type GalleryPhoto = Readonly<{ image: string; name: string; href: string }>;

// The primary source's cover is the hero; every other source that carried its
// own image adds a photo, each attributed to — and linking back to — its
// source. Deduped by image URL so a shared cover never appears twice.
const withImage = (link: SourceLink): boolean => typeof link.image === 'string' && link.image !== '';

const primaryPhoto = (event: CompactEvent): readonly GalleryPhoto[] =>
  branch(event.img === undefined || event.img === '')(
    () => [],
    () => [{ image: event.img ?? '', name: sourceName(sourceOf(event)), href: event.u }],
  );

/** Hero-first list of every source photo for an event, attributed and deduped.
 *  Empty when the event has no image at all. */
export const eventGallery = (event: CompactEvent): readonly GalleryPhoto[] => {
  const fromSources: readonly GalleryPhoto[] = (event.l ?? [])
    .filter(withImage)
    .map((link) => ({ image: link.image ?? '', name: sourceName(link.source), href: link.url }));
  return [...primaryPhoto(event), ...fromSources].reduce<readonly GalleryPhoto[]>(
    (kept, photo) =>
      branch(kept.some((existing) => existing.image === photo.image))(
        () => kept,
        () => [...kept, photo],
      ),
    [],
  );
};
