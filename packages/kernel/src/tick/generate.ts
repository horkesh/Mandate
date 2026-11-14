/**
 * Reports written on a cycle (decision 0032's templates), at the end of the day.
 *
 * - An enemy estimate reaches each field commander daily from his
 *   intelligence source (a chief, if the post has one, whose bias is a term on
 *   the report; else his own scouts).
 * - Each field commander wires the principal on the dispatch cycle. What he
 *   says of the enemy is his belief (`knowledge/beliefs.ts`), so his
 *   perception inflates his dispatches exactly as it inflates his choices.
 * - Each field post sends a strength return up its chain by mail, with both
 *   the present-for-duty and the paper (present and absent) figure.
 * - Each office holder gives the principal his word, weekly, on the returns he holds.
 *
 * STAND-IN: the enemy strength observed is the stand-in post strength at each
 * enemy headquarters, until lane 0.5's force blocks.
 */
import { strictCompare } from '../compare.ts';
import type { PersonId, PostId, RegionId } from '../ids.ts';
import { enemyBeliefs } from '../knowledge/beliefs.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { ReportBody, ReportClaim, ReportType } from '../knowledge/report.ts';
import { templateFor } from '../knowledge/templates.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { CommsPost } from '../standin/world.ts';
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

/** The stand-in enemy strength at each region: the strengths of other factions' field posts headquartered there. */
function enemyAt(ctx: TickContext, state: State, faction: string): ReadonlyMap<RegionId, number> {
  const out = new Map<RegionId, number>();
  for (const id of ctx.world.postIds) {
    const p = ctx.world.post(id);
    if (p.faction === faction || p.kind !== 'field') continue;
    const region = state.headquarters[id]!.hqRegion;
    out.set(region, (out.get(region) ?? 0) + p.strength);
  }
  return out;
}

/** The regions a commander watches: where he stands and every neighbour, in id order. */
function watched(ctx: TickContext, region: RegionId): RegionId[] {
  return [region, ...ctx.world.region(region).neighbours.map((l) => l.to)].sort(strictCompare);
}

export function generateReports(ctx: TickContext, state: State, awaiting: ReadonlySet<PostId>): void {
  const { world, day } = ctx;
  const tpl = (type: ReportType, subtype: string | null = null) => templateFor(world.rules.templates, type, subtype);
  const fields: CommsPost[] = world.postIds.map((id) => world.post(id)).filter((p) => p.kind === 'field' && p.holder !== null);

  if (onCycle(day, tpl('enemy-estimate').cadenceDays)) {
    for (const p of fields) {
      const holder = p.holder!;
      const author = p.intelligenceChief ?? holder;
      const bias = p.intelligenceChief === null ? 1000 : world.person(p.intelligenceChief).intelligenceBias;
      const enemy = enemyAt(ctx, state, p.faction);
      const claims: ReportClaim[] = [];
      const terms: BiasTerm[] = [];
      for (const region of watched(ctx, state.headquarters[p.id]!.hqRegion)) {
        const seen = enemy.get(region) ?? 0;
        claims.push(claim('enemy-strength', region, Math.trunc((seen * bias) / 1000), null, 700));
        terms.push(term('observed', seen, { region, post: p.id }));
        if (bias !== 1000) terms.push(term('intelligence_bias', bias, { person: author, region, post: p.id }));
      }
      sendReport(ctx, state, {
        body: body(author, p.intelligenceChief === null ? p.id : null, day, 'enemy-estimate', null, { kind: 'enemy', id: p.id }, claims),
        truth: { truthTerms: terms, truthTrimmed: [] },
        to: holder,
        tag: `estimate.${p.id}`,
        fromRegion: state.headquarters[p.id]!.hqRegion,
      });
    }
  }

  if (onCycle(day, tpl('wire-dispatch').cadenceDays)) {
    for (const p of fields) {
      const holder = world.person(p.holder!);
      const hq = state.headquarters[p.id]!.hqRegion;
      const goal = state.standingGoals[p.id]!;
      const status = goal.standingSpec.goalSpecKind === 'hold' ? 'holding' : awaiting.has(p.id) ? 'awaiting-strength' : 'advancing';
      const claims: ReportClaim[] = [claim('position', hq, 0, null, 1000), claim('goal-status', goal.standingSpec.goalSpecRegion, 0, status, 1000)];
      const terms: BiasTerm[] = [];
      const beliefs = enemyBeliefs(state, world.rules.traits, holder, knowledgeOf(state, seatIdFor(holder.id)));
      for (const region of watched(ctx, hq)) {
        const b = beliefs.get(region);
        if (b === undefined) continue;
        claims.push(claim('enemy-strength', region, b.value, null, 600));
        terms.push(...b.terms);
      }
      if (status === 'awaiting-strength') {
        // He wants men, so he quotes the smaller "effective" figure (decision 0032).
        claims.push(claim('effective-strength', null, Math.trunc((p.strength * world.rules.traits.wantsMenPermille) / 1000), null, 800));
        terms.push(term('observed', p.strength, { post: p.id }), term('wants_men', world.rules.traits.wantsMenPermille, { person: holder.id, post: p.id }));
      }
      sendReport(ctx, state, {
        body: body(holder.id, p.id, day, 'wire-dispatch', null, { kind: 'post', id: p.id }, claims),
        truth: { truthTerms: terms, truthTrimmed: [] },
        to: world.faction(p.faction).principal,
        tag: `dispatch.${p.id}`,
      });
    }
  }

  if (onCycle(day, tpl('strength-return').cadenceDays)) {
    for (const p of fields) {
      const superior = p.superior === null ? null : world.post(p.superior);
      const to = superior?.holder ?? world.faction(p.faction).principal;
      const paper = Math.trunc((p.strength * world.rules.traits.paperPermille) / 1000);
      sendReport(ctx, state, {
        body: body(p.holder!, p.id, day, 'strength-return', null, { kind: 'post', id: p.id }, [
          claim('present-for-duty', null, p.strength, null, 900),
          claim('present-and-absent', null, paper, null, 900),
        ]),
        truth: { truthTerms: [term('observed', p.strength, { post: p.id }), term('paper_strength', world.rules.traits.paperPermille, { post: p.id })], truthTrimmed: [] },
        to,
        tag: `return.${p.id}`,
      });
    }
  }

  if (onCycle(day, tpl('informal', 'cabinet-word').cadenceDays)) {
    for (const id of world.postIds) {
      const office = world.post(id);
      if (office.kind !== 'office' || office.holder === null) continue;
      const principal = world.faction(office.faction).principal;
      if (office.holder === principal) continue;
      // His word on each post whose latest return he holds: what he believes, passed on in person.
      const latest = new Map<string, { value: number; reportId: string }>();
      for (const r of knowledgeOf(state, seatIdFor(office.holder)).knownReports) {
        if (r.knownBody.reportType !== 'strength-return') continue;
        const pfd = r.knownBody.reportClaims.find((c) => c.claimKind === 'present-for-duty');
        if (pfd !== undefined) latest.set(r.knownBody.reportSubjectId, { value: pfd.claimValue, reportId: r.id });
      }
      for (const subject of [...latest.keys()].sort(strictCompare)) {
        const { value } = latest.get(subject)!;
        sendReport(ctx, state, {
          body: body(office.holder, office.id, day, 'informal', 'cabinet-word', { kind: 'post', id: subject }, [claim('present-for-duty', null, value, null, 700)]),
          truth: { truthTerms: [term('reported', value, { person: office.holder })], truthTrimmed: [] },
          to: principal,
          tag: `word.${subject}`,
        });
      }
    }
  }
}
