import { expect, it, vi } from 'vitest';
import * as supply from '../src/supply/supply.ts';
import * as controls from '../src/control-index/control-index.ts';
import { localPlanningGround } from '../src/seats/planning-ground.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { createState } from '../src/tick/setup.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { fixtureMap, fixtureStart, F, P, POST, R } from './support/seats-fixture.ts';
import { toId } from '../src/ids.ts';
import { seatIdFor } from '../src/seats/seats.ts';

function fixture() {
 const world=indexSeatsWorld(fixtureMap(),fixtureStart());
 return {world,state:createState(world,{seed:17})};
}

it('S153 round2: unchanged complete ground dependencies reuse supply across mornings',()=>{
 const {world,state}=fixture(), cache=createViewCache(), before=canonicalHash(state);
 const spy=vi.spyOn(supply,'deriveSupply');
 try {
  const first=localPlanningGround(world,state,1,cache.planningGround)();
  const second=localPlanningGround(world,{...state,stateDay:1},2,cache.planningGround)();
  expect(second).toEqual(first);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(canonicalHash(state)).toBe(before);
 } finally {spy.mockRestore();}
});

it('S153 round2: every ground dependency, month and world invalidates safely',()=>{
 const {world,state}=fixture(), cache=createViewCache();
 const edge=toId('edge','road:a_cap:a_mid'), depot=toId('depot','a_src');
 const variants=[
  {...state,regionControl:{...state.regionControl,[R('a_mid')]:{[F('b')]:1000}}},
  {...state,infraEdgeCondition:{...state.infraEdgeCondition,[edge]:0}},
  {...state,infraDepotCondition:{...state.infraDepotCondition,[depot]:0}},
  {...state,infraObstructions:[{obsEdge:edge,obsBy:null}]},
  {...state,regionGovernments:{...state.regionGovernments,[R('a_mid')]:'unknown' as const}},
  {...state,departmentFactions:{...state.departmentFactions,[toId('department','a')]:null}},
  {...state,closedGovernments:{...state.closedGovernments,[toId('department','a')]:1}},
 ];
 for(const changed of variants) {
  localPlanningGround(world,state,1,cache.planningGround)();
  expect(localPlanningGround(world,changed,1,cache.planningGround)()).toEqual(localPlanningGround(world,changed,1)());
 }
 for(const [w,day] of [[{...world},1],[world,40]] as const) {
  expect(localPlanningGround(w,state,day,cache.planningGround)()).toEqual(localPlanningGround(w,state,day)());
 }
});

it('S153 round2: planner control indexes share only the exact received control picture and world',()=>{
 const {world,state}=fixture(), ground=localPlanningGround(world,state,1)();
 const view=viewFor(world,state,seatIdFor(P('a_gen'))), post=POST('a_army');
 const goal={goalObjective:R('b_front'),goalPosture:'take' as const,goalRisk:500,goalDeadlineDays:20,goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
 const input=(w=world,v=view)=>plannerInputFor(w,state,ground.derived,ground.network,ground.month,v,post,goal,1,ground.plannerCache);
 const spy=vi.spyOn(controls,'buildControlIndex');
 try {
  const first=input();
  const index=first.ground.index;
  expect(input({...world}).ground.index).toEqual(index);
  spy.mockClear();
  input().ground.index; input().ground.index;
  expect(spy).toHaveBeenCalledTimes(1);
  const changed: typeof view={...view,controlBeliefs:{...view.controlBeliefs,[R('b_front')]:{...view.controlBeliefs[R('b_front')]!,shares:{[F('a')]:1000}}}};
  expect(input(world,changed).ground.index).toEqual(controls.buildControlIndex(world.map,Object.fromEntries(Object.entries(changed.controlBeliefs).map(([r,b])=>[r,b.shares]))));
 } finally {spy.mockRestore();}
});
