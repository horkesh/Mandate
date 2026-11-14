// The Union 1861 pack's own vocabularies and rules (lane 0.3).
//
// Authored here from the three drafts' README vocabularies. Where a value is a
// design parameter and not a sourced fact (season effects, seniority numbers,
// when a post kind may be created) the line says so; the hand-over note lists
// them all. Nothing is copied from the lane 0.2 testbed or fit-test scaffolds.

const t = (id, roadLengthPermille, water = false) => ({ id, name: `terrain.${id}`, roadLengthPermille, water });

/** Terrains and road multipliers: the map draft README's table (the multipliers feed its lengths). */
export const TERRAINS = [
  ...['plain', 'rolling', 'prairie', 'valley', 'urban', 'tidewater'].map((id) => t(id, 1000)),
  ...['hills', 'forest', 'desert'].map((id) => t(id, 1200)),
  ...['swamp', 'delta'].map((id) => t(id, 1400)),
  t('mountains', 1500),
  ...['open_sea', 'coastal', 'sound', 'river'].map((id) => t(id, 1000, true)),
];

/**
 * Post kinds are the oob draft README's vocabulary. `creatable` is a design
 * parameter: squadrons by directive (the navy note: squadrons are created
 * during play), departments by directive, expeditions and local commands by
 * appointment, and everything that exists by law or by a standing structure
 * only at a start.
 */
const KINDS = [
  ['president', 'start_only'],
  ['vice_president', 'start_only'],
  ['cabinet', 'start_only'],
  ['bureau', 'start_only'],
  ['general_in_chief', 'start_only'],
  ['army_department', 'directive'],
  ['fort_command', 'appoint'],
  ['arsenal', 'start_only'],
  ['navy_squadron', 'directive'],
  ['navy_yard', 'start_only'],
  ['ship_command', 'appoint'],
  ['marine_corps', 'start_only'],
  ['governor', 'start_only'],
  ['harbour_command', 'appoint'],
  ['state_military', 'start_only'],
  ['temporary_command', 'appoint'],
];
export const POST_KINDS = KINDS.map(([id, creatable]) => ({ id, name: `post_kind.${id}`, creatable, temporary: id === 'temporary_command' }));

const plain = (prefix) => (id) => ({ id, name: `${prefix}.${id}` });

export const DEPARTMENT_KINDS = ['executive', 'war', 'navy', 'treasury', 'diplomatic', 'justice', 'interior', 'post_office', 'state_government'].map(plain('department_kind'));

/** Arms: the oob draft README's list; only naval blocks carry others aboard. */
export const ARMS = ['infantry', 'artillery', 'cavalry', 'mixed', 'engineers', 'ordnance', 'marines', 'naval'].map((id) => ({ id, name: `arm.${id}`, naval: id === 'naval' }));

export const PERSON_KINDS = ['general', 'naval_officer', 'cabinet', 'bureau', 'governor', 'congress', 'diplomat', 'editor', 'other'].map(plain('person_kind'));

/** The 33 trait tags of the people draft README, each defined by an observable act. The gate tags are facts the sensitive-history gate places, never levers (0021, 0046). */
const GATE_TRAITS = new Set(['slaveholder', 'harsh_with_civilians', 'makes_policy', 'opposes_emancipation', 'antislavery']);
export const TRAITS = [
  'slow', 'overestimates_enemy', 'organiser', 'poor_administrator', 'incorruptible', 'contract_scandal', 'insubordinate',
  'makes_policy', 'disdains_superiors', 'secretive', 'ambitious', 'rank_proud', 'credit_seeking', 'shifts_blame', 'candid',
  'self_doubting', 'boastful', 'uses_press', 'political_patron', 'joint_minded', 'service_proud', 'quarrelsome',
  'holds_grudges', 'dutiful', 'intrigues', 'micromanages', 'infirm', 'popular_with_troops', 'drink_rumour', 'antislavery',
  'opposes_emancipation', 'slaveholder', 'harsh_with_civilians',
].map((id) => ({ id, name: `trait.${id}`, gate: GATE_TRAITS.has(id) }));

