/**
 * World format v2 as Zod 4 schemas (decision 0035): the shape of every pack
 * file, with errors a modder can read. Shape only: references between records,
 * licences, graph rules and string tables are checked in `validate.ts`, which
 * reports them with the same `Issue` type.
 *
 * The parsed output of `WorldSchema` and `ScenarioSchema` is exactly the
 * kernel's `World` and `ScenarioStart` (checked at the bottom of this file at
 * compile time), so the kernel's types and the published schemas cannot drift.
 */
import { ids, phase0, world as w } from '@mandate/kernel';
import { z } from 'zod';
import { COMPLIANCE_RUNGS, DISCRETION_CONDITIONS } from '@mandate/kernel';
import { CallProfileSchema, StateConditionSchema } from './call-profiles.ts';

type IdKind = ids.IdKind;

/** A well-formed id of one kind, branded as the kernel's typed id (FOUNDATION 11.3). */
export function idOf<K extends IdKind>(kind: K) {
  return z
    .string()
    .max(ids.ID_MAX_LENGTH, `a ${kind} id of at most ${ids.ID_MAX_LENGTH} characters`)
    .regex(ids.ID_PATTERN, `a ${kind} id: a letter or digit, then letters, digits and _ . : / - (no spaces)`)
    .transform((s) => s as ids.Id<K>);
}

/** An id from a pack vocabulary (terrain, post kind, arm...): same grammar, no brand. */
export const termId = z.string().max(ids.ID_MAX_LENGTH).regex(ids.ID_PATTERN, 'a vocabulary id: a letter or digit, then letters, digits and _ . : / -');

/** A string-table key: lowercase dotted segments (`region.capital_north.name`). */
export const STRING_KEY_PATTERN = /^[a-z0-9_]+(?:\.[a-z0-9_:-]+)*$/;
export const stringKey = z.string().regex(STRING_KEY_PATTERN, 'a string-table key: lowercase segments of a-z, 0-9 and _ joined by dots');

const int = z.int('a whole number');
const nonNegative = int.min(0, 'zero or more');
const positive = int.min(1, 'one or more');
const permille = int.min(0, 'a permille from 0').max(1000, 'a permille up to 1000');
const signedPermille = int.min(-1000, 'a signed permille from -1000').max(1000, 'a signed permille up to 1000');
const month = int.min(1, 'a month from 1').max(12, 'a month up to 12');

function isCalendarDate(y: number, m: number, d: number): boolean {
  const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return m >= 1 && m <= 12 && d >= 1 && d <= days[m - 1]!;
}

/** A full ISO date (YYYY-MM-DD) that exists on the calendar. */
export const isoDate = z.string().refine((s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m !== null && isCalendarDate(Number(m[1]), Number(m[2]), Number(m[3]));
}, 'a calendar date written YYYY-MM-DD');

/** A historical date: YYYY-MM-DD, or YYYY-MM or YYYY when the day or month is not in the source. */
export const historicalDate = z.string().refine((s) => {
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(s);
  if (!m) return false;
  if (m[2] === undefined) return true;
  return isCalendarDate(Number(m[1]), Number(m[2]), m[3] === undefined ? 1 : Number(m[3]));
}, 'a date written YYYY-MM-DD, YYYY-MM or YYYY');

const citation = z.strictObject({
  source: z.string().min(1, 'a source key from PROVENANCE.json'),
  at: z.string().min(1).nullable(),
});
const provenance = z.array(citation).min(1, 'at least one citation of a source in PROVENANCE.json (decisions 0031, 0033)');

const detentionPurpose = z.strictObject({
  kind: z.literal('attack_or_demonstrate'), duty: z.literal('detain'),
  target: z.strictObject({ kind: z.literal('opposing_command'), post: idOf('post') }),
  detentionArea: z.array(idOf('region')).min(1).max(2),
  actionArea: z.array(idOf('region')).min(1).max(4),
  means: z.tuple([z.literal('attack'), z.literal('demonstrate')]),
});
const doctrineGoal = z.strictObject({ objective: idOf('region').nullable(), posture: z.enum(['hold', 'relieve', 'take']) });
const letterToken = z.string().max(ids.ID_MAX_LENGTH).regex(/^[a-z][a-z0-9_]*$/);
const letterIdentity = z.strictObject({ namespace: letterToken, key: letterToken, revision: positive });
const paperClaim = z.strictObject({ kind: z.enum(phase0.CLAIM_KINDS), region: idOf('region').nullable(), token: termId.nullable(), min: int.optional(), max: int.optional() });
const paperSelector = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('letter'), issuer: idOf('person'), letter: letterIdentity, post: idOf('post'), role: z.enum(['relay', 'addressee']) }),
  z.strictObject({ kind: z.literal('report'), author: idOf('person'), authorPost: idOf('post').nullable(), subjectKind: z.enum(phase0.SUBJECT_KINDS),
    subjectId: termId, reportType: z.enum(phase0.REPORT_TYPES), reportSubtype: termId.nullable(), answers: letterIdentity.optional(), claims: z.array(paperClaim).optional() }),
]);
const requiresPapers = z.array(paperSelector).min(1).optional().describe('A conjunction of actual receipts in the acting seat’s own knowledge.');
const doctrineDiscretion = z.strictObject({ condition: z.enum(DISCRETION_CONDITIONS), fallback: doctrineGoal });
const nestedDiscretion = doctrineDiscretion.extend({ fallback: doctrineGoal.extend({ discretion: doctrineDiscretion.optional() }) });
const boundedDiscretion = doctrineDiscretion.extend({ fallback: doctrineGoal.extend({ discretion: nestedDiscretion.optional() }) });
const proposalReply = z.strictObject({ id: termId, post: idOf('post'), fromDate: historicalDate, answers: termId, source: z.string().min(1), requiresPapers });
const doctrineProposalAnswer = z.union([
  proposalReply.extend({ action: z.enum(['accept', 'decline']) }),
  proposalReply.extend({ action: z.literal('discretion'), objective: doctrineGoal.shape.objective.optional(),
    posture: doctrineGoal.shape.posture.optional(), discretion: boundedDiscretion }),
]);

const geoPoint = z.strictObject({
  lonE6: int.min(-180_000_000).max(180_000_000),
  latE6: int.min(-90_000_000).max(90_000_000),
});

const labelHints = z.strictObject({
  anchor: geoPoint.nullable(),
  spine: z.array(geoPoint),
  sizeClass: z.enum(w.LABEL_SIZE_CLASSES).nullable(),
  minZoomPermille: nonNegative.nullable(),
});

export const RegionSchema = z.strictObject({
  id: idOf('region'),
  name: stringKey,
  kind: z.enum(w.REGION_KINDS),
  terrain: termId.nullable(),
  flags: z.array(z.enum(w.REGION_FLAGS)),
  offMapRole: z.enum(w.OFF_MAP_ROLES).nullable(),
  weatherZone: idOf('weatherZone').nullable(),
  refPoint: geoPoint.nullable(),
  counties: z.array(z.string().min(1)),
  labelHints: labelHints.nullable(),
  provenance,
});

export const InstallationSchema = z.strictObject({
  id: idOf('installation'),
  region: idOf('region'),
  kind: z.enum(w.INSTALLATION_KINDS),
  name: stringKey,
  fort: z.strictObject({ water: z.enum(w.FORT_WATER_MODES).nullable(), commandsEdges: z.array(idOf('edge')) }).nullable(),
  provenance,
});

const seasonWindow = z.strictObject({
  reason: z.enum(w.SEASON_REASONS),
  months: z.array(month).min(1, 'at least one month'),
  depthFeet: nonNegative.nullable(),
});

export const EdgeSchema = z.strictObject({
  id: idOf('edge'),
  type: z.enum(w.EDGE_TYPES),
  a: idOf('region'),
  b: idOf('region'),
  lengthDays: positive,
  lengthDaysBA: positive.nullable(),
  capacity: positive,
  line: idOf('railLine').nullable(),
  breakOfBulk: z.boolean(),
  depthFeet: nonNegative.nullable(),
  seasons: z.array(seasonWindow),
  provenance,
});

export const RailLineSchema = z.strictObject({ id: idOf('railLine'), name: stringKey, provenance });

