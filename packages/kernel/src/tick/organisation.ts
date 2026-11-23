/** Local organisation, triggered by actual unorganised troops, never an order date. */
import { strictCompare } from '../compare.ts';
import { allCommandedBlocks, appointHolder, commandedBlocks, factionOfPost, heldPost, sideOfPerson } from '../command/command.ts';
import { openFormationPost, regroupAssignments } from '../command/organisation.ts';
import { regroupForces, type LotGroup } from '../forces/regroup.ts';
import { toId, type ForceBlockId, type PersonId, type PostId } from '../ids.ts';
import { regroupLocations } from '../movement/regroup.ts';
import type { State } from '../root-state.ts';
import type { OrganisationTemplate } from '../world/organisation.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { sendReport, type TickContext } from './context.ts';
import { partitionOfferReceipts } from '../command/offers.ts';

/** The transaction uses local copies; any owner rejection leaves the input untouched. */
export function repartition(state:State,sources:readonly ForceBlockId[],groups:readonly LotGroup[],posts:readonly (PostId|null)[]):State {
  let next=regroupLocations(state,sources,groups);
  next=regroupForces(next,sources,groups);
  next=regroupAssignments(next,sources,groups.map((g,i)=>({block:g.block,post:posts[i]!})));
  return partitionOfferReceipts(next,state,sources,groups);
}

/** Planning bundles [I]. Opaque historical aggregates cannot be partitioned into regiments. */
export function bundleRaised(world:SeatsWorld,state:State,created:readonly ForceBlockId[]):State {
  const size=world.map.world.rules.recruitment.planningRegiments;
  if(size===undefined)return state;
  let next=state;
  for(const id of created){
    const b=next.forceBlockStates[id];if(b===undefined||b.fbLots.length<=size)continue;
    const bins=new Map<string,string[]>();
    for(const l of b.fbLots){const e=l.lotService;const key=`${l.lotArm}:${e?.enlMusterDay}:${e?.enlEndsDay}:${e?.enlTermUnknown===true}`;bins.set(key,[...(bins.get(key)??[]),l.lotId]);}
    const groups:LotGroup[]=[];
    for(const lots of bins.values())for(let i=0;i<lots.length;i+=size){
      const block=groups.length===0?id:toId('forceBlock',`${id}.bundle.${groups.length+1}`);
      groups.push({block,lots:lots.slice(i,i+size),name:b.fbName});
    }
    next=repartition(next,[id],groups,groups.map(()=>next.forceAssignments[id]??null));
  }
  return next;
}

export type OrganisationFailure='no_commander'|'no_present_lots'|'invalid_template'|'owner_refused';
export interface OrganisationResult { readonly state:State; readonly problem:OrganisationFailure|null; readonly reason?:string; readonly absent:readonly string[]; readonly substitutions:readonly {readonly expected:string;readonly actual:string}[]; readonly opened:readonly PostId[]; }

/** Eligibility does not turn an unknown commission or opening kind into an officer. */
function eligibleHolder(world:SeatsWorld,state:State,army:PostId,id:PersonId|null):boolean{
  if(id===null)return false;
  const p=world.map.world.people.find(p=>p.id===id);
  const side=factionOfPost(world.map,state,army);
  const kinds=world.map.world.rules.ruleSeats.principals.find(r=>r.faction===side)?.appointKinds.land??[];
  return p!==undefined&&(p.invented||kinds.includes(p.kind)||Object.keys(state.personRanks[id]??{}).length>0)&&sideOfPerson(world.map,state,id)===side&&heldPost(state,id)===null&&(state.personStatus[id]?.statusKind??'serving')==='serving';
}

