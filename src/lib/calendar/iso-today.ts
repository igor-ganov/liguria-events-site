const ROME = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// The dev environment pins "today" to a fixed date (baked into the client
// bundle at build) so the feed/map behave as if it's a chosen day.
const PINNED = import.meta.env.PUBLIC_FIXED_TODAY;

/** Shell function (time is a side effect): current Europe/Rome calendar day,
 *  or the pinned dev date when PUBLIC_FIXED_TODAY is set. */
export const isoToday = (): string => PINNED ?? ROME.format(new Date());
