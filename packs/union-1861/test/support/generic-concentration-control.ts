/** Retired 5c4a9d83 history policy, retained only as a synthetic generic-policy regression control. */
import { readFileSync } from 'node:fs';
import { seatsWorld as load } from '../../../../packages/cli/src/seats-world.ts';
const policy=JSON.parse(readFileSync(new URL('./legacy-concentrations.json',import.meta.url),'utf8'));
export function seatsWorld(name:string):ReturnType<typeof load> {
  const loaded=load(name),world=loaded.world;
  return {...loaded,world:{...world,map:{...world.map,world:{...world.map.world,rules:{...world.map.world.rules,ruleSeats:{...world.map.world.rules.ruleSeats,principals:world.map.world.rules.ruleSeats.principals.map(row=>({...row,...policy[row.faction]}))}}}}}};
}
