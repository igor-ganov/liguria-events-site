/** Which endpoint the form talks to: an edit of an existing event, or a fresh
 *  submission. Stamped on the form as `data-mode`. */
export type EventFormMode = 'edit' | 'create';

// A Map, not an object: the raw value comes off the DOM, and an inherited key
// ("constructor") must not read as a mode.
const MODES = new Map<string, EventFormMode>([['edit', 'edit']]);

/** Read the form's mode; anything but an explicit `edit` creates. */
export const eventFormMode = (raw: string | undefined): EventFormMode =>
  MODES.get(raw ?? '') ?? 'create';
