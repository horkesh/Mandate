/**
 * The battle model's pack rules (lane 1.3; the combat note's proposal P2–P10; 0072: every kernel default is a pack
 * rule, stated by every pack). DESIGN PARAMETERS, never sourced facts: the starting values are the combat note's,
 * placed inside Livermore's and Fox's bands, for lane 1.14 to calibrate. The engine names no terrain (hard rule 3): the
 * frontage table keys the pack's own terrain ids, and `otherTerrain` is the pack's stated row for any terrain it omits.
 */

/** The five battle types (P2), each with its own base loss rates. */
export const BATTLE_TYPES = ['meeting', 'attack_open', 'attack_hasty', 'assault_works', 'rearguard'] as const;
export type BattleType = (typeof BATTLE_TYPES)[number];

/** What a commander commits at dawn (P6.1). `defend`: the side that does not attack stands with what is there. */
export const COMMITS = ['all_out', 'main', 'probe', 'defend'] as const;
export type Commit = (typeof COMMITS)[number];

/** A side's result at the end of a battle-day that stays or leaves in order or in disorder (P5); `cut_off` is decided after. */
export const DAY_RESULTS = ['held', 'gained_ground', 'fell_back', 'withdrew', 'routed'] as const;
export type DayResult = (typeof DAY_RESULTS)[number];

/** The four phases of a battle-day's shape (P10): the day's losses and its flank break are apportioned over them. */
export const DAY_PHASES = ['dawn', 'morning', 'afternoon', 'evening'] as const;
export type DayPhase = (typeof DAY_PHASES)[number];

export interface SideRates {
  /** K+W per 1000 men in contact per day for the side that attacks (either side, in a meeting). */
  readonly attacker: number;
  readonly defender: number;
}

export interface TerrainCombat {
  readonly terrain: string;
  /** Men who can be in contact per side per day on this ground (P3). */
  readonly frontageMen: number;
  /** A loss term both sides take on this ground, signed permille (difficult ground lowers both, Dupuy 12). */
  readonly lossPermille: number;
}

