import { expect, it, vi } from 'vitest';
import * as supply from '../src/supply/supply.ts';
import { localPlanningGround } from '../src/seats/planning-ground.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { makeCtx } from '../src/planner/context.ts';
import { plannerViewFor } from '../src/view/view.ts';
import { fresh } from './support/s25-fixture.ts';
import { F, P, POST, R } from './support/seats-fixture.ts';
import { seatIdFor } from '../src/seats/seats.ts';

it('S153 round2: lazy planning computes exact supply once on demand, including unknown beliefs',()=>{
 const {world,state}=fresh(), ground=localPlanningGround(world,state,1)();
 const view=plannerViewFor(world,state,seatIdFor(P('a_gen'))), post=POST('a_army');
 const goal={goalObjective:R('b_front'),goalPosture:'take' as const,goalRisk:500,goalDeadlineDays:20,goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
 const spy=vi.spyOn(supply,'deriveSupply');
 try {
  const input=plannerInputFor(world,state,()=>ground.derived,ground.network,ground.month,view,post,goal,1);
  const ctx=makeCtx(input);
  expect(ctx.threat.get(R('b_front'))??null).toBeNull();
  expect(spy).not.toHaveBeenCalled();
  const first=ctx.inSupply;
  expect(spy).toHaveBeenCalledTimes(1);
  expect(ctx.inSupply).toBe(first);
  expect(input.supply).toBe(ground.derived.supply.factions.get(F('a')));
  expect(spy).toHaveBeenCalledTimes(1);
  const eager=plannerInputFor(world,state,ground.derived,ground.network,ground.month,view,post,goal,1);
  expect(input).toEqual(eager);
  expect(ctx.inSupply).toEqual(makeCtx(eager).inSupply);
 } finally {spy.mockRestore();}
});

it('S153 round2: missing supply still rejects eager callers and lazy consumers',()=>{
 const {world,state}=fresh(), g=localPlanningGround(world,state,1)();
 const empty={...g.derived,supply:{...g.derived.supply,factions:new Map()}}, view=plannerViewFor(world,state,seatIdFor(P('a_gen')));
 const goal={goalObjective:R('b_front'),goalPosture:'hold' as const,goalRisk:500,goalDeadlineDays:20,goalRail:false,goalRiver:false,goalSea:false,goalNeutral:false,goalCommitted:[],goalAwaitWord:false,goalApproveAsDrafted:false};
 expect(()=>plannerInputFor(world,state,empty,g.network,g.month,view,POST('a_army'),goal,1)).toThrow('no supply');
 const lazy=plannerInputFor(world,state,()=>empty,g.network,g.month,view,POST('a_army'),goal,1);
 expect(()=>lazy.supply).toThrow('no supply');
});