export const DepotSchema = z.strictObject({
  id: idOf('depot'),
  region: idOf('region'),
  kind: z.enum(w.DEPOT_KINDS),
  name: stringKey,
  capacity: positive,
  provenance,
});

export const WeatherZoneSchema = z.strictObject({ id: idOf('weatherZone'), name: stringKey });

const statCentre = z.strictObject({ direction: z.enum(w.STAT_DIRECTIONS).nullable(), cites: z.array(citation) });

export const PersonSchema = z.strictObject({
  id: idOf('person'),
  name: stringKey,
  invented: z.boolean(),
  requiresIntroduction:z.boolean().optional(),
  faction: idOf('faction').nullable(),
  kind: termId,
  born: historicalDate.nullable(),
  died: historicalDate.nullable(),
  centres: z.strictObject({ competence: statCentre, nerve: statCentre, experience: statCentre, reputation: statCentre }),
  temperament: z.strictObject({ boldness: statCentre, candour: statCentre }).describe('Boldness and candour (lane 1.1): cited centres history’s shadow draws around at setup.'),
  values: z.array(z.strictObject({ value: termId, cites: z.array(citation) })).describe('The values he holds, from the pack’s values vocabulary, each cited (lane 1.1); empty when none is known.'),
  regard: statCentre.describe('His regard for his own faction’s principal at the pack’s first start, a cited centre (lane 1.1).'),
  regardOthers: z
    .array(z.strictObject({ toward: idOf('person'), direction: z.enum(w.STAT_DIRECTIONS), cites: z.array(citation) }))
    .describe('His regard for other people at the pack’s first start (lane 1.5: rivals, partners), each a cited direction.'),
  practices: z
    .array(z.strictObject({ practice: termId, cites: z.array(citation) }))
    .describe('His own standing practices (lane 1.5b), each cited: conduct an order of the map can run against (a row’s clashes), such as a commander’s practice toward fugitives. Gate content.'),
  traits: z.array(z.strictObject({ trait: termId, cites: z.array(citation) })),
  bloc: termId.nullable(),
  service: z.strictObject({ government: idOf('department').nullable(), toFaction: idOf('faction'), toBloc: termId.nullable(), historicalOn: isoDate.nullable(), cites: z.array(citation).min(1) }).optional(),
  blocCites: z.array(citation).optional().describe('The citations for his bloc (0087: a bloc is a judgment true at the start, so it needs a contemporary leg dated before the pack’s first start); absent when none is given.'),
  ranks: z.array(z.strictObject({ rank: termId, from: historicalDate, until:isoDate.optional() })),
  rankSchedule:z.boolean().optional(),
  unknowns: z.array(z.string()),
  provenance,
});

const term = z.strictObject({ id: termId, name: stringKey });

