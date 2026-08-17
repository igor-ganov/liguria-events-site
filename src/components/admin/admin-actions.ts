import { branch } from '../../lib/branch.ts';

/** What a click on the admin users table asks for. */
export type AdminAction = 'toggle' | 'user' | 'event';

/** The dataset of the button that was clicked, as the DOM hands it over. */
export type ButtonData = Readonly<Record<string, string | undefined>>;

const EXPAND: readonly AdminAction[] = ['toggle'];
const PERSON: readonly AdminAction[] = ['user'];
const SUBMISSION: readonly AdminAction[] = ['event'];

const acts = (data: ButtonData): readonly AdminAction[] => [
  ...PERSON.filter(() => data['userAction'] !== undefined),
  ...SUBMISSION.filter(() => data['action'] !== undefined),
];

/** Which handlers a clicked button runs — none when it carries no admin hook at
 *  all. `data-toggle` only expands a person's submissions, so it never doubles
 *  as one of the acting buttons. */
export const adminActions = (data: ButtonData): readonly AdminAction[] =>
  branch(data['toggle'] !== undefined)<readonly AdminAction[]>(
    () => EXPAND,
    () => acts(data),
  );
