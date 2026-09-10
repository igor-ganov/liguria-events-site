import { ARCHIVE_COVER } from './archive-cover-url.ts';
import { branch } from '../branch.ts';
import type { GalleryPhoto } from './event-gallery.ts';

const MARK: GalleryPhoto = { image: ARCHIVE_COVER, name: '', href: '' };

/**
 * What an event page shows at the top.
 *
 * An event that is over keeps its page — the link somebody shared has to keep
 * working — but not its photograph: a picture of a full square reads as an
 * invitation to something that is no longer happening, and it is hotlinked
 * from a newspaper that will eventually stop serving it. The rest of the
 * gallery goes with it.
 */
export const archivedCover = (
  gallery: readonly GalleryPhoto[],
  passed: boolean,
): readonly GalleryPhoto[] => branch(passed)(() => [MARK], () => gallery);
