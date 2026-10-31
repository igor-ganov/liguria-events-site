/** Worker endpoint the AI holiday job publishes to (env-overridable: the E2E
 *  build points it at e2e/fixtures/holidays.json). */
export const HOLIDAYS_URL =
  import.meta.env.HOLIDAYS_URL ?? 'https://liguria-events-bot.igor-ganov.workers.dev/holidays.json';
