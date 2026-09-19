# Google Play listing — dovego.it

Everything below is ready to paste. Files are in this folder:
`icon-512.png`, `feature-graphic.png`, `screenshots/` (5 phone, 5 tablet, PNG).
The bundle is built by the release workflow in the `dovego-android` repository
(`app-release-bundle.aab`).

## App details

| Field | Value |
| --- | --- |
| App name (≤30) | `Dove Go — cosa fare in Italia` |
| Package | `it.dovego.twa` |
| Category | Events |
| Tags | events, local, calendar |
| Contact email | (yours) |
| Website | `https://dovego.it` |
| Privacy policy | `https://dovego.it/privacy/` |

## Short description (≤80)

**Italian** — `Cosa c'è oggi nella tua città: eventi, sagre, mostre e concerti.`

**English** — `What's on in your city today: events, festivals, shows and concerts.`

**Russian** — `Что происходит в вашем городе сегодня: события, ярмарки, концерты.`

## Full description (≤4000)

**Italian**

```
Dove Go raccoglie gli eventi di tutta Italia — sagre di paese, concerti,
mostre, mercatini, visite guidate — e li mette in un posto solo.

• Oggi, domani, nel weekend. Scegli la tua città una volta e il resto segue.
• Calendario e mappa: guarda il mese, o guarda cosa c'è vicino a te.
• Una notifica al mattino, se la vuoi: cosa c'è oggi dove sei. Se non c'è
  nulla, non arriva nulla.
• Funziona senza rete. Le pagine che hai aperto restano leggibili in metro o
  in montagna, e l'app dice sempre quanto sono vecchie.
• Il tuo evento, pubblicato in un minuto. Nessun account necessario per
  guardare; ne serve uno solo per pubblicare.

Le fonti sono dichiarate su ogni evento, con il link all'originale.
```

**English**

```
Dove Go collects events from all over Italy — village festivals, concerts,
exhibitions, markets, guided walks — and puts them in one place.

• Today, tomorrow, the weekend. Pick your town once and the rest follows.
• A calendar and a map: see the month, or see what is near you.
• One notification a morning, if you want it: what is on today where you are.
  Nothing on, nothing sent.
• Works without a signal. Pages you have opened stay readable on the metro or
  up a mountain, and the app always says how old they are.
• Your own event, published in a minute. No account needed to read; one is
  needed only to publish.

Every event names its sources and links back to them.
```

**Russian**

```
Dove Go собирает события по всей Италии — деревенские ярмарки, концерты,
выставки, рынки, экскурсии — и складывает их в одно место.

• Сегодня, завтра, на выходных. Выберите город один раз, остальное само.
• Календарь и карта: посмотреть месяц или посмотреть, что рядом.
• Одно уведомление утром, если нужно: что сегодня там, где вы. Нечего —
  ничего и не придёт.
• Работает без сети. Открытые страницы остаются читаемыми в метро и в горах,
  и приложение всегда говорит, насколько они старые.
• Своё событие публикуется за минуту. Чтобы смотреть, аккаунт не нужен;
  нужен только чтобы опубликовать.

У каждого события указаны источники со ссылками на оригинал.
```

## Data safety

What the app actually does, in the console's own terms:

| Question | Answer | Why |
| --- | --- | --- |
| Collects or shares user data? | **Yes**, collects; **no** sharing with third parties | |
| Location — approximate | Collected, **not** shared, **optional** | Only when notifications are turned on, only to pick which region the morning digest is about. Never stored on our side: the app sends the chosen region, not coordinates. |
| App activity — page views | Collected, not shared, not optional | First-party analytics on our own domain, cookieless, no cross-site identifier. |
| App info and performance — crash logs / diagnostics | Collected, not shared, not optional | Web Vitals from the same first-party beacon. |
| Personal info — email address | Collected, not shared, **optional** | Only if somebody signs in to publish an event. |
| Device or other IDs | **Not collected** | No advertising ID, no cookie, no device identifier. |
| Data encrypted in transit | Yes | HTTPS everywhere. |
| Users can request deletion | Yes | Contact address on the privacy page. |

## Content rating questionnaire

Category **Reference / News / Education** → everything answered **No**: no
violence, no sexual content, no profanity, no drugs, no gambling, no user-to-user
communication, no sharing of location between users, no personal information
shared publicly. The app lists public events and links to their organisers.

## Ads

Contains ads: **No**.

## Target audience

13+. Not designed for children; no child-directed content.
