import { activeMandate, inSubtree, mandateAt, mayCommit } from '../command/authority.ts';
import { commandedBlocks, factionOfPost } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { State } from '../root-state.ts';
import type { OnwardAssignment } from '../world/assignments.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { letterKey } from '../world/letters.ts';
import { seatIdFor } from './seats.ts';
import { senderFor } from './sender.ts';
import type { SeatsWorld } from './world.ts';

export function assignmentLetter(paper: OnwardAssignment) {
  return {namespace:`assignment.${paper.issuer}`,key:paper.id,revision:1};
}

export function receivedRegiment(state: State, paper: OnwardAssignment, block: ForceBlockId, whole = true): boolean {
  const force = state.forceBlockStates[block];
  if (state.forceAssignments[block] !== paper.from || force?.fbKind !== 'block' ||
    force.fbSurrenderedDay !== null || force.fbLots.length === 0) return false;
  const matches=force.fbLots.map(lot => {
    if (lot.lotGenerated || lot.lotRegiment !== paper.regiment || lot.lotMen === 0 || lot.lotService?.enlCallId !== paper.call) return false;
    const offer = state.neutralOffers?.[lot.lotService.enlCall];
    return offer?.offerCallId === paper.call && offer.offerReceived.includes(block);
  });
  return whole ? matches.every(Boolean) : matches.some(Boolean);
}

export function assignmentAuthority(world: SeatsWorld, state: State, paper: OnwardAssignment, block: ForceBlockId, day: number, order?: MessageId) {
  const authority = mandateAt(state,paper.from,paper.mandate);
  if (authority === undefined || !activeMandate(world.map,state,authority,day)) return undefined;
  const grant = authority.authorityGrant;
  const side = factionOfPost(world.map,state,paper.from);
  const region = state.forceLocations[block]?.locRegion;
  if (grant.mandateHolder !== paper.issuer || !grant.mandateActions.includes('assign') ||
    !inSubtree(state,paper.to,paper.from) || !grant.mandateRecipients.some(p => inSubtree(state,paper.to,p)) ||
    region === undefined || !grant.mandateRegions.includes(region) || !grant.mandateRegions.includes(paper.destination) ||
    side === null || factionOfPost(world.map,state,paper.to) !== side ||
    !mayCommit(world.map,state,authority,paper.from,[block],order ?? true)) return undefined;
  return authority;
}

export function assignmentOptions(world: SeatsWorld, state: State, person: PersonId, day: number) {
  const papers = world.map.world.rules.onwardAssignments?.filter(p => p.issuer === person &&
    state.postStates[p.from]?.postHolder === person && p.fromDate <= formatIsoDate(dateOfDay(world.start.startDate,day)));
  if (papers === undefined || papers.length === 0) return [];
  const seat = seatIdFor(person);
  const knowledge = knowledgeOf(state,seat);
  return papers.flatMap(paper => {
    const sender = senderFor(world,state,seat,undefined,undefined,paper.from);
    if ((paper.address!=='office' && paper.recipient===undefined && sender?.holder(paper.to) == null) || knowledge.knownDoctrineDispatches?.some(d =>
      letterKey(d.dispatchLetter) === letterKey(assignmentLetter(paper)))) return [];
    const blocks = commandedBlocks(state,paper.from).filter(b => receivedRegiment(state,paper,b,false));
    if (blocks.length !== 1) return [];
    const block = blocks[0]!;
    const loc = state.forceLocations[block];
    if (loc?.locMarch !== null || loc?.locAboard !== null || state.forceJoins[block] !== undefined) return [];
    const authority = assignmentAuthority(world,state,paper,block,day);
    return authority === undefined ? [] : [{id:`assignment:${paper.id}`,kind:'assignment' as const,paper,block,authority}];
  }).sort((a,b) => strictCompare(a.id,b.id));
}
