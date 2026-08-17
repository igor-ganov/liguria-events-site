// "Set the base by clicking the map": which point the NEXT map click sets.
// Types only — the functions that read them live one per file next to this one.

/** A base can be set for this route, for the traveller globally, or for one day
 *  of the route; a day may also set a different FINAL point. */
export type PickMode = Readonly<{
  scope: 'route' | 'global' | 'day';
  day?: string;
  kind: 'base' | 'final';
}>;

/** The four things a map click can actually write to. */
export type PickKey = 'global' | 'route' | 'day-base' | 'day-final';
