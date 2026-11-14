// Free-text places in the oob draft ("Charleston, Charleston County, South
// Carolina", "Off Fort Pickens, Santa Rosa Island") become region ids.
//
// Resolution order: explicit station and place rules (below), then a county
// lookup in the map draft's own county lists, then the state's capital region
// (or its only region). Anything left unresolved is returned as null and the
// importer reports it; nothing is guessed.

/** Off-map stations: the drafts say squadrons on foreign stations sit in the off-map boxes (oob README q8); which box is this lane's call, named in the hand-over note. */
const STATION_RULES = [
  [/^gulf of mexico and caribbean/i, 'gulf_of_mexico'],
  [/lost at sea/i, null],
  [/needs-source/i, null],
  [/^off fort pickens|off fort pickens/i, 'pensacola_coast'],
  [/aboard USS/i, 'pensacola_coast'],
  [/inside pensacola harbou?r/i, 'pensacola_coast'],
  [/at sea, vera cruz to hampton roads|at sea from vera cruz/i, 'gulf_of_mexico'],
  [/sacrificios|vera cruz/i, 'france_mexico'],
  [/havana/i, 'havana'],
  [/hong kong|shanghai|canton, china/i, 'eastern_seas'],
  [/cape town/i, 'south_atlantic'],
  [/congo|gulf of guinea|montevideo|buenos aires|west coast of africa|coast of brazil/i, 'south_atlantic'],
  [/messina|naples|malta|mediterranean/i, 'north_atlantic'],
  [/panama/i, 'panama'],
  [/callao|valparaiso|western mexico|mare island|san francisco|sacramento|salem, oregon|california, oregon/i, 'pacific_coast'],
  [/erie, pennsylvania/i, 'pennsylvania_north'],
  [/philadelphia navy yard/i, 'philadelphia'],
  [/new york navy yard|brooklyn/i, 'new_york'],
  [/^gulf of mexico and caribbean/i, 'gulf_of_mexico'],
  [/charleston bar/i, 'charleston_bar'],
  [/fort sumter/i, 'fort_sumter'],
  [/sullivan's island|charleston harbou?r|james island|stono|morris island|castle pinckney|fort moultrie|fort johnson/i, 'charleston'],
  [/fort pickens|santa rosa island/i, 'fort_pickens'],
  [/pensacola harbou?r|warrington|fort barrancas/i, 'pensacola'],
  [/garden key|dry tortugas|key west/i, 'key_west'],
  [/old point com/i, 'fort_monroe'],
  [/gosport/i, 'norfolk'],
  [/georgetown and horry/i, 'georgetown_pee_dee'],
  [/northwest(ern)? frontier/i, 'tx_west'],
  [/lower rio grande|rio grande/i, 'brownsville'],
  [/camp floyd|utah territory/i, null],
];

const STATE_OVERRIDE = { California: 'pacific_coast', Oregon: 'pacific_coast' };

export function makeResolver(regions) {
  // regions: [{ id, counties: ['State:County', ...], flags: [] }]
  const byCounty = new Map();
  const byState = new Map();
  const star = new Map();
  for (const r of regions) {
    for (const c of r.counties) {
      const m = /^([^:]+):(.+)$/.exec(c);
      if (!m) continue;
      const state = m[1];
      byState.set(state, [...new Set([...(byState.get(state) ?? []), r.id])]);
      if (m[2] === '*') {
        star.set(state, [...(star.get(state) ?? []), r.id]);
        continue;
      }
      const part = /\(part:/.test(m[2]);
      const county = m[2].replace(/\s*\(part:.*$/, '').trim();
      const key = `${state}:${county}`;
      byCounty.set(key, [...(byCounty.get(key) ?? []), { id: r.id, part }]);
    }
  }
  const byId = new Map(regions.map((r) => [r.id, r]));
  const states = [...byState.keys(), ...star.keys(), 'District of Columbia'];

  function stateRegion(state) {
    if (STATE_OVERRIDE[state]) return STATE_OVERRIDE[state];
    const ids = [...new Set([...(byState.get(state) ?? []), ...(star.get(state) ?? [])])];
    if (ids.length === 1) return ids[0];
    const cap = ids.filter((id) => byId.get(id).flags.includes('capital'));
    if (cap.length === 1) return cap[0];
    return null;
  }

  return function resolve(loc) {
    const text = loc.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    for (const [re, id] of STATION_RULES) if (re.test(loc)) return id;
    const norm = text.replace(/\bSaint\b/g, 'St.').replace(/\bSackets\b/g, 'Sackets');
    // "..., X County|Parish|District, State"
    let m = /,\s*([A-Za-z.' ]+?)\s+(?:County|Parish|District),\s*([A-Za-z. ]+?)$/.exec(norm);
    if (m) {
      const hits = byCounty.get(`${m[2]}:${m[1]}`);
      if (hits) {
        const plain = hits.filter((h) => !h.part);
        const pick = plain.length > 0 ? plain : hits;
        if (new Set(pick.map((h) => h.id)).size === 1) return pick[0].id;
      }
      const sr = stateRegion(m[2]);
      if (sr) return sr;
    }
    // "..., State" or "State (...)"
    for (const s of states) {
      if (new RegExp(`(^|,\\s*)${s}(\\s|,|$)`).test(norm)) return stateRegion(s);
    }
    return null;
  };
}
