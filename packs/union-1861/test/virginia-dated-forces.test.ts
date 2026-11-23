import { observeBlock } from '../../../packages/kernel/test/support/lot-fixture.ts';
import { enlistmentsOf } from '../../../packages/kernel/src/forces/enlistment.ts';
import { forceTotals } from '../../../packages/kernel/src/forces/lots.ts';
import { describe, it, expect } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
const B = (s: string) => ids.toId('forceBlock', `state-forces.${s}`);
const P = (s: string) => ids.toId('post', s);
function fixture() {
  const loaded = seatsWorld('union-1861');
  const world = { ...loaded.world, situations: loaded.world.situations.filter(s => s.id.startsWith('virginia_') && (s.gate as { none?: string }).none !== undefined) };
  let state = phase0.createState(world, loaded.setup);
  state = { ...state, situationFlags: { virginia_seceded: 44 }, departmentFactions: { ...state.departmentFactions, [ids.toId('department','st_virginia')]: ids.toId('faction','confederate') },
    postStates: Object.fromEntries(Object.entries(state.postStates).map(([id,p]) => [id,p.postHolder === 'johnston_joseph_e' ? { ...p, postHolder: null } : p])),
    personService: { ...state.personService, [ids.toId('person','johnston_joseph_e')]: { serviceFaction: ids.toId('faction','confederate'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 44 }, [ids.toId('person','magruder_john_b')]: { serviceFaction: ids.toId('faction','confederate'), serviceBloc: null, serviceChoice: 'resign', serviceDay: 44 } } };
  return { world, state };
}
describe('S46 dated Virginia state contingents', () => {
  it('places the local troops before June, keeps unknown strengths, and transfers only the surviving identities', () => {
    const f = fixture(); let state = f.state;
    const tick = (day: number) => { state = phase0.tick(f.world, { ...state, stateDay: day-1 }, [], { freeze:true }).state; };
    tick(43); expect(state.forceBlockStates[B('va_norfolk')]).toBeUndefined();
    tick(44); expect(observeBlock(state.forceBlockStates[B('va_norfolk')]!)).toMatchObject({ fbDepartment:'st_virginia',fbStrength:null });
    expect(state.forceLocations[B('va_norfolk')]?.locRegion).toBe('norfolk');
    tick(48); expect(forceTotals(state.forceBlockStates[B('va_harpers_militia')]!).fbStrength).toBeNull();
    tick(50); tick(52); expect(state.forceLocations[B('va_richmond')]?.locRegion).toBe('richmond');
    expect(state.postStates[P('st_va_norfolk')]?.postHolder).toBe('gwynn_walter');
    tick(54); expect(state.forceBlockStates[B('va_harpers_militia')]).toBeUndefined();
    expect(state.postStates[P('st_va_harpers_ferry')]?.postHolder).toBe('jackson_thomas_j');
    expect(forceTotals(state.forceBlockStates[B('va_harpers_ferry')]!).fbStrength).toBeNull();
    tick(64); expect(state.postStates[P('st_va_richmond')]?.postHolder).toBe('magruder_john_b');
    tick(71); expect(state.forceLocations[B('va_manassas_garland')]?.locRegion).toBe('manassas');
    expect(state.forceLocations[B('va_manassas_preston')]).toBeUndefined();
    expect(state.forceLocations[B('va_harpers_ferry')]?.locRegion).toBe('harpers_ferry');
    tick(77); expect(state.forceLocations[B('va_peninsula')]?.locRegion).toBe('peninsula');
    tick(79); expect(state.postStates[P('st_va_norfolk')]?.postHolder).toBe('huger_benjamin');
    const before=state; tick(93);
    for (const id of ['va_norfolk','va_harpers_ferry','va_richmond','va_manassas_garland','va_peninsula']) {
      expect(observeBlock(state.forceBlockStates[B(id)]!)).toMatchObject({ fbDepartment:'cs_war',fbStrength:id==='va_manassas_garland'?490:null });
      expect(enlistmentsOf(state)[B(id)]).toEqual(enlistmentsOf(before)[B(id)]);
      expect(state.forceAssignments[B(id)]).toBe(before.forceAssignments[B(id)]);
      expect(state.forceLocations[B(id)]).toEqual(before.forceLocations[B(id)]);
    }
    tick(104); expect(state.forceBlockStates[B('cs_va_transfer_virginia')]).toBeUndefined();
    expect(Object.keys(state.forceBlockStates).filter(b=>b.startsWith('state-forces.va_'))).toHaveLength(5);
  });
});


it('S81 Garland return remains its own aggregate and leaves Harpers Ferry men unknown', () => {
  const f=fixture();let state=f.state;
  const step=(day:number)=>{state=phase0.tick(f.world,{...state,stateDay:day-1},[],{freeze:true}).state;};
  step(67);expect(state.forceBlockStates[B('va_manassas_garland')]).toBeUndefined();
  step(68);expect(forceTotals(state.forceBlockStates[B('va_manassas_garland')]!).fbStrength).toBe(490);
  expect(enlistmentsOf(state)[B('va_manassas_garland')]?.enlRegiments).toBeNull();
  expect(state.forceBlockStates[B('va_manassas_garland')]!.fbLots).toHaveLength(1);
  step(71);expect(state.forceBlockStates[B('va_manassas_preston')]).toBeUndefined();
  expect(forceTotals(state.forceBlockStates[B('va_manassas_garland')]!).fbStrength).toBe(490);
});


it('S81 quantifies the same existing Garland aggregate through the return path without replacing its service',()=>{
 const f=fixture();const without={...f.world,situations:f.world.situations.filter(s=>s.id!=='virginia_manassas_garland_return')};
 const entered=phase0.tick(without,{...f.state,stateDay:70},[],{freeze:true}).state;
 const id=B('va_manassas_garland'),before=enlistmentsOf(entered)[id];
 expect(forceTotals(entered.forceBlockStates[id]!).fbStrength).toBeNull();
 const returned=phase0.tick(f.world,{...entered,stateDay:71},[],{freeze:true}).state;
 expect(forceTotals(returned.forceBlockStates[id]!).fbStrength).toBe(490);
 expect(enlistmentsOf(returned)[id]).toEqual(before);
 expect(returned.forceBlockStates[id]!.fbLots.map(l=>l.lotId)).toEqual(entered.forceBlockStates[id]!.fbLots.map(l=>l.lotId));
});
