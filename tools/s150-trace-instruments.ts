/** Replay the retained S150 log and observe State boundaries. This runner never creates new commands. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { seatsWorld } from '../packages/cli/src/seats-world.ts';
import { authorityBlocks, activeMandate, currentMandates } from '../packages/kernel/src/command/authority.ts';
import { allocationAuthority, allocationSelection, scopeMatches } from '../packages/kernel/src/command/allocation.ts';
import type { AllocationRecord } from '../packages/kernel/src/command/allocation.ts';
import type { NeutralOffer } from '../packages/kernel/src/command/offers.ts';
import { createDerivedMapCache } from '../packages/kernel/src/control-index/derived.ts';
import type { RegimentLot } from '../packages/kernel/src/forces/lots.ts';
import type { ForceBlockId } from '../packages/kernel/src/ids.ts';
import { knowledgeOf } from '../packages/kernel/src/knowledge/knowledge.ts';
import { paperReadiness } from '../packages/kernel/src/knowledge/papers.ts';
import { checkedLog } from '../packages/kernel/src/log/log.ts';
import type { TransitMessage } from '../packages/kernel/src/messages/transit.ts';
import type { OrderResponse } from '../packages/kernel/src/proxy/responses.ts';
import type { State } from '../packages/kernel/src/root-state.ts';
import type { ServiceReceipt } from '../packages/kernel/src/command/service-receipt.ts';
import { availableAllocations } from '../packages/kernel/src/seats/allocation.ts';
import { seatIdFor } from '../packages/kernel/src/seats/seats.ts';
import { canonicalHash } from '../packages/kernel/src/serialize/hash.ts';
import { createState } from '../packages/kernel/src/tick/setup.ts';
import { tick } from '../packages/kernel/src/tick/tick.ts';
import { createViewCache } from '../packages/kernel/src/view/view.ts';
import type { AllocationInstrument } from '../packages/kernel/src/world/allocation.ts';
import { dateOfDay, formatIsoDate } from '../packages/kernel/src/world/calendar.ts';

const capture = 'runs/s150/measurement';
const logFile = 'runs/s150/optimisation-original-log.json';
const smoke = process.argv.includes('--smoke');
const through = smoke ? 2 : 140;
const out = process.argv.find(a=>a.startsWith('--out='))?.slice(6) ?? `runs/s150-trace/${smoke ? 'smoke' : 'before'}`;
mkdirSync(out,{recursive:true});
const put = (name:string, data:unknown) => writeFileSync(`${out}/${name}.json`,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
const receipt = (file:string) => ({file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
const parse = (file:string) => JSON.parse(readFileSync(file,'utf8'));

const retained = parse(`${capture}/summary.json`) as {worldHash:string;initialHash:string;turns:{turn:number;hash:string}[]};
const log = checkedLog(parse(logFile));
const {world,worldHash,setup}=seatsWorld('union-1861');
const paperById=new Map((world.map.world.rules.allocationInstruments??[]).map(p=>[p.id,p]));
assert.equal(paperById.size,16);
assert.equal(worldHash,retained.worldHash);
const expectedHashes=new Map(retained.turns.map(t=>[t.turn,t.hash]));
let state=createState(world,setup);
assert.equal(canonicalHash(state),retained.initialHash);
put('started',{through,worldHash,inputReceipts:[receipt(logFile),receipt(`${capture}/summary.json`),receipt(`${capture}/causal-events.jsonl`)]});

interface Place {
  readonly block:ForceBlockId;
  readonly holder:string|null;
  readonly department:string;
  readonly post:string|null;
  readonly side:string|null;
  readonly region:string|null;
  readonly aboard:string|null;
  readonly march:State['forceLocations'][ForceBlockId]['locMarch'];
  readonly join:State['forceJoins'][ForceBlockId]|null;
  readonly surrenderedDay:number|null;
  readonly facts:RegimentLot;
}
interface Location {day:number;phase:string}
interface LotChange extends Location {kinds:string[];before:Place|null;after:Place|null}
type Observed<T> = Location & {row:T;lots:string[]};
type Wire = {day:number;kind:'dispatch'|'paper_receipt';message:TransitMessage};
type Gate = ReturnType<typeof gateOf>;
const lotEvents=new Map<string,LotChange[]>();
const allocations=new Map<string,Observed<AllocationRecord>[]>();
const offers=new Map<string,Observed<NeutralOffer>[]>();
const stationReceipts=new Map<string,Observed<ServiceReceipt>[]>();
const answers=new Map<string,OrderResponse[]>();
const firstSelection=new Map<string,unknown>();
const gates=new Map<string,{day:number;gate:Gate}[]>();
const wires:Wire[]=[];
const hashes:{day:number;hash:string;commands:number}[]=[];
const phases=new Set<string>();
const tickSource=readFileSync('packages/kernel/src/tick/tick.ts','utf8').split(/\r?\n/);

function push<K,V>(map:Map<K,V[]>, key:K, value:V):void {
  const found=map.get(key);
  if(found===undefined)map.set(key,[value]);
  else found.push(value);
}

function places(at:State):Map<string,Place> {
  const rows=new Map<string,Place>();
  for(const [blockId,force] of Object.entries(at.forceBlockStates)) {
    const block=blockId as ForceBlockId, loc=at.forceLocations[block], post=at.forceAssignments[block]??null;
    for(const facts of force.fbLots) {
      assert(!rows.has(facts.lotId),`duplicate live lot ${facts.lotId}`);
      rows.set(facts.lotId,{block,holder:post===null?null:at.postStates[post]?.postHolder??null,department:force.fbDepartment,post,
        side:at.departmentFactions[force.fbDepartment]??null,region:loc?.locRegion??null,aboard:loc?.locAboard??null,
        march:loc?.locMarch??null,join:at.forceJoins[block]??null,surrenderedDay:force.fbSurrenderedDay,facts});
    }
  }
  return rows;
}

function changes(before:Place|null, after:Place|null, day:number):string[] {
  if(before===null)return [after?.facts.lotService?.enlMusterDay===day?'mustered':'appeared'];
  if(after===null)return [before.facts.lotService?.enlEndsDay!=null&&before.facts.lotService.enlEndsDay<=day?'expired_or_discharged':'removed'];
  const kinds:string[]=[];
  if(before.block!==after.block)kinds.push('partition_or_regroup');
  if(before.department!==after.department||before.side!==after.side)kinds.push('service_or_alignment_changed');
  if(before.post!==after.post)kinds.push('assignment_changed');
  if(before.holder!==after.holder)kinds.push('holder_changed');
  if(before.region!==after.region||before.aboard!==after.aboard)kinds.push('location_changed');
  if(before.march?.marchEdge!==after.march?.marchEdge||before.march?.marchStartDay!==after.march?.marchStartDay)kinds.push(after.march===null?'leg_ended':'leg_started');
  else if(before.march?.marchDoneMilli!==after.march?.marchDoneMilli)kinds.push('leg_progress');
  if(before.join!==after.join && JSON.stringify(before.join)!==JSON.stringify(after.join))kinds.push('journey_changed');
  if(before.surrenderedDay!==after.surrenderedDay)kinds.push('surrender_status_changed');
  if(before.facts!==after.facts) {
    if(before.facts.lotService!==after.facts.lotService && JSON.stringify(before.facts.lotService)!==JSON.stringify(after.facts.lotService))kinds.push('service_terms_changed');
    if(before.facts.lotRegiment!==after.facts.lotRegiment||before.facts.lotGenerated!==after.facts.lotGenerated)kinds.push('recorded_identity_changed');
    if(before.facts.lotMen!==after.facts.lotMen||before.facts.lotStragglers!==after.facts.lotStragglers)kinds.push('strength_changed');
  }
  return kinds;
}

function census(at:State,paper:AllocationInstrument) {
  const inSendingChain=new Set(authorityBlocks(at,paper.from));
  return [...places(at).values()].filter(l=>scopeMatches(l.facts,paper)).map(l=>({lot:l.facts.lotId,regiment:l.facts.lotRegiment,
    block:l.block,post:l.post,region:l.region,side:l.side,call:l.facts.lotService?.enlCallId??null,termEnd:l.facts.lotService?.enlEndsDay??null,
    inSendingChain:inSendingChain.has(l.block),offer:l.facts.lotService===null?null:at.neutralOffers?.[l.facts.lotService.enlCall]?.offerStatus??null,
    join:l.join,men:l.facts.lotMen}));
}

function gateOf(at:State,paper:AllocationInstrument,day:number) {
  const authority=paper.issuerPost===null?null:currentMandates(at,paper.issuerPost).find(a=>a.authorityGrant.mandateKey===paper.mandate)??null;
  return {
    available:availableAllocations(world,at,paper.issuer,day).some(p=>p.id===paper.id),
    papers:paperReadiness(paper.requiresPapers??[],knowledgeOf(at,seatIdFor(paper.issuer)),at.stateDay,world.rules.templates),
    issuerPostHolder:paper.issuerPost===null?null:at.postStates[paper.issuerPost]?.postHolder??null,
    issuerMandate:authority===null?null:{seen:authority.authoritySeenDay,active:activeMandate(world.map,at,authority,day),actions:authority.authorityGrant.mandateActions},
    issueAuthority:allocationAuthority(world,at,paper,day),
    sender:at.postStates[paper.from]?.postHolder??null,
    receiver:at.postStates[paper.to]?.postHolder??null,
  };
}

let previous:State|undefined;
let previousPlaces:Map<string,Place>|undefined;
let day=0;
function observe(next:State,phase:string) {
  phases.add(phase);
  const stamp={day,phase};
  if(previous===undefined||previous.forceBlockStates!==next.forceBlockStates||previous.forceLocations!==next.forceLocations||previous.forceAssignments!==next.forceAssignments||
    previous.forceJoins!==next.forceJoins||previous.postStates!==next.postStates||previous.departmentFactions!==next.departmentFactions) {
    const current=places(next);
    for(const id of new Set([...(previousPlaces?.keys()??[]),...current.keys()])) {
      const before=previousPlaces?.get(id)??null, after=current.get(id)??null;
      const kinds=previousPlaces===undefined?['opening']:changes(before,after,day);
      if(kinds.length)push(lotEvents,id,{...stamp,kinds,before,after});
    }
    previousPlaces=current;
  }
  if(previous?.allocationRecords!==next.allocationRecords)for(const [id,row] of Object.entries(next.allocationRecords??{})) {
    if(row===previous?.allocationRecords?.[id as AllocationRecord['allocOrder']])continue;
    push(allocations,id,{...stamp,row,lots:[...row.allocLots]});
    const paper=paperById.get(row.allocPaper);
    if(paper!==undefined&&!firstSelection.has(id)&&previous!==undefined) {
      firstSelection.set(id,{...stamp,basis:'State at the preceding observed phase boundary, not within the delivery batch',
        selection:allocationSelection(world,previous,paper,day,row.allocStrongest),matchingLots:census(previous,paper)});
    }
  }
  if(previous?.neutralOffers!==next.neutralOffers)for(const [id,row] of Object.entries(next.neutralOffers??{})) {
    if(row===previous?.neutralOffers?.[id as NeutralOffer['offerCall']])continue;
    const lots=row.offerBlocks.flatMap(b=>next.forceBlockStates[b]?.fbLots.map(l=>l.lotId)??[]);
    push(offers,id,{...stamp,row,lots});
  }
  if(previous?.serviceReceipts!==next.serviceReceipts)for(const [id,row] of Object.entries(next.serviceReceipts??{})) {
    if(row===previous?.serviceReceipts?.[id])continue;
    push(stationReceipts,id,{...stamp,row,lots:[...row.receiptLots]});
  }
  if(previous?.orderResponses!==next.orderResponses)for(const [key,row] of Object.entries(next.orderResponses)) {
    if(row!==previous?.orderResponses[key] && ['allocation','call','mandate','assignment','verb:transfer'].includes(row.respKind))push(answers,row.respOrder,row);
  }
  previous=next;
}

class PhaseLedger extends WeakSet<object> {
  override add(value:object):this {
    if('stateDay' in value&&'forceBlockStates' in value&&value!==previous) {
      const frames=[...new Error().stack!.matchAll(/[/\\]tick\.ts:(\d+):\d+/g)];
      const line=Number(frames.at(-1)?.[1]);
      observe(value as State,Number.isFinite(line)?`tick.ts:${line} ${tickSource[line-1]?.trim()}`:'opening');
    }
    return super.add(value);
  }
}

observe(state,'opening');
const freezeLedger=new PhaseLedger(), mapCache=createDerivedMapCache(), senderViews=createViewCache();
for(day=1;day<=through;day++) {
  const date=formatIsoDate(dateOfDay(world.start.startDate,day));
  for(const paper of paperById.values()) {
    if(date<paper.fromDate)continue;
    const gate=gateOf(state,paper,day), last=gates.get(paper.id)?.at(-1);
    if(last===undefined||JSON.stringify(last.gate)!==JSON.stringify(gate))push(gates,paper.id,{day,gate});
  }
  const entries=log.filter(row=>row.day===day);
  const result=tick(world,state,entries,{freeze:true,freezeLedger,mapCache,senderViews});
  assert.deepEqual(result.rejections,[],`rejected command on day ${day}`);
  const hash=canonicalHash(result.state);
  assert.equal(hash,expectedHashes.get(day),`retained state hash mismatch on day ${day}`);
  hashes.push({day,hash,commands:entries.length});
  for(const message of result.requestDispatches??[])wires.push({day,kind:'dispatch',message});
  for(const message of result.requestReceipts??[])wires.push({day,kind:'paper_receipt',message});
  state=result.state;
  if(day%20===0||day===through)console.log(`verified day ${day}/${through}`);
}

// Confirm the traced paper and offer populations against the retained capture, never a target roster.
const capturedOffers=parse(`${capture}/offers.json`) as Record<string,NeutralOffer>;
const mustTrace=Object.values(capturedOffers).filter(o=>Object.values(o.offerReceiptDays).some(d=>d<=through)).map(o=>o.offerCall).sort();
const receivedOffers=Object.values(state.neutralOffers??{}).filter(o=>o.offerReceived.length>0).map(o=>o.offerCall).sort();
assert.deepEqual(receivedOffers,mustTrace);
if(!smoke)assert.equal(mustTrace.length,16);
const latest=places(state);
const linkedWires=(origins:ReadonlySet<string>)=>wires.filter(w=>origins.has(w.message.msgOrigin)||origins.has(w.message.msgReport?.reportAnswers??''));
const linkedReceipts=(lots:ReadonlySet<string>)=>[...stationReceipts.values()].flat().filter(r=>r.lots.some(l=>lots.has(l)));
const lotFates=(lots:ReadonlySet<string>)=>[...lots].sort().map(id=>({lot:id,atCutoff:latest.get(id)??null,timeline:lotEvents.get(id)??[]}));
const offerDetails=(id:string)=>{
  const timeline=offers.get(id)??[];
  const lots=new Set(timeline.flatMap(o=>o.lots));
  const last=timeline.at(-1)?.row;
  assert(lots.size>0||last?.offerStatus==='recalled',`no stable lots for offer ${id}`);
  return {id,last,timeline,wires:linkedWires(new Set([id])),answers:answers.get(id)??[],stationReceipts:linkedReceipts(lots),lots:lotFates(lots)};
};
const paperDetails=[...paperById.values()].map(paper=>{
  const dispatches=wires.filter(w=>w.kind==='dispatch'&&w.message.msgOrder?.orderAllocation===paper.id);
  const origins=new Set(dispatches.map(w=>w.message.msgOrigin));
  const records=[...allocations].filter(([,rows])=>rows[0]?.row.allocPaper===paper.id);
  const recordsOverTime=records.flatMap(([,rows])=>rows);
  const lots=new Set(recordsOverTime.flatMap(r=>r.lots));
  const offerJourneys=[...origins].filter(id=>offers.has(id)).map(offerDetails);
  const gate=gates.get(paper.id)??[];
  return {paper,gate,dispatches,wires:linkedWires(origins),answers:[...origins].flatMap(id=>answers.get(id)??[]),
    allocationRecords:recordsOverTime,firstSelection:records.map(([id])=>({id,screen:firstSelection.get(id)})),offerJourneys,
    stationReceipts:linkedReceipts(lots),lots:lotFates(lots),matchingAtCutoff:census(state,paper)};
});
const offerTraces=mustTrace.map(offerDetails);
assert.equal(paperDetails.length,16);
assert(phaseNamesHaveSource());
put('instruments',paperDetails);
put('received-offers',offerTraces);
put('all-offer-states',[...offers].map(([id,timeline])=>({id,timeline})));
put('lot-transitions',Object.fromEntries(lotEvents));
put('daily-hashes',hashes);
put('coverage',{through,instruments:paperDetails.length,receivedOffers:offerTraces.length,observedOffers:offers.size,lotTimelines:lotEvents.size,
  transitions:[...lotEvents.values()].reduce((n,e)=>n+e.length,0),hashesVerified:hashes.length,rejections:0,phases:[...phases],
  granularity:'Opening State and each distinct State handed to tick deepFreeze. Same-phase substeps may only have a net effect. Paper sends and receipts are tick events; firstSelection is a preceding-boundary diagnostic, not a historical claim.'});
console.log(`traced ${paperDetails.length} instruments and ${offerTraces.length} received offers through day ${through}`);

function phaseNamesHaveSource():boolean {
  return [...phases].some(p=>p.includes('advanceDay(kept, day)'));
}
