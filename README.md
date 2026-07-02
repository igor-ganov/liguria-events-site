# liguria-events-site

Static UI for the Genoa events corpus collected by
[liguria-events-bot](https://github.com/igor-ganov/liguria-events-bot):
a month **calendar** and a chronological **feed** with category filters.

**Live:** <https://igor-ganov.github.io/liguria-events-site/>

- **Astro 5** static build + **Lit 3** client components (light-DOM custom
  elements hydrated from a build-time JSON island).
- Data is fetched at build time from the worker's public
  [`/events.json`](https://liguria-events-bot.igor-ganov.workers.dev/events.json);
  a scheduled GitHub Action rebuilds every 6 hours, so the site trails the
  collector by ≤6h.
- Code follows the functional-frontend dogma, lint-enforced: files ≤50 code
  lines, one exported value per file, no `if`/ternary in `src/`
  (`eslint.config.js`), Effect pipelines at data boundaries, every pure
  function unit-tested.

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Local dev server |
| `bun run check` | lint + typecheck + tests |
| `bun run build` | Static build into `dist/` (fetches live data) |

Spec: [`specs/site/`](specs/site/) (requirements → design → tasks).
Related: the bot also serves an
[iCal feed](https://liguria-events-bot.igor-ganov.workers.dev/calendar.ics)
subscribable in any calendar app, and answers questions in Telegram:
[@liguria_events_bot](https://t.me/liguria_events_bot).
