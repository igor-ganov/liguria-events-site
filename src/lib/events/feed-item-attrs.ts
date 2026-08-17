import { branch } from '../branch.ts';
import type { CompactEvent } from './event-schema.ts';

const flag = (on: boolean): string =>
  branch(on)(
    () => '1',
    () => '0',
  );

/** The `data-*` a feed row carries so the client filter/sort can work off the
 *  DOM alone — show/hide, never a re-render. */
export const feedItemAttrs = (event: CompactEvent): Readonly<Record<string, string>> => ({
  'data-id': event.id,
  'data-cats': event.c.join(','),
  'data-start': event.s,
  'data-end': event.e ?? event.s,
  'data-free': flag(event.f === true),
  'data-gem': flag(event.x === true),
  'data-ct': event.ct ?? '',
  'data-created': branch(event.cr === undefined)(
    () => '',
    () => String(event.cr),
  ),
});
