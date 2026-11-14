import { sortedKeys, strictCompare } from './compare.ts';
import type { ComplianceRung, Reason } from './directive.ts';
import { mandate, postOf, promiseCredibility, sanctionCredibility } from './derive.ts';
import type { PersonId, ValueId } from './people.ts';
import type { KernelRules } from './rules.ts';
import type {
  Author,
  Claim,
  DirectiveId,
  FactionId,
  GameState,
  LadderRung,
  Objective,
  PostId,
  RegionId,
  Verdict,
} from './state.ts';

/**
 * What one principal knows (decisions 0008, 0011). This is the only thing a
 * UI or a bot principal may read. It contains no proxy's true response,
 * candour, regard, grievances or ladder rung, and no enemy force except as
 * someone has reported it.
 */
export interface FactionView {
  readonly factionId: FactionId;
  readonly day: number;
  readonly turn: number;
  readonly attentionPerTurn: number;
  readonly mandate: number;
  readonly sanctionCredibility: number;
  readonly promiseCredibility: number;
  readonly pendingPromises: readonly { readonly personId: PersonId; readonly dueDay: number }[];
  readonly posts: readonly PostView[];
  readonly people: readonly PersonView[];
  readonly regions: readonly RegionView[];
  readonly blocs: readonly { readonly id: string; readonly values: readonly ValueId[]; readonly weight: number; readonly support: number }[];
  readonly directives: readonly DirectiveView[];
  readonly claims: readonly Claim[];
  readonly verdict: Verdict | null;
}

export interface PostView {
  readonly id: PostId;
  readonly kind: 'field' | 'office';
  readonly regionId: RegionId;
  readonly holderId: PersonId | null;
  /** Own returns. M1 simplification: a principal knows its own posts' strength. */
  readonly force: number;
  readonly linkDays: number;
}

/** Public reputation only. */
export interface PersonView {
  readonly id: PersonId;
  readonly values: readonly ValueId[];
  readonly competence: number;
  readonly boldness: number;
  readonly standing: number;
  readonly status: 'active' | 'dismissed';
  readonly postId: PostId | null;
  /** Whether this principal has attached an overseer (its own act, so it knows). */
  readonly overseen: boolean;
  /** The last rung someone reported for this person, if any. */
  readonly lastSignal: LadderRung | null;
}

export interface RegionView {
  readonly id: RegionId;
  readonly controllerId: FactionId;
  readonly neighbours: readonly RegionId[];
  readonly lastEstimate: { readonly force: number; readonly author: Author; readonly day: number } | null;
}

export interface DirectiveView {
  readonly id: DirectiveId;
  readonly postId: PostId;
  readonly objective: Objective;
  readonly boldness: number;
  readonly issuedDay: number;
  /** What the proxy told us, if it has reached us. */
  readonly told: {
    readonly personId: PersonId;
    readonly declared: ComplianceRung;
    readonly statedReasons: readonly Reason[];
    readonly counterBoldness: number | null;
    readonly day: number;
  } | null;
  readonly objectionPending: boolean;
}

export function viewFor(state: GameState, factionId: FactionId, rules: KernelRules): FactionView {
  const faction = state.factions[factionId]!;
  const claims = state.claims.filter((c) => c.factionId === factionId);

  const lastSignal = new Map<PersonId, LadderRung>();
  const estimates = new Map<RegionId, RegionView['lastEstimate']>();
  const told = new Map<DirectiveId, NonNullable<DirectiveView['told']>>();
  for (const c of claims) {
    if (c.body.kind === 'signal') lastSignal.set(c.body.personId, c.body.rung);
    if (c.body.kind === 'enemy_strength') estimates.set(c.body.regionId, { force: c.body.force, author: c.author, day: c.aboutDay });
    if (c.body.kind === 'response') {
      told.set(c.body.directiveId, {
        personId: c.body.personId,
        declared: c.body.declared,
        statedReasons: c.body.statedReasons,
        counterBoldness: c.body.counterBoldness,
        day: c.knownDay,
      });
    }
  }

  return {
    factionId,
    day: state.day,
    turn: state.turn,
    attentionPerTurn: faction.attentionPerTurn,
    mandate: mandate(state, factionId),
    sanctionCredibility: sanctionCredibility(state, factionId, rules),
    promiseCredibility: promiseCredibility(state, factionId, rules),
    pendingPromises: faction.promises.map((p) => ({ ...p })),
    posts: sortedKeys(state.posts)
      .map((id) => state.posts[id]!)
      .filter((p) => p.factionId === factionId)
      .map((p) => ({ id: p.id, kind: p.kind, regionId: p.regionId, holderId: p.holderId, force: p.force, linkDays: p.linkDays })),
    people: sortedKeys(state.persons)
      .map((id) => state.persons[id]!)
      .filter((p) => p.factionId === factionId && p.id !== faction.principalId)
      .map((p) => ({
        id: p.id,
        values: p.values,
        competence: p.competence,
        boldness: p.boldness,
        standing: p.standing,
        status: p.status,
        postId: postOf(state, p.id)?.id ?? null,
        overseen: p.overseen,
        lastSignal: lastSignal.get(p.id) ?? null,
      })),
    regions: sortedKeys(state.regions).map((id) => {
      const r = state.regions[id]!;
      return { id, controllerId: r.controllerId, neighbours: r.neighbours, lastEstimate: estimates.get(id) ?? null };
    }),
    blocs: sortedKeys(state.blocs)
      .map((id) => state.blocs[id]!)
      .filter((b) => b.factionId === factionId)
      .map((b) => ({ id: b.id, values: b.values, weight: b.weight, support: b.support })),
    directives: sortedKeys(state.directives)
      .map((id) => state.directives[id]!)
      .filter((d) => d.factionId === factionId)
      .map((d) => {
        const t = told.get(d.id) ?? null;
        return {
          id: d.id,
          postId: d.postId,
          objective: d.objective,
          boldness: d.boldness,
          issuedDay: d.issuedDay,
          told: t,
          objectionPending: t?.declared === 'object' && d.status === 'awaiting_answer',
        };
      }),
    claims: [...claims].sort((a, b) => a.knownDay - b.knownDay || strictCompare(a.id, b.id)),
    verdict: state.verdict,
  };
}
