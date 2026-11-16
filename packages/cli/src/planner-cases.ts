/**
 * Lane 0.9's three planner cases, run on the kernel planner on the testbed pack (lane 1.2): a pincer round the salient,
 * a supply-aware march, and a small joint naval relief through a boom.
 *
 * The spike read truth for its inputs (its finding 11). Here every input about the enemy and the ground reaches the
 * commander as a report: one intelligence estimate, delivered into his seat's knowledge, says what his side's
 * intelligence knows of the enemy's blocks (region by region, times the source's bias), the works standing in each
 * region and the water edges closed to his side. The planner then reads only his view (`viewFor`), with his own
 * perception applied in belief derivation (0052). Seating a different man in a post gives the post's holder that
 * man's cited character (lane 1.1's people: his temperament, competence and values), drawn exactly as cited
 * (history's shadow `as-history`), so the cast's other posts keep their own holders (lane 0.9 finding 10).
 */
import { phase0, planner, world as w, ids } from '@mandate/kernel';
import { v2Map } from './seats-world.ts';

export type CaseName = 'pincer' | 'supply' | 'naval';

export interface CaseSpec {
  readonly name: CaseName;
  readonly title: string;
  readonly post: string;
  readonly goal: phase0.PlanGoal;
}

const goal = (objective: string, posture: phase0.Posture, deadlineDays: number, permissions: { rail: boolean; river: boolean; sea: boolean }): phase0.PlanGoal => ({
  goalObjective: ids.toId('region', objective),
  goalPosture: posture,
  goalRisk: 500,
  goalDeadlineDays: deadlineDays,
  goalRail: permissions.rail,
  goalRiver: permissions.river,
  goalSea: permissions.sea,
  goalNeutral: false,
  goalCommitted: [],
  goalAwaitWord: false,
  goalApproveAsDrafted: true,
});

export const CASES: readonly CaseSpec[] = [
  { name: 'pincer', title: 'pincer: take the Harrow Bulge between the two northern armies', post: 'n_army_west', goal: goal('salient_tip', 'take', 10, { rail: true, river: false, sea: false }) },
  { name: 'supply', title: 'supply-aware: march on Southvale from Westwatch', post: 'n_army_west', goal: goal('s_heartland', 'take', 20, { rail: true, river: false, sea: false }) },
  { name: 'naval', title: 'joint naval relief: relieve Gull Rock by sea', post: 'n_relief_army', goal: goal('island_fort', 'relieve', 14, { rail: false, river: false, sea: true }) },
];

/** The men a seating puts in the post: one of the testbed's generals, or a steady-competent stand-in (labelled; not pack data). */
export interface Seating {
  readonly label: string;
  /** The person whose cited character the post's holder is given. */
  readonly person: string;
  /** Override his cited boldness (the steady stand-in). */
  readonly boldness?: w.StatDirection;
  /** Override his cited competence (the steady-competent stand-in, which the testbed's cast lacks). */
  readonly competence?: w.StatDirection;
}

export const SEATINGS: readonly Seating[] = [
  { label: 'appointee (bold 500, comp 350)', person: 'n_appointee' },
  { label: 'organiser (bold 200, comp 650)', person: 'n_organiser' },
  { label: 'fighter (bold 800, comp 650)', person: 'n_fighter' },
  { label: 'steady stand-in (bold 500, comp 650)', person: 'n_appointee', boldness: 'average', competence: 'above' },
];

export interface CaseOptions {
  /** The intelligence source's bias, permille (1000: as reported). */
  readonly sourceBias?: number;
  /** Rules to draft under (a sensitivity run); the pack's otherwise. */
  readonly rules?: w.PlannerRules;
  /** The assault margin to draft under (`people.traits.assaultMargin`); the pack's otherwise. */
  readonly assaultMargin?: number;
}

export interface Case {
  readonly world: phase0.SeatsWorld;
  readonly state: phase0.State;
  readonly input: planner.PlannerInput;
}

const FACTION = 'north';