export const RulesSchema = z.strictObject({
  onwardAssignments: z.array(z.strictObject({
    id: termId, source: z.string().min(1), fromDate: historicalDate,
    issuer: idOf('person'), from: idOf('post'), to: idOf('post'), destination: idOf('region'),
    mandate: termId, call: termId, regiment: termId,
  })).optional(),
  mandates: z.array(z.strictObject({
    id: termId, fromDate: isoDate, source: z.string().min(1),
    requiresPapers: z.array(paperSelector).max(16).optional(),
    grant: z.strictObject({
      mandateKey: termId, mandateRevision: positive, mandateIssuer: idOf('person'), mandateIssuerPost: idOf('post').nullable(),
      mandateHolder: idOf('person'), mandatePost: idOf('post'),
      mandateParent: z.strictObject({ parentPost: idOf('post'), parentKey: termId }).nullable(),
      mandateActions: z.array(z.enum(['hold', 'relieve', 'take', 'approve', 'assign', 'attack_or_demonstrate'])), mandateRecipients: z.array(idOf('post')),
      mandateRegions: z.array(idOf('region')), mandateModes: z.array(z.enum(['land','rail','river','sea'])),
      mandateCeiling: z.strictObject({ ceilingPost: idOf('post'), ceilingMen: nonNegative.nullable() }).nullable(),
      mandateGuard: nonNegative.nullable(), mandateExpires: nonNegative.nullable(),
      mandateReports: z.array(z.string().min(1)), mandateOnward: z.boolean(), mandateRevoke: z.boolean(),
    }),
  })).optional(),
  capacityMax: positive,
  supplyControlPermille: permille,
  retreatControlPermille: permille,
  seasons: z.array(
    z.strictObject({
      reason: z.enum(w.SEASON_REASONS),
      defaultMonths: z.array(month).min(1),
      lengthPermille: positive,
      capacityPermille: nonNegative,
    }),
  ),
  // Lane 0.5's numbers, moved out of the kernel (0064, the lead's ruling): every pack states them, there is no default.
  stores: z
    .strictObject({
      menPerCapacityUnit: positive.describe('Men (and non-combatants) one unit of the capacity scale feeds for a day. A design parameter.'),
      capDays: positive.describe('The most days of stores a block refills to. A design parameter.'),
      lowDays: nonNegative.describe('Stores below this many days are low, a truth event a report may tell; at most capDays. A design parameter.'),
      norms: z
        .array(z.strictObject({ post: idOf('post').nullable(), postKind: termId.nullable(), arm: termId.nullable(), faction: idOf('faction').nullable(), days: positive, cite: z.string().min(1, 'a source and place') }))
        .describe('Norms for blocks whose stores no source gives (lane 1.4): practice, so each block given one is flagged assumed. First match by post or post kind, arm and side; no match stays unknown.'),
    })
    .describe('Stores on hand (0040, 0064): design parameters the pack states, not sourced facts.'),
  occupation: z
    .strictObject({
      occupyPermille: permille.describe('Control a side alone in held ground gains a day at full strength, permille. A design parameter.'),
      occupyFullMen: positive.describe('The men at which occupation reaches its full rate; fewer gain in proportion. A design parameter.'),
    })
    .describe('Occupation (0064): a side alone that marched in takes ground by its men. Design parameters the pack states, not sourced facts.'),
  // Lane 1.3: the battle model (the combat note). Every pack states every number; the kernel has no default (0072).
  combat: z
    .strictObject({
      baseRates: z
        .strictObject(Object.fromEntries(phase0.BATTLE_TYPES.map((t) => [t, z.strictObject({ attacker: permille, defender: permille })])) as Record<phase0.BattleType, z.ZodObject<{ attacker: typeof permille; defender: typeof permille }, z.core.$strict>>)
        .describe('K+W per 1000 men in contact per day, by battle type, for the side that attacks and the side that defends (P2).'),
      works: z.strictObject({ hastyAt: permille, preparedAt: permille }).describe('Region fortification (permille) at or above which a defender is dug in or in works.'),
      terrain: z
        .array(z.strictObject({ terrain: termId, frontageMen: nonNegative, lossPermille: signedPermille }))
        .describe('Per terrain the pack names: men who can be in contact per side per day (P3), and a loss term both sides take.'),
      otherTerrain: z.strictObject({ frontageMen: nonNegative, lossPermille: signedPermille }).describe('The row for any terrain the table does not name (the pack’s statement, never a kernel default).'),
      multiplier: z.strictObject({ min: nonNegative, max: nonNegative }).describe('The loss multiplier’s clamp, permille.'),
      terms: z
        .strictObject({ qualityWeight: permille, qualityMax: permille, competenceWeight: permille, competenceMax: permille, numbersMax: permille, surprisePermille: permille, successiveDayPermille: signedPermille, noiseMax: permille })
        .describe('The additive loss terms’ weights and caps (P4).'),
      commit: z
        .strictObject(Object.fromEntries(phase0.COMMITS.map((c) => [c, z.strictObject({ sharePermille: permille, posturePermille: signedPermille })])) as Record<phase0.Commit, z.ZodObject<{ sharePermille: typeof permille; posturePermille: typeof signedPermille }, z.core.$strict>>)
        .describe('Per dawn commit: the share of men committed, and the posture term both sides take.'),
      killedPermille: permille.describe('Killed, permille of killed and wounded.'),
      missingPermille: z.strictObject(Object.fromEntries(phase0.DAY_RESULTS.map((r) => [r, permille])) as Record<phase0.DayResult, typeof permille>).describe('Missing, permille of K+W, by the side’s result.'),
      capturedPermille: z.strictObject(Object.fromEntries(phase0.DAY_RESULTS.map((r) => [r, permille])) as Record<phase0.DayResult, typeof permille>).describe('Of the missing, permille captured on the field, by result.'),
      flank: z.strictObject({ basePermille: permille, numbersWeight: permille, qualityWeight: permille, maxPermille: permille, moraleLoss: permille, missingPermille: permille }).describe('The flank break (P7).'),
      morale: z.strictObject({ start: permille, lossWeight: nonNegative, nerveWeight: permille, experienceWeight: permille, routAt: permille, routFloor: permille, recoveryDays: nonNegative }).describe('Morale and the rout (P5, P8).'),
      experience: z.strictObject({ start: permille, gainPerDay: permille }),
      equipment: z.strictObject({ start: permille, routLoss: permille }),
      decisions: z
        .strictObject({ probeShare: nonNegative, allOutBoldness: permille, holdShare: nonNegative, breakoutShare: nonNegative, followBoldness: permille, pressBoldness: permille })
        .describe('The commanders’ rules (P6), read against his own demand ratio: shares are permille of it.'),
      maxBattleDays: positive.describe('A battle closes after this many days (P1).'),
      fieldControlPermille: permille.describe('Control the side left holding the field gains, permille (P9).'),
      pursuit: z.strictObject({ followPermille: permille, pressPermille: permille, cavalryPermille: permille }).describe('Pursuit’s captures (lane 1.4): the pursued side’s stragglers taken on a rearguard day, by the pursuer’s choice, more with cavalry.'),
      straggleReturnPermille: permille.describe('Stragglers who rejoin a day, permille of the pool (P8).'),
      leaders: z.strictObject({ killedPermille: permille, woundedPermille: permille, capturedPermille: permille }).describe('A commander’s draw per battle-day on his own stream: killed, wounded, captured (only if his side routs).'),
      phases: z
        .strictObject({
          hours: z.array(z.strictObject({ phase: z.enum(phase0.DAY_PHASES), fromHour: nonNegative, toHour: nonNegative })),
          lossShares: z.strictObject(Object.fromEntries(phase0.BATTLE_TYPES.map((t) => [t, z.array(permille)])) as Record<phase0.BattleType, z.ZodArray<typeof permille>>),
        })
        .describe('The day shape (P10): each phase’s hours, and each battle type’s share of the day’s losses per phase.'),
      bombardment: z
        .strictObject({
          gunArms: z.array(termId).min(1).describe('The arms (arm ids) whose known men count as guns.'),
          objectives: z
            .array(z.strictObject({ region: idOf('region'), source: z.string().min(1) }))
            .describe('The fortifications that may be bombarded, each cited (G-1.12a); any other objective is refused, so no town is bombarded as such.'),
          rangeMaxDaysPermille: nonNegative.describe('A water edge carries fire only if it is at most this long, permille days (the batteries’ range).'),
          inPositionPreparationDays: nonNegative.describe('Preparation days for batteries already at their firing position; they still march if they must move there.'),
          moraleLossPerDay: permille.describe('Morale the defender loses a day at a fire ratio of 1000.'),
          ratioCapPermille: nonNegative.describe('The fire ratio (attacker’s guns over the defender’s, permille) is capped here.'),
          outOfStoresMoraleLoss: permille.describe('Morale lost a day besides when the garrison’s stores are out.'),
          worksWearPerDay: permille.describe('Fortification permille the defender’s works lose a day at a fire ratio of 1000.'),
          lossPermille: permille.describe('The defender’s killed and wounded a day, permille of his men, at a fire ratio of 1000.'),
          surrenderMorale: permille.describe('An average commander surrenders when his men’s morale falls below this.'),
          boldnessWeight: permille.describe('Permille of that floor per point of his boldness from 500: a bolder man holds to a lower floor.'),
          recordTerms: z
            .array(z.strictObject({ region: idOf('region'), faction: idOf('faction'), commander: idOf('person'), offerWindow: z.strictObject({ offerDay: nonNegative, lastDay: nonNegative }).nullable(), terms: z.enum(phase0.BOMBARD_TERMS), source: z.string().min(1) }))
            .describe('Cited surrender terms for this fort, defending side and commander (0074). A dated offer applies strictly after offerDay through lastDay (scenario days); null records no offer date. Without a matching case, the garrison is captured.'),
          source: z.string().min(1).describe('Where the numbers come from.'),
        })
        .describe('Bombardment across water (lane 1.12): a fire-only engagement against a fort the attacker cannot reach by land. Guns are the known men of artillery-arm blocks.'),
    })
    .describe('The battle model (lane 1.3; the combat note): design parameters the pack states (0072), not sourced facts; the starting values sit inside Livermore’s and Fox’s bands.'),
  operations: z
    .strictObject({
      pauseDays: positive.describe('Days an axis pauses after it is driven back, before it tries again. A design parameter.'),
      maxRepulses: positive.describe('Times an axis may be driven back before its operation fails. A design parameter.'),
      pursuitDays: z.strictObject({ follow: positive, press: positive }).describe('Days a pursuit lasts, by the commander’s choice.'),
      holdControlPermille: int.min(1, 'a permille from 1').max(1000, 'a permille up to 1000').describe('Control at its objective at which an axis holds it and its operation ends.'),
      works: z.strictObject({ perNightPermille: permille, capPermille: permille, lostWhenStormedPermille: permille }).describe('Works dug each night by an axis holding its objective, their cap, and what storming takes off (0029).'),
      returns: z.strictObject({ firstLowPermille: permille, revealDays: positive }).describe('Casualty returns (0074, 0076): how low the first runs, the captured counted among its missing, and the days until the full return.'),
    })
    .describe('Operations (lane 1.4): design parameters the pack states (0072), not sourced facts.'),
  pruning: z
    .strictObject({ operationDays: positive, battleDays: positive, responseDays: positive })
    .describe('How long ended operations, closed battles and answered orders are kept, in days (lane 1.4; as knowledge prunes). Design parameters.'),
  movement: z
    .strictObject({
      marchMinCapacityPermille: positive.describe('The least capacity an edge needs this month to carry a march, permille of one unit of the capacity scale; at most capacityMax x 1000. A design parameter.'),
      courierPermille: int.min(1, 'a permille from 1').max(1000, 'a permille up to 1000').describe('A courier’s days on an edge, permille of a division’s, rounded up, at least one day. A design parameter.'),
    })
    .describe('Movement and messages over the graph (0064): design parameters the pack states, not sourced facts.'),
  ruleSeats: z
    .strictObject({
      warFlags: z
        .array(
          z.strictObject({
            faction: idOf('faction'),
            flag: termId.nullable().describe('The situation chain flag that puts this faction at war; null for war from day 1.'),
          }),
        )
        .describe('One row per faction in the manifest.'),
      principals: z
        .array(
          z.strictObject({
            faction: idOf('faction'),
            letterNamespace: letterToken.optional(),
            maxPaperSelectors: positive.optional().describe('Pack limit for each receipt conjunction and its per-paper claim tests.'),
            crossNeutral: z.boolean().describe('Whether his goals may cross a neutral government’s open ground: a political act (lane 1.12).'),
            concentrateAt: idOf('post').nullable().describe('The post his raised regiments are transferred to; null leaves them with the governors.'),
            concentrateSource: z.string().min(1).nullable().describe('Why that post: the research it rests on, the choice of post labelled [I]; null exactly when concentrateAt is.'),
            concentrations: z.array(z.strictObject({ id: termId.optional(), post: idOf('post'), fromDate: historicalDate, requiresDepartment: idOf('department'), fromPosts: z.array(idOf('post')), namedRegiments: z.strictObject({ afterCall: termId, ids: z.array(termId).min(1) }).optional(), receiveLevies: z.boolean().optional(), source: z.string().min(1), requiresPapers })).optional().describe('Dated concentration changes after a government joins this side and the receiving command is received. Named regiment requests use one sending post and its received call answer. receiveLevies false withholds unallocated statewide batches.'),
            appointments: z.array(z.union([z.strictObject({ post: idOf('post'), person: idOf('person'), fromPost: idOf('post').nullable(), fromDate: historicalDate, requiresDepartment: idOf('department'), source: z.string().min(1) }), z.strictObject({ post: idOf('post'), person: idOf('person'), onDate: isoDate, source: z.string().min(1) })])).optional().describe('Sourced appointments establishing declared commands through the existing appointment verb, conditional on government side and commander eligibility.'),
            calls: z
              .array(z.strictObject({ address: z.literal('office').optional(), offer: z.strictObject({ region: idOf('region'), receiver: idOf('post') }).optional(), termsId: z.string().regex(/^[a-z][a-z0-9_]*$/).optional(), id: z.string().regex(/^[a-z][a-z0-9_]*$/).optional(), post: idOf('post'), regiments: positive.nullable().describe('Regiments requested; null when only an unquantified sub-regimental unit is documented.'), men: positive.nullable().optional().describe('Exact headcount; null preserves an unquantified unit, absent uses menPerRegiment.'), arm: termId.optional(), readiness: z.boolean().optional(), termDays: positive.nullable().describe('Days from muster, or null for the war.'), fromDate: historicalDate, atPeace: z.boolean().optional(), source: z.string().min(1), requiresPapers }))
              .describe('Each identified dated requisition goes once; distinct IDs allow repeats to a governor. atPeace permits a cited pre-war call. readiness records an answer without muster. Remove a row when a situation owns the same requisition.'),
            offensives: z
              .array(z.union([
                z.strictObject({ id: termId.optional(), letter: letterIdentity.optional(), supersedes: letterIdentity.optional(), dependsOn: z.array(letterIdentity).optional(), repeats: letterIdentity.optional(), post: idOf('post'), objective: idOf('region'), fromDate: historicalDate, posture: doctrineGoal.shape.posture.optional(), discretion: boundedDiscretion.optional(), requiresNotice: idOf('situation').optional(), requiresPapers, source: z.string().min(1) }),
                z.strictObject({ letter: letterIdentity, supersedes: letterIdentity.optional(), dependsOn: z.array(letterIdentity).optional(), repeats: letterIdentity.optional(), post: idOf('post'), purpose: detentionPurpose, issuer: idOf('person').optional(), fromDate: historicalDate, requiresNotice: idOf('situation').optional(), requiresPapers, source: z.string().min(1) }),
              ]))
              .describe('The dated goals he gives (take unless a posture is specified), each from its date (or the day after war, if later); each cites its source.'),
            proposalAnswers: z.array(doctrineProposalAnswer).optional()
              .describe('Sourced replies from their written date, once the commander’s proposal answering the named goal has reached this principal.'),
            inquireEveryDays: positive.describe('How often he asks each army where it stands, in days (an inquiry costs no attention).'),
            appointKinds: z
              .strictObject({ land: z.array(termId), naval: z.array(termId) })
              .describe('The person kinds he appoints to a vacant post commanding land troops, and naval ones.'),
          }),
        )
        .describe('One row per faction: its rule-seat principal’s doctrine (lane 1.12, replacing the generic principal of 0072).'),
    })
    .describe('The rule-seat principals: when each side is at war (0064, 0066), and how its principal does his historical jobs (lane 1.12).'),
  // Moved out of the kernel by 0072 (the exit review's S3), as 0064 moved lane 0.5's: every pack states them, there is no default.
  latency: z
    .strictObject({
      wireDays: nonNegative.describe('Days for a message on the wire between two wired regions. A design parameter.'),
      publicWires: z.array(z.strictObject({ from: idOf('region'), to: idOf('region'), faction: idOf('faction'), fromDate: historicalDate, throughDate: historicalDate, source: z.string().min(1) })).optional().describe('Cited public-office access between these places on these dates, independent of military control; enemy-held endpoints close it. No entry means no public access.'),
      mailPermille: nonNegative.describe('The mail against a courier, permille (slower: above 1000). A design parameter.'),
      specialMessengerPermille: permille.describe('A special messenger against a courier, permille (faster: at most 1000). A design parameter.'),
      courierNoiseMaxDays: nonNegative.describe('The most extra days a courier or the mail can lose to roads and weather. A design parameter.'),
      specialMessengerPrice: nonNegative.describe('The attention a special messenger costs its sender. A design parameter.'),
    })
    .describe('How long each route takes beside the map’s courier days (0026, 0032): design parameters the pack states, not sourced facts.'),
  reportConfidence: z
    .strictObject(Object.fromEntries(phase0.REPORT_CONFIDENCE_FIELDS.map((field) => [field, permille])) as Record<phase0.ReportConfidenceField, typeof permille>)
    .describe('Tentative report claim and advice confidence in whole permille. Every pack supplies all fields (0072). Consult minimum is the floor on a recommendation’s score.'),
  reportTemplates: z
    .array(
      z.strictObject({
        templateType: z.enum(phase0.REPORT_TYPES),
        templateSubtype: termId.nullable().describe('The subtype for the informal and advice families; null for every other type.'),
        templateRoute: z.enum(phase0.ROUTE_KINDS).describe('The usual route; an author off the wire falls back to courier.'),
        cadenceDays: nonNegative.describe('Every this many days, for a report written on a cycle; 0 for one written on an event. A design parameter.'),
        maxAgeDays: positive.max(phase0.MAX_REPORT_AGE_DAYS, `at most ${phase0.MAX_REPORT_AGE_DAYS} days`).describe('A held report older than this is pruned. A design parameter.'),
        keepSupersededDays: nonNegative.describe('A report superseded by a newer one with the same template, author and subject is pruned once this old; at most maxAgeDays. A design parameter.'),
      }),
    )
    .describe('One template for every report type and subtype the kernel writes (0032: each a pack-tunable template), with the pruning rule for knowledge (FOUNDATION section 8): design parameters the pack states.'),
  standing: z
    .strictObject({
      conflictWindowDays: positive.describe('Days within which a chain order stands against a newer order that went around the chain (0040). A design parameter.'),
    })
    .describe('Conflicting orders (0040, 0072): a design parameter the pack states, not a sourced fact. A stand-in until the people recast resolves conflicts by compliance.'),
  // Lane 1.2: the planner and plans in the kernel (0062). Every number is a design parameter the pack states (0072), none a kernel default.
  planner: z
    .strictObject({
      hopShare: positive.describe('Share of a neighbouring region’s perceived enemy that adds to a region’s threat, permille.'),
      menPerDay: positive.describe('Men of perceived enemy that weigh as one day’s march in route cost, at risk weight 1000.'),
      flankOverlapMax: positive.describe('A flank is kept only if it shares fewer than this many permille of the direct route’s regions (0062: 600).'),
      flankLengthMax: positive.describe('A flank may take at most this many permille of the direct route’s days (0062: 1600).'),
      flankPenalty: positive.describe('Penalty, permille, on the direct route’s edges when looking for a flank (2000 doubles them).'),
      retrogradeSlack: nonNegative.describe('An alternative may pass regions at most this many permille days further from the objective than its start.'),
      dedupeOverlap: positive.describe('Candidates sharing at least this many permille of their regions, with the same shape, are duplicates.'),
      dedupeArrival: nonNegative.describe('... and only if they arrive within this many permille days of each other.'),
      topN: positive.describe('Moving candidates on the menu, plus a holding action (0062: four).'),
      maxSearches: positive.describe('Route searches allowed per request; the cap is counted and reported, never silent.'),
      reducePerLevel: nonNegative.describe('Permille days to reduce works per permille of fortification.'),
      clearDays: nonNegative.describe('Permille days to clear works no installation holds (a boom) deliberately.'),
      forceDays: nonNegative.describe('Permille days to force such works in a night.'),
      forcingThreat: nonNegative.describe('Extra threat, as men, of forcing works or running past batteries.'),
      assaultDays: nonNegative.describe('Permille days an assault on a garrisoned region takes, on the route as at the objective.'),
      pincerWindow: nonNegative.describe('A pincer’s partner may arrive up to this many permille days before the main axis.'),
      dependenceCost: nonNegative.describe('What one support request to another holder costs in the score.'),
      partnerWillingnessWeight: nonNegative.describe('Permille of the cooperation a drafter expects of a partner holder counted against dependenceCost. He expects it from what he can know: his regard for the holder and the holder’s public standing (0062: beliefs, never truth).'),
      partnerRegardWeight: nonNegative.describe('Permille of the drafter’s regard for the partner’s holder (signed; regardUnknown with no history) in the cooperation he expects.'),
      partnerStandingWeight: nonNegative.describe('Permille of the partner holder’s public standing, above or below partnerStandingPivot, in the cooperation expected of him.'),
      partnerStandingPivot: int.min(0).max(1000).describe('The public standing, permille, at which a holder’s reputation neither raises nor lowers what is expected of him.'),
      dailyDraftCap: positive.describe('Plans drafted in one day by each side’s commanders; the rest wait for the next, oldest request first. Counted per side: one side’s requests never defer the other’s (0062; lane 0.8 measured the worst day on the Union graph).'),
      weights: z
        .strictObject({
          riskBase: nonNegative,
          supplyBase: nonNegative,
          concentrationPerTimid: positive,
          pausePerTimid: positive,
          twoAxesAt: nonNegative,
          threeAxesAt: nonNegative,
          goalFit: nonNegative,
          ratioBonusMax: nonNegative,
          ratioBonusDivisor: positive,
          ratioPenaltyMax: positive,
          latePenaltyMax: nonNegative,
          latePerDay: nonNegative,
          earlyBonusMax: nonNegative,
          earlyDivisor: positive,
          holdingTime: int,
          traitBase: nonNegative,
          hasteDivisor: positive,
          supplyDivisor: positive,
          outrunDivisor: positive,
          exposureDivisor: positive,
          coordinationDivisor: positive,
          perExtraAxis: nonNegative,
          gloryDivisor: positive,
          cautionDivisor: positive,
        })
        .describe('How the planner turns a man’s traits into his profile and scores a plan: each score term a signed sum of these weights times the plan’s facts (hard rule 6). Calibrated with compliance.'),
    })
    .describe('The planner (0062): design parameters the pack states, not sourced facts.'),
  plans: z
    .strictObject({
      notes: z.strictObject({
        maxMarks: positive,
        maxWaypoints: positive,
        maxWaitDays: nonNegative,
        scoreWeight: nonNegative,
        rungs: z.array(z.strictObject({ rung: z.enum(COMPLIANCE_RUNGS), weight: permille })).refine(rows => rows.length === COMPLIANCE_RUNGS.length && new Set(rows.map(r => r.rung)).size === COMPLIANCE_RUNGS.length, 'one note weight per compliance rung'),
        terms: z.array(z.strictObject({ kind: z.enum(['focus', 'via', 'wait', 'avoid']), boldness: permille, honours: z.array(termId), offends: z.array(termId) })).refine(rows => rows.length === 4 && new Set(rows.map(r => r.kind)).size === 4, 'one directive term row per note kind'),
      }).describe('Nonbinding send-back marks: bounds, soft score weight, compliance weights and value terms. Design parameters, not historical facts.'),
      goalDefaults: z
        .strictObject({ risk: permille, deadlineDays: positive, rail: z.boolean(), river: z.boolean(), sea: z.boolean(), neutral: z.boolean(), awaitWord: z.boolean(), approveAsDrafted: z.boolean() })
        .describe('The goal terms an order carries when it names only a posture and an objective (a situation’s option).'),
      demonstration: z.strictObject({
        detentionRegions: z.literal(2), actionRegions: z.literal(4),
        deploymentDays: z.tuple([z.literal(1), z.literal(2)]), reconnaissanceDays: z.literal(1),
        demonstrationCandidates: z.literal(12), totalCandidates: z.literal(16), reserveDays: z.literal(1),
      }).optional().describe('Accepted limits for attack or demonstrate (0128 D1–D6). Required for the purpose.'),
      holdingRisk: int.describe('A holding action’s riskiness, for reading an edit’s boldness against his own best plan (0062).'),
    })
    .describe('Goals and plans (0040, 0062): design parameters the pack states.'),
  recruitment: z
    .strictObject({
      stateConditions: z.array(z.strictObject({
        recordId: termId, recordActor: idOf('person'), recordPost: idOf('post'), recordDate: isoDate,
        recordCondition: StateConditionSchema,
      })).optional(),
      callProfiles: z.array(CallProfileSchema).optional().describe('Per-paper values and recorded, unscored conditions. Missing profile uses the explicit callTerms fallback.'),
      callTerms: z
        .strictObject({ boldness: permille, honours: z.array(termId), offends: z.array(termId) })
        .describe('How a governor reads a call for regiments: its boldness and the values it honours and offends (pack data; 0074).'),
      raisingPostKinds: z.array(termId).describe('Post kinds whose holders answer a call (a governor’s). A post of a self-governing department never does.'),
      planningRegiments: positive.max(4).optional().describe('Model planning size [I], at most four regiments; not a historical norm.'),
      menPerRegiment: positive.optional().describe('Legacy fictional pack size; replaced by establishments for researched calls.'),
      establishments: z.array(z.strictObject({ id: termId, faction: idOf('faction'), callKind: termId, arm: termId, organisation: termId,
        effective: isoDate, men: positive.nullable(), cites: z.array(z.tuple([z.string().min(1),positive])).min(1), note: z.string().min(1) })).optional(),
      defaultEstablishments: z.array(z.strictObject({ faction: idOf('faction'), arm: termId, id: termId })).optional(),
      arm: termId.describe('The arm new blocks are.'),
      storesDays: nonNegative.describe('Days of stores a new block is issued at muster.'),
      musterDays: nonNegative.describe('Days from a call’s arrival to muster, for a governor who complies at once.'),
      rungs: z
        .array(z.strictObject({ rung: z.enum(COMPLIANCE_RUNGS), sharePermille: nonNegative, delayDays: nonNegative }))
        .describe('The compliance rungs that raise men: permille of the quota raised and days added to the muster. A rung not listed raises none and sends a memorandum back.'),
      loyaltyFull: permille.describe('The loyalty to his side at which a governor’s region gives its full share.'),
      loyaltyWeight: permille.describe('How far loyalty below that scales the share down (0: loyalty is not read).'),
      maxTermDays: positive.describe('The longest enlistment a call may name, in days.'),
      musterBlockedDays: nonNegative.describe('Days a levy due to muster waits while its region is enemy-held; past them it lapses, reported to the caller.'),
    })
    .describe('Governors raising regiments on a call (lane 1.7): design parameters the pack states. No men stock in 1A: a regiment goes straight into a block.'),
  selfEmancipation: z
    .strictObject({
      linesFaction: idOf('faction').nullable().describe('The faction whose lines people reach (pack data); null: the pack has no such term.'),
      agencyReasons: z
        .strictObject({ resistanceWithin: z.string().regex(/^agency:[a-z0-9-]+$/), resistanceElsewhere: z.string().regex(/^agency:[a-z0-9-]+$/), flightToLines: z.string().regex(/^agency:[a-z0-9-]+$/) })
        .describe('The reason type each cause carries, one of the gate register’s agency types (SENSITIVE-HISTORY E3): cause 1 in the enslaving side’s own regions, and elsewhere (a neutral government’s, or the lines’ side’s own); cause 2.'),
      protectedFlags: z
        .array(z.strictObject({ flag: termId, regions: z.array(idOf('region')) }))
        .describe('Where slavery has ended, in law or in fact (G-1.7b; the District of Columbia act of April 1862 is the model): while a flag is set, the term skips its regions. A policy protecting people who reach the lines is a policy flag, which never skips a region; holding a region protects no one by itself.'),
      cadenceDays: positive.describe('The term is recomputed every this many days.'),
      resistancePerMillion: int.min(0).max(1000000).describe('Cause 1, resistance and flight within, keyed to no one’s reach: per million of the census per cadence.'),
      pressureFlags: z.array(z.strictObject({ flag: termId, permille: nonNegative, agency: z.string().regex(/^agency:[a-z0-9-]+$/) })).describe('Situation flags whose pressure (impressment, say) raises both causes, permille of each, each with its own agency type (N9).'),
      flightPerMillion: int.min(0).max(1000000).describe('Cause 2, flight to the lines, per million of the census per cadence at full reach and policy.'),
      reachWithForce: permille.describe('Reach when the lines’ side holds the region or a neighbour with its force there.'),
      reachLinesOnly: permille.describe('Reach when it holds one with no force there.'),
      holdShare: permille.describe('The control share at which the lines’ side holds a region.'),
      policyBase: permille.describe('Known policy, permille: the base.'),
      policyFlags: z.array(z.strictObject({ flag: termId, permille: int.min(-1000).max(1000) })).describe('Situation flags that raise or lower known policy, signed permille.'),
    })
    .describe('The derived self-emancipation term (0046; SENSITIVE-HISTORY 3.2): never a lever. Its rates wait on sources; a pack with no census has no arrivals.'),
  politics: z
    .strictObject({
      blocs: z
        .array(
          z.strictObject({
            id: termId.describe('A bloc in the pack’s bloc vocabulary.'),
            faction: idOf('faction'),
            voice: permille.describe('Its share of its side’s voice in Washington; a side’s blocs sum to 1000.'),
            rest: signedPermille.describe('Its support at the start, and the settled disposition it drifts back toward.'),
            values: z.array(termId).describe('The values it holds: an address to a bloc costs the side’s blocs that share none of them.'),
            victory: signedPermille.describe('Support it moves when its side’s press reports a battle won, at a paper’s full reach.'),
            defeat: signedPermille.describe('The same, for a battle reported lost.'),
            cite: z.string().min(1).describe('Where its voice, rest and reactions come from (a source key and place, or the design note that sets them).'),
          }),
        )
        .describe('Blocs with weights and support (FOUNDATION section 7; M2’s blocs recast). A bloc is never a protected group (the gate refuses one).'),
      drift: z.strictObject({ divisor: positive, cite: z.string().min(1) }).describe('Each week a bloc closes 1/divisor of the gap between its support and its rest. Cite: a source, “[I]” or “M2’s”.'),
      address: z.strictObject({ support: signedPermille, othersPenalty: signedPermille, cite: z.string().min(1) }).describe('An address: the bloc addressed gains support; the side’s blocs sharing none of its values gain othersPenalty. Cite: a source, “[I]” or “M2’s”.'),
      ladder: z
        .strictObject({ lobbyingPerRung: signedPermille, publicDefiance: signedPermille, rival: signedPermille, cite: z.string().min(1) })
        .describe('A man’s rung, weekly: from lobbying up, his bloc gets lobbyingPerRung per rung; from public defiance, every bloc of his side gets publicDefiance; a rival’s bloc gets rival.'),
      chambers: z.array(z.strictObject({ id: termId, faction: idOf('faction'), name: stringKey, cite: z.string().min(1),composition:z.array(z.strictObject({on:isoDate,groups:z.array(z.strictObject({name:stringKey,seats:int.min(0)})).min(1),cite:z.string().min(1)})).optional().describe('Dated public membership counts; absent means unpublished, never estimated from support.') })).describe('The chambers of the legislature (0040).'),
      sessions: z
        .array(
          z.strictObject({
            id: termId,
            chambers: z.array(termId).min(1),
            callable: z.boolean().describe('Sits only when a proposal calls it (a special session); otherwise a regular session of the calendar.'),
            opens: isoDate.nullable().describe('The first day it sits; for a callable session, null when it meets afterCallDays after the call.'),
            closes: isoDate.nullable().describe('The last day it sits; for a callable session, null when it sits sitsDays.'),
            afterCallDays: positive.nullable(),
            sitsDays: positive.nullable(),
            cite: z.string().min(1),
          }),
        )
        .describe('The session calendar (0040): regular sessions by their dates, and the special sessions a call may summon.'),
      credibility: z
        .strictObject({ base: permille, mandatePermille: permille, perRelief: signedPermille, min: permille, max: permille, cite: z.string().min(1) })
        .describe('The principal’s sanction credibility (P7), derived: base, a share of his mandate, and each man holding a relief against him, within min..max.'),
      framing: z.strictObject({ mandatePermille: permille, cite: z.string().min(1) }).describe('How much the framing term (0028, 0040) counts in the mandate.'),
      press: z
        .strictObject({
          cadenceDays: nonNegative.describe('Days between front pages; 0 prints none.'),
          papers: z.array(
            z.strictObject({
              id: termId,
              faction: idOf('faction'),
              editor: idOf('person'),
              region: idOf('region'),
              reachPermille: permille.describe('The share of its side’s public it reaches; a side’s papers sum to at most 1000.'),
              cite: z.string().min(1),
            }),
          ),
          standing: z.strictObject({ victory: signedPermille, defeat: signedPermille, cite: z.string().min(1) }).describe('A battle’s commander’s standing moved by a front page reporting it won or lost, at full reach.'),
        })
        .describe('The press as a report route (FOUNDATION section 7): a weekly front page each paper’s editor writes.'),
    })
    .describe('Politics (lane 1.6): blocs, the chambers and their calendar, credibility, framing and the press. Design parameters and sourced records the pack states (0072).'),
  turns: z
    .strictObject({ maxDays: positive.describe('The most days a turn runs before the game waits for the player; a decision point ends one sooner.'), cite: z.string().min(1) })
    .describe('Turns (0027): read by the shell (the console), never by the kernel, which ticks a day at a time.'),
  people: z
    .strictObject({
      resignation: z.strictObject({ historicalDefaults: z.boolean(), base: int, resignAt: int,
        values: z.array(z.strictObject({ value: termId, weight: int })),
        traits: z.array(z.strictObject({ trait: termId, weight: int })) }),
      shadow: z
        .strictObject({
          centrePermille: z.strictObject({ high: permille, above: permille, average: permille, below: permille, low: permille }).describe('The permille centre of each cited direction. A design parameter.'),
          unknownCentre: permille.describe('The centre of an unknown stat. A design parameter.'),
          spread: permille.describe('Half-width of the uniform draw around a cited centre (0: as history). A design parameter.'),
          unknownSpread: permille.describe('Half-width around an unknown centre. A design parameter.'),
          regardPermille: z.strictObject({ high: signedPermille, above: signedPermille, average: signedPermille, below: signedPermille, low: signedPermille }).describe('Signed regard for each cited direction of regard for the principal. A design parameter.'),
          regardUnknown: signedPermille.describe('The regard a man holds toward someone when nothing is known or recorded: toward his principal when uncited, and toward anyone else until play moves it. A design parameter, never a silent 0.'),
        })
        .describe('History’s shadow (FOUNDATION section 6): how true stats are drawn at setup.'),
      compliance: z
        .strictObject({
          valueWeight: int, temperamentWeight: int, regardWeight: int, deterrenceWeight: int, standingShield: int, shortfallWeight: int,
          exceedAt: int, complyAt: int, reservationsAt: int, severeBelow: int, slowWalkAbove: int,
          candidAt: int, protectedStandingAt: int, protectedDeterrenceAt: int, grievanceWeight: int, grievanceReasonAt: int,
          temperamentReasonAt: int, regardReasonAt: int, fearReasonAt: int,
          departureWeight: int, departureReasonAt: int, reinforceShareTimid: int, reinforceShareBold: int,
          conflictChainWeight: int, conflictNewerWeight: int,
        })
        .describe('Compliance’s weights and thresholds (M1/M2’s, recast in lane 1.1). Design parameters.'),
      goalTerms: z
        .array(z.strictObject({ goal: termId, boldness: permille, honours: z.array(termId), offends: z.array(termId) }))
        .describe('What a goal of each kind asks of the man who reads it: its boldness and the values it honours or offends.'),
      context: z
        .strictObject({ oversight: permille, oversightPerCourierDay: permille, oversightWired: permille, oversightMin: permille })
        .describe('Oversight for an order read in the chain (the principal’s credibility is politics’ derived term, lane 1.6). Design parameters.'),
      relay: z
        .strictObject({ reservationsHoldDays: nonNegative, slowWalkHoldDays: nonNegative, reinterpretHoldDays: nonNegative })
        .describe('Days a relaying link holds an order for each covert rung (0040). Design parameters.'),
      filter: z
        .strictObject({
          holdFor: z.array(z.strictObject({ value: termId, days: nonNegative })),
          trimFor: z.array(z.strictObject({ value: termId, claimKinds: z.array(termId) })),
          candidAt: permille,
        })
        .describe('The values that make a filter post’s holder hold a wire or cut claims (0032), and the candour at which he cuts nothing.'),
      traits: z
        .strictObject({
          perceptionPivot: nonNegative, perceptionPerPoint: nonNegative,
          perceptionValues: z.array(z.strictObject({ value: termId, permille: nonNegative })),
          perceptionMax: nonNegative, demandBase: nonNegative, demandPerPoint: nonNegative, assaultMargin: int.min(1000, 'at least 1000: an assault never asks less than the open field').describe('His demand for an assault on held ground, permille of his demand in the open (the planner applies it, lane 0.9 finding 1).'), holdBand: nonNegative,
          wantsMenPermille: nonNegative, paperPermille: nonNegative,
        })
        .describe('How temperament and values shade what a man sees and asks (lane 0.6’s stand-in rules, now the pack’s, 0058).'),
      grievances: z.strictObject({ bypassedWeight: nonNegative }).describe('Weights of grievances the people core applies.'),
      attention: z
        .strictObject({
          cap: nonNegative,
          refillDays: positive,
          costs: z.strictObject(Object.fromEntries(phase0.ATTENTION_KEYS.map((k) => [k, nonNegative])) as Record<(typeof phase0.ATTENTION_KEYS)[number], typeof nonNegative>),
        })
        .describe('The president’s attention (0025, 0040): a weekly cap, its refill, and the cost table (FOUNDATION section 5). Design parameters.'),
      verbs: z
        .strictObject({
          weekDays: positive,
          initiativeAt: int.describe('Willingness needed for spontaneous initiative admission, separate from ordinary compliance (0105). Design parameter.'),
          orderValues: z
            .array(z.strictObject({ order: z.string().min(1), boldness: permille.nullable(), honours: z.array(termId), offends: z.array(termId), gateTopics: z.array(termId), notCheaperThan: z.string().min(1).nullable(), clashes: z.array(termId).default([]) }))
            .describe('The map from orders to values (0074): gate content; a row tagged with gate topics needs the gate reviewer’s sign-off.'),
          relief: z.array(z.strictObject({ mode: z.enum(['quiet_department', 'own_request', 'outright']), grievanceWeight: nonNegative, regardDelta: signedPermille, standingDelta: signedPermille })),
          inquiry: z.strictObject({ freePerWeek: nonNegative, pesteredWeight: nonNegative }),
          promise: z.strictObject({ dueDays: nonNegative, brokenWeight: nonNegative, brokenRegard: signedPermille }),
          pressure: z.strictObject({ weight: nonNegative, oversight: nonNegative, days: nonNegative }),
          observer: z.strictObject({ oversight: nonNegative, monitoredWeight: nonNegative, letterEveryDays: positive }),
          audience: z.strictObject({ maxCounters: nonNegative, cooldownDays: nonNegative, vindicateRegard: signedPermille, vindicateStanding: signedPermille }),
          ladder: z.strictObject({ thresholds: z.array(int), dispositionPerRung: nonNegative, publicStanding: nonNegative, rivalStanding: nonNegative, decayDivisor: positive }),
          initiatives: z.array(
            z.strictObject({
              id: termId,
              kinds: z.array(termId),
              boldness: permille,
              honours: z.array(termId),
              offends: z.array(termId),
              fromRung: z.enum(phase0.LADDER_RUNGS),
              cooldownDays: positive,
              recommends: termId,
            }),
          ),
          practiceWeight: nonNegative.describe('What a clash with one of his own practices costs a recipient’s willingness, and adds to the pushback (lane 1.5b).'),
        })
        .describe('The people verbs, the ladder, the audience and seat initiatives (lane 1.5). Design parameters.'),
    })
    .describe('The people core (lane 1.1): history’s shadow, compliance, reading orders and reports, traits. Design parameters the pack states (0072), not sourced facts.'),
});

