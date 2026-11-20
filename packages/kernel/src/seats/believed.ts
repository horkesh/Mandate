/**
 * Posts as a principal believes them (lane 1.12; the lead's ruling on the standing review of lane 1.13, item 2, under
 * 0052 and 0027): his menu and the orders he may send read the last holder he was told of, never State's truth of
 * the morning. A battle that takes a post's commander (killed, wounded, captured) vacates the post at once in truth;
 * the principal learns it from the `commander-lost` report (`tick/commander-losses.ts`), and until
 * that report is in his hands he believes the post held by the man he lost. An order he sends meanwhile is accepted and
 * comes back as a returned dispatch when it arrives (`tick/deliver.ts`).
 *
 * The belief needs no State of its own: while the report is on its way it is a message in transit (never pruned), and
 * the report's truth names the lost holder, independent of battle records and their pruning. Kernel side only.
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

/** The holder named in the latest loss report still travelling to this principal, including through a filter.
 * The report's truth carries the identity for every capture route; battle records may already have been pruned.
 */
export function believedHolder(state: State, principal: PersonId, post: PostId, losses: ReadonlySet<string> = lossesInTransit(state, principal)): PersonId | null {
  const holder = state.postStates[post]?.postHolder ?? null;
  if (!losses.has(post)) return holder;
  let best: { readonly person: PersonId; readonly day: number; readonly id: string } | null = null;
  for (const m of state.messagesInTransit) {
    const r = m.msgReport;
    if (r?.reportSubjectKind !== 'post' || r.reportSubjectId !== post || !r.reportClaims.some((c) => c.claimKind === 'commander-lost')) continue;
    if (m.msgTo !== principal && !m.msgPending.some((h) => h.hopPerson === principal)) continue;
    const lost = m.msgTruth?.truthTerms.find((t) => t.termPost === post && t.termPerson !== null)?.termPerson;
    if (lost === undefined || lost === null) continue;
    if (best === null || r.reportDay > best.day || (r.reportDay === best.day && strictCompare(m.msgOrigin, best.id) > 0)) best = { person: lost, day: r.reportDay, id: m.msgOrigin };
  }
  return best?.person ?? holder;
}

/** Whether `post` is vacant in truth while `principal` still believes it held (the report of the loss on its way). */
export function vacancyUnreported(state: State, principal: PersonId, post: PostId, losses: ReadonlySet<string> = lossesInTransit(state, principal)): boolean {
  return (state.postStates[post]?.postHolder ?? null) === null && believedHolder(state, principal, post, losses) !== null;
}
