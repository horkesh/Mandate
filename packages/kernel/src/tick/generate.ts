import { forceTotals } from '../forces/lots.ts';
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
import { buildControlIndex } from '../control-index/control-index.ts';
import { factionOfBlock } from '../forces/forces.ts';
import type { EdgeId, FactionId, ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import { obstructionFor } from '../supply/supply.ts';
import { passageOf } from './passage.ts';
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
function reconContacts(ctx: TickContext, state: State, side: FactionId, region: RegionId) {
  const commands = new Set<PostId>();
  let unquantified = false;
  const ids = Object.keys(state.forceLocations) as ForceBlockId[];
  for (const block of ids.sort(strictCompare)) {
    const loc = state.forceLocations[block]!;
    const force = state.forceBlockStates[block]!;
    const faction = factionOfBlock(ctx.world.map, state, block);
    if (faction === null || faction === side || loc.locRegion !== region || loc.locMarch !== null ||
      loc.locAboard !== null || force.fbSurrenderedDay !== null) continue;
    const strength = forceTotals(force, ctx.world.map.forceTotalsCache).fbStrength;
    if (strength === null) unquantified = true;
    const post = state.forceAssignments[block];
    if (post !== undefined && post !== null && force.fbKind !== 'detachment' && strength !== 0) commands.add(post);
  }
  return { commands: [...commands].sort(strictCompare), unquantified };
}

function enemyAt(ctx: TickContext, state: State, faction: FactionId): ReadonlyMap<RegionId, number> {
  const map = ctx.world.map;
  const out = new Map<RegionId, number>();
  const ids = Object.keys(state.forceLocations) as ForceBlockId[];
  for (const id of ids.sort(strictCompare)) {
    const side = factionOfBlock(map, state, id);
    if (side === null || side === faction) continue;
    const region = state.forceLocations[id]!.locRegion;
    out.set(region, (out.get(region) ?? 0) + (forceTotals(state.forceBlockStates[id]!, ctx.world.map.forceTotalsCache).fbStrength ?? 0));
  }
  return out;
}

/**
 * What a field commander's report says of his goal (lane 1.2): `holding` with no goal or a hold, `planning` while his
 * plan is drafted, chosen or reviewed, `awaiting-strength` when the plan he executes holds for men (or holds at all,
 * against a goal to take or relieve), `advancing` when it moves.
 */
export function goalStatus(state: State, post: PostId): { readonly token: string; readonly region: RegionId | null } {
  const r = state.planRecords[post];
  if (r === undefined) return { token: 'holding', region: null };
  if (r.planGoal.goalPurpose !== undefined) {
    if (r.planDetentionEnd !== undefined) return { token: r.planDetentionEnd.dendReason, region: null };
    const operations = Object.values(state.operationRecords).filter(o => o.opOrder === r.planOrder);
    return { token: state.stateDay > r.planSetDay + r.planGoal.goalDeadlineDays ? 'duty_overdue' :
      operations.some(o => (o.opDemonstration?.demActions.length ?? 0) > 0) ? 'pressure_attempted' :
      r.planDraft?.draftCandidates.length === 0 ? 'blocked' : 'planning', region: null };
  }
  const region = r.planGoal.goalObjective;
  if (r.planStatus !== 'approved') return { token: 'planning', region };
  const plan = r.planApproved;
  // Reached: his operation's main axis holds its objective, or the operation ended with it held (lane 1.4).
  const ops = Object.values(state.operationRecords).filter((o) => o.opPost === post && o.opOrder === r.planOrder);
  const reached = ops.some((o) => o.opOutcome === 'objective_reached' || o.opAxes.some((a) => a.oaxPost === post && a.oaxArrived !== null));
  if (r.planGoal.goalPosture === 'hold' && (plan === null || plan.candMethod === 'holding' || reached)) return { token: 'holding', region };
  if (plan === null || plan.candMethod === 'holding' || plan.candConditions.some((g) => g.gateKind === 'move_when_reinforced')) return { token: 'awaiting-strength', region };
  return { token: reached ? 'holding' : 'advancing', region };
}

export function generateReports(ctx: TickContext, state: State): void {
  const { world, day } = ctx;
  const confidence = world.map.world.rules.reportConfidence;
  const tpl = (type: ReportType, subtype: string | null = null) => templateFor(world.rules.templates, type, subtype);
  const fields = fieldPosts(world, state).filter((id) => world.factionIds.includes(postFaction(world, state, id)!));
  const holderOf = (id: PostId) => state.postStates[id]!.postHolder!;
  const sideOf = (id: PostId) => postFaction(world, state, id)!;

  if (onCycle(day, tpl('enemy-estimate').cadenceDays)) {
    const enemies = new Map<FactionId, ReadonlyMap<RegionId, number>>();
    // What scouts see of the ground (lane 1.2): works standing in a region, and works or a boom closing a water edge
    // to his side, so a commander plans on what he has been told (0062), never on truth.
    const index = buildControlIndex(world.map, state.regionControl);
    const network = passageOf(world.map, state);
    const obstructed = new Set(state.infraObstructions.map((o) => o.obsEdge));
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
      const edges = new Set<EdgeId>();
      for (const region of world.watched(hq)) {
        const seen = enemy.get(region) ?? 0;
        const contacts = world.map.world.rules.plans.demonstration === undefined ? undefined : reconContacts(ctx, state, side, region);
        if (!contacts?.unquantified) claims.push(claim('enemy-strength', region, Math.trunc((seen * bias) / 1000), null, confidence.scoutEnemyStrength));
        else claims.push(claim('enemy-estimate-unknown', region, 1, null, confidence.scoutEnemyStrength));
        for (const command of contacts?.commands ?? []) claims.push(claim('enemy-command', region, 1, command, confidence.scoutEnemyStrength));
        if (contacts !== undefined) for (const key of Object.keys(state.operationRecords).sort(strictCompare)) {
          const operation = state.operationRecords[key]!;
          const action = operation.opDemonstration?.demActions.at(-1);
          const actor = postFaction(world, state, operation.opPost);
          if (action?.dactDay !== day || action.dactRegion !== region || actor === null || actor === side) continue;
          claims.push({ ...claim('enemy-activity', region, 1, operation.opPost, confidence.scoutEnemyStrength),
            claimActivity: action.dactTask });
        }
        terms.push(term('observed', seen, { region, post: id }));
        if (bias !== 1000) terms.push(term('intelligence_bias', bias, { person: author, region, post: id }));
        const works = state.regionFortification[region] ?? 0;
        if (works > 0) {
          claims.push(claim('works', region, works, null, confidence.scoutWorks));
          terms.push(term('observed', works, { region, post: id, rule: 'works' }));
        }
        for (const e of world.map.edgesAt.get(region) ?? []) if (obstructed.has(e.id)) edges.add(e.id);
      }
      for (const edge of [...edges].sort(strictCompare)) {
        const o = obstructionFor(world.map, index, network, edge, side);
        const by = o?.by === null || o?.by === undefined ? null : (world.map.world.installations.find((i) => i.id === o.by)?.region ?? null);
        claims.push(claim('obstruction', by, o === null ? 0 : 1, edge, confidence.scoutObstruction));
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
      const strength = commandStrength(state, id, world.map.forceTotalsCache).men;
      const { token: status, region: objective } = goalStatus(state, id);
      const claims: ReportClaim[] = [claim('position', hq, 0, null, 1000), claim('goal-status', objective, 0, status, 1000)];
      const terms: BiasTerm[] = [];
      const beliefs = enemyBeliefs(state, world.rules.traits, holder, knowledgeOf(state, seatIdFor(holder.id)));
      for (const region of world.watched(hq)) {
        const b = beliefs.get(region);
        if (b === undefined) continue;
        claims.push(claim('enemy-strength', region, b.value, null, confidence.dispatchEnemyStrength));
        terms.push(...b.terms);
      }
      if (status === 'awaiting-strength') {
        // He wants men, so he quotes the smaller "effective" figure (decision 0032).
        claims.push(claim('effective-strength', null, Math.trunc((strength * world.rules.traits.wantsMenPermille) / 1000), null, confidence.dispatchEffectiveStrength));
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
      const strength = commandStrength(state, id, world.map.forceTotalsCache).men;
      const paper = Math.trunc((strength * world.rules.traits.paperPermille) / 1000);
      sendReport(ctx, state, {
        body: body(holderOf(id), id, day, 'strength-return', null, { kind: 'post', id }, [
          claim('present-for-duty', null, strength, null, confidence.returnPresentForDuty),
          claim('present-and-absent', null, paper, null, confidence.returnPaperStrength),
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
          body: body(holder, id, day, 'informal', 'cabinet-word', { kind: 'post', id: subject }, [claim('present-for-duty', null, value, null, confidence.cabinetWord)]),
          truth: { truthTerms: [term('reported', value, { person: holder })], truthTrimmed: [] },
          to: principal,
          tag: `word.${subject}`,
        });
      }
    }
  }
}
