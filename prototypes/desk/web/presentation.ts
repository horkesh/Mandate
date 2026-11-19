import { S } from './strings.ts';

const unresolved = new Set<string>();
export const missingNameKeys = () => [...unresolved].sort();
const cache = new WeakMap<Readonly<Record<string, string>>, ReturnType<typeof makePresenter>>();

/** Index the actual supplied keys. No title-casing or inferred historical names. */
function makePresenter(strings: Readonly<Record<string, string>>) {
  const names = new Map<string, string[]>();
  for (const key of Object.keys(strings)) {
    const match = /^([^.]+)\.(.+)\.name$/.exec(key);
    if (match) names.set(match[2]!, [...(names.get(match[2]!) ?? []), key]);
    else if(key.startsWith('faction.'))names.set(key.slice(8),[key]);
  }
  const name = (id: string, kind?: string | number): string => {
    if (Object.hasOwn(strings, id)) return strings[id]!;
    // Factions use `faction.<id>` in the supplied catalogue, unlike people/posts.
    if(kind==='faction'&&Object.hasOwn(strings,`faction.${id}`))return strings[`faction.${id}`]!;
    const keys = (names.get(id) ?? []).filter(key => typeof kind !== 'string' || key.startsWith(`${kind}.`));
    const values = [...new Set(keys.map(key => strings[key]!))];
    if (values.length === 1) return values[0]!;
    unresolved.add(typeof kind === 'string' ? `${kind}.${id}.name` : id);
    return S.unknown;
  };
  // The console's prose carries identifiers too. Preserve its wording around
  // those tokens; grammar keywords are desk vocabulary rather than pack names.
  const tokens = /\b[a-z0-9]+(?:[_.][a-z0-9]+)*\b/g;
  const text = (value: string): string => value.replace(/\benemy(?:-strength)?\s+0\s+at\b/gi, 'no enemy seen at').replace(tokens, token => {
    if (Object.hasOwn(S.commandTerms, token)) return S.commandTerms[token]!;
    if (names.has(token) || Object.hasOwn(strings, token)) return name(token);
    return /_/.test(token) ? name(token) : token;
  });
  // Bracketed display tokens keep multiword names editable while the wire
  // command remains byte-for-byte in the console's identifier grammar.
  const commandDisplay = (line: string) => line.replace(tokens, token =>
    names.has(token) || Object.hasOwn(strings, token) || token.includes('_')
      ? `‹${Object.hasOwn(S.commandTerms, token) ? S.commandTerms[token] : name(token)}›` : token);
  const commandInput = (value: string, original: string) => {
    const ids = new Map<string, Set<string>>();
    for (const [token, keys] of names) for (const key of keys) {
      const label = strings[key]!;
      ids.set(label, new Set([...(ids.get(label) ?? []), token]));
    }
    for (const [token, label] of Object.entries(S.commandTerms)) ids.set(label, new Set([token]));
    // Existing command tokens disambiguate names shared by two entity kinds.
    const current = new Map<string, string[]>();
    for (const token of original.match(tokens) ?? []) {
      const shown = commandDisplay(token);
      if (shown.startsWith('‹')) current.set(shown, [...(current.get(shown) ?? []), token]);
    }
    return value.replace(/‹([^›]*)›/g, (shown, label: string) => {
      const existing = current.get(shown)?.shift();
      if (existing) return existing;
      const candidates = ids.get(label);
      return candidates?.size === 1 ? [...candidates][0]! : shown;
    });
  };
  return { name, text, commandDisplay, commandInput };
}

export function presenter(strings: Readonly<Record<string, string>>) {
  let result = cache.get(strings);
  if (!result) { result = makePresenter(strings); cache.set(strings, result); }
  return result;
}
