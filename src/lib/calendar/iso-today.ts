const ROME = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Shell function (time is a side effect): current Europe/Rome calendar day. */
export const isoToday = (): string => ROME.format(new Date());
