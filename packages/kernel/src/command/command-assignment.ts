/** Command alone opens a read assignment and maintains its declared troop lineage. */
import { appointHolder, createTemporaryPost, declaredAppointment, factionOfPost, heldPost, relieveHolder, sideOfPerson } from './command.ts';
import { activeMandate, inSubtree, mandateAt } from './authority.ts';
import { regroupAssignments } from './organisation.ts';
import { pendingOffer } from './offers.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { MandatePaper } from '../world/mandates.ts';

export function canReceiveCommand(world: SeatsWorld, state: State, paper: MandatePaper): boolean {
 const g=paper.grant, a=paper.assignment;
 if(a===undefined || g.mandateParent!==null || g.mandateRevoke || (state.personStatus[g.mandateHolder]?.statusKind??'serving')!=='serving')return false;
 const template=world.start.temporaryPosts.find(p=>p.id===g.mandatePost);
 const side=template===undefined?null:state.departmentFactions[template.department];
 const prior=Object.keys(state.postStates).filter(id=>state.postStates[id as PostId]!.postHolder===g.mandateHolder) as PostId[];
 const occupant=state.postStates[g.mandatePost]?.postHolder;
 if(template===undefined || template.holder!==g.mandateHolder || side!==sideOfPerson(world.map,state,g.mandateHolder) ||
  prior.some(p=>p!==g.mandatePost && p!==a.replaces && !a.concurrentWith?.includes(p)) ||
  (occupant!==undefined && occupant!==null && occupant!==g.mandateHolder))return false;
 const commands=[...(a.commands??[]),...(a.intake??[])];
 if(commands.some(id=>{
  const post=state.postStates[id];
  const declared=world.start.temporaryPosts.find(p=>p.id===id);
  const department=post?.postDepartment??declared?.department;
  return department!==template.department || (g.mandateIssuerPost!==null &&
   (post===undefined?declared?.parent!==g.mandateIssuerPost:!inSubtree(state,id,g.mandateIssuerPost)));
 }))return false;
 if(state.postStates[g.mandatePost]===undefined && declaredAppointment(world.map,state,world.start.temporaryPosts,g.mandatePost,side!)===undefined)return false;
 return true;
}

export function receiveCommand(world: SeatsWorld, state: State, paper: MandatePaper): State {
 if(!canReceiveCommand(world,state,paper))return state;
 const g=paper.grant;
 let next=state;
 const prior=paper.assignment?.replaces;
 if(prior!==undefined && next.postStates[prior]?.postHolder===g.mandateHolder)next=relieveHolder(next,prior);
 if(next.postStates[g.mandatePost]===undefined)next=createTemporaryPost(world.map,next,{...declaredAppointment(world.map,next,world.start.temporaryPosts,g.mandatePost,sideOfPerson(world.map,next,g.mandateHolder)!)!,holder:null});
 // This exception comes only from a separately received read assignment; ordinary appointments still allow one post.
 if(heldPost(next,g.mandateHolder)!==null && paper.assignment?.concurrentWith!==undefined)
  next={...next,postStates:{...next.postStates,[g.mandatePost]:{...next.postStates[g.mandatePost]!,postHolder:g.mandateHolder}}};
 else next=appointHolder(world.map,next,g.mandatePost,g.mandateHolder);
 for(const id of paper.assignment?.commands??[]) {
  if(next.postStates[id]===undefined) {
   const spec=declaredAppointment(world.map,next,world.start.temporaryPosts,id,factionOfPost(world.map,next,g.mandatePost)!);
   if(spec===undefined)continue;
   next=createTemporaryPost(world.map,next,{...spec,holder:null});
  }
  const p=next.postStates[id]!;
  if(factionOfPost(world.map,next,id)!==factionOfPost(world.map,next,g.mandatePost) || inSubtree(next,g.mandatePost,id))continue;
  next={...next,postStates:{...next.postStates,[id]:{...p,postParent:g.mandatePost}}};
 }
 return next;
}

/** Administrative receipt stays with its office; only troops physically in the received territorial scope pass. */
export function commandIntake(world: SeatsWorld, start: State, day: number): State {
 let state=start;
 for(const paper of world.map.world.rules.mandates??[]) {
  if(paper.assignment?.intake===undefined)continue;
  const g=paper.grant, enacted=mandateAt(state,g.mandatePost,g.mandateKey);
  if(enacted===undefined || !activeMandate(world.map,state,enacted,day))continue;
  const blocks=(Object.keys(state.forceAssignments).sort(strictCompare) as ForceBlockId[]).filter(id=>{
   const post=state.forceAssignments[id];
   const loc=state.forceLocations[id];
   return post!=null && paper.assignment!.intake!.includes(post) && loc!==undefined && loc.locMarch===null && loc.locAboard===null &&
    state.forceJoins[id]===undefined && pendingOffer(state,id)===undefined && g.mandateRegions.includes(loc.locRegion) &&
    state.forceBlockStates[id]?.fbDepartment===state.postStates[g.mandatePost]?.postDepartment &&
    factionOfPost(world.map,state,post)===factionOfPost(world.map,state,g.mandatePost);
  });
  state=regroupAssignments(state,[],blocks.map(block=>({block,post:g.mandatePost})));
 }
 return state;
}