export const VocabulariesSchema = z.strictObject({
  terrains: z.array(z.strictObject({ id: termId, name: stringKey, roadLengthPermille: positive, water: z.boolean() })),
  postKinds: z.array(
    z.strictObject({
      id: termId,
      name: stringKey,
      creatable: z.enum(w.POST_CREATION),
      temporary: z.boolean(),
      role: z
        .enum(w.POST_KIND_ROLES)
        .nullable()
        .default(null)
        .describe('What the engine reads of this kind (0058): filter (holds or passes what comes in for its principal), intelligence, or office (government seat and office reports despite directly assigned forces); null for any other kind. The engine never reads kind names.'),
    }),
  ),
  departmentKinds: z.array(
    z.strictObject({
      id: termId,
      name: stringKey,
      government: z
        .boolean()
        .default(false)
        .describe('A civil government that can hold a region’s jurisdiction (0058): only such a department may be named in a scenario’s governments. The engine reads this, never kind names.'),
      selfGoverning: z
        .boolean()
        .default(false)
        .describe('A government of a people who govern themselves (0069): only its own act, a notice, may change its side, close or reopen it, or move its regions, never a principal’s decision. Only a government may be self-governing.'),
    }),
  ),
  arms: z.array(z.strictObject({ id: termId, name: stringKey, naval: z.boolean(), cavalry: z.boolean().describe('Cavalry (lane 1.4): a pursuer with a block of this arm present takes more stragglers.') })),
  personKinds: z.array(term),
  traits: z.array(z.strictObject({ id: termId, name: stringKey, gate: z.boolean() })),
  ranks: z.array(z.strictObject({ id: termId, name: stringKey, seniority: nonNegative, kind: termId.describe('Its kind from rankKinds: a person holds one rank of each kind at once (0073).') })),
  rankKinds: z.array(term).describe('Kinds of rank held side by side (0073), such as regular, volunteer and brevet.'),
  values: z
    .array(z.strictObject({ id: termId, name: stringKey, costOnly: z.boolean().default(false).describe('0074: honouring it never helps its holder; offending it still costs.') }))
    .describe('Values people hold (lane 1.1); the engine reads only the people rules that name them.'),
  blocs: z.array(term),
  standingOrderKinds: z.array(term),
});

