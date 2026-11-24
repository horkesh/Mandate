import { expect, it } from 'vitest';
import { createViewCache, plannerViewFor, viewFor } from '../src/view/view.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { claim, fresh, report } from './support/s25-fixture.ts';
import { P, R } from './support/seats-fixture.ts';

it('S153 round2: thin planner pictures equal the full received fields through reports, expiry, traits and rewind',()=>{
 const {world,state}=fresh(), seat=seatIdFor(P('a_gen')), cache=createViewCache();
 const known=deliverReport({...state,stateDay:2},seat,report('r2.enemy',{reportType:'enemy-estimate',reportClaims:[claim('enemy-strength',700)]}),NO_TRUTH);
 const unknown=deliverReport({...state,stateDay:2},seat,report('r2.unknown',{reportType:'enemy-estimate',reportClaims:[claim('enemy-estimate-unknown',0)]}),NO_TRUTH);
 const own=state.personTrue[P('a_gen')]!;
 const changed={...known,personTrue:{...known.personTrue,[P('a_gen')]:{...own,trueBoldness:999}}};
 for(const position of [state,known,unknown,{...known,stateDay:100},changed,state]) {
  const before=canonicalHash(position), thin=plannerViewFor(world,position,seat,cache), full=viewFor(world,position,seat,cache);
  expect(thin).toEqual(Object.fromEntries(Object.keys(thin).map(k=>[k,full[k as keyof typeof full]])));
  expect(Object.isFrozen(thin)).toBe(true);
  expect(canonicalHash(position)).toBe(before);
 }
 expect(plannerViewFor(world,unknown,seat).enemyBeliefs[R('a_front')]?.value??null).toBeNull();
 // A different seat's report never enters this commander's planner picture.
 const hidden=deliverReport(state,seatIdFor(P('b_gen')),report('r2.hidden',{reportType:'enemy-estimate',reportClaims:[claim('enemy-strength',9999)]}),NO_TRUTH);
 expect(plannerViewFor(world,hidden,seat)).toEqual(plannerViewFor(world,state,seat));
});
