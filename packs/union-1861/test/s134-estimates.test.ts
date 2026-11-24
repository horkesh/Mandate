import {expect,it} from 'vitest';
import {phase0,ids} from '@mandate/kernel';
import {seatsWorld} from '../../../packages/cli/src/seats-world.ts';
import {plannerInputFor} from '../../../packages/kernel/src/planner/input.ts';

it('S134 G8: an unreceived change in true enemy position leaves the picture and the Winchester territory fixed',()=>{
  const {world}=seatsWorld('union-1861');const state=phase0.createState(world,{seed:17});
  const person=ids.toId('person','patterson_robert');const seat=phase0.seatIdFor(person);
  const enemy=(Object.keys(state.forceLocations) as ids.ForceBlockId[]).find(b=>phase0.factionOfBlock(world.map,state,b)==='confederate')!;
  const destination=[...world.map.regions.keys()].find(r=>r!==state.forceLocations[enemy]!.locRegion)!;
  const changed={...state,forceLocations:{...state.forceLocations,[enemy]:{...state.forceLocations[enemy]!,locRegion:destination}}};
  const before=phase0.viewFor(world,state,seat),after=phase0.viewFor(world,changed,seat);
  expect(after.enemyBeliefs).toEqual(before.enemyBeliefs);expect(after.reports).toEqual(before.reports);
  const network=phase0.passageOf(world.map,state);const derived=phase0.deriveMap(world.map,{control:state.regionControl,month:3,network});
  // Patterson's later department does not exist on the opening day. Use an
  // already held Union post for the planner control, without inventing an appointment.
  const post=(Object.keys(state.postStates) as ids.PostId[]).find(p=>state.postStates[p]!.postHolder!==null&&phase0.postFaction(world,state,p)==='union')!;
  const planningSeat=phase0.seatIdFor(state.postStates[post]!.postHolder!);
  const goal=phase0.goalOf({posture:'take',objective:ids.toId('region','harpers_ferry'),risk:500,deadlineDays:14,rail:false,river:false,sea:false,neutral:false,committed:[],awaitWord:false,approveAsDrafted:true});
  const a=plannerInputFor(world,state,derived,network,3,phase0.viewFor(world,state,planningSeat),post,goal,1),b=plannerInputFor(world,changed,derived,network,3,phase0.viewFor(world,changed,planningSeat),post,goal,1);
  expect(b.beliefs).toEqual(a.beliefs);expect(b.beliefDetails).toEqual(a.beliefDetails);
  // Accepted0130, from the retained OR I-II p.166 reading; geography does not follow headquarters.
  const duties=world.map.world.rules.ruleSeats.principals.flatMap(p=>p.offensives).filter(o=>o.purpose!==undefined);
  expect(duties).toHaveLength(3);
  expect(duties.every(o=>o.purpose!.detentionArea.length===1&&o.purpose!.detentionArea[0]==='lower_valley')).toBe(true);
});
