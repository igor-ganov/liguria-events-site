/**
 * Whether a failed-load event came from one of OUR event pictures — a feed
 * thumbnail, a detail hero, or a gallery photo. The `error` event is listened
 * for on the document in the capture phase (it does not bubble), so this keeps
 * unrelated images on the page out of the fallback path.
 */
export const isEventImage = (target: unknown): target is HTMLImageElement =>
  target instanceof HTMLImageElement &&
  (target.classList.contains('mini-thumb') ||
    Boolean(target.closest('.event-hero')) ||
    Boolean(target.closest('.gallery-photo')));
