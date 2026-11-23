import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * The lead's ruling (lane 1.11): a call for regiments goes to a state government, of the calling side or neutral, never
 * to a people who govern themselves (0069, 0070; SENSITIVE-HISTORY 3.7). The Cherokee Nation is neutral from 17 May; no
 * seat recruits it. The start has no post for the nation's principal chief, so this control plants one and calls it: the
 * validator refuses the call, and the kernel's call path refuses it as `not_raising_post` (lane 1.7).
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const NATION_POST = 'nt_cherokee_principal_chief';
const SCENARIO = 'data/scenarios/march_1861.json';
const plantedPost = {
  acting: false, department: 'nation_cherokee', departmentChanges: [], holder: null, id: NATION_POST, installation: null, intelligenceChief: null,
  kind: 'governor', links: [], name: 'post.st_gov_kentucky.name', parent: null, provenance: [{ at: 'a planted control (lane 1.11)', source: 'OR' }],
  railLine: null, region: 'it_cherokee', standingOrders: [], temporary: null, unknowns: [],
};
const call = { to: NATION_POST, regiments: 2, termDays: 90, route: 'courier' };
const plantedSituation = {
  id: 'zz_nation_call', kind: 'decision', faction: 'union', title: 'situation.call_for_troops.title', text: 'situation.call_for_troops.text', earliest: '1861-03-06',
  event: { dayAtLeast: 1 }, railroad: 'a planted control on day 1',
  options: [{ id: 'call_out', label: 'situation.call_for_troops.option.militia_call', displayKey: 1, proposedBy: ['cameron_simon'], honours: ['union'], effects: [], calls: [call] }],
  inaction: { text: 'situation.call_for_troops.inaction', effects: [] }, historicalDefault: { options: ['call_out'] },
  staffLine: { authors: ['us_secretary_war'], recommends: ['call_out'], reasons: [{ kind: 'union', weight: 600 }], confidence: 600 },
  delegableTo: [], resurfaceOn: [], gate: { none: 'a planted control' }, citations: [{ source: 'OR', at: 'III-1 p. 69' }],
};

function files(withSituation: boolean): PackFiles {
  return {
    read: (p) => {
      const full = join(root, ...p.split('/'));
      if (withSituation && p === 'situations/zz_nation_call.json') return JSON.stringify(plantedSituation);
      if (!existsSync(full) || !statSync(full).isFile()) return undefined;
      const text = readFileSync(full, 'utf8');
      if (p !== SCENARIO) return text;
      const j = JSON.parse(text) as { posts: unknown[] };
      return JSON.stringify({ ...j, posts: [...j.posts, plantedPost] });
    },
    folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
    files: (p) => {
      const names = readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
      return withSituation && p === 'situations' ? [...names, 'zz_nation_call.json'] : names;
    },
  };
}

describe('no principal calls on a nation for regiments (the lead’s ruling; 0069, 0070)', () => {
  it('the validator refuses a call to a self-governing nation’s post, and accepts the start without it', () => {
    const planted = loadPack(files(true)).issues.filter((i) => i.severity === 'error').map((i) => i.kind);
    expect(planted).toContain('self-governing-call');
    expect(loadPack(files(false)).issues.filter((i) => i.kind === 'self-governing-call')).toEqual([]);
  });

  it('the kernel’s call path refuses it as not_raising_post, and no levy is held', () => {
    const { pack } = loadPack(files(false));
    const map = w.indexWorld(pack!.world);
    const def = { ...plantedSituation, id: ids.toId('situation', 'zz_nation_call'), knowledge: null, chain: null, subjects: [], effects: [], report: null, gateReview: null,
      options: plantedSituation.options.map((o) => ({ ...o, proposedBy: [ids.toId('person', 'cameron_simon')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, lockedCosts: [], orders: [], watched: false, policy: null, gate: null,
        calls: [{ ...call, to: ids.toId('post', NATION_POST) }] })),
      staffLine: { ...plantedSituation.staffLine, authors: [ids.toId('post', 'us_secretary_war')] },
      inaction: { ...plantedSituation.inaction, policy: null },
    } as unknown as phase0.SituationDef;
    const world = phase0.indexSeatsWorld(map, pack!.scenarios[0]!, { situations: [...pack!.situations!.filter(s => s.id === 'manassas_advance_received'), def] });
    let state = phase0.createState(world, { seed: 1, people: 'as-history' });
    const rejections: string[] = [];
    for (let d = 1; d <= 4; d++) {
      const r = phase0.tick(world, state, [], { freeze: true });
      rejections.push(...r.rejections.map((x) => x.reason));
      state = r.state;
    }
    expect(rejections).toContain('not_raising_post');
    expect(Object.values(state.postLevies).filter((l) => l.levyPost === ids.toId('post', NATION_POST))).toEqual([]);
  });
});
