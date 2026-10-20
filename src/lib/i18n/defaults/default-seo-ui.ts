import type { Ui } from '../ui-schema.ts';

/** The strings that go in a page's head, and the headings that are written for
 *  a search result as much as for a reader. Its own module for the reason the
 *  landmarks and places vocabularies have one: this one is a dozen lines and
 *  grows whenever a template learns to name its place properly. */
export const DEFAULT_SEO_UI: Ui['seo'] = {
  venueCount: { other: '' },
  venueTitle: '',
  feedTitle: "What's on in {place}",
  venuesHere: 'Venues in {place}',
  venuesAround: 'Venues across {place}',
  pastHere: 'Previously here',
  pastNote: 'The most recent dates we have on record at this venue.',
  venue: '',
  feed: "Events and what's on in {place} — concerts, exhibitions, markets and more.",
  calendar: "Event calendar for {place} — what's on, day by day.",
  map: "Map of events in {place} — find what's on near you.",
};
