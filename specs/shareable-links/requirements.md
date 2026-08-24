# Requirements — a shared link that looks like something

## Why

Search brings a stranger once. The other half of distribution is the visitor
who passes a link on, and in Italy that link travels through WhatsApp and
Telegram. Measured on production 2026-08-24:

| | |
| --- | --- |
| `og:image` on `/`, a city, a venue, a facet page | **absent** |
| `og:image` on an event page | present, hot-linked from the source CDN, in the source's own aspect ratio |
| `og:description` on an event page | ~700 characters of body copy |
| share control anywhere on the site | **none** |

So every shared listing link arrives as a grey rectangle, and every shared
event link arrives as a wall of text next to a picture we do not control.

## R1 — Every page carries a picture worth showing

1. WHEN a feed page is rendered for any scope (region, city, venue, category,
   time facet, free), THE SYSTEM SHALL emit an `og:image` taken from the
   soonest event in that scope that has one.
2. WHERE no event in scope has an image, THE SYSTEM SHALL emit a branded
   default image rather than omitting the tag.
3. THE SYSTEM SHALL serve every `og:image` from the site's own origin, cropped
   to 1200×630.
4. THE SYSTEM SHALL clip `og:description` to at most 200 characters, ending on
   a word boundary.
5. WHEN the page is a single event, THE SYSTEM SHALL declare `og:type=article`.

## R2 — The image proxy is not an open proxy

1. WHEN `/img/` is asked for a URL whose host is one the corpus actually uses,
   THE SYSTEM SHALL return the image.
2. WHEN the host is anything else, THE SYSTEM SHALL answer 400 WITHOUT making
   an outbound request.
3. THE SYSTEM SHALL let the edge cache a proxied image for at least a day.

## R3 — The visitor can pass it on

1. THE SYSTEM SHALL show a share control on event pages and on feed pages.
2. WHERE the browser has `navigator.share`, THE SYSTEM SHALL use it; otherwise
   THE SYSTEM SHALL copy the URL and confirm visibly.
3. THE control SHALL be reachable and operable from the keyboard, and labelled
   in all three languages.

## R4 — It cannot rot quietly

1. THE collector's health report SHALL assert that the home page, a city page,
   a venue page and an event page each carry an `og:image` on our own origin.
