/** The image hosts the corpus actually carries, counted on 2026-08-25 over
 *  1 182 events. The proxy fetches from these and nothing else: an unbounded
 *  proxy is a bandwidth relay for whoever finds the route. A new source needs
 *  a line here, and the `og-images` health check is what tells us it is due. */
export const IMAGE_HOSTS: readonly string[] = [
  's1.ticketm.net',
  'www.mentelocale.it',
  'www.eventiesagre.it',
  'www.visitgenoa.it',
  'www.visitlazio.com',
  'palazzoducale.genova.it',
  'portoantico.it',
  'www.genovateatro.it',
  'upload.wikimedia.org',
  'commons.wikimedia.org',
];
