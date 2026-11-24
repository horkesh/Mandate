import { expect, it, vi } from 'vitest';
import * as command from '../src/command/command.ts';
import { sideForces, sidePosts } from '../src/planner/input.ts';
import { localPlanningGround } from '../src/seats/planning-ground.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, P, POST, fixtureMap, fixtureStart } from './support/seats-fixture.ts';

function fixture() {
 const world=indexSeatsWorld(indexWorld(fixtureMap().world),fixtureStart());
 const state=createState(world,{seed:17});
 return {world,state};
}

it('S153: commanders share exact morning force and post projections, with their own cooperation',()=>{
 const {world,state}=fixture(), cache=localPlanningGround(world,state,1)().plannerCache;
 const expected=sidePosts(world,state,F('a'),P('a_bold'));
 const spy=vi.spyOn(command,'allCommandedBlocks');
 try {
  sidePosts(world,state,F('a'),P('a_gen'),cache);
  const calls=spy.mock.calls.length;
  expect(calls).toBeGreaterThan(0);
  expect(sidePosts(world,state,F('a'),P('a_bold'),cache)).toEqual(expected);
  expect(spy).toHaveBeenCalledTimes(calls);
  const forces=sideForces(world,state,F('a'),cache);
  expect(sideForces(world,state,F('a'),cache)).toBe(forces);
  expect(forces).toEqual(sideForces(world,state,F('a')));
 } finally {spy.mockRestore();}
});

it('S153: projection reuse invalidates for new States, worlds and factions',()=>{
 const {world,state}=fixture(), cache=localPlanningGround(world,state,1)().plannerCache;
 sidePosts(world,state,F('a'),P('a_gen'),cache);
 sideForces(world,state,F('a'),cache);
 const changed={...state,postStates:{...state.postStates,[POST('a_army')]:{...state.postStates[POST('a_army')]!,postHolder:P('a_bold')}},personStanding:{...state.personStanding,[P('a_bold')]:999}};
 for(const [w,s,f] of [[world,changed,F('a')],[{...world},state,F('a')],[world,state,F('b')]] as const) {
  expect(sidePosts(w,s,f,P('a_gen'),cache)).toEqual(sidePosts(w,s,f,P('a_gen')));
  expect(sideForces(w,s,f,cache)).toEqual(sideForces(w,s,f));
 }
});