const faction = z.strictObject({ id: idOf('faction'), name: stringKey });

export const DepartmentSchema = z.strictObject({
  id: idOf('department'),
  /** Null for a neutral government (review F6). */
  faction: idOf('faction').nullable(),
  kind: termId,
  /** For a self-governing department (0070): the people whose government it is; rival governments of one nation share it. */
  polity: termId.optional(),
  name: stringKey,
  provenance,
});

export const RegimentCatalogueSchema = z.array(z.strictObject({
  id: termId,
  order: nonNegative,
  state: z.string().min(1),
  raisingDepartment: idOf('department').nullable(),
  designation: z.string().min(1),
  arm: z.string().min(1),
  scope: z.string().min(1),
  side: z.string().min(1),
  termDays: z.array(positive),
  warTerm: z.boolean().optional().describe('An explicitly sourced war contract; absent does not establish a term.'),
  identityCall: termId.optional().describe('Read linkage to a particular requisition; the already raised lot keeps its call’s service.'),
  aliases: z.array(z.string().min(1)),
  observations: z.array(z.strictObject({
    observationId: z.string().min(1), observedOn: z.string().min(1),
    observationKind: z.string().min(1), command: z.string(), division: z.string(), brigade: z.string(),
    source: z.string().min(1), pages: z.string().min(1), evidence: z.record(z.string(), z.string()),
  })).min(1),
  path: z.record(z.string(), z.string()),
}));

