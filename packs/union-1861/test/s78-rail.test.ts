import { expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { changeDepartmentSide } from '../../../packages/kernel/src/command/command.ts';
import { edgeLeg } from '../../../packages/kernel/src/supply/supply.ts';
import { marchBar } from '../../../packages/kernel/src/movement/march.ts';
import { createDerivedMapCache, deriveMap } from '../../../packages/kernel/src/control-index/derived.ts';

it('accession preserves civil rail access for its side without creating control; opposing and contested ground stays barred', () => {
  const { world, setup } = seatsWorld('union-1861');
  const before = phase0.createState(world, setup);
  const cs = ids.toId('faction', 'confederate'), us = ids.toId('faction', 'union');
  const after = changeDepartmentSide(world.map, before, ids.toId('department', 'st_north_carolina'), cs).state;
  expect(after.regionControl).toBe(before.regionControl);
  const edge = [...world.map.edges.values()].find(e => e.type === 'rail' && e.a === 'salisbury_nc' && e.b === 'charlotte');
  // Match the existing map's ids without relying on their edge orientation.
  const line = edge ?? [...world.map.edges.values()].find(e => e.type === 'rail' && [e.a, e.b].some(r => r.includes('salisbury')) && [e.a, e.b].some(r => r.includes('charlotte')))!;
  expect(line).toBeDefined();
  const bar = (state: typeof before, side = cs) => {
    const ground = { map: world.map, index: phase0.buildControlIndex(world.map, state.regionControl), network: phase0.passageOf(world.map, state), month: 6 };
    return marchBar(ground, edgeLeg(world.map, line, line.a, 6, ground.network), side, false);
  };
  expect(bar(before)).toBeNull();
  expect(bar(after)).toBeNull();
  expect(bar(after, us)).toBe('rail_not_traced');
  for (const shares of [{ union: 1000 }, { union: 300, confederate: 300 }, { union: 1 }]) {
    const contested = { ...after, regionControl: { ...after.regionControl, [line.a]: shares } };
    expect(bar(contested)).toBe('confederate' in shares ? null : 'rail_not_traced');
  }
  const cache = createDerivedMapCache();
  const network = phase0.passageOf(world.map, after);
  const empty = { ...after.regionControl, [line.a]: {} };
  const contested = { ...after.regionControl, [line.a]: { union: 1 } };
  expect(deriveMap(world.map, { control: empty, network, month: 6 }, cache).index.holdings.get(line.a)!.reason).toBe('no_control');
  expect(deriveMap(world.map, { control: contested, network, month: 6 }, cache).index.holdings.get(line.a)!.reason).toBe('below_threshold');
});


it('S81 civil railway access survives only its own positive shares, including cached derivations', () => {
  const {world,setup}=seatsWorld('union-1861');
  const start=phase0.createState(world,setup),cs=ids.toId('faction','confederate');
  const state=changeDepartmentSide(world.map,start,ids.toId('department','st_north_carolina'),cs).state;
  const line=[...world.map.edges.values()].find(e=>e.type==='rail' && [e.a,e.b].some(r=>r.includes('salisbury')) && [e.a,e.b].some(r=>r.includes('charlotte')))!;
  const cache=createDerivedMapCache();
  for(const [shares,expected] of [[{confederate:1},null],[{confederate:1,union:0},null],[{confederate:1,union:1},'rail_not_traced'],[{confederate:250,union:1},null],[{},null]] as const){
    const next={...state,regionControl:{...state.regionControl,[line.a]:shares}};
    const network=phase0.passageOf(world.map,next);
    const inputs={control:next.regionControl,network,month:6};
    const cached=deriveMap(world.map,inputs,cache),fresh=deriveMap(world.map,inputs);
    expect(cached.index).toEqual(fresh.index);
    const bar=(index:typeof cached.index)=>marchBar({map:world.map,index,network,month:6},edgeLeg(world.map,line,line.a,6,network),cs,false);
    expect(bar(cached.index)).toBe(expected);
    expect(bar(fresh.index)).toBe(expected);
  }
});
