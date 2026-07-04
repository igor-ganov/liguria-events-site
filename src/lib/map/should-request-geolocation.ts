/** Given a Permissions API geolocation state, whether to actually call
 *  getCurrentPosition (which prompts). A 'denied' origin never re-prompts,
 *  so we surface a "blocked" message instead of a silent no-op. */
export const shouldRequestGeolocation = (state: string): boolean => state !== 'denied';
