/**
 * Posts as a principal believes them (lane 1.12; the lead's ruling on the standing review of lane 1.13, item 2, under
 * 0052 and 0027): his menu and the orders he may send read the last holder he was told of, never State's truth of
 * the morning. A battle that takes a post's commander (killed, wounded, captured) vacates the post at once in truth;
 * the principal learns it from the `commander-lost` report the battle sends him (`tick/battle-reports.ts`), and until
 * that report is in his hands he believes the post held by the man he lost. An order he sends meanwhile is accepted and
 * comes back as a returned dispatch when it arrives (`tick/deliver.ts`).
 *
 * The belief needs no State of its own: while the report is on its way it is a message in transit (never pruned), and
 * the man is the battle record's commander for that post. Kernel side: it reads State, so the seat API never imports it.
 */
import { strictCompare } from '../compare.ts';
import type { PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';

/** The posts whose `commander-lost` report is still on its way to `principal` (or through his filter post): one pass. */
export function lossesInTransit(state: State, principal: PersonId): ReadonlySet<string> {
  const out = new Set<string>();
  for (const m of state.messagesInTransit) {
    if (m.msgReport === null || m.msgReport.reportSubjectKind !== 'post') continue;
    if (!m.msgReport.reportClaims.some((c) => c.claimKind === 'commander-lost')) continue;
    if (m.msgTo === principal || m.msgPending.some((h) => h.hopPerson === principal)) out.add(m.msgReport.reportSubjectId);
  }
  return out;
}

/** The commander a battle last took from `post`, from the battle records (null if none did). */
function lastLostCommander(state: State, post: PostId): PersonId | null {
  let best: { readonly person: PersonId; readonly day: number } | null = null;
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    for (const bday of state.battleRecords[id]!.battleDays) {
      for (const s of bday.bdaySides) {
        if (s.bsidePost !== post || s.bsideHit === null || s.bsideCommander === null) continue;
        if (best === null || bday.bdayDay >= best.day) best = { person: s.bsideCommander, day: bday.bdayDay };
      }
    }
  }
  return best?.person ?? null;
}

/**
 * The holder `principal` believes `post` has: its holder in truth, or, when a battle has taken him and the report of it
 * has not reached the principal, the man he lost; null when he knows the post vacant.
 */
export function believedHolder(state: State, principal: PersonId, post: PostId, losses: ReadonlySet<string> = lossesInTransit(state, principal)): PersonId | null {
  const holder = state.postStates[post]?.postHolder ?? null;
  if (holder !== null) return holder;
  if (!losses.has(post)) return null;
  return lastLostCommander(state, post);
}

/** Whether `post` is vacant in truth while `principal` still believes it held (the report of the loss on its way). */
export function vacancyUnreported(state: State, principal: PersonId, post: PostId, losses: ReadonlySet<string> = lossesInTransit(state, principal)): boolean {
  return (state.postStates[post]?.postHolder ?? null) === null && believedHolder(state, principal, post, losses) !== null;
}
