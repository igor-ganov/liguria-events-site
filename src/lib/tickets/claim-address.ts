// One mailbox: something, an at sign, a host with a dot in it, and no spaces
// or commas — a list of addresses is not an address.
const SHAPE = /^[^\s,@]+@[^\s,@]+\.[^\s,@]+$/;
const LONGEST = 254;

/** The address a code may be sent to, trimmed and in lower case; empty when
 *  what was typed is not one mailbox. */
export const claimAddress = (typed: unknown): string =>
  [typed]
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length <= LONGEST && SHAPE.test(value))
    .at(0) ?? '';
