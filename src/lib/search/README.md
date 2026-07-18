# search — vendored fuzzy scorer

A dependency-free, typo-tolerant, Cyrillic-aware fuzzy search scorer, **vendored
from `@prometheus/search-core`** (repo `communist-prometheus/public-website`,
MIT licence). Copied rather than depended on so this site's CI stays
self-contained — the upstream package is private and lives on a different
account.

## What it does

- **Bounded Levenshtein** with a length-scaled typo budget (`distance.ts`).
- **Prefix distance** so inflected endings diverge for free while the stem still
  has to match — matters for Italian and Russian (`distance.ts`).
- **Diacritic + case folding** that keeps `й` a letter and folds `ё → е`, with a
  map back to the source so highlights land on the right characters (`fold.ts`).
- **Field-weighted scoring** (title ≫ description ≫ body), AND across query terms
  (`score.ts`).
- **Safe snippets**: ranges, not HTML — the renderer escapes and wraps
  (`snippet.ts`).

## Keeping it in sync

This is a **copy**. If you fix or improve the algorithm here, port the change
upstream to `@prometheus/search-core` (commit there as that repo's author) — not
the reverse. Site-specific glue (e.g. `event-doc.ts`) stays here and does **not**
go upstream.

Entry point: `index.ts`. Build a `SearchDoc[]`, `prepare()` it once, then
`search(index, query)` per keystroke.
