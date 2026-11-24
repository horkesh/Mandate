import { canonicalHash, DEFAULT_COMPLIANCE_RULES, ids, planner, resolveDirective, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { CASES, caseInput, drafted, SEATINGS, type CaseSpec, type Seating } from '../src/planner-cases.ts';
import { measureDrafting } from '../src/drafting-measure.ts';
import { TIMING } from '../../kernel/test/support/timing.ts';

/**
 * Lane 0.9's spike checks, ported to the kernel planner (lane 1.2; 0062). The three cases run on the testbed, with
 * every input about the enemy and the ground reaching the commander as a report and read from his view
 * (`planner-cases.ts`). What changed against the spike, and why, is said where it changed:
 * - the assault margin (lane 0.9 finding 1) makes one army too few against the Harrow Bulge at true strength, so the
 *   fighter now picks the pincer, as lane 0.9 expected once the margin was in, given a partner of neutral will; the
 *   cooperation he expects of the testbed's actual partner, the organiser, comes from what he can know (his regard, the
 *   organiser's public standing), which invites the pincer; a drafter who distrusts him attacks alone on condition of men;
 * - a phase for enemy-held ground on the way (finding 9) prices the fortified Neck, so the direct march on Southvale now
 *   takes the Highcairn road, the spike's flank, and no distinct flank is left (every alternative doubles back).
 */
const [PINCER, SUPPLY, NAVAL] = CASES as [CaseSpec, CaseSpec, CaseSpec];
const R = (id: string) => ids.toId('region', id);
const seat = (label: string): Seating => SEATINGS.find((s) => s.label.startsWith(label))!;
const all = () => CASES.flatMap((spec) => SEATINGS.flatMap((s) => [1000, 2000].map((bias) => ({ name: `${spec.name} / ${s.label} / ${bias}`, set: drafted(spec, s, { sourceBias: bias }).set }))));
const pick = (set: planner.DraftSet) => set.draftCandidates[0]!;
/** The pincer case redrafted with the eastern army's holder given this willingness to cooperate. */
const withPartner = (input: planner.PlannerInput, will: number) => planner.draft({ ...input, posts: input.posts.map((p) => (p.id === 'n_army_east' ? { ...p, holderWillingness: will } : p)) });
const edit = (kind: 'objective' | 'waypoints' | 'timing' | 'add_axis' | 'remove_axis', over: { axis?: string | null; region?: string; via?: string[]; concentration?: number } = {}) => ({
  editKind: kind,
  editAxis: over.axis === undefined ? (kind === 'add_axis' ? null : 'main') : over.axis,
  editRegion: over.region === undefined ? null : R(over.region),
  editVia: (over.via ?? []).map(R),
  editConcentration: over.concentration ?? null,
});

describe('every case drafts distinct, explained candidates', () => {
  it('gives at least two distinct candidates per case and seating, a holding action always among them', () => {
    for (const { name, set } of all()) {
      expect(set.draftCandidates.length, name).toBeGreaterThanOrEqual(2);
      expect(new Set(set.draftCandidates.map((c) => c.id)).size, name).toBe(set.draftCandidates.length);
      expect(set.draftCandidates.some((c) => c.candMethod === 'holding'), name).toBe(true);
    }
  });

  it('gives at least two distinct moving plans in each case for some seating', () => {
    for (const spec of CASES) {
      const best = Math.max(...SEATINGS.map((s) => drafted(spec, s).set.draftCandidates.filter((c) => c.candMethod !== 'holding').length));
      expect(best, spec.name).toBeGreaterThanOrEqual(2);
    }
  });

  it('makes every score exactly the sum of its typed terms (hard rule 6)', () => {
    for (const { name, set } of all()) {
      for (const c of set.draftCandidates) {
        expect(c.candScore, `${name} ${c.id}`).toBe(c.candTerms.reduce((s, t) => s + t.contribAmount, 0));
        for (const t of c.candTerms) expect(Number.isSafeInteger(t.contribAmount) && !Object.is(t.contribAmount, -0) && t.contribWhy.length > 0, `${c.id} ${t.contribTerm}`).toBe(true);
      }
    }
  });

  it('reports every gate of every rejected method, never an empty rejection', () => {
    for (const { name, set } of all()) for (const r of set.draftRejected) expect(r.rejGates.length, `${name} ${r.rejMethod}/${r.rejVariant}`).toBeGreaterThan(0);
    // A low-competence man is refused the pincer for that reason, alongside every other.
    const pincer = drafted(SUPPLY, seat('appointee')).set.draftRejected.find((r) => r.rejMethod === 'pincer' && r.rejVariant === 'with_partner')!;
    expect(pincer.rejGates.map((g) => g.gateKind)).toEqual(['max_axes', 'staging_not_adjacent', 'staging_not_adjacent']);
  });

  it('keeps every quantity an integer: days in permille, scores in permille, strengths in men', () => {
    for (const { set } of all()) {
      for (const c of set.draftCandidates) {
        for (const a of c.candAxes) {
          for (const n of [a.axisArrival, a.axisOutOfSupply, a.axisStrength, a.axisRoute.routeCost, ...a.axisPhases.flatMap((p) => [p.phaseStart, p.phaseDays])]) expect(Number.isSafeInteger(n)).toBe(true);
        }
      }
    }
  });
});

describe('case 1: a two-commander pincer round the salient', () => {
  it('drafts a pincer for a competent man, with a support request to the other army’s holder and an arrival window', () => {
    const { set } = drafted(PINCER, seat('fighter'));
    const p = set.draftCandidates.find((c) => c.candMethod === 'pincer' && c.candVariant === 'with_partner')!;
    expect(p.candAxes.map((a) => [a.axisPost, a.axisRoute.routeFrom, a.axisRoute.routeTo])).toEqual([
      ['n_army_west', 'n_west_front', 'salient_tip'],
      ['n_army_east', 'n_east_front', 'salient_tip'],
    ]);
    const req = p.candRequests.find((r) => r.reqKind === 'cooperating_axis')!;
    expect(req).toMatchObject({ reqPost: 'n_army_east', reqHolder: 'n_organiser', reqFrom: 'n_east_front', reqObjective: 'salient_tip' });
    expect(p.candAxes[1]!.axisArrival).toBeGreaterThanOrEqual(req.reqArriveFrom);
  });

  it('refuses the pincer to a man who cannot run two axes, and names why', () => {
    const { set } = drafted(PINCER, seat('appointee'));
    expect(set.draftCandidates.some((c) => c.candMethod === 'pincer')).toBe(false);
    expect(set.draftRejected.find((r) => r.rejVariant === 'with_partner')!.rejGates[0]!.gateKind).toBe('max_axes');
  });

  it('with the assault margin, one army is too few: with a partner of neutral will, the fighter picks the pincer at true strength, the steady man once intelligence overstates the enemy', () => {
    // The partner's will to cooperate is held neutral here, so the comparison is between the two commanders alone.
    const top = (s: Seating, options: Parameters<typeof caseInput>[2] = {}) => pick(withPartner(caseInput(PINCER, s, options).input, 0)).candMethod;
    expect(top(seat('fighter'))).toBe('pincer');
    // The spike's fighter attacked alone at parity; without the margin he still would.
    expect(top(seat('fighter'), { assaultMargin: 1000 })).toBe('direct');
    // The steady man: at true strength the pincer ties the direct assault (id order picks direct); it is his pick while
    // intelligence overstates the enemy by 1.25x to 1.75x; past that even two armies seem too few, and he attacks alone
    // on condition of reinforcement (the spike saw the same window at 1.75x to 2.5x, before the margin).
    expect(top(seat('steady'), { sourceBias: 1000 })).toBe('direct');
    expect(top(seat('steady'), { sourceBias: 1500 })).toBe('pincer');
    expect(top(seat('steady'), { sourceBias: 2500 })).toBe('direct');
  });

  it('weighs the partner by what the drafter can know (the lead’s ruling on review S2): the organiser’s standing invites the pincer; distrust of him leaves the fighter to attack alone', () => {
    // He has no history with the organiser (regard unknown, 0) and the organiser's public standing is high (800 over the
    // pack's pivot of 500), so he expects cooperation, +300, and picks the pincer.
    const { world, state, input } = caseInput(PINCER, seat('fighter'));
    const set = planner.draft(input);
    const [drafter, partner] = [ids.toId('person', 'n_appointee'), ids.toId('person', 'n_organiser')];
    expect(input.posts.find((p) => p.id === 'n_army_east')!.holderWillingness).toBe(300);
    expect(planner.expectedCooperation(world, state, drafter, partner)).toBe(300);
    expect(pick(set).candMethod).toBe('pincer');
    // A drafter who distrusts him (regard -1000) expects -700, and attacks alone on condition of men.
    const distrust = { ...state, personRegard: { ...state.personRegard, [drafter]: { ...(state.personRegard[drafter] ?? {}), [partner]: -1000 } } };
    const doubted = planner.expectedCooperation(world, distrust, drafter, partner);
    expect(doubted).toBe(-700);
    expect(pick(withPartner(input, doubted)).candMethod).toBe('direct');
    expect(pick(withPartner(input, doubted)).candConditions.map((g) => g.gateKind)).toContain('move_when_reinforced');
    // The partner's hidden nature never enters what is expected of him (0062: beliefs, never truth; FOUNDATION section 6).
    const hidden = { ...state, personTrue: { ...state.personTrue, [partner]: { ...state.personTrue[partner]!, trueCompetence: 1000 } }, personTraits: { ...state.personTraits, [partner]: [] } };
    expect(planner.expectedCooperation(world, hidden, drafter, partner)).toBe(300);
    // The assault margin is explained in the force_ratio term's reason, with its permille (hard rule 6).
    expect(pick(set).candTerms.find((t) => t.contribTerm === 'force_ratio')!.contribWhy).toContain('the assault margin, 1500‰, on his open-field demand 1000');
  });

  it('has the timid man hold and ask the principal for men rather than attack', () => {
    const { set } = drafted(PINCER, seat('organiser'));
    expect(pick(set).candMethod).toBe('holding');
    const attack = set.draftCandidates.find((c) => c.candMethod === 'direct')!;
    expect(attack.candRequests[0]).toMatchObject({ reqKind: 'reinforcement', reqPost: null });
    expect(attack.candConditions.map((g) => g.gateKind)).toContain('move_when_reinforced');
  });

  it('asks for men only past a shortfall scaled by his boldness, compliance’s own rule (lane 0.9 finding 8): a bold man moves a little short', () => {
    // At the pack's margin the fighter is far short, and waits; with a margin that leaves him 2% short, he moves.
    const direct = (margin: number) => drafted(PINCER, seat('fighter'), { assaultMargin: margin }).set.draftCandidates.find((c) => c.candMethod === 'direct')!;
    expect(direct(1500).candConditions.map((g) => g.gateKind)).toContain('move_when_reinforced');
    const near = direct(1000);
    expect(near.candRatio).toBeLessThan(1000);
    expect(near.candConditions).toEqual([]);
  });
});

describe('case 2: a supply-aware route', () => {
  it('has the steady man march in depot steps, and the bold man take the overextended direct road', () => {
    const steady = pick(drafted(SUPPLY, seat('steady')).set);
    expect(steady.candMethod).toBe('supply_line');
    expect(steady.candAxes[0]!.axisPhases.map((p) => p.phaseKind)).toContain('depot_step');
    const bold = pick(drafted(SUPPLY, seat('fighter')).set);
    expect(bold.candMethod).toBe('direct');
    expect(bold.candAxes[0]!.axisOutOfSupply).toBeGreaterThan(steady.candAxes[0]!.axisOutOfSupply);
  });

  it('prices enemy-held ground on the way (finding 9): the march avoids the fortified Neck, and assaults the garrisoned hills it crosses', () => {
    const { set } = drafted(SUPPLY, seat('fighter'));
    const direct = set.draftCandidates.find((c) => c.candMethod === 'direct')!;
    expect(direct.candAxes[0]!.axisRoute.routeLegs.map((l) => l.legTo)).toEqual(['w_valley', 's_west_hills', 's_heartland']);
    const phases = direct.candAxes[0]!.axisPhases.map((p) => `${p.phaseKind}@${p.phaseRegion}`);
    expect(phases).toContain('assault@s_west_hills');
    // The control: priced at no time, held ground is marched straight through, by the Neck.
    const rules = caseInput(SUPPLY, seat('fighter')).input.rules;
    const free = drafted(SUPPLY, seat('fighter'), { rules: { ...rules, assaultDays: 0, reducePerLevel: 0 } }).set.draftCandidates.find((c) => c.candMethod === 'direct')!;
    expect(free.candAxes[0]!.axisRoute.routeLegs.map((l) => l.legTo)).not.toEqual(['w_valley', 's_west_hills', 's_heartland']);
    // No flank is left that does not double back through his own rear.
    expect(set.draftRejected.find((r) => r.rejMethod === 'flank')!.rejGates.map((g) => g.gateDetail)).toContain('alternative doubles back through n_railhead');
  });
});

describe('case 3: a small joint naval relief', () => {
  it('relieves the island fort by sea in the squadron’s ship, with a naval support request to its holder', () => {
    const { set } = drafted(NAVAL, seat('steady'));
    for (const c of set.draftCandidates.filter((x) => x.candMethod === 'by_water')) {
      expect(c.candAxes[0]!.axisMode).toBe('sea');
      expect(c.candAxes[0]!.axisRoute.routeLegs.at(-1)!.legEdge).toBe('sea:island_fort:south_sea');
      expect(c.candRequests).toContainEqual(expect.objectContaining({ reqKind: 'naval_support', reqPost: 'n_home_squadron', reqHolder: 'n_commodore', reqCarrier: 'n_ship_resolute' }));
    }
    expect(set.draftRejected.find((r) => r.rejMethod === 'direct')!.rejGates[0]!.gateKind).toBe('no_route');
  });

  it('meets the boom he has been told of: the careful man clears it, the bold man forces it in a night', () => {
    const careful = pick(drafted(NAVAL, seat('organiser')).set);
    const bold = pick(drafted(NAVAL, seat('fighter')).set);
    expect(careful.candVariant).toBe('clear_first');
    expect(bold.candVariant).toBe('run_in');
    const clear = (c: planner.PlanCandidate) => c.candAxes[0]!.axisPhases.find((p) => p.phaseKind === 'clear')!.phaseDays;
    expect(clear(careful)).toBeGreaterThan(clear(bold));
    expect(bold.candAxes[0]!.axisArrival).toBeLessThan(careful.candAxes[0]!.axisArrival);
  });

  it('plans only on what he has been told: a boom no report names is no phase of his plan (lane 0.9 finding 11)', () => {
    const { input } = caseInput(NAVAL, seat('organiser'));
    expect(input.obstructions.size).toBeGreaterThan(0);
    const untold = planner.draft({ ...input, obstructions: new Map() });
    for (const c of untold.draftCandidates.filter((x) => x.candMethod === 'by_water')) expect(c.candAxes[0]!.axisPhases.some((p) => p.phaseKind === 'clear')).toBe(false);
  });

  it('offers "assemble and await word" as the relief’s holding action', () => {
    expect(drafted(NAVAL, seat('steady')).set.draftCandidates.find((c) => c.candMethod === 'holding')!.candAxes[0]!.axisPhases[0]!.phaseKind).toBe('await');
  });
});

describe('character shapes the menu', () => {
  it('gives different top picks to different men in every case', () => {
    for (const spec of CASES) {
      const picks = new Set(SEATINGS.map((s) => `${pick(drafted(spec, s).set).candMethod}/${pick(drafted(spec, s).set).candVariant}`));
      expect(picks.size, spec.name).toBeGreaterThanOrEqual(2);
    }
  });

  it('applies his perception once, in belief derivation: the timid man sees more enemy at the same objective', () => {
    expect(pick(drafted(PINCER, seat('organiser')).set).candPerceived).toBeGreaterThan(pick(drafted(PINCER, seat('fighter')).set).candPerceived!);
  });

  it('scores a pincer partner by its holder’s willingness, read through the people rules, not by post id (lane 0.9 finding 7)', () => {
    const { input } = caseInput(PINCER, seat('fighter'));
    const p = (will: number) => withPartner(input, will).draftCandidates.find((c) => c.candMethod === 'pincer' && c.candVariant === 'with_partner');
    const willing = p(600)!;
    const grudging = p(-600)!;
    const dep = (c: planner.PlanCandidate) => c.candTerms.find((t) => t.contribTerm === 'dependence')!.contribAmount;
    expect(dep(willing)).toBeGreaterThan(dep(grudging));
    expect(willing.candScore).toBeGreaterThan(grudging.candScore);
  });
});

describe('the 0026 edit grammar', () => {
  const ADVANCE = { boldness: 600, honours: [], offends: [], required: 0 };
  const proxy = { values: [], candour: 800, standing: 500, regard: 0 };
  const answer = (input: planner.PlannerInput, set: planner.DraftSet, edited: planner.PlanCandidate, distance: number) =>
    resolveDirective({ id: input.profile.person, boldness: input.profile.boldness, ...proxy }, planner.editDirective(input, set, edited, distance, -400, ADVANCE), { available: 1000, oversight: 500, leaderCredibility: 500 }, DEFAULT_COMPLIANCE_RULES);

  it('re-routes an axis to a new objective and re-scores it with his scorer', () => {
    const { input, set } = drafted(PINCER, seat('fighter'));
    const r = planner.applyEdit(input, set, pick(set), edit('objective', { region: 'salient_base' }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.edited.candAxes[0]!.axisRoute.routeTo).toBe('salient_base');
      expect(r.edited.candScore).toBe(r.edited.candTerms.reduce((s, t) => s + t.contribAmount, 0));
    }
  });

  it('routes through waypoints; one of his own routes costs nothing, another costs what it departs from his judgement', () => {
    const { input, set } = drafted(SUPPLY, seat('fighter'));
    const own = planner.applyEdit(input, set, pick(set), edit('waypoints', { via: ['s_west_hills'] }));
    const neck = planner.applyEdit(input, set, pick(set), edit('waypoints', { via: ['salient_base'] }));
    const far = planner.applyEdit(input, set, pick(set), edit('waypoints', { via: ['e_lowlands'] }));
    expect(own.ok && neck.ok && far.ok).toBe(true);
    if (own.ok && neck.ok && far.ok) {
      expect(own.distance).toBe(0);
      // Through the fortified Neck he must reduce its works and assault it: the dearest of the three, though nearest
      // his own route (the spike, which priced no held ground, ranked it below the distant lowlands).
      expect(far.distance).toBeGreaterThan(0);
      expect(neck.distance).toBeGreaterThan(far.distance);
      expect(neck.fell.map((f) => f.term)).toContain('time');
    }
  });

  it('refuses a waypoint no route reaches, as a validation failure with a reason', () => {
    const { input, set } = drafted(SUPPLY, seat('fighter'));
    expect(planner.applyEdit(input, set, pick(set), edit('waypoints', { via: ['island_fort'] }))).toEqual({
      ok: false, reason: { kind: 'no-waypoint', region: 'island_fort', mode: 'land' },
    });
  });

  it('shortens his concentration ("move now"): haste falls, and the timid man objects or shirks', () => {
    const { input, set } = drafted(SUPPLY, seat('organiser'));
    const plan = set.draftCandidates.find((c) => c.candMethod === 'direct')!;
    const r = planner.applyEdit(input, set, plan, edit('timing', { concentration: 0 }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.edited.candAxes[0]!.axisPhases[0]!.phaseDays).toBeLessThan(plan.candAxes[0]!.axisPhases[0]!.phaseDays);
      expect(r.distance).toBeGreaterThan(0);
      expect(r.fell.map((f) => f.term)).toContain('haste');
      const a = answer(input, set, r.edited, r.distance);
      expect(['object', 'refuse', 'slow_walk', 'reinterpret', 'comply_with_reservations']).toContain(a.actual);
      expect(a.reasons.map((x) => x.kind)).toContain('departs_from_judgement');
    }
  });

  it('reads an edit against his own best plan: his own plan is exactly as bold as his best, and departs not at all (lane 0.9 finding 2)', () => {
    for (const s of SEATINGS) {
      const { input, set } = drafted(SUPPLY, s);
      const terms = planner.editDirective(input, set, pick(set), 0, -400, ADVANCE);
      expect([terms.boldness, terms.ownBest, terms.departure]).toEqual([600, 600, 0]);
    }
  });

  it('adds an axis with an objective and splits his force; removes one and gathers it back', () => {
    const { input, set } = drafted(SUPPLY, seat('steady'));
    const added = planner.applyEdit(input, set, set.draftCandidates.find((c) => c.candMethod === 'direct')!, edit('add_axis', { region: 'salient_tip' }));
    expect(added.ok).toBe(true);
    if (added.ok) {
      expect(added.edited.candAxes.map((a) => a.axisRoute.routeTo)).toEqual(['s_heartland', 'salient_tip']);
      // The depot's guard detachment stays at its post; the two brigades are split.
      expect(added.edited.candAxes.reduce((s, a) => s + a.axisStrength, 0)).toBe(8000);
    }
    const p = drafted(PINCER, seat('fighter'));
    const pincer = p.set.draftCandidates.find((c) => c.candMethod === 'pincer')!;
    const removed = planner.applyEdit(p.input, p.set, pincer, edit('remove_axis', { axis: 'partner' }));
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(removed.edited.candAxes.map((a) => a.axisName)).toEqual(['main']);
      expect(removed.edited.candRequests.some((r) => r.reqKind === 'cooperating_axis')).toBe(false);
    }
  });

  it('executes a covert rung’s concrete plan: his own nearest for reinterpret, a stretched one for a slow walk, his own for an objection', () => {
    const { input, set } = drafted(SUPPLY, seat('fighter'));
    const chosen = pick(set);
    const r = planner.applyEdit(input, set, chosen, edit('waypoints', { via: ['e_lowlands'] }));
    if (!r.ok) throw new Error(r.reason.kind);
    expect(set.draftCandidates.map((c) => c.id)).toContain(planner.concretePlan(input, set, chosen, r.edited, 'reinterpret').id);
    expect(planner.concretePlan(input, set, chosen, r.edited, 'slow_walk').candAxes[0]!.axisArrival).toBeGreaterThan(r.edited.candAxes[0]!.axisArrival);
    expect(planner.concretePlan(input, set, chosen, r.edited, 'object')).toBe(chosen);
    expect(planner.concretePlan(input, set, chosen, r.edited, 'comply_with_reservations')).toBe(r.edited);
  });
});

