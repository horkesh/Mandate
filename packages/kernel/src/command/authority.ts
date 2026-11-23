/** The sole writer of received authority and its shared commitments (0121). */
import { allCommandedBlocks, factionOfPost, heldPost, sideOfPerson } from './command.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId, PostId } from '../ids.ts';
import { forceTotals } from '../forces/lots.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { MandateGrant } from '../world/mandates.ts';

export interface AuthorityUse {
  readonly useOrder: MessageId;
  readonly useAssignment?: true;
  readonly useTarget: PostId;
  readonly useBlocks: readonly ForceBlockId[];
}
export interface EnactedMandate {
  readonly authorityGrant: MandateGrant;
  readonly authorityOrigin: MessageId;
  readonly authorityDay: number;
  readonly authorityStatus: 'active' | 'revoked' | 'refused';
  readonly authorityResponse: string;
  readonly authorityRevisionSeen: number;
  readonly authoritySeenDay: number;
  readonly authorityUses: readonly AuthorityUse[];
}
export type AuthorityTable = Readonly<Record<PostId, readonly EnactedMandate[]>>;
export interface AuthorityBasis {
  readonly basisPost: PostId;
  readonly basisKey: string;
}

export function inSubtree(state: State, child: PostId, parent: PostId): boolean {
  const seen = new Set<PostId>();
  for (let p: PostId | null = child; p !== null && !seen.has(p); p = state.postStates[p]?.postParent ?? null) {
    if (p === parent) return true;
    seen.add(p);
  }
  return false;
}
export function mandateAt(state: State, post: PostId, key: string, asOfDay = Number.MAX_SAFE_INTEGER): EnactedMandate | undefined {
  return state.authorityByPost?.[post]?.filter(a => a.authorityGrant.mandateKey === key && a.authoritySeenDay <= asOfDay)
    .sort((a,b) => b.authorityRevisionSeen-a.authorityRevisionSeen)[0];
}
export function currentMandates(state: State, post: PostId): EnactedMandate[] {
  return (state.authorityByPost?.[post] ?? []).filter(a => mandateAt(state,post,a.authorityGrant.mandateKey) === a);
}
/** The force assigned to a command includes its actual subordinate chain. */
export function authorityBlocks(state: State, post: PostId): ForceBlockId[] {
  return (Object.keys(state.forceAssignments) as ForceBlockId[]).filter(b => {
    const assigned = state.forceAssignments[b];
    return assigned != null && inSubtree(state,assigned,post);
  }).sort(strictCompare);
}
export function activeMandate(map: WorldIndex, state: State, a: EnactedMandate, day: number, seen = new Set<string>()): boolean {
  const g = a.authorityGrant;
  const token = `${g.mandatePost}:${g.mandateKey}`;
  if (seen.has(token) || a.authorityStatus !== 'active' || a.authorityDay > day ||
    state.postStates[g.mandatePost]?.postHolder !== g.mandateHolder ||
    (state.personStatus[g.mandateHolder]?.statusKind ?? 'serving') !== 'serving' ||
    (g.mandateExpires !== null && day > g.mandateExpires)) return false;
  seen.add(token);
  if (g.mandateIssuerPost === null) {
    return map.world.people.some(p => p.id === g.mandateIssuer) &&
      sideOfPerson(map, state, g.mandateIssuer) === factionOfPost(map, state, g.mandatePost);
  }
  if (heldPost(state, g.mandateIssuer) !== g.mandateIssuerPost ||
    (state.personStatus[g.mandateIssuer]?.statusKind ?? 'serving') !== 'serving' ||
    !inSubtree(state, g.mandatePost, g.mandateIssuerPost) ||
    factionOfPost(map, state, g.mandateIssuerPost) !== factionOfPost(map, state, g.mandatePost)) return false;
  if (g.mandateParent === null) return true; // A sourced state-post root.
  const parent = mandateAt(state, g.mandateParent.parentPost, g.mandateParent.parentKey);
  // An ancestor's revocation is not a receipt at this holder's post.
  return parent !== undefined;
}

/** Intersection never interprets an omitted permission as unlimited. */
export function intersectMandate(state: State, child: MandateGrant, parent: MandateGrant): MandateGrant {
  const min = (a: number | null, b: number | null) => a === null ? b : b === null ? a : Math.min(a, b);
  return { ...child,
    mandateActions: child.mandateActions.filter(x => parent.mandateActions.includes(x)),
    mandateRecipients: child.mandateRecipients.filter(p => inSubtree(state, p, child.mandatePost) &&
      parent.mandateRecipients.some(r => inSubtree(state, p, r))),
    mandateRegions: child.mandateRegions.filter(r => parent.mandateRegions.includes(r)),
    mandateModes: child.mandateModes.filter(m => parent.mandateModes.includes(m)),
    mandateCeiling: child.mandateCeiling === null || parent.mandateCeiling === null ? null : {
      ceilingPost: inSubtree(state, child.mandateCeiling.ceilingPost, parent.mandateCeiling.ceilingPost)
        ? child.mandateCeiling.ceilingPost : child.mandatePost,
      ceilingMen: min(child.mandateCeiling.ceilingMen, parent.mandateCeiling.ceilingMen),
    },
    mandateGuard: Math.max(child.mandateGuard ?? 0, parent.mandateGuard ?? 0) || null,
    mandateExpires: min(child.mandateExpires, parent.mandateExpires),
    mandateReports: [...new Set([...parent.mandateReports, ...child.mandateReports])].sort(strictCompare),
    mandateOnward: child.mandateOnward && parent.mandateOnward,
  };
}