export function organise(world:SeatsWorld,state:State,template:OrganisationTemplate):OrganisationResult{
  const fail=(problem:OrganisationFailure):OrganisationResult=>({state,problem,absent:[],substitutions:[],opened:[]});
  if(!world.map.world.organisationTemplates?.includes(template))return fail('invalid_template');
  const army=state.postStates[template.army], commander=army?.postHolder;
  if(army===undefined||commander==null||(state.personStatus[commander]?.statusKind??'serving')!=='serving')return fail('no_commander');
  let next=state;
  const opened:PostId[]=[];
  for(const p of template.posts){
    if(state.postStates[p.id]?.postHolder===null&&p.commander!==null&&allCommandedBlocks(world.map,state,p.id).length>0&&eligibleHolder(world,next,template.army,p.commander)){
      next=appointHolder(world.map,next,p.id,p.commander);opened.push(p.id);
    }
  }
  const region=army.postSeat;
  const committed=new Set(Object.values(state.planRecords).flatMap(p=>p.planDraft?.draftCandidates.flatMap(c=>c.candAxes.flatMap(a=>a.axisBlocks))??[]));
  const sources=commandedBlocks(state,template.army).filter(id=>{
    const b=state.forceBlockStates[id]!,l=state.forceLocations[id];
    return !committed.has(id)&&!Object.values(state.forceBlockStates).some(child=>child.fbParent===id)&&!Object.values(state.operationRecords).some(op=>op.opEndDay===null&&op.opAxes.some(axis=>axis.oaxBlocks.includes(id)))&&b.fbKind==='block'&&b.fbSurrenderedDay===null&&l?.locRegion===region&&l.locMarch===null&&l.locAboard===null&&state.forceJoins[id]===undefined&&b.fbLots.some(x=>x.lotRegiment!==null);
  });
  if(sources.length===0)return opened.length===0?fail('no_present_lots'):{state:next,problem:null,absent:[],substitutions:[],opened};
  const all=sources.flatMap(id=>state.forceBlockStates[id]!.fbLots);
  const used=new Set<string>(),groups:LotGroup[]=[],posts:PostId[]=[],absent:string[]=[];
  try{
    for(const brigade of template.brigades){
      if(brigade.post===template.army||template.posts.some(p=>p.parent===brigade.post))continue;
      const lots=all.filter(l=>l.lotRegiment!==null&&brigade.regiments.includes(l.lotRegiment)&&!used.has(l.lotId));
      for(const id of brigade.regiments)if(!lots.some(l=>l.lotRegiment===id))absent.push(id);
      if(lots.length===0)continue;
      // A sourced brigade can include several arms; each arm/location/service remains a separate moving block.
      const spec=template.posts.find(p=>p.id===brigade.post);if(spec===undefined)return fail('invalid_template');
      const path=[];let current=spec;
      while(next.postStates[current.id]===undefined){path.unshift(current);if(current.parent===template.army)break;const parent=template.posts.find(p=>p.id===current.parent);if(parent===undefined)return fail('invalid_template');current=parent;if(path.length>template.posts.length)return fail('invalid_template');}
      for(const p of path){
        const named=p.commander;
        const eligible=(id:PersonId|null)=>eligibleHolder(world,next,template.army,id);
        const generated=named===null&&!p.identityHeld?world.map.world.people.filter(x=>x.invented&&eligible(x.id)).sort((a,b)=>strictCompare(a.id,b.id))[0]?.id??null:null;
        const holder=eligible(named)?named:generated;
        // Divisions need an eligible holder; a sourced but held brigade identity opens vacant.
        if(p.id!==brigade.post&&holder===null)continue;
        const actualParent=next.postStates[p.parent]===undefined?template.army:p.parent;
        next=openFormationPost(world.map,next,template.army,{...p,parent:actualParent},holder);opened.push(p.id);
      }
      const bins=new Map<string,string[]>();
      for(const l of lots){used.add(l.lotId);const source=sources.find(id=>state.forceBlockStates[id]!.fbLots.includes(l))!;const b=state.forceBlockStates[source]!;const key=`${b.fbDepartment}:${l.lotArm}:${l.lotService?.enlMusterDay}:${l.lotService?.enlEndsDay}:${l.lotService?.enlTermUnknown===true}`;bins.set(key,[...(bins.get(key)??[]),l.lotId]);}
      for(const members of bins.values()){
        let n=1,id=toId('forceBlock',`organised.${brigade.post}.${n}`);while(next.forceBlockStates[id]!==undefined||groups.some(g=>g.block===id))id=toId('forceBlock',`organised.${brigade.post}.${++n}`);
        groups.push({block:id,lots:members,name:spec.name});posts.push(brigade.post);
      }
    }
    if(groups.length===0)return opened.length===0?fail('no_present_lots'):{state:next,problem:null,absent:[],substitutions:[],opened};
    for(const id of sources){const lots=state.forceBlockStates[id]!.fbLots.filter(l=>!used.has(l.lotId));if(lots.length>0){groups.push({block:id,lots:lots.map(l=>l.lotId),name:state.forceBlockStates[id]!.fbName});posts.push(template.army);}}
    next=repartition(next,sources,groups,posts);
  }catch(error){return {...fail('owner_refused'),reason:error instanceof Error?error.message:'owner refused the partition'};}
  return {state:next,problem:null,absent:absent.sort(strictCompare),substitutions:[],opened};
}

export function organisationPhase(ctx:TickContext,start:State):State{
  let state=start;
  for(const template of ctx.world.map.world.organisationTemplates??[]){
    const result=organise(ctx.world,state,template);if(result.problem!==null)continue;
    state=result.state;
    const holder=state.postStates[template.army]!.postHolder!,side=factionOfPost(ctx.world.map,state,template.army);if(side===null)continue;
    const common={reportType:'wire-dispatch' as const,reportSubtype:null,reportAuthor:holder,reportAuthorPost:template.army,reportDay:ctx.day,reportHour:null,reportAdvice:null,reportAnswers:null};
    for(const post of result.opened){const p=state.postStates[post]!;sendReport(ctx,state,{body:{...common,reportSubjectKind:'post',reportSubjectId:post,reportClaims:[{claimKind:'organisation-post',claimRegion:p.postSeat,claimToken:p.postParent,claimCommander:p.postHolder,claimValue:1,claimConfidence:1000}]},truth:{truthTerms:[],truthTrimmed:[]},to:ctx.world.faction(side).principal,tag:`organisation.${post}`});}
    sendReport(ctx,state,{body:{...common,reportSubjectKind:'post',reportSubjectId:template.army,reportClaims:result.absent.map(id=>({claimKind:'organisation-absence' as const,claimRegion:null,claimToken:id,claimValue:0,claimConfidence:1000}))},truth:{truthTerms:[],truthTrimmed:[]},to:ctx.world.faction(side).principal,tag:`organisation-return.${template.id}`});
  }
  return state;
}