export const OrganisationTemplatesSchema = z.array(z.strictObject({
  id: termId, army: idOf('post'), evidenceDate: isoDate, sources: z.array(z.string().min(1)).min(1),
  posts: z.array(z.strictObject({ id: idOf('post'), name: stringKey, kind: termId, parent: idOf('post'), commander: idOf('person').nullable(), identityHeld: z.boolean() })),
  brigades: z.array(z.strictObject({post: idOf('post'), regiments:z.array(termId)})),
}));

export const WorldSchema = z.strictObject({
  organisationTemplates: OrganisationTemplatesSchema.optional(),
  regimentCatalogue: RegimentCatalogueSchema.optional(),
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  pack: termId,
  rules: RulesSchema,
  vocabularies: VocabulariesSchema,
  factions: z.array(faction),
  departments: z.array(DepartmentSchema),
  regions: z.array(RegionSchema),
  installations: z.array(InstallationSchema),
  edges: z.array(EdgeSchema),
  railLines: z.array(RailLineSchema),
  depots: z.array(DepotSchema),
  weatherZones: z.array(WeatherZoneSchema),
  people: z.array(PersonSchema),
  census: z
    .array(z.strictObject({ region: idOf('region'), enslavedPopulation: nonNegative, provenance }))
    .describe('Protected census input (the gate’s region_enslaved_population): read only by the derived self-emancipation term, never written, counted or spent by any seat. Rows only where a source gives it.'),
});

