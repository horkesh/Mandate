import { strictCompare } from '../compare.ts';
import type { PersonId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { hasRequiredPapers } from '../knowledge/papers.ts';
import type { State } from '../root-state.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { letterKey } from '../world/letters.ts';
import { seatIdFor } from './seats.ts';
import type { SeatsWorld } from './world.ts';
import { allocationSelection, outstandingAllocation } from '../command/allocation.ts';

export function allocationFulfilments(world: SeatsWorld, state: State, person: PersonId, day: number) {
  return Object.values(state.allocationRecords??{}).filter(r=>r.allocSender===person).flatMap(row=>{
    const paper=outstandingAllocation(world,state,row);
    if(!paper || state.postStates[paper.from]?.postHolder!==person)return [];
    return allocationSelection(world,state,paper,day,row.allocStrongest,row.allocLots).lots.length?[{row,paper}]:[];
  });
}

export function availableAllocations(world: SeatsWorld, state: State, person: PersonId, day: number) {
  const knowledge=knowledgeOf(state,seatIdFor(person));
  return (world.map.world.rules.allocationInstruments??[]).filter(p=>p.issuer===person &&
    p.fromDate<=formatIsoDate(dateOfDay(world.start.startDate,day)) &&
    !knowledge.knownDoctrineDispatches?.some(d=>letterKey(d.dispatchLetter)===letterKey(p.letter)) &&
    hasRequiredPapers(p.requiresPapers,knowledge,state.stateDay,world.rules.templates))
    .sort((a,b)=>strictCompare(a.fromDate,b.fromDate)||strictCompare(a.id,b.id));
}