/** The planner input for a case with a seating: the testbed's opening start, his knowledge one intelligence estimate. */
export function caseInput(spec: CaseSpec, seating: Seating, options: CaseOptions = {}): Case {
  const map = v2Map('testbed')!;
  const startPost = map.start.posts.find((p) => p.id === spec.post);
  if (startPost === undefined || startPost.holder === null) throw new Error(`testbed post ${spec.post} has no holder`);
  const seated = map.world.people.find((p) => p.id === seating.person)!;
  const direction = (d: w.StatDirection | undefined, centre: w.StatCentre): w.StatCentre => (d === undefined ? centre : { ...centre, direction: d });
  const people = map.world.people.map((p) =>
    p.id !== startPost.holder
      ? p
      : {
          ...p,
          temperament: { ...seated.temperament, boldness: direction(seating.boldness, seated.temperament.boldness) },
          centres: { ...p.centres, competence: direction(seating.competence, seated.centres.competence) },
          values: seated.values,
        },
  );
  const rules = {
    ...map.world.rules,
    ...(options.rules === undefined ? {} : { planner: options.rules }),
    ...(options.assaultMargin === undefined ? {} : { people: { ...map.world.rules.people, traits: { ...map.world.rules.people.traits, assaultMargin: options.assaultMargin } } }),
  };
  const index = w.indexWorld({ ...map.world, people, rules });
  const world = phase0.indexSeatsWorld(index, map.start, {});
  let state = phase0.createState(world, { seed: map.start.seed, people: 'as-history' });
  const holder = ids.toId('person', startPost.holder);
  const seat = phase0.seatIdFor(holder);
  const faction = ids.toId('faction', FACTION);

  // What his side's intelligence knows: the enemy's blocks, the works, the obstructions closing water edges to him.
  const bias = options.sourceBias ?? 1000;
  const enemy = new Map<string, number>();
  for (const id of Object.keys(state.forceLocations).sort() as ids.ForceBlockId[]) {
    const side = phase0.factionOfBlock(index, state, id);
    if (side === null || side === faction) continue;
    const region = state.forceLocations[id]!.locRegion;
    enemy.set(region, (enemy.get(region) ?? 0) + (state.forceBlockStates[id]!.fbStrength ?? 0));
  }
  const claims: phase0.ReportClaim[] = [];
  for (const region of [...enemy.keys()].sort()) claims.push({ claimKind: 'enemy-strength', claimRegion: region as ids.RegionId, claimValue: Math.trunc((enemy.get(region)! * bias) / 1000), claimToken: null, claimConfidence: 700 });
  for (const region of Object.keys(state.regionFortification).sort() as ids.RegionId[]) {
    if ((state.regionFortification[region] ?? 0) > 0) claims.push({ claimKind: 'works', claimRegion: region, claimValue: state.regionFortification[region]!, claimToken: null, claimConfidence: 700 });
  }
  const control = phase0.buildControlIndex(index, state.regionControl);
  const network = phase0.passageOf(index, state);
  for (const o of state.infraObstructions) {
    const closed = phase0.obstructionFor(index, control, network, o.obsEdge, faction);
    if (closed === null) continue;
    const by = closed.by === null ? null : (index.world.installations.find((i) => i.id === closed.by)?.region ?? null);
    claims.push({ claimKind: 'obstruction', claimRegion: by, claimValue: 1, claimToken: o.obsEdge, claimConfidence: 700 });
  }
  const report: phase0.KnownReport = {
    id: ids.toId('message', `case.${spec.name}.estimate`),
    knownReceivedDay: 0,
    knownRoute: 'courier',
    knownVia: [],
    knownBody: {
      reportType: 'enemy-estimate',
      reportSubtype: null,
      reportAuthor: holder,
      reportAuthorPost: ids.toId('post', spec.post),
      reportSubjectKind: 'enemy',
      reportSubjectId: spec.post,
      reportClaims: claims,
      reportDay: 0,
      reportHour: null,
      reportAdvice: null,
      reportAnswers: null,
    },
  };
  state = phase0.deliverReport(state, seat, report, { truthTerms: [], truthTrimmed: [] });
  const view = phase0.viewFor(world, state, seat);
  const month = phase0.monthOf(state, 1);
  const derived = phase0.deriveMap(index, { control: state.regionControl, month, network });
  const input = planner.plannerInputFor(world, state, derived, network, month, view, ids.toId('post', spec.post), spec.goal, 1);
  return { world, state, input };
}

/** A case drafted with a seating. */
export function drafted(spec: CaseSpec, seating: Seating, options: CaseOptions = {}): { readonly input: planner.PlannerInput; readonly set: planner.DraftSet } {
  const { input } = caseInput(spec, seating, options);
  return { input, set: planner.draft(input) };
}
