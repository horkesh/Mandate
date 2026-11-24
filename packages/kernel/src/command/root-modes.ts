/** 0137 [I]: the national root holds the modes its declared grants convey.
 * This reads immutable declarations only, never a subordinate's received authority.
 */
import { toId, type PersonId } from '../ids.ts';
import type { ForceRequestModeAuthority } from '../knowledge/force-need.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { AllocationInstrument } from '../world/allocation.ts';

export function rootModes(world:SeatsWorld,person:PersonId):AllocationInstrument['modes'] {
  if(!world.start.factions.some(f=>f.principal===person))return undefined;
  const conveyed=new Set((world.map.world.rules.mandates??[]).flatMap(({grant:g})=>
    g.mandateIssuer===person && g.mandateIssuerPost===null && g.mandateParent===null && !g.mandateRevoke?g.mandateModes:[]));
  return (['land','rail','river','sea'] as const).filter(mode=>conveyed.has(mode));
}

export function rootModeAuthority(world:SeatsWorld,person:PersonId):ForceRequestModeAuthority|undefined {
  const modes=rootModes(world,person);
  // Derived provenance for the union, not an invented historical self-grant.
  return modes?.length?[toId('message',`root-modes.${person}`),modes]:undefined;
}

export function stampRootModes(world:SeatsWorld,paper:AllocationInstrument):AllocationInstrument {
  if(paper.modes!==undefined)return paper; // Read terms bind, including a restriction.
  const modes=rootModes(world,paper.issuer);
  return modes===undefined?paper:{...paper,modes};
}
