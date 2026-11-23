import { describe, expect, it } from 'vitest';
import { forceTotals, unidentifiedLot } from '../src/forces/lots.ts';
import { applyMusters } from '../src/forces/enlistment.ts';
import { regimentsRaised } from '../src/tick/recruitment.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { toId } from '../src/ids.ts';
import { forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { worldOf } from './support/tick-context.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';

describe('strength provenance (0125)', () => {
  it('reports the known part of a mixed block by kind without filling its unknown lot', () => {
    const lots = [
      { ...unidentifiedLot('a', 'infantry', 12), lotStrength: { strengthKind: 'return', strengthSource: 'fictional roll p.1', strengthDate: '1861-03-01' } },
      { ...unidentifiedLot('b', 'infantry', 20), lotStrength: { strengthKind: 'rule', strengthSource: 'fictional establishment p.2', strengthDate: null } },
      unidentifiedLot('c', 'infantry', null),
    ];
    expect(forceTotals({ fbLots: lots } as Parameters<typeof forceTotals>[0])).toMatchObject({
      fbStrength: null, fbByKind: { return: 12, estimate: 0, rule: 20, unknown: null }, fbUnknownLots: ['c'],
    });
  });

  it('keeps a model quantity when the catalogue supplies a historical identity', () => {
    const base = forcesIndex({ regions: [], edges: [] });
    const map = indexWorld({ ...base.world, regimentCatalogue: [{ id: 'named', order: 1, state: 'province', raisingDepartment: toId('department','a_war'), designation: 'named', arm: 'infantry', scope: 'regiment', side: 'a', termDays: [90], aliases: [], observations: [], path: {} }] });
    const state = createState(worldOf(map, forcesStart({}, [], [])), { seed: 1 });
    const block = toId('forceBlock','raised');
    const next = applyMusters(map,state,[{ change:'create',cause:'recruitment',create:{ block,name:'raised',department:toId('department','a_war'),arm:'infantry',strength:780,storesDays:1,
      enlistment:{enlPost:toId('post','governor'),enlRaisedBy:null,enlCall:toId('message','call'),enlRegiments:1,enlMusterDay:1,enlEndsDay:91} } }]).state;
    expect(next.forceBlockStates[block]!.fbLots[0]).toMatchObject({ lotRegiment:'named',lotGenerated:false,lotMen:780,lotStrength:{strengthKind:'rule'} });
    expect(decodeSave(encodeSave({ worldHash:canonicalHash(map.world),state:next })).state).toEqual(next);
  });

  it('migrates a named call lot as rule and an unsourced historical lot as unknown', () => {
    const state = { forceBlockStates:{ sample:{fbLots:[
      {lotId:'named',lotGenerated:false,lotMen:780,lotService:{enlCall:'call'}},
      {lotId:'historical',lotGenerated:true,lotMen:1000,lotService:{enlSourceAct:'transfer'}},
    ]} } };
    const old = {format:'mandate-save',schemaVersion:3,worldHash:canonicalHash('world'),state,stateHash:canonicalHash(state),log:[],logHash:canonicalHash([])};
    expect(decodeSave(JSON.stringify(old)).state).toMatchObject({forceBlockStates:{sample:{fbLots:[
      {lotMen:780,lotStrength:{strengthKind:'rule'}}, {lotMen:null,lotStrength:{strengthKind:'unknown'}},
    ]}}});
  });

  it('uses the selected call establishment, keeps explicit men, and never fills explicitly unknown men', () => {
    const rules = forcesIndex({regions:[],edges:[]}).world.rules.recruitment;
    // Final argument is the call's selected establishment, never a universal size.
    expect(regimentsRaised(rules,2,'comply',null,undefined,780)!.men).toBe(1560);
    expect(regimentsRaised(rules,2,'comply',null,undefined,866)!.men).toBe(1732);
    expect(regimentsRaised(rules,2,'comply',null,1234,780)!.men).toBe(1234);
    expect(regimentsRaised(rules,2,'comply',null,null,780)!.men).toBeNull();
  });
});
