import { SUGGEST_MODEL } from './suggest-model.ts';

/** The one method of the Workers AI binding this feature calls. */
type Embedder = Readonly<{ run: (model: string, input: Readonly<{ text: readonly string[] }>) => Promise<unknown> }>;

const isEmbedder = (value: unknown): value is Embedder => typeof Reflect.get(Object(value), 'run') === 'function';

const firstVector = (answer: unknown): readonly number[] | undefined =>
  [Reflect.get(Object(Reflect.get(Object(answer), 'data')), 0)]
    .filter((row): row is readonly number[] => Array.isArray(row) && row.length > 0 && row.every((value) => typeof value === 'number'))
    .at(0);

/** The query's vector, or nothing when there is no binding or the model
 *  fails — the page then keeps the suggestions its letters found. The binding
 *  is typed `unknown` in Env, so it is checked here rather than cast. */
export const embedQuery = async (ai: unknown, text: string): Promise<readonly number[] | undefined> =>
  Promise.all([ai].filter(isEmbedder).map((binding) => binding.run(SUGGEST_MODEL, { text: [text] })))
    .then((answers) => firstVector(answers.at(0)))
    .catch(() => undefined);
