/**
 * Reports written on a cycle (decision 0032's templates), at the end of the day.
 *
 * - An enemy estimate reaches each field commander daily from his
 *   intelligence source (a chief, if the post has one, whose bias is a term on
 *   the report; else his own scouts). What is observed is the enemy's force
 *   blocks standing in the regions he watches (lane 0.5).
 * - Each field commander wires the principal on the dispatch cycle. What he
 *   says of the enemy is his belief (`knowledge/beliefs.ts`), so his
 *   perception inflates his dispatches exactly as it inflates his choices.
 * - Each field post sends a strength return up its chain by mail, with both
 *   the present-for-duty and the paper (present and absent) figure. Its
 *   strength is the men it commands, directly and through the posts below it.
 * - Each office holder gives the principal his word, weekly, on the returns he holds.
 */
import { perceptionBias, traitsOf } from '../people/traits.ts';
import { strictCompare } from '../compare.ts';
import { factionOfBlock } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import { enemyBeliefs } from '../knowledge/beliefs.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { ReportBody, ReportClaim, ReportType } from '../knowledge/report.ts';
import { templateFor } from '../knowledge/templates.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import { commandStrength, fieldPosts, headquartersOf, offices, postFaction } from '../seats/posts.ts';
import { seatIdFor } from '../seats/seats.ts';
import { sendReport, type TickContext } from './context.ts';

/** Whether a template with `cadence` fires today. Day 1 always fires, so every cycle starts at once. */
export function onCycle(day: number, cadence: number): boolean {
  return cadence > 0 && (day - 1) % cadence === 0;
}

function body(author: PersonId, authorPost: PostId | null, day: number, type: ReportType, subtype: string | null, subject: { kind: ReportBody['reportSubjectKind']; id: string }, claims: readonly ReportClaim[]): ReportBody {
  return {
    reportType: type,
    reportSubtype: subtype,
    reportAuthor: author,
    reportAuthorPost: authorPost,
    reportSubjectKind: subject.kind,
    reportSubjectId: subject.id,
    reportClaims: claims,
    reportDay: day,
    reportHour: null,
    reportAdvice: null,
    reportAnswers: null,
  };
}

const claim = (kind: ReportClaim['claimKind'], region: RegionId | null, value: number, token: string | null, confidence: number): ReportClaim => ({
  claimKind: kind,
  claimRegion: region,
  claimValue: value,
  claimToken: token,
  claimConfidence: confidence,
});

/** The enemy's known men standing in each region: other sides' force blocks, ships and troops aboard included. */
function enemyAt(ctx: TickContext, state: State, faction: FactionId): ReadonlyMap<RegionId, number> {
  const map = ctx.world.map;
  const out = new Map<RegionId, number>();
  const ids = Object.keys(state.forceLocations) as ForceBlockId[];
  for (const id of ids.sort(strictCompare)) {
    const side = factionOfBlock(map, state, id);
    if (side === null || side === faction) continue;
    const region = state.forceLocations[id]!.locRegion;
    out.set(region, (out.get(region) ?? 0) + (state.forceBlockStates[id]!.fbStrength ?? 0));
  }
  return out;
}

