import { isJunkImage } from '../img/is-junk-image.ts';
import type { CompactEvent } from './event-schema.ts';

/** The picture a scope shows in a link preview: the soonest event that has a
 *  real one. The feed hands its events in date order, so first is soonest. */
export const socialImage = (events: readonly CompactEvent[]): string | undefined =>
  events
    .map((event) => event.img ?? '')
    .filter((src) => src !== '')
    .filter((src) => !isJunkImage(src))
    .at(0);