describe('liveness of the scoring terms, over drafts and edits (0062; lane 0.9)', () => {
  it('S41 time live control: dropping time changes the chosen candidate', () => {
    const { set } = drafted(PINCER, seat('appointee'));
    expect(pick(set).candMethod).toBe('direct');
    const withoutTime = set.draftCandidates.map(c => ({ ...c,
      candScore: c.candScore - (c.candTerms.find(t => t.contribTerm === 'time')?.contribAmount ?? 0),
    })).sort(planner.compareCandidates);
    expect(withoutTime[0]!.candMethod).toBe('holding');
    expect(withoutTime[0]!.id).not.toBe(pick(set).id);
    expect(planner.liveTerms(set)).toContain('time');
  });

  it('counts every scoring term live in some case: dropping it changes a draft’s pick, or it falls under an edit', () => {
    const live = new Set<string>();
    for (const spec of CASES) {
      for (const s of SEATINGS) {
        for (const bias of [1000, 1500, 2500]) {
          const { input, set } = drafted(spec, s, { sourceBias: bias });
          for (const t of planner.liveTerms(set)) live.add(t);
          // And with a partner he distrusts (the expectation a regard of -1000 gives the organiser: -700), so `dependence` can decide.
          if (spec === PINCER) for (const t of planner.liveTerms(withPartner(input, -700))) live.add(t);
          // Edits exercise terms drafts never do (`haste`): "move now" on his best moving plan.
          const moving = set.draftCandidates.find((c) => c.candMethod !== 'holding');
          const name = moving?.candAxes[0]?.axisName ?? null;
          if (moving === undefined || name === null) continue;
          const r = planner.applyEdit(input, set, moving, edit('timing', { axis: name, concentration: 0 }));
          if (r.ok) for (const f of r.fell) live.add(f.term);
        }
      }
    }
    const { input } = drafted(CASES[0]!, SEATINGS[0]!);
    const marked = planner.draft({ ...input, noteScoreWeight: 600, notes: [{ weight: 1000, mark: {
      markKind: 'wait', markAxis: 'main', markDays: input.profile.concentrationDays + 1, markRegion: null, markVia: [],
    } }] });
    for (const t of planner.liveTerms(marked)) live.add(t);
    expect([...live].sort()).toEqual([...planner.TERMS].sort());
  });
});

