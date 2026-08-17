// One row of the "My routes" list. Types only.

/** A route this visitor can open: `owned` ones came from the account (and carry
 *  the real privacy state), the rest are links this device remembers. */
export type MyRoute = Readonly<{
  id: string;
  name: string;
  public: boolean;
  owned: boolean;
}>;