const standingOrder = z.strictObject({
  id: termId,
  kind: termId,
  from: idOf('post').nullable(),
  issuedOn: isoDate,
  summary: stringKey,
  cites: z.array(citation).min(1, 'at least one citation'),
});

export const PostSchema = z.strictObject({
  id: idOf('post'),
  name: stringKey,
  kind: termId,
  department: idOf('department'),
  parent: idOf('post').nullable(),
  holder: idOf('person').nullable(),
  acting: z.boolean(),
  intelligenceChief: idOf('person').nullable().describe('The person who runs this post’s intelligence (0058), on the post’s side; null for none.'),
  region: idOf('region').nullable(),
  temporary: z.strictObject({ operation: termId }).nullable(),
  installation: idOf('installation').nullable(),
  railLine: idOf('railLine').nullable(),
  links: z.array(z.strictObject({ kind: z.enum(w.POST_LINK_KINDS), post: idOf('post') })),
  departmentChanges: z.array(z.strictObject({ on: isoDate, department: idOf('department'), parent: idOf('post').nullable(), provenance })),
  standingOrders: z.array(standingOrder),
  unknowns: z.array(z.string()),
  provenance,
});

export const ForceBlockSchema = z.strictObject({
  id: idOf('forceBlock'),
  name: stringKey,
  kind: z.enum(w.FORCE_BLOCK_KINDS),
  parent: idOf('forceBlock').nullable(),
  department: idOf('department'),
  post: idOf('post').nullable(),
  region: idOf('region'),
  aboard: idOf('forceBlock').nullable(),
  arm: termId,
  strength: nonNegative.nullable(),
  strengthDate: historicalDate.nullable(),
  strengthBasis: z.strictObject({ strengthKind: z.enum(['return','estimate','rule','unknown']), strengthSource: z.string().min(1).nullable(), strengthDate: historicalDate.nullable() }).optional(),
  nonCombatants: nonNegative,
  storesDays: nonNegative.nullable(),
  storesDate: historicalDate.nullable().describe('The date the stores figure is as of (0065), as strengthDate is for strength: informational in Phase 0. Required when storesDays is given.'),
  unknowns: z.array(z.string()),
  provenance,
});