export interface CombatRules {
  /** Base K+W per 1000 men in contact per day, by battle type (P2). */
  readonly baseRates: Readonly<Record<BattleType, SideRates>>;
  /** Region fortification (permille, `regions`) at or above which a defender is dug in (`attack_hasty`) or in works (`assault_works`). */
  readonly works: { readonly hastyAt: number; readonly preparedAt: number };
  /** Frontage and the terrain term, per terrain the pack names. */
  readonly terrain: readonly TerrainCombat[];
  /** The row for any terrain the table does not name: the pack's own statement, never a kernel default. */
  readonly otherTerrain: { readonly frontageMen: number; readonly lossPermille: number };
  /** The loss multiplier's clamp, permille (P4: 250..3000). */
  readonly multiplier: { readonly min: number; readonly max: number };
  /** The additive loss terms' weights and caps (P4). */
  readonly terms: {
    /** Permille of loss term per point of quality the enemy has over the side, and its cap. */
    readonly qualityWeight: number;
    readonly qualityMax: number;
    /** Permille of loss term per point of competence the enemy's commander has over the side's, and its cap. */
    readonly competenceWeight: number;
    readonly competenceMax: number;
    /** The cap on the numbers term (P3): the larger side's losses fall, the smaller side's rise, by its margin. */
    readonly numbersMax: number;
    /** The surprised side's term in a meeting engagement (P4: up to +300). */
    readonly surprisePermille: number;
    /** The term per day of battle after the first (Dupuy 13), signed. */
    readonly successiveDayPermille: number;
    /** Half-width of the loss noise (P7), permille. */
    readonly noiseMax: number;
  };
  /** Per commit: the share of present men committed, and the posture term both sides take (Dupuy 18). */
  readonly commit: Readonly<Record<Commit, { readonly sharePermille: number; readonly posturePermille: number }>>;
  /** Killed, permille of K+W (Fox: about 1 killed to 4.5–7 wounded). */
  readonly killedPermille: number;
  /** Missing, permille of K+W, by the side's result (Fox: low when it held, high when it broke). */
  readonly missingPermille: Readonly<Record<DayResult, number>>;
  /** Of the missing, permille captured on the field, by result; the rest straggle and rejoin. */
  readonly capturedPermille: Readonly<Record<DayResult, number>>;
  /** The flank break (P7): a draw below the threshold breaks a side's flank today. */
  readonly flank: {
    readonly basePermille: number;
    /** Threshold permille per permille of the enemy's numbers margin. */
    readonly numbersWeight: number;
    /** Threshold permille per point of quality the enemy has over the side. */
    readonly qualityWeight: number;
    readonly maxPermille: number;
    /** Morale the side loses when its flank breaks. */
    readonly moraleLoss: number;
    /** Missing added, permille of K+W, when its flank breaks. */
    readonly missingPermille: number;
  };
  /** Morale (P5): its start, how losses, nerve and experience move it, and the rout. */
  readonly morale: {
    readonly start: number;
    /** Morale lost per permille of the side's present men hit today, permille. */
    readonly lossWeight: number;
    /** Morale per point of the commander's nerve above 500, permille. */
    readonly nerveWeight: number;
    /** Morale per point of the side's experience above 500, permille. */
    readonly experienceWeight: number;
    /** Below this, the side routs (mechanical, never a choice). */
    readonly routAt: number;
    /** Morale a routed block falls to. */
    readonly routFloor: number;
    /** Days after a rout before a block may attack again (P8). */
    readonly recoveryDays: number;
  };
  readonly experience: { readonly start: number; readonly gainPerDay: number };
  readonly equipment: { readonly start: number; readonly routLoss: number };
  /**
   * The commanders' rules (P6), read with his own demand ratio (`people` traits): he attacks at or above his demand,
   * probes at or above `probeShare` of it, withdraws at night below `holdShare` of it, breaks out of a pocket at or above
   * `breakoutShare` of it, and pursues by his boldness. Every share is permille of his demand.
   */
  readonly decisions: {
    readonly probeShare: number;
    readonly allOutBoldness: number;
    readonly holdShare: number;
    readonly breakoutShare: number;
    readonly followBoldness: number;
    readonly pressBoldness: number;
  };
  /** A battle closes after this many days; a fight that goes on opens a new one (P1: the Seven Days). */
  readonly maxBattleDays: number;
  /** Control the side holding the field gains the day the other leaves it, permille (P9). */
  readonly fieldControlPermille: number;
  /**
   * Pursuit's captures (P8; lane 1.4): on a rearguard day, the pursued side's stragglers taken, permille, by the pursuer's
   * choice (`follow` or `press`), with more when the pursuer has cavalry there (an arm the pack flags `cavalry`).
   */
  readonly pursuit: { readonly followPermille: number; readonly pressPermille: number; readonly cavalryPermille: number };
  /** Stragglers who rejoin a day, permille of the pool, while in supply and out of battle (P8). */
  readonly straggleReturnPermille: number;
  /** A commander hit on a battle-day (0..999 draw on his own stream): killed below the first, wounded, captured (only if his side routs). */
  readonly leaders: { readonly killedPermille: number; readonly woundedPermille: number; readonly capturedPermille: number };
  /** The day shape (P10): each phase's hours, and each battle type's share of the day's losses per phase. */
  readonly phases: {
    readonly hours: readonly { readonly phase: DayPhase; readonly fromHour: number; readonly toHour: number }[];
    readonly lossShares: Readonly<Record<BattleType, readonly number[]>>;
  };
}

const RESULT_KEYS: readonly DayResult[] = DAY_RESULTS;

