import { describe, expect, it } from 'vitest';
import { applyMusters, enlistmentsOf, type NewBlock } from '../src/forces/enlistment.ts';
import { forceTotals } from '../src/forces/lots.ts';
import { toId } from '../src/ids.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import type { RegimentRecord } from '../src/world/regiments.ts';
import { forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { worldOf } from './support/tick-context.ts';

const base = forcesIndex({regions: [], edges: []});
const entry = (id: string, order: number, termDays = [90]): RegimentRecord => ({
  id, order, state: 'province', raisingDepartment: toId('department', 'a_war'), designation: id,
  arm: 'infantry', scope: 'regiment', side: 'a', termDays, aliases: [], observations: [], path: {},
});
const proposal = (id: string, count: number | null = 2, men: number | null = 2000): NewBlock => ({
  block: toId('forceBlock', id), name: id, department: toId('department', 'a_war'), arm: 'infantry', strength: men, storesDays: 5,
  enlistment: { enlPost: toId('post', 'governor'), enlRaisedBy: null, enlCall: toId('message', `call.${id}`), enlRegiments: count, enlMusterDay: 4, enlEndsDay: 94 },
});
function fixture(records: readonly RegimentRecord[]) {
  const map = indexWorld({ ...base.world, regimentCatalogue: records });
  const world = worldOf(map, forcesStart({}, [], []));
  return { map, state: createState(world, { seed: 1 }) };
}
describe('identities follow actual raising (0108)', () => {
  it('takes the next unused fitting identity in catalogue order, retaining generated overflow', () => {
    const {map, state} = fixture([entry('late', 8), entry('wrong_term', 0, [1095]), entry('early', 2)]);
    const a = proposal('batch', 3, 3000);
    const r = applyMusters(map, state, [{change:'create', create:a, cause:'recruitment'}]).state;
    expect(r.forceBlockStates[a.block]!.fbLots.map(l => [l.lotRegiment, l.lotGenerated, l.lotMen])).toEqual([
      ['early', false, 1000], ['late', false, 1000], ['generated.batch.3', true, 1000],
    ]);
    expect(forceTotals(r.forceBlockStates[a.block]!)).toEqual({fbStrength:3000,fbStragglers:0});
    expect(enlistmentsOf(r)[a.block]).toEqual(a.enlistment);
    const gone = applyMusters(map, r, [{change:'disband',block:a.block,cause:'recruitment'}]).state;
    const b = proposal('later_batch',1,1000);
    const next = applyMusters(map,gone,[{change:'create',create:b,cause:'recruitment'}]).state;
    expect(next.forceBlockStates[b.block]!.fbLots[0]!.lotGenerated).toBe(true);
  });
  it('retains an unknown-count batch as one unidentified lot with unknown men', () => {
    const {map,state}=fixture([entry('early',0)]), b=proposal('unknown',null,null);
    const next=applyMusters(map,state,[{change:'create',create:b,cause:'recruitment'}]).state;
    expect(next.forceBlockStates[b.block]!.fbLots).toHaveLength(1);
    expect(next.forceBlockStates[b.block]!.fbLots[0]).toMatchObject({lotRegiment:null,lotGenerated:false,lotMen:null});
    expect(next.forceRaisedIdentities).toEqual({});
  });
  it('S77: matches an explicit war contract without treating an unknown term as war service', () => {
    const {map,state}=fixture([{...entry('held',0,[]),warTerm:false},{...entry('war',1,[]),warTerm:true}]);
    const b=proposal('war_batch',2,2000);
    const next=applyMusters(map,state,[{change:'create',create:{...b,enlistment:{...b.enlistment,enlEndsDay:null}},cause:'recruitment'}]).state;
    expect(next.forceBlockStates[b.block]!.fbLots.map(l=>l.lotRegiment)).toEqual(['war','generated.war_batch.2']);
    expect(next.forceBlockStates[b.block]!.fbLots.every(l=>l.lotService?.enlEndsDay===null)).toBe(true);
    const held=applyMusters(map,state,[{change:'create',create:{...b,enlistment:{...b.enlistment,enlEndsDay:null,enlTermUnknown:true}},cause:'recruitment'}]).state;
    expect(held.forceBlockStates[b.block]!.fbLots.every(l=>l.lotGenerated)).toBe(true);
  });
  it('retains the model quota when its last nominal regiment is partial', () => {
    const {map,state}=fixture([]), b=proposal('partial',2,1500);
    const next=applyMusters(map,state,[{change:'create',create:b,cause:'recruitment'}]).state;
    expect(next.forceBlockStates[b.block]!.fbLots.map(l=>l.lotMen)).toEqual([1000,500]);
    expect(forceTotals(next.forceBlockStates[b.block]!)).toEqual({fbStrength:1500,fbStragglers:0});
  });
  it('does not apportion an aggregate return into purported regimental strengths', () => {
    const {map,state}=fixture([]), b=proposal('return_batch',2,null);
    const entered=applyMusters(map,state,[{change:'create',create:{...b,enlistment:{...b.enlistment,enlSourceAct:toId('situation','entry')}},cause:'recruitment'}]).state;
    expect(()=>applyMusters(map,entered,[{change:'quantify',block:b.block,men:3500,regiments:2,cause:'recruitment'}])).toThrow('aggregate return cannot assign regimental strengths');
    expect(forceTotals(entered.forceBlockStates[b.block]!).fbStrength).toBeNull();
  });
  it('keeps a counted but unidentified return as one aggregate lot without assigning identities', () => {
    const {map,state}=fixture([entry('early',0)]), b=proposal('unidentified_return',null,null);
    const entered=applyMusters(map,state,[{change:'create',create:{...b,enlistment:{...b.enlistment,enlSourceAct:toId('situation','entry')}},cause:'recruitment'}]).state;
    const next=applyMusters(map,entered,[{change:'quantify',block:b.block,men:2500,regiments:2,cause:'recruitment'}]).state;
    expect(next.forceBlockStates[b.block]!.fbLots).toHaveLength(1);
    expect(next.forceBlockStates[b.block]!.fbLots[0]).toMatchObject({lotRegiment:null,lotMen:2500});
    expect(next.forceRaisedIdentities).toEqual({});
    expect(enlistmentsOf(next)[b.block]?.enlRegiments).toBe(2);
  });
});


it('S81 keeps a sourced own-contingent headcount with unknown regiment count on entry and later return',()=>{
 const {map,state}=fixture([]),b=proposal('own_contingent',null,490);
 const service={...b.enlistment,enlSourceAct:toId('situation','entry')};
 const direct=applyMusters(map,state,[{change:'create',create:{...b,enlistment:service},cause:'recruitment'}]).state;
 expect(forceTotals(direct.forceBlockStates[b.block]!).fbStrength).toBe(490);
 const unknown=applyMusters(map,state,[{change:'create',create:{...b,strength:null,enlistment:service},cause:'recruitment'}]).state;
 const returned=applyMusters(map,unknown,[{change:'quantify',block:b.block,men:490,regiments:null,cause:'recruitment'}]).state;
 expect(returned.forceBlockStates[b.block]!.fbLots).toHaveLength(1);
 expect(returned.forceBlockStates[b.block]!.fbLots[0]).toMatchObject({lotMen:490,lotRegiment:null});
 expect(enlistmentsOf(returned)[b.block]).toEqual(service);
});