/** Called only with an actual addressee receipt and the recorded compliance answer. */
export function enactMandate(map: WorldIndex, state: State, grant: MandateGrant, origin: MessageId, day: number, response: string, accepted: readonly string[] | null, issuedDay = day): State {
  const old = mandateAt(state, grant.mandatePost, grant.mandateKey);
  if (old !== undefined && old.authorityRevisionSeen >= grant.mandateRevision) return state;
  if (state.postStates[grant.mandatePost]?.postHolder !== grant.mandateHolder) return state;
  let bounded = grant;
  if (grant.mandateParent !== null && !grant.mandateRevoke) {
    const parent = mandateAt(state, grant.mandateParent.parentPost, grant.mandateParent.parentKey, issuedDay);
    if (parent === undefined || !activeMandate(map, state, parent, issuedDay) || !parent.authorityGrant.mandateOnward ||
      parent.authorityGrant.mandateHolder !== grant.mandateIssuer ||
      !parent.authorityGrant.mandateRecipients.some(r => inSubtree(state, grant.mandatePost, r))) return state;
    bounded = intersectMandate(state, grant, parent.authorityGrant);
  }
  // A partial undertaking cannot acquire any unaccepted action or onward power.
  bounded = { ...bounded, mandateActions: bounded.mandateActions.filter(a => accepted?.includes(a)),
    mandateOnward: bounded.mandateOnward && accepted?.includes('onward') === true };
  const row: EnactedMandate = { authorityGrant: bounded, authorityOrigin: origin, authorityDay: day,
    authorityStatus: grant.mandateRevoke ? 'revoked' : accepted === null ? 'refused' : 'active',
    authorityRevisionSeen: grant.mandateRevision, authoritySeenDay: day,
    authorityResponse: response, authorityUses: old?.authorityUses ?? [] };
  // A refused revision preserves the earlier permission while remembering its revision.
  if (!grant.mandateRevoke && accepted === null && old?.authorityStatus === 'active') {
    return put(state, grant.mandatePost, { ...old, authorityRevisionSeen: grant.mandateRevision, authoritySeenDay:day });
  }
  return put(state, grant.mandatePost, row);
}
function put(state: State, post: PostId, row: EnactedMandate): State {
  const rows = state.authorityByPost?.[post] ?? [];
  return { ...state, authorityByPost: { ...state.authorityByPost, [post]: [...rows.filter(a => a.authorityGrant.mandateKey !== row.authorityGrant.mandateKey || a.authorityRevisionSeen !== row.authorityRevisionSeen), row]
    .sort((a,b) => strictCompare(a.authorityGrant.mandateKey,b.authorityGrant.mandateKey) || a.authorityRevisionSeen-b.authorityRevisionSeen) } };
}
function liveUse(state: State, u: AuthorityUse): boolean {
  return state.messagesInTransit.some(m => m.msgOrigin === u.useOrder && m.msgOrder !== null) ||
    (u.useAssignment === true && u.useBlocks.some(b => state.forceJoins[b]?.joinAssignment?.assignmentOrder === u.useOrder)) ||
    Object.values(state.planRecords).some(p => p.planOrder === u.useOrder);
}
export function authorityFamily(state: State, a: EnactedMandate): EnactedMandate[] {
  const result: EnactedMandate[] = [a];
  while (result.at(-1)!.authorityGrant.mandateParent !== null) {
    const p = result.at(-1)!.authorityGrant.mandateParent!;
    const next = mandateAt(state, p.parentPost, p.parentKey);
    if (next === undefined || result.includes(next)) break;
    result.push(next);
  }
  return result;
}
/** The same blocks/men cannot be spent by two siblings or their parent. */
export function mayCommit(map: WorldIndex, state: State, a: EnactedMandate, target: PostId, blocks: readonly ForceBlockId[], assignment?: true | MessageId): boolean {
  if (blocks.length === 0 || new Set(blocks).size !== blocks.length) return false;
  return authorityFamily(state,a).every(row => {
    const g = row.authorityGrant;
    if (g.mandateCeiling === null) return false;
    const own = authorityBlocks(state,g.mandateCeiling.ceilingPost);
    if (!blocks.every(b => own.includes(b) && authorityBlocks(state,target).includes(b))) return false;
    const uses = row.authorityUses.filter(u => u.useOrder !== assignment && liveUse(state,u) &&
      (u.useTarget !== target || u.useAssignment === true || assignment !== undefined));
    if (uses.some(u => u.useBlocks.some(b => blocks.includes(b)))) return false;
    const spent = [...new Set([...uses.flatMap(u => u.useBlocks), ...blocks])];
    const strengths = spent.map(b => forceTotals(state.forceBlockStates[b]!).fbStrength);
    if (g.mandateCeiling.ceilingMen !== null && (strengths.some(n => n === null) || strengths.reduce<number>((s,n) => s+(n??0),0) > g.mandateCeiling.ceilingMen)) return false;
    if (g.mandateGuard !== null) {
      const retained = authorityBlocks(state,g.mandatePost).filter(b => !spent.includes(b)).map(b => forceTotals(state.forceBlockStates[b]!).fbStrength);
      if (retained.some(n => n === null) || retained.reduce<number>((s,n) => s+(n??0),0) < g.mandateGuard) return false;
    }
    return true;
  });
}
export function commitAuthority(state: State, a: EnactedMandate, order: MessageId, target: PostId, blocks: readonly ForceBlockId[], assignment?: true): State {
  let next = state;
  for (const row of authorityFamily(state,a)) next = put(next,row.authorityGrant.mandatePost,{ ...row,
    authorityUses: [...row.authorityUses.filter(u => liveUse(state,u) && (u.useTarget !== target || u.useAssignment === true || assignment === true)),
      { useOrder: order, useTarget: target, useBlocks: [...blocks], ...(assignment === undefined ? {} : {useAssignment:assignment}) }] });
  return next;
}