const controlTable = z.array(z.strictObject({ region: idOf('region'), shares: z.array(z.strictObject({ faction: idOf('faction'), permille })) }));
const openingControl = z.strictObject({
  authors: z.array(z.strictObject({ faction: idOf('faction'), post: idOf('post') })).min(1),
  table: controlTable.optional().describe('A complete report-only table. If omitted, the opening report uses the scenario’s control table.'),
}).optional().describe('The opening map report, with one filled authoring post per faction in the scenario.');

export const ScenarioSchema = z.strictObject({
  id: idOf('scenario'),
  name: stringKey,
  startDate: isoDate,
  seed: int.min(0).max(2_147_483_647),
  factions: z.array(
    z.strictObject({ faction: idOf('faction'), principal: idOf('person').nullable(), capital: idOf('region').nullable(), playable: z.boolean() }),
  ),
  control: controlTable,
  openingControl,
  fortification: z.array(z.strictObject({ region: idOf('region'), levelPermille: permille })),
  loyalty: z.array(z.strictObject({ region: idOf('region'), shares: z.array(z.strictObject({ faction: idOf('faction'), permille })) })).describe('Region loyalty at the start (lane 1.7): each faction’s share, summing to at most 1000. Never a stand-in for control.'),
  edgeConditions: z.array(z.strictObject({ edge: idOf('edge'), conditionPermille: permille })),
  obstructions: z.array(z.strictObject({ edge: idOf('edge'), by: idOf('installation').nullable(), provenance })),
  depotConditions: z.array(z.strictObject({ depot: idOf('depot'), conditionPermille: permille })),
  posts: z.array(PostSchema),
  forceBlocks: z.array(ForceBlockSchema),
  declaredGovernments: z
    .array(z.strictObject({ id: idOf('department'), regions: z.array(idOf('region')).min(1) }))
    .describe('Governments the start declares but does not establish: one a situation’s effect establishes, taking its regions from whoever held them (lane 1.11).'),
  temporaryPosts: z
    .array(z.strictObject({ id: idOf('post'), name: stringKey, kind: termId, department: idOf('department'), parent: idOf('post').nullable(), holder: idOf('person').nullable(), region: idOf('region').nullable(), operation: termId }))
    .describe('Temporary posts the start declares but does not open: an expedition command a situation’s effect opens (0040; lane 1.11).'),
  governments: z.array(
    z.strictObject({
      region: idOf('region'),
      department: z.union([z.literal(w.UNKNOWN_GOVERNMENT), idOf('department')]).describe('The department that governs the region on the start date, or unknown (0058).'),
      provenance,
    }),
  ),
});

/** The pack manifest, `pack.json` (hand-written). */
export const ManifestSchema = z.strictObject({
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  id: termId,
  /** A draft may carry unknown values; a release may not. */
  status: z.enum(['draft', 'release']),
  /** Whether people may be marked invented (exempt from citing their centres and traits); off for a historical pack (review F7). */
  allowsInventedPeople: z.boolean().default(false),
  name: stringKey,
  defaultLocale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'a locale such as en or en-GB'),
  locales: z.array(z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/)).min(1),
  rules: RulesSchema,
  vocabularies: VocabulariesSchema,
  factions: z.array(faction).min(1),
  scenarios: z.array(idOf('scenario')).min(1, 'at least one scenario start (decision 0030)'),
});

/** How a source may be cited: a pointer (our own research notes) never satisfies a citation on its own. */
export const SOURCE_KINDS = ['primary', 'secondary', 'pointer', 'own-work'] as const;

/** One source in `PROVENANCE.json` (decision 0031). */
export const SourceSchema = z.strictObject({
  key: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9 ._:/()-]*$/, 'a source key: letters, digits, spaces and . _ : / ( ) -'),
  title: z.string().min(1),
  kind: z.enum(SOURCE_KINDS),
  /** Checked against the allow-list in `validate.ts`, so a rejected licence gets a reason, not just "invalid enum". */
  licence: z.string().min(1),
  /** Why a public-domain source is public domain (a government work, published before 1931, dedicated by its owner). */
  basis: z.string().nullable(),
  /** The copy actually used: an archive identifier or a stable reference (0031's archived copy). */
  copyUsed: z.string().min(1),
  /** The licence page and the day it was read, for sources whose licence is a statement on a page. */
  licencePage: z.string().nullable(),
  licenceReadOn: isoDate.nullable(),
});

export const ProvenanceFileSchema = z.strictObject({
  formatVersion: z.literal(w.WORLD_FORMAT_VERSION),
  sources: z.array(SourceSchema),
});

/** A string table: flat keys to ICU messages (decision 0030; intl-messageformat). */
export const StringTableSchema = z.record(z.string().regex(STRING_KEY_PATTERN, 'a string-table key'), z.string());

/** A scenario's hand-written header, `source/scenarios/<id>/scenario.json`; its tables are CSV beside it. */
export const ScenarioHeaderSchema = z.strictObject({
  name: z.string().min(1),
  startDate: isoDate,
  seed: int.min(0).max(2_147_483_647),
  factions: z.array(
    z.strictObject({ faction: idOf('faction'), principal: idOf('person').nullable(), capital: idOf('region').nullable(), playable: z.boolean() }),
  ),
  openingControl,
});

export type Manifest = z.output<typeof ManifestSchema>;
export type ProvenanceFile = z.output<typeof ProvenanceFileSchema>;
export type SourceEntry = z.output<typeof SourceSchema>;
export type StringTable = z.output<typeof StringTableSchema>;
export type ScenarioHeader = z.output<typeof ScenarioHeaderSchema>;

// ---------------------------------------------------------------------------
// The schemas' output is exactly the kernel's types. A mismatch fails
// `npm run typecheck`, so neither side can change alone.

type DeepReadonly<T> = T extends string | number | boolean | null | undefined
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : { readonly [K in keyof T]: DeepReadonly<T[K]> };
type Equivalent<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
type Same<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

export const SCHEMAS_MATCH_KERNEL: {
  world: Equivalent<DeepReadonly<z.output<typeof WorldSchema>>, DeepReadonly<w.World>>;
  scenario: Same<DeepReadonly<z.output<typeof ScenarioSchema>>, DeepReadonly<w.ScenarioStart>>;
} = { world: true, scenario: true };
