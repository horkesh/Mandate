/**
 * What the lever sweep (SENSITIVE-HISTORY D6) weighs for a gated decision: each move a victory-only bot has, resolved to
 * the options it takes, and whether it takes a `watched` one (lane 1.5b; the gate review of lane 1.5).
 *
 * The sweep itself arrives with a victory measure (lanes 1.12 and 1.14). It reads moves through this function, so
 * **delegating a gated decision is the delegate's pick**: the option the holder would choose by his values, exactly as
 * his rule seat chooses (`chooseDelegated` over the kernel's `situationChoice`). A delegate's score reads every value he
 * holds, cost-only ones included (legitimate conduct under 0074), so without this a bot could reach a watched option by
 * handing the choice to a man who holds it, and the sweep would never see it.
 *
 * Moves: taking one open option alone; delegating to each post the situation may go to, whose holder is on its side; and
 * inaction. Options that may be taken together (groups) are read one at a time: a watched option is reached by any set
 * that holds it, and the sweep counts it by the option.
 */
import { phase0, type ids } from '@mandate/kernel';
import { chooseDelegated } from '@mandate/rule-seats';

type PersonId = ids.PersonId;
type PostId = ids.PostId;
type SituationId = ids.SituationId;

export type SweepMove =
  | { readonly move: 'decide'; readonly options: readonly string[] }
  | { readonly move: 'delegate'; readonly post: PostId; readonly holder: PersonId }
  | { readonly move: 'inaction' };

export interface SweepChoice {
  readonly move: SweepMove;
  /** The options the move ends in taking: the delegate's pick for a delegation. */
  readonly takes: readonly string[];
  /** Whether any option it takes is marked watched by the gate reviewer. */
  readonly watched: boolean;
}

/** The moves open on a decision, each resolved to what it takes. Empty when the decision is not open to its principal. */
export function sweepMoves(world: phase0.SeatsWorld, state: phase0.State, id: SituationId): SweepChoice[] {
  const def = world.situations.find((s) => s.id === id);
  const record = state.situationStates[id];
  if (def === undefined || def.kind !== 'decision' || record === undefined || record.sitStatus !== 'open' || record.sitDelegate !== null) return [];
  const watched = new Set(def.options.filter((o) => o.watched).map((o) => o.id));
  const choice = (move: SweepMove, takes: readonly string[]): SweepChoice => ({ move, takes, watched: takes.some((o) => watched.has(o)) });
  const out: SweepChoice[] = record.sitOpenOptions.map((o) => choice({ move: 'decide', options: [o] }, [o]));
  for (const post of def.delegableTo) {
    const holder = state.postStates[post]?.postHolder ?? null;
    // The kernel refuses a delegation to a vacant post or the other side's holder, so neither is a move.
    if (holder === null || phase0.sideOfPerson(world.map, state, holder) !== def.faction) continue;
    const menu = { menuKind: 'delegated-situation' as const, choice: phase0.situationChoice(def, record.sitOpenOptions, [], phase0.valuesOf(world.map, holder)) };
    out.push(choice({ move: 'delegate', post, holder }, chooseDelegated(menu)));
  }
  out.push(choice({ move: 'inaction' }, []));
  return out;
}
