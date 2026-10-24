import { cachedEvents } from '../data/cached-events.ts';
import { EVENTS_URL } from '../data/events-url.ts';
import { isoToday } from '../lib/calendar/iso-today.ts';
import { llmsText } from '../lib/seo/llms-text.ts';
import type { APIRoute } from 'astro';

// What the site is, for the engines that answer questions with it. They fetch
// it between 30 000 and 400 000 times a day and sent three visits in three
// weeks; nothing here told them what they were holding or how to credit it.
// Built with the sitemaps so the counts cannot drift from the pages.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const payload = await cachedEvents(EVENTS_URL);
  return new Response(llmsText(payload.events, isoToday(), site), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
