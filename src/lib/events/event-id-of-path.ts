// Every id this site mints is the first 12 characters of a digest — see
// eventIdOf in the collector. It sits at the end of an event's address, after
// the words, so it survives a retitling: the old link still names the event and
// is redirected to whatever the address reads as now.
const MINTED = /(?:^|-)([0-9a-f]{12})$/;

/** The event an address names, from a full slug or from a bare id. Empty when
 *  the segment never named an event here. */
export const eventIdOfPath = (segment: string): string => MINTED.exec(segment)?.[1] ?? '';
