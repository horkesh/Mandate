/** Opted-in sourced commission intervals, distinct from service allegiance and voluntary resignation. */
import { strictCompare } from '../compare.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import { ranksOn } from './ranks.ts';

export function advanceCommissions(map:WorldIndex,state:State,today:string):State{
  let ranks=state.personRanks;
  for(const p of map.world.people){
    if(p.rankSchedule!==true)continue;
    const departed=p.service?.historicalOn!=null&&state.personService?.[p.id]?.serviceChoice==='resign';
    const history=departed?p.ranks.filter(r=>r.from>=p.service!.historicalOn!):p.ranks;
    const desired=ranksOn(map,history,today),old=state.personRanks[p.id]??{};
    const next={...old};
    // Preserve an in-play promotion that has superseded the recorded historical grade.
    for(const kind of new Set(p.ranks.map(r=>map.world.vocabularies.ranks.find(v=>v.id===r.rank)!.kind))){
      const held=old[kind];
      const authored=held===undefined||p.ranks.some(r=>r.rank===held.rankTerm&&r.from===held.rankSince);
      if(!authored)continue;
      if(desired[kind]===undefined)delete next[kind];else next[kind]=desired[kind]!;
    }
    if(JSON.stringify(old)!==JSON.stringify(next)){
      const ordered=Object.fromEntries(Object.keys(next).sort(strictCompare).map(k=>[k,next[k]!]));
      ranks={...ranks,[p.id]:ordered};
    }
  }
  return ranks===state.personRanks?state:{...state,personRanks:ranks};
}