/** Problems with a pack's combat rules, as the validator and the kernel's setup see them (the kernel takes any World it is handed). */
export function combatRulesProblems(rules: CombatRules | undefined, terrains: readonly string[]): string[] {
  if (rules === undefined) return ['the pack states no combat rules (rules.combat)'];
  const problems: string[] = [];
  const whole = (v: unknown, what: string, max?: number) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0 || (max !== undefined && v > max)) problems.push(`combat rule ${what} must be a whole number from 0${max === undefined ? '' : ` to ${max}`}`);
  };
  const signed = (v: unknown, what: string) => {
    if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < -1000 || v > 1000) problems.push(`combat rule ${what} must be a whole signed permille`);
  };
  for (const t of BATTLE_TYPES) {
    whole(rules.baseRates?.[t]?.attacker, `baseRates.${t}.attacker`, 1000);
    whole(rules.baseRates?.[t]?.defender, `baseRates.${t}.defender`, 1000);
    const shares = rules.phases?.lossShares?.[t];
    if (!Array.isArray(shares) || shares.length !== DAY_PHASES.length) problems.push(`combat rule phases.lossShares.${t} must give one share per phase (${DAY_PHASES.length})`);
    else {
      shares.forEach((s, i) => whole(s, `phases.lossShares.${t}[${i}]`, 1000));
      if (shares.reduce((a, b) => a + b, 0) !== 1000) problems.push(`combat rule phases.lossShares.${t} must sum to 1000`);
    }
  }
  whole(rules.works.hastyAt, 'works.hastyAt', 1000);
  whole(rules.works.preparedAt, 'works.preparedAt', 1000);
  if (rules.works.preparedAt < rules.works.hastyAt) problems.push('combat rule works.preparedAt must be at least works.hastyAt');
  const known = new Set(terrains);
  const seen = new Set<string>();
  for (const t of rules.terrain) {
    if (!known.has(t.terrain)) problems.push(`combat rule terrain names "${t.terrain}", which is not in the pack's terrains`);
    if (seen.has(t.terrain)) problems.push(`combat rule terrain names "${t.terrain}" twice`);
    seen.add(t.terrain);
    whole(t.frontageMen, `terrain.${t.terrain}.frontageMen`);
    signed(t.lossPermille, `terrain.${t.terrain}.lossPermille`);
  }
  whole(rules.otherTerrain.frontageMen, 'otherTerrain.frontageMen');
  signed(rules.otherTerrain.lossPermille, 'otherTerrain.lossPermille');
  whole(rules.multiplier.min, 'multiplier.min');
  whole(rules.multiplier.max, 'multiplier.max');
  if (rules.multiplier.max < rules.multiplier.min) problems.push('combat rule multiplier.max must be at least multiplier.min');
  for (const k of ['qualityWeight', 'qualityMax', 'competenceWeight', 'competenceMax', 'numbersMax', 'surprisePermille', 'noiseMax'] as const) whole(rules.terms[k], `terms.${k}`, 1000);
  signed(rules.terms.successiveDayPermille, 'terms.successiveDayPermille');
  for (const c of COMMITS) {
    whole(rules.commit?.[c]?.sharePermille, `commit.${c}.sharePermille`, 1000);
    signed(rules.commit?.[c]?.posturePermille, `commit.${c}.posturePermille`);
  }
  whole(rules.killedPermille, 'killedPermille', 1000);
  for (const r of RESULT_KEYS) {
    whole(rules.missingPermille?.[r], `missingPermille.${r}`, 1000);
    whole(rules.capturedPermille?.[r], `capturedPermille.${r}`, 1000);
  }
  for (const k of ['basePermille', 'numbersWeight', 'qualityWeight', 'maxPermille', 'moraleLoss', 'missingPermille'] as const) whole(rules.flank[k], `flank.${k}`, 1000);
  for (const k of ['start', 'nerveWeight', 'experienceWeight', 'routAt', 'routFloor'] as const) whole(rules.morale[k], `morale.${k}`, 1000);
  whole(rules.morale.lossWeight, 'morale.lossWeight');
  whole(rules.morale.recoveryDays, 'morale.recoveryDays');
  whole(rules.experience.start, 'experience.start', 1000);
  whole(rules.experience.gainPerDay, 'experience.gainPerDay', 1000);
  whole(rules.equipment.start, 'equipment.start', 1000);
  whole(rules.equipment.routLoss, 'equipment.routLoss', 1000);
  for (const k of ['probeShare', 'holdShare', 'breakoutShare'] as const) whole(rules.decisions[k], `decisions.${k}`);
  for (const k of ['allOutBoldness', 'followBoldness', 'pressBoldness'] as const) whole(rules.decisions[k], `decisions.${k}`, 1000);
  if (!Number.isSafeInteger(rules.maxBattleDays) || rules.maxBattleDays < 1) problems.push('combat rule maxBattleDays must be a whole number from 1');
  whole(rules.fieldControlPermille, 'fieldControlPermille', 1000);
  whole(rules.straggleReturnPermille, 'straggleReturnPermille', 1000);
  whole(rules.pursuit?.followPermille, 'pursuit.followPermille', 1000);
  whole(rules.pursuit?.pressPermille, 'pursuit.pressPermille', 1000);
  whole(rules.pursuit?.cavalryPermille, 'pursuit.cavalryPermille', 1000);
  whole(rules.leaders.killedPermille, 'leaders.killedPermille', 1000);
  whole(rules.leaders.woundedPermille, 'leaders.woundedPermille', 1000);
  whole(rules.leaders.capturedPermille, 'leaders.capturedPermille', 1000);
  if (rules.leaders.killedPermille + rules.leaders.woundedPermille + rules.leaders.capturedPermille > 1000) problems.push('combat rule leaders: killed, wounded and captured must sum to at most 1000');
  const hours = rules.phases.hours;
  if (hours.length !== DAY_PHASES.length || hours.some((h, i) => h.phase !== DAY_PHASES[i])) problems.push(`combat rule phases.hours must list ${DAY_PHASES.join(', ')} in order`);
  hours.forEach((h, i) => {
    whole(h.fromHour, `phases.hours.${h.phase}.fromHour`, 24);
    whole(h.toHour, `phases.hours.${h.phase}.toHour`, 24);
    if (h.toHour <= h.fromHour) problems.push(`combat rule phases.hours.${h.phase} must end after it starts`);
    if (i > 0 && h.fromHour < hours[i - 1]!.toHour) problems.push(`combat rule phases.hours.${h.phase} must start after ${hours[i - 1]!.phase} ends`);
  });
  return problems;
}