export const BLOCS = ['confederate', 'army', 'moderates', 'radicals', 'war_democrats', 'border_unionists', 'peace_democrats'].map(plain('bloc'));

/** Only one kind of standing agreement is sourced in the drafts: the Pickens truce. */
export const STANDING_ORDER_KINDS = ['truce', 'prior_order'].map(plain('order_kind'));

export const FACTIONS = [
  { id: 'union', name: 'faction.union' },
  { id: 'confederate', name: 'faction.confederate' },
];

/**
 * Pack rules. Control thresholds are 0019's tested values. The season effects
 * and default months are DESIGN PARAMETERS: the map draft states that its
 * seasonal column holds months only ("mud" for dirt roads, low-water or ice
 * months for rivers), not what a season does to a length or a capacity.
 */
export const RULES = {
  capacityMax: 5,
  supplyControlPermille: 250,
  retreatControlPermille: 50,
  seasons: [
    { reason: 'mud', defaultMonths: [1, 2, 3, 12], lengthPermille: 1500, capacityPermille: 600 },
    { reason: 'low_water', defaultMonths: [8, 9, 10], lengthPermille: 1300, capacityPermille: 500 },
    { reason: 'flood', defaultMonths: [3, 4, 5], lengthPermille: 1200, capacityPermille: 800 },
    { reason: 'ice', defaultMonths: [12, 1, 2].sort((a, b) => a - b), lengthPermille: 2000, capacityPermille: 300 },
  ],
};

// ---- Ranks -----------------------------------------------------------------
// The draft's free text ("brig gen PACS", "col 2 cav USA", "bvt maj gen USA")
// becomes a service and a grade. Seniority numbers are a DESIGN PARAMETER:
// a tier per grade, higher is senior, and a brevet is one below its grade so it
// never outranks the substantive grade.

const LAND_TIER = { lt: 10, capt: 20, maj: 30, lt_col: 40, col: 50, brig_gen: 60, maj_gen: 70, lt_gen: 80, gen: 90 };
const SEA_TIER = { lt: 10, lt_cdr: 25, cdr: 35, capt: 50, commodore: 60, flag_officer: 60, rear_admiral: 70, adm: 90 };
const GRADE_LABEL = {
  lt: 'Lieutenant', capt: 'Captain', maj: 'Major', lt_col: 'Lieutenant colonel', col: 'Colonel', brig_gen: 'Brigadier general',
  maj_gen: 'Major general', lt_gen: 'Lieutenant general', gen: 'General', lt_cdr: 'Lieutenant commander', cdr: 'Commander',
  commodore: 'Commodore', flag_officer: 'Flag officer', rear_admiral: 'Rear admiral', adm: 'Admiral',
};
const SERVICE_LABEL = {
  usa: 'US Army', usv: 'US Volunteers', csa: 'Confederate States Army', pacs: 'Provisional Army of the Confederate States',
  usn: 'US Navy', csn: 'Confederate States Navy', state: 'a state or militia force', other: 'service not stated in the draft',
};
const GRADES = [
  ['lt gen', 'lt_gen'], ['maj gen', 'maj_gen'], ['brig gen', 'brig_gen'], ['lt col', 'lt_col'], ['lt cdr', 'lt_cdr'],
  ['rear admiral', 'rear_admiral'], ['flag officer', 'flag_officer'], ['commodore', 'commodore'], ['gen', 'gen'], ['adm', 'adm'],
  ['cdr', 'cdr'], ['col', 'col'], ['maj', 'maj'], ['capt', 'capt'], ['1 lt', 'lt'], ['lt', 'lt'],
];

