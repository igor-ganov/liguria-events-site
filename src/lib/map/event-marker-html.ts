import { photoMarkerHtml } from './photo-marker-html.ts';

/**
 * The inner markup of an event's map marker: its photo when it has one, and the
 * category icon otherwise. The square event face is the `ev` flavour of the
 * shared photo-marker template.
 */
export const eventMarkerHtml = photoMarkerHtml('ev');
