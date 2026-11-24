/** Historical plan enclosure, not a live planner cache. No current State is consulted when replaying an enclosure. */
import type { PlanPaper } from '../knowledge/plan-paper.ts';
import { buildControlIndex } from '../control-index/control-index.ts';
import type { PlannerInput } from './context.ts';
import type { DraftSet, PlanCandidate } from './types.ts';
import type { SeatsWorld } from '../seats/world.ts';

export function enclosePlan(input: PlannerInput, set: DraftSet, chosen: PlanCandidate): PlanPaper {
  return {
    paperPost: input.post, paperGoal: input.goal, paperDraft: set, paperChosen: chosen,
    paperProfile: [input.profile.person,input.profile.boldness,input.profile.demand,input.profile.riskWeight,input.profile.supplyCare,input.profile.gloryWeight,input.profile.concentrationDays,input.profile.pauseDays,input.profile.maxAxes,input.profile.competence],
    paperForces: input.forces.map(f => [f.id,f.post,f.region,f.kind,f.naval,f.arm,f.strength,f.storesDays,f.storesAssumed,f.aboard]),
    ...(input.forces.some(f=>f.unknownStrength) ? {paperUnknownForces:input.forces.filter(f=>f.unknownStrength).map(f=>f.id)} : {}),
    paperPosts: input.posts.map(p => [p.id,p.holder,p.parent,p.region,p.seat,p.holderWillingness]),
    paperBeliefs: [...input.beliefs], paperWorks: [...input.works], paperObstructions: [...input.obstructions],
    ...(input.beliefDetails?.size ? {paperBeliefDetails:[...input.beliefDetails]} : {}),
    paperControl: Object.fromEntries([...input.ground.index.holdings].map(([region, holding]) => [region, Object.fromEntries(holding.tracedBy.map(faction => [faction,input.ground.index.threshold + (holding.holder === faction && holding.tracedBy.length > 1 ? 1 : 0)]))])),
    paperSupplied: [...input.supply.paths.keys()], paperNetwork: { ...input.ground.network, obstructions: [] }, paperMonth: input.ground.month,
    ...(input.notes?.length ? { paperNoteBasis: { notes: input.notes, scoreWeight: input.noteScoreWeight ?? 0 } } : {}),
  };
}

export function inputFromPaper(world: SeatsWorld, paper: PlanPaper): PlannerInput {
  const [person,boldness,demand,riskWeight,supplyCare,gloryWeight,concentrationDays,pauseDays,maxAxes,competence] = paper.paperProfile;
  return {
    ground: { map: world.map, index: buildControlIndex(world.map, paper.paperControl), network: paper.paperNetwork, month: paper.paperMonth },
    supply: { paths: new Map(paper.paperSupplied.map(region => [region, null])) },
    faction: paper.paperDraft.draftFaction, beliefs: new Map(paper.paperBeliefs), works: new Map(paper.paperWorks), obstructions: new Map(paper.paperObstructions),
    ...(paper.paperBeliefDetails === undefined ? {} : {beliefDetails:new Map(paper.paperBeliefDetails)}),
    forces: paper.paperForces.map(([id,post,region,kind,naval,arm,strength,storesDays,storesAssumed,aboard])=>({id,post,region,kind,naval,arm,strength,storesDays,storesAssumed,aboard,...(paper.paperUnknownForces?.includes(id)?{unknownStrength:true as const}:{})})),
    posts: paper.paperPosts.map(([id,holder,parent,region,seat,holderWillingness])=>({id,holder,parent,region,seat,holderWillingness})),
    post: paper.paperPost, profile: {person,boldness,demand,riskWeight,supplyCare,gloryWeight,concentrationDays,pauseDays,maxAxes,competence}, goal: paper.paperGoal,
    rules: world.map.world.rules.planner, assaultMargin: world.rules.people.traits.assaultMargin,
    reinforceShare: { timid: world.rules.people.compliance.reinforceShareTimid, bold: world.rules.people.compliance.reinforceShareBold },
    day: paper.paperDraft.draftDay, bombardment: world.map.world.rules.combat.bombardment,
    ...(paper.paperNoteBasis === undefined ? {} : { notes: paper.paperNoteBasis.notes, noteScoreWeight: paper.paperNoteBasis.scoreWeight }),
  };
}
