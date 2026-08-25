import type { Target } from './outreach-targets.ts';

// Localisation data — these are letters that get sent, not code.
//
// Written to be answerable in one line. No "vorremmo proporvi una
// collaborazione", no attachment, no mention of SEO: the request is small and
// the thing being offered is already done, which is the only reason a stranger
// replies at all.

const VENUE = (t: Target): string => `Oggetto: la pagina di ${t.name} su Dove Go

Buongiorno,

raccogliamo gli eventi pubblici italiani su dovego.it e in questo momento sul
sito ci sono ${t.events} vostri appuntamenti. Hanno una pagina dedicata:

${t.page}

È già online e aggiornata da sola: date, orari, come arrivare e il link alla
vostra biglietteria. Non c'è nulla da fare da parte vostra.

Due cose, se vi è utile:

1. se trovate un errore — una data, un orario, un nome — scrivetemi e lo
   correggo subito;
2. se la pagina vi sembra utile, un collegamento dal vostro sito aiuterebbe
   chi cerca il vostro programma a trovarlo.

Se preferite invece che il vostro programma non compaia, basta dirlo e lo
tolgo.

Grazie,
Igor Ganov — dovego.it
public@dovego.it`;

const COMUNE = (t: Target): string => `Oggetto: calendario eventi di ${t.city} — segnalazione per la pagina Eventi

Buongiorno,

gestisco dovego.it, un calendario degli eventi pubblici italiani. Per ${t.city}
raccoglie in questo momento ${t.events} appuntamenti, aggiornati ogni ora dalle
fonti che li annunciano:

${t.page}

L'accesso è libero, non c'è pubblicità e non si registra nulla di chi lo
consulta. È in italiano, inglese e russo, e si può seguire via calendario o RSS
— utile per chi arriva da fuori e cerca cosa fare in città.

Se vi sembra utile ai cittadini e ai visitatori, sarei grato di una
segnalazione dalla vostra pagina Eventi o dai link utili. Resto a disposizione
per qualsiasi verifica o correzione.

Cordiali saluti,
Igor Ganov — dovego.it
public@dovego.it`;

const LETTERS: Readonly<Record<Target['kind'], (t: Target) => string>> = {
  venue: VENUE,
  comune: COMUNE,
};

/** The letter for one target, ready to paste into a mail client. */
export const outreachLetter = (target: Target): string => LETTERS[target.kind](target);
