# Google Ads campaign, built from the corpus

    bun run scripts/growth/build-ads.ts [outDir]     # default: out/ads

Writes three files for Google Ads Editor:

| File | What it is |
| --- | --- |
| `keywords.csv` | every keyword in phrase **and** exact match, with its landing page |
| `ads.csv` | one responsive search ad per group, 15 headlines and 4 descriptions |
| `negatives.csv` | campaign-level negatives |

Run of 2026-08-25: **105 ad groups** — 30 cities, 75 venues — 1 440 keywords.

## The rules it encodes

**Nothing is advertised that we cannot show.** A city needs five upcoming
events, a venue three. The page exists either way — a real place with nothing on
answers 200 and says so — but paying to send somebody there is a different
matter. This is why 30 cities are advertised and 110 have pages.

**Phrase and exact only, never broad.** In Italian, `eventi` mostly belongs to
the events *industry*: agencies, halls for hire, catering. Broad match buys all
of it. `negatives.csv` excludes that, plus the medical (`eventi avversi`),
geological (`eventi sismici`) and programming (`addEventListener`) senses.

**Keywords follow the demand we can already see in Search Console** — place- and
venue-shaped (`acquario eventi genova`, `museo delle illusioni genova`), not the
"cosa fare in Italia" phrasing nobody types.

**Assets that do not fit are dropped, not truncated.** Google refuses a headline
of 31 characters at upload, after the whole file is built, so the length rule
lives in code with tests. Enough assets never mention the place at all, which is
what keeps a long name like *Reggio nell'Emilia* advertisable.

## Importing

Google Ads Editor → Account → Import → From file, one CSV at a time, review the
proposed changes, then post. Campaign name is `DoveGo — Ricerca — IT`; create it
first with the budget and the geographic targeting you want. Bids are left
unset on purpose — start on Maximise clicks with a cap, then move the groups
that convert onto their own bids.

## What this does not do

It does not spend money, and it does not touch the account: it produces files a
person imports. There is a Google Ads API that could push directly; it needs a
developer token and OAuth on the account, which is a decision rather than a
piece of work.


# The weekly reel

    bun run scripts/growth/build-reel.ts <city-slug> [outDir]   # default: out/reels

Needs `ffmpeg` on PATH. Writes `<city>-week.mp4`: 1080×1920, ~18 seconds — a
cover card and up to six events on in the next seven days, each with the
photograph the corpus already holds.

One creative serves three places: a YouTube Short, an Instagram/TikTok Reel,
and the video asset a YouTube campaign has to have before it can run at all.
That last one is why this exists — you cannot advertise on YouTube without a
video, and hiring one made weekly for 110 cities is not a plan.

Details that matter more than they look:

- **Vertical, always.** The feeds show nothing else.
- **A slow push in on every slide.** A still frame in a feed reads as a broken
  video. Each slide is encoded separately with `zoompan`, then concatenated —
  identical streams are what the concat demuxer needs.
- **A silent audio track**, because several platforms reject a video with no
  audio at all. Music is left out on purpose: licensing is a real problem and
  a copyright strike costs more than the reach.
- **A run already open shows when it closes**, not when it opened. Half the
  corpus is months-long exhibitions, and "10 apr" on a video about this week
  reads as a stale post.
- **Fewer than three events with photographs means no video.** A reel of one
  slide is worse than silence.
