# Design — a shared link that looks like something

Satisfies `requirements.md` R1–R4.

## 1. Where the picture comes from (R1.1, R1.2)

`FeedView` is the single choke point: every listing page in the site renders
through it, already holding the scoped, date-sorted event list. One helper,
`socialImage(events)`, takes the first event carrying an image.

*Rejected:* rendering a card with the title drawn on it (satori + resvg in the
Worker). It is the nicer artefact, and it costs ~1.7 MB of WASM in a bundle
that must stay under the Worker limit, for a gain over a real photograph of the
event that is aesthetic rather than structural. Revisit when there is a reason
beyond taste.

*Rejected:* one static brand image everywhere. Identical previews for 6 000
pages train the eye to skip them.

## 2. The proxy (R1.3, R2)

`GET /img/<width>x<height>/<encoded source URL>` returns the source image after
Cloudflare Transformations has cropped it. The zone allows transformations only
for same-origin paths (`image_resizing: on`, not `open` — `open` would let
anybody resize anything through our bill), so the route fetches the source
itself and hands the bytes back; the caller wraps it in `/cdn-cgi/image/...`,
which is then a same-origin path and permitted.

The host must appear in `IMAGE_HOSTS`, the eight hosts the corpus actually
carries (`s1.ticketm.net`, `www.mentelocale.it`, `www.eventiesagre.it`,
`www.visitgenoa.it`, `www.visitlazio.com`, `palazzoducale.genova.it`,
`portoantico.it`, `www.genovateatro.it`) plus our own uploads. Anything else is
400 before any fetch happens — otherwise the route is a free bandwidth relay
for whoever finds it.

*Rejected:* signing each URL with an HMAC. City pages are prerendered, so the
signing key would have to exist in the build as well as in the Worker, and two
copies of a secret that must match is a failure waiting for a rotation.

*Consequence:* a new source needs a line here. R4.1 is what tells us.

## 3. The description (R1.4)

`clipText(text, 200)` cuts at the last space before the limit and appends an
ellipsis. Applied where the meta description is built, not in the page body:
the page still shows the whole article.

## 4. The share control (R3)

A `<button data-share>` beside the page heading, hydrated by one inline script
already in the shell. `navigator.share` where present — that is the native
sheet, and on iOS it is the only route into WhatsApp — otherwise
`navigator.clipboard.writeText` and swap the label to the "copied" string for
two seconds. No component framework: the button is three lines of behaviour.

## 5. Health (R4.1)

One check, `og-images`, fetching four representative URLs and asserting each
carries an `og:image` pointing at `dovego.it`. It fails on the case that
actually happens: a new image host appears and the proxy starts refusing it.

## Traceability

| Requirement | Design | Verified by |
| --- | --- | --- |
| R1.1, R1.2 | §1 | `test/social-image.test.ts` |
| R1.3, R2.1–R2.3 | §2 | `test/image-proxy.test.ts` |
| R1.4 | §3 | `test/clip-text.test.ts` |
| R1.5 | §1 | `test/og-type.test.ts` |
| R3.1–R3.3 | §4 | `e2e/share.spec.ts` |
| R4.1 | §5 | collector `test/health.test.ts` |