describe('determinism (decision 0002)', () => {
  it('scores a route or wait after an objective note against the suggested objective', () => {
    const {input}=caseInput(SUPPLY,SEATINGS[0]!);
    const focus={markKind:'focus' as const,markAxis:'main',markRegion:R('w_valley'),markVia:[],markDays:null};
    const wait={markKind:'wait' as const,markAxis:'main',markRegion:null,markVia:[],markDays:7};
    const set=planner.draft({...input,beliefs:new Map([[R('w_valley'),100],[input.goal.goalObjective!,9000]]),noteScoreWeight:600,notes:[{mark:focus,weight:1000},{mark:wait,weight:1000}]});
    const first=set.draftCandidates.find(c=>c.candVariant.endsWith('+note0'));
    const combined=set.draftCandidates.find(c=>c.candVariant.endsWith('+note0+note1'));
    expect(first).toBeDefined();expect(combined).toBeDefined();
    expect(combined!.candPerceived).toBe(first!.candPerceived);
  });
  it('gives the same draft set twice, and under permuted inputs', () => {
    for (const spec of CASES) {
      for (const s of SEATINGS) {
        const { input } = caseInput(spec, s);
        const a = canonicalHash(planner.draft(input));
        expect(canonicalHash(planner.draft(input))).toBe(a);
        const world = input.ground.map.world;
        const shuffled = w.indexWorld({ ...world, regions: [...world.regions].reverse(), edges: [...world.edges].reverse() });
        const permuted: planner.PlannerInput = {
          ...input,
          ground: { ...input.ground, map: shuffled },
          forces: [...input.forces].reverse(),
          posts: [...input.posts].reverse(),
          beliefs: new Map([...input.beliefs].reverse()),
          works: new Map([...input.works].reverse()),
          obstructions: new Map([...input.obstructions].reverse()),
        };
        expect(canonicalHash(planner.draft(permuted)), `${spec.name} / ${s.label}`).toBe(a);
      }
    }
  });
});

describe('cost', () => {
  // Wall clock: runs only with MANDATE_TIMING=1 (lane 1.0t; CI's Linux job sets it, the pre-commit hook does not). The
  // Union drafts' soundness is asserted without a stopwatch in done-check.test.ts.
  it.runIf(TIMING)('drafts on the testbed in well under 10 ms, and on the Union graph under 40 ms (median)', () => {
    const time = (f: () => unknown) => {
      f();
      const xs: number[] = [];
      for (let i = 0; i < 11; i++) {
        const t = performance.now();
        f();
        xs.push(performance.now() - t);
      }
      return xs.sort((a, b) => a - b)[5]!;
    };
    for (const spec of CASES) {
      const { input } = caseInput(spec, seat('fighter'));
      expect(time(() => planner.draft(input))).toBeLessThan(10);
    }
    const union = measureDrafting('union-1861', { days: 1, reps: 3 });
    expect(union.sound).toBe(true);
    // Raised from 25 ms (lane 0.8's rule: a timing bound that flakes on CI is raised, never skipped): the Windows runner
    // drafted in 27.96 ms on lane 1.5b's 7b4177f, and passed on a re-run.
    expect(Math.max(...union.drafts.map((d) => d.medianMs))).toBeLessThan(40);
  });
});
