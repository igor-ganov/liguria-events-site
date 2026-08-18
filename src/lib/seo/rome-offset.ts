// The events are all in Italy, so one zone answers for the whole corpus. The
// offset is read from the platform's own tz database rather than hard-coded,
// because it is +02:00 for the summer half of the year and +01:00 for the rest —
// and a concert stamped an hour wrong is a concert the reader misses.
const FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Rome',
  timeZoneName: 'longOffset',
});

/** Italy's UTC offset on a given ISO date, as `+02:00`. */
export const romeOffset = (date: string): string =>
  FORMAT.formatToParts(new Date(`${date}T12:00:00Z`))
    .filter((part) => part.type === 'timeZoneName')
    .map((part) => part.value.replace(/^GMT/, ''))
    // A zero offset is spelled bare "GMT", which is not a valid ISO suffix.
    .map((offset) => [offset].filter((value) => value !== '').at(0) ?? '+00:00')
    .at(0) ?? '+01:00';
