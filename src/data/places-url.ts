import { EVENTS_URL } from './events-url.ts';

/** The collector's canonical place list, beside its events. */
export const PLACES_URL = EVENTS_URL.replace(/\/events\.json.*$/, '/places.json');
