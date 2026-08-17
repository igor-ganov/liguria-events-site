import { branch } from '../../lib/branch.ts';
import type { CompactEvent } from '../../lib/events/event-schema.ts';

const flag = (on: boolean): string =>
  branch(on)(
    () => '1',
    () => '0',
  );

/** The `dataset` keys a client-inserted card carries, so the filter and the sort
 *  read it exactly like a server-rendered one. */
export const feedCardAttrs = (event: CompactEvent): Readonly<Record<string, string>> => ({
  id: event.id,
  cats: event.c.join(','),
  start: event.s,
  end: event.e ?? event.s,
  free: flag(event.f === true),
  gem: flag(event.x === true),
  created: branch(event.cr === undefined)(
    () => '',
    () => String(event.cr),
  ),
});
