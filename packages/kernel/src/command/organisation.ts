/** The army commander's persistent formation posts (0108). */
import { CommandError, factionOfPost, heldPost, sideOfPerson, type PostState } from './command.ts';
import type { ForceBlockId, PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { WorldIndex } from '../world/index.ts';
import type { OrganisationPost } from '../world/organisation.ts';

export function formationPost(map: WorldIndex, post: PostId): boolean {
  return (map.world.organisationTemplates??[]).some(t=>t.posts.some(p=>p.id===post));
}

export function regroupAssignments(state: State, sources: readonly ForceBlockId[], assignments: readonly { readonly block: ForceBlockId; readonly post: PostId | null }[]): State {
  const table={...state.forceAssignments};
  for(const id of sources)delete table[id];
  for(const a of assignments){if(a.post!==null&&state.postStates[a.post]===undefined)throw new CommandError(['unknown organisation post']);table[a.block]=a.post;}
  return {...state,forceAssignments:table};
}

export function openFormationPost(map: WorldIndex, state: State, army: PostId, spec: OrganisationPost, holder: PersonId | null): State {
  if(state.postStates[spec.id]!==undefined)return state;
  const parent=state.postStates[spec.parent];
  if(parent===undefined || factionOfPost(map,state,spec.parent)!==factionOfPost(map,state,army))throw new CommandError(['invalid formation parent']);
  const kind=map.world.vocabularies.postKinds.find(k=>k.id===spec.kind);
  if(kind===undefined||kind.temporary||kind.creatable!=='directive')throw new CommandError(['formation kind must persist and be created by its commander']);
  if(holder!==null&&(heldPost(state,holder)!==null||sideOfPerson(map,state,holder)!==factionOfPost(map,state,army)))throw new CommandError(['ineligible formation holder']);
  const post:PostState={...parent,postName:spec.name,postKind:spec.kind,postParent:spec.parent,postHolder:holder,postActing:false,postOperation:null,postInstallation:null,postIntelChief:null,postLinks:[],postScheduled:[],postStandingOrders:[]};
  return {...state,postStates:{...state.postStates,[spec.id]:post}};
}

/** A later local act closes a division without deleting its formations or its officers. */
export function closeFormationPost(map:WorldIndex,state:State,army:PostId,post:PostId):State{
  const p=state.postStates[post];
  if(!formationPost(map,post)||p===undefined||p.postParent!==army)throw new CommandError(['not this army\'s division']);
  const posts={...state.postStates};delete posts[post];
  for(const [id,child] of Object.entries(posts))if(child.postParent===post)posts[id as PostId]={...child,postParent:army};
  const assignments={...state.forceAssignments};
  for(const id of Object.keys(assignments) as ForceBlockId[])if(assignments[id]===post)assignments[id]=army;
  return {...state,postStates:posts,forceAssignments:assignments};
}
