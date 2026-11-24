/** Command owns authored requests and answers; their reports still have to travel. */
import type { MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { DirectiveReservation, DirectiveResponse } from '../directive.ts';
import type { State } from '../root-state.ts';
import type { AllocationInstrument, AllocationScope } from '../world/allocation.ts';
export type { ForceNeed } from '../knowledge/force-need.ts';
import type { ForceNeed, ForceRequestModeAuthority } from '../knowledge/force-need.ts';
import { stampRootModes } from './root-modes.ts';
import type { SeatsWorld } from '../seats/world.ts';

export type ForceAction = 'grant' | 'partial' | 'offer' | 'defer' | 'refuse' | 'no_eligible_force' | 'relay' | 'ask_governor' | 'order_subordinate';
export const FORCE_MODES_UNAVAILABLE = 'modes_unavailable';
/** The holder's own mission shortfall in men with and without the proposed sending. */
export type RetentionShortfalls = readonly [keep:number|null,send:number|null];

const undeterminedRetention={clause:'detail',subject:'organisation',
 grounds:{groundKind:'course_judgment',groundReference:'retention_comparison_undetermined'},
 treatment:'protest',effect:'statement',reservationProvenance:'planner_evaluation',knowledge:'unknown'} as const satisfies DirectiveReservation;

/** State the unavailable comparison without changing the holder's actual compliance. */
export function reserveUndeterminedRetention(answer:DirectiveResponse):DirectiveResponse {
 return {...answer,reservations:retentionReservations(answer.reservations),declaredReservations:retentionReservations(answer.declaredReservations)};
}

export function retentionReservations(existing:readonly DirectiveReservation[]=[]):readonly DirectiveReservation[] {
 return existing.some(r=>r.grounds.groundReference===undeterminedRetention.grounds.groundReference)?existing:[...existing,undeterminedRetention];
}
/** Authored terms as an immutable packet, not another writable World record. */
export type ForceAssignment = readonly [id:string,issuer:PersonId,issuerPost:PostId,from:PostId,to:PostId,destination:RegionId,scope:AllocationScope,quantity:number,mandate:string,modes:readonly ('land'|'rail'|'river'|'sea')[],voluntary?:true|null,subordinate?:PersonId];
export function assignmentPacket(p:AllocationInstrument):ForceAssignment {
 if(p.issuerPost===null || p.quantity==='all' || p.mandate===null)throw new RangeError('own force assignment must be finite and held');
 if(!p.modes?.length)throw new RangeError('own force assignment requires declared modes');
 const packet= [p.id,p.issuer,p.issuerPost,p.from,p.to,p.destination,p.scope,p.quantity,p.mandate,p.modes] as const;
 if(p.subordinateOrder===true) {
  if(p.recipient===undefined||p.scope.kind!=='cohort')throw new RangeError('subordinate order requires a recipient and a cohort');
  return [...packet,null,p.recipient];
 }
 return p.voluntary===true?[...packet,true]:packet;
}
export function assignmentPaper(packet:ForceAssignment):AllocationInstrument {
 const [id,issuer,issuerPost,from,to,destination,scope,quantity,mandate,modes,voluntary,subordinate]=packet;
 return {id,issuer,issuerPost,from,to,destination,scope,quantity,mandate,modes,...(voluntary===true?{voluntary}:{}),
  ...(subordinate===undefined?{}:{subordinateOrder:true as const}),source:`[I] ${subordinate===undefined?'0133':'0134'} logged commander choice; no historical paper`,
  fromDate:'0001-01-01',kind:'assignment',recipient:subordinate??issuer,words:'Received mission force need',letter:{namespace:'force-choice',key:id,revision:1}};
}
export interface ForceAnswer {
 readonly fansDay: number;
 readonly fansPerson: PersonId;
 readonly fansPost: PostId;
 /** Author of the request that this person actually read. */
 readonly fansIssuer?: PersonId;
 readonly fansTo?: PostId;
 readonly fansEvidence?: MessageId;
 /** The mandate and modes stated in the governor request, then carried by the voluntary undertaking. */
 readonly fansModeAuthority?: ForceRequestModeAuthority;
 readonly fansAction: ForceAction;
 readonly fansReasons: readonly string[];
 readonly fansScore: readonly [retain:number|null,after:number|null,support:number|null];
 readonly fansRetention?: RetentionShortfalls;
 readonly fansAssignment?: ForceAssignment;
}
export interface ForceRequest {
 readonly freqId: MessageId;
 readonly freqNeed: ForceNeed;
 readonly freqDay: number;
 readonly freqTo: PostId;
 readonly freqAnswers: readonly ForceAnswer[];
}
export function putForceRequest(state:State, row:ForceRequest):State {
 return {...state,forceRequests:{...state.forceRequests,[row.freqId]:row}};
}
export function allocationPaper(world:SeatsWorld,state:State,id:string) {
 const paper=world.map.world.rules.allocationInstruments?.find(p=>p.id===id)??dynamicPaper(state,id);
 return paper===undefined?undefined:stampRootModes(world,paper);
}

function dynamicPaper(state:State,id:string):AllocationInstrument|undefined {
 const match=forceAssignmentFor(state,id);
 return match===undefined?undefined:assignmentPaper(match.packet);
}

export function forceAssignmentFor(state:State,id:string) {
 for(const request of Object.values(state.forceRequests??{})) {
  const answer=request.freqAnswers.find(a=>a.fansAssignment?.[0]===id);
  if(answer!==undefined)return {request,answer,packet:answer.fansAssignment!};
 }
 return undefined;
}