export function generateReports(ctx: TickContext, state: State, awaiting: ReadonlySet<PostId>): void {
  const { world, day } = ctx;
  const tpl = (type: ReportType, subtype: string | null = null) => templateFor(world.rules.templates, type, subtype);
  const fields = fieldPosts(world, state).filter((id) => world.factionIds.includes(postFaction(world, state, id)!));
  const holderOf = (id: PostId) => state.postStates[id]!.postHolder!;
  const sideOf = (id: PostId) => postFaction(world, state, id)!;

  if (onCycle(day, tpl('enemy-estimate').cadenceDays)) {
    const enemies = new Map<FactionId, ReadonlyMap<RegionId, number>>();
    for (const id of fields) {
      const holder = holderOf(id);
      const chief = state.postStates[id]!.postIntelChief;
      const author = chief ?? holder;
      // An intelligence chief's estimates carry his own perception bias (lane 1.1: no separate input; a timid or cautious chief inflates).
      const bias = chief === null ? 1000 : perceptionBias(world.rules.traits, traitsOf(world, state, chief)).permille;
      const side = sideOf(id);
      if (!enemies.has(side)) enemies.set(side, enemyAt(ctx, state, side));
      const enemy = enemies.get(side)!;
      const hq = headquartersOf(world, state, id);
      const claims: ReportClaim[] = [];
      const terms: BiasTerm[] = [];
      for (const region of world.watched(hq)) {
        const seen = enemy.get(region) ?? 0;
        claims.push(claim('enemy-strength', region, Math.trunc((seen * bias) / 1000), null, 700));
        terms.push(term('observed', seen, { region, post: id }));
        if (bias !== 1000) terms.push(term('intelligence_bias', bias, { person: author, region, post: id }));
      }
      sendReport(ctx, state, {
        body: body(author, chief === null ? id : null, day, 'enemy-estimate', null, { kind: 'enemy', id }, claims),
        truth: { truthTerms: terms, truthTrimmed: [] },
        to: holder,
        tag: `estimate.${id}`,
        fromRegion: hq,
      });
    }
  }

  if (onCycle(day, tpl('wire-dispatch').cadenceDays)) {
    for (const id of fields) {
      const holder = traitsOf(world, state, holderOf(id));
      const hq = headquartersOf(world, state, id);
      const goal = state.standingGoals[id];
      const strength = commandStrength(state, id).men;
      const status = goal === undefined || goal.standingSpec.goalSpecKind === 'hold' ? 'holding' : awaiting.has(id) ? 'awaiting-strength' : 'advancing';
      const claims: ReportClaim[] = [claim('position', hq, 0, null, 1000), claim('goal-status', goal?.standingSpec.goalSpecRegion ?? null, 0, status, 1000)];
      const terms: BiasTerm[] = [];
      const beliefs = enemyBeliefs(state, world.rules.traits, holder, knowledgeOf(state, seatIdFor(holder.id)));
      for (const region of world.watched(hq)) {
        const b = beliefs.get(region);
        if (b === undefined) continue;
        claims.push(claim('enemy-strength', region, b.value, null, 600));
        terms.push(...b.terms);
      }
      if (status === 'awaiting-strength') {
        // He wants men, so he quotes the smaller "effective" figure (decision 0032).
        claims.push(claim('effective-strength', null, Math.trunc((strength * world.rules.traits.wantsMenPermille) / 1000), null, 800));
        terms.push(term('observed', strength, { post: id }), term('wants_men', world.rules.traits.wantsMenPermille, { person: holder.id, post: id }));
      }
      sendReport(ctx, state, {
        body: body(holder.id, id, day, 'wire-dispatch', null, { kind: 'post', id }, claims),
        truth: { truthTerms: terms, truthTrimmed: [] },
        to: world.faction(sideOf(id)).principal,
        tag: `dispatch.${id}`,
      });
    }
  }

  if (onCycle(day, tpl('strength-return').cadenceDays)) {
    for (const id of fields) {
      const parent = state.postStates[id]!.postParent;
      const to = (parent === null ? null : state.postStates[parent]!.postHolder) ?? world.faction(sideOf(id)).principal;
      const strength = commandStrength(state, id).men;
      const paper = Math.trunc((strength * world.rules.traits.paperPermille) / 1000);
      sendReport(ctx, state, {
        body: body(holderOf(id), id, day, 'strength-return', null, { kind: 'post', id }, [
          claim('present-for-duty', null, strength, null, 900),
          claim('present-and-absent', null, paper, null, 900),
        ]),
        truth: { truthTerms: [term('observed', strength, { post: id }), term('paper_strength', world.rules.traits.paperPermille, { post: id })], truthTrimmed: [] },
        to,
        tag: `return.${id}`,
      });
    }
  }

  if (onCycle(day, tpl('informal', 'cabinet-word').cadenceDays)) {
    for (const id of offices(world, state)) {
      const holder = holderOf(id);
      const principal = world.faction(sideOf(id)).principal;
      // His word on each post whose latest return he holds: what he believes, passed on in person.
      const latest = new Map<string, { value: number; reportId: string }>();
      for (const r of knowledgeOf(state, seatIdFor(holder)).knownReports) {
        if (r.knownBody.reportType !== 'strength-return') continue;
        const pfd = r.knownBody.reportClaims.find((c) => c.claimKind === 'present-for-duty');
        if (pfd !== undefined) latest.set(r.knownBody.reportSubjectId, { value: pfd.claimValue, reportId: r.id });
      }
      for (const subject of [...latest.keys()].sort(strictCompare)) {
        const { value } = latest.get(subject)!;
        sendReport(ctx, state, {
          body: body(holder, id, day, 'informal', 'cabinet-word', { kind: 'post', id: subject }, [claim('present-for-duty', null, value, null, 700)]),
          truth: { truthTerms: [term('reported', value, { person: holder })], truthTrimmed: [] },
          to: principal,
          tag: `word.${subject}`,
        });
      }
    }
  }
}
