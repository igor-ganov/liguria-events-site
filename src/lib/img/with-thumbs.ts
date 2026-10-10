import { largeCover } from './large-cover.ts';
import { thumbKey } from './thumb-key.ts';
import { thumbPath } from './thumb-path.ts';
import type { CompactEvent } from '../events/event-schema.ts';

/**
 * Point an event at the small copy of its cover, when one has been made. The
 * copy is of the file a card would otherwise have fetched from the source, so
 * its name is taken from that address. An event whose copy is not there yet is
 * returned as it came and keeps showing the source's own file.
 */
export const withThumbs =
  (made: ReadonlySet<string>) =>
  (event: CompactEvent): CompactEvent =>
    [event.img ?? '']
      .map((img) => thumbKey(largeCover(img)))
      .filter((key) => event.img !== undefined && made.has(key))
      .map((key): CompactEvent => ({ ...event, th: thumbPath(key) }))
      .at(0) ?? event;
