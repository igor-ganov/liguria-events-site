/** Worker endpoint the build pulls the corpus from (env-overridable). */
export const EVENTS_URL =
  import.meta.env.EVENTS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/events.json';