/** Parse one draft rank string (without its date). Returns null for a status that is not a rank. */
export function parseRank(raw) {
  let s = raw.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/,\s*unknown\s*$/, '').replace(/\s+/g, ' ').trim();
  if (s === '' || /^cashiered$|^retired list/.test(s)) return null;
  const brevet = /^bvt /.test(s);
  if (brevet) s = s.slice(4);
  const hit = GRADES.find(([text]) => s === text || s.startsWith(`${text} `));
  if (!hit) return null;
  const grade = hit[1];
  const words = s.split(' ');
  const last = words[words.length - 1];
  let service;
  if (['usa', 'usv', 'csa', 'pacs', 'usn', 'csn'].includes(last)) service = last;
  else if (/\bvols\b/.test(s) && /\busa\b/.test(s)) service = 'usv';
  else if (/militia|forces|state|d\.c\. vols|\bvols\b|\bga\b/.test(s)) service = 'state';
  else service = 'other';
  if (/ vols usa$/.test(s)) service = 'usv';
  const navy = service === 'usn' || service === 'csn' || /state navy/.test(s);
  const tiers = navy ? SEA_TIER : LAND_TIER;
  const base = tiers[grade];
  if (base === undefined) return null;
  const id = `${service}_${brevet ? 'bvt_' : ''}${grade}`;
  const name = `${brevet ? 'Brevet ' : ''}${GRADE_LABEL[grade].toLowerCase()}, ${SERVICE_LABEL[service]}`.replace(/^./, (c) => c.toUpperCase());
  return { id, seniority: base - (brevet ? 1 : 0), name };
}

// ---- Departments ------------------------------------------------------------
/** The executive departments both sides' posts name, by draft text. */
export const EXEC_DEPARTMENTS = {
  union: [
    ['us_executive', 'executive', 'Executive Office'],
    ['us_war', 'war', 'War Department'],
    ['us_navy', 'navy', 'Navy Department'],
    ['us_treasury', 'treasury', 'Treasury Department'],
    ['us_diplomatic', 'diplomatic', 'Department of State'],
    ['us_justice', 'justice', 'Department of Justice'],
    ['us_interior', 'interior', 'Department of the Interior'],
    ['us_post_office', 'post_office', 'Post Office Department'],
  ],
  confederate: [
    ['cs_executive', 'executive', 'Confederate Executive Office'],
    ['cs_war', 'war', 'Confederate War Department'],
    ['cs_navy', 'navy', 'Confederate Navy Department'],
    ['cs_treasury', 'treasury', 'Confederate Treasury Department'],
    ['cs_diplomatic', 'diplomatic', 'Confederate Department of State'],
    ['cs_justice', 'justice', 'Confederate Department of Justice'],
    ['cs_post_office', 'post_office', 'Confederate Post-Office Department'],
  ],
};

/** Which department a draft post names: [side, draft text] -> id. */
export function executiveDepartment(side, text) {
  const t = text.trim().toLowerCase();
  const prefix = side === 'confederate' ? 'cs' : 'us';
  if (t === '') return `${prefix}_executive`;
  if (t === 'executive') return `${prefix}_executive`;
  if (/^war/.test(t)) return `${prefix}_war`;
  if (/^navy/.test(t)) return `${prefix}_navy`;
  if (/^treasury/.test(t)) return `${prefix}_treasury`;
  if (/^(department of )?state$|^department of state/.test(t)) return `${prefix}_diplomatic`;
  if (/^(department of )?justice|^justice/.test(t)) return `${prefix}_justice`;
  if (/^interior|^department of the interior/.test(t)) return `${prefix}_interior`;
  if (/post[-_ ]office/.test(t)) return `${prefix}_post_office`;
  return undefined;
}

/**
 * The faction of a state's government on 4 March 1861 (a MODELLING RULE, named
 * in the hand-over note):
 * - the seven states the research notes call "the seven states" in the Senate
 *   debates of 25-28 March (secession-winter and march-1861-facts) are
 *   Confederate;
 * - the eight slave states that had not left the Union on 4 March are
 *   uncommitted: a government with no faction (0050), its side chosen later by
 *   a situation;
 * - every other state is Union.
 */
export const SECEDED = ['South Carolina', 'Mississippi', 'Florida', 'Alabama', 'Georgia', 'Louisiana', 'Texas'];
export const UNCOMMITTED = ['Delaware', 'Maryland', 'Virginia', 'North Carolina', 'Tennessee', 'Kentucky', 'Missouri', 'Arkansas'];
export function stateFaction(state) {
  if (SECEDED.includes(state)) return 'confederate';
  if (UNCOMMITTED.includes(state)) return null;
  return 'union';
}
export const stateId = (state) => `st_${state.toLowerCase().replace(/[^a-z]+/g, '_')}`;
