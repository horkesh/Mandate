import { expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { availableAllocations } from '../../../packages/kernel/src/seats/allocation.ts';
import { issueAllocation } from '../../../packages/kernel/src/tick/allocation.ts';
import { ctxFor } from '../../../packages/kernel/test/support/tick-context.ts';

it('0131 retires every history concentration sweep while retaining the explicit generic testbed policy',()=>{
  const loaded=seatsWorld('union-1861');
  for(const row of loaded.world.map.world.rules.ruleSeats.principals) {
    expect(row.concentrateAt).toBeNull();expect(row.concentrations).toEqual([]);
  }
  expect(seatsWorld('testbed').world.map.world.rules.ruleSeats.principals.some(p=>p.concentrateAt!==null)).toBe(true);
  const state={...phase0.createState(loaded.world,loaded.setup),stateDay:140};
  for(const request of phase0.pendingRequests(loaded.world,state).filter(r=>r.menu.menuKind==='principal')) {
    const answer=createRuleSeat().respond(request);
    if(answer.answerKind==='commands')expect(answer.commands.some(c=>c.cmd==='transfer'&&c.amount===999)).toBe(false);
  }
});
it('declares the finite five and a causally disjoint remainder without inventing a call or McDowell membership',()=>{
  const {world}=seatsWorld('union-1861');
  const papers=world.map.world.rules.allocationInstruments!.filter(p=>p.id.startsWith('s141_'));
  expect(papers).toHaveLength(2);
  const first=papers.find(p=>p.quantity===5)!, remainder=papers.find(p=>p.quantity==='all')!;
  expect(first).toMatchObject({from:'st_gov_pennsylvania',to:'us_dept_pennsylvania',issuer:'lincoln_abraham',issuerPost:null,mandate:null,scope:{kind:'cohort',minTermDays:91}});
  expect(first.scope).not.toHaveProperty('calls');expect(first.scope).not.toHaveProperty('arm');
  expect(remainder.to).toBe('us_general_in_chief');
  expect(remainder.requiresPapers).toEqual([expect.objectContaining({answers:first.letter,claims:[{kind:'allocation-shortfall',region:null,token:first.id,min:0,max:0}]})]);
  expect(papers.every(p=>!p.source.includes('GO17')&&!p.source.includes('GO18')&&!p.source.includes('GO19'))).toBe(true);
});
it('the actual declared issuer can dispatch against retained holdings without hidden recipient selection',()=>{
  const {world}=seatsWorld('union-1861');
  const paper=world.map.world.rules.allocationInstruments!.find(p=>p.quantity===5)!;
  // Synthetic opened-command fixture; never a historical receipt or campaign.
  const initial=phase0.createState(world,{seed:1});
  const base=initial.postStates[ids.toId('post','us_dc_militia')]!;
  const state:phase0.State={...initial,stateDay:148,postStates:{...initial.postStates,[paper.to]:{...base,postHolder:ids.toId('person','patterson_robert'),postParent:ids.toId('post','us_general_in_chief'),postSeat:ids.toId('region','philadelphia')}}};
  const ctx=ctxFor(world,state,149,phase0.TICK_MECHANICS);
  expect(availableAllocations(world,state,paper.issuer,149).some(p=>p.id===paper.id)).toBe(true);
  expect(issueAllocation(ctx,state,phase0.seatIdFor(paper.issuer),{cmd:'allocation',paper:paper.id,route:'courier'})).toBeNull();
  expect(ctx.outbox).toHaveLength(1);
  expect(ctx.outbox[0]!.msgToPost).toBe(paper.from);
  expect(state.allocationRecords).toBeUndefined();
});
