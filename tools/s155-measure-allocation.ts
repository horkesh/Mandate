import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { phase0Run } from '../packages/cli/src/phase0-run.ts';
import { seatsWorld } from '../packages/cli/src/seats-world.ts';
import { historyPack } from '../packages/cli/src/done-check.ts';
import { observeRun, checkpointsScore, operationScore, unknownStrengthScore } from '../packages/cli/src/history-run.ts';
import { coverageScore } from '../packages/cli/src/pushback-coverage.ts';
import { gateFailures, REFERENCE_RUNS } from '../packages/cli/src/liveness-gate.ts';
import { authorityBlocks, inSubtree } from '../packages/kernel/src/command/authority.ts';
import { aggregateLots } from '../packages/kernel/src/forces/lots.ts';
import { allocationAuthority, allocationSelection, scopeMatches } from '../packages/kernel/src/command/allocation.ts';
import type { State } from '../packages/kernel/src/root-state.ts';
import type { PostId, ForceBlockId } from '../packages/kernel/src/ids.ts';
import { go1Holdings } from './s150-go1-evidence.ts';
import { dateOfDay, formatIsoDate } from '../packages/kernel/src/world/calendar.ts';

const smoke=process.argv.includes('--smoke');
const liveOrders=false, needRetention=false, subordinateOrders=false, corrected=false;
const requestAudit=true;
const out=smoke?'runs/s155/smoke':'runs/s155/measurement';
assert(!existsSync(`${out}/started.json`),'do not overwrite or rerun the measurement');
mkdirSync(out,{recursive:true});
const put=(name:string,value:unknown)=>writeFileSync(`${out}/${name}.json`,JSON.stringify(value,null,2)+'\n');
const csv=(name:string,rows:Record<string,unknown>[])=>{
  const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const cell=(v:unknown)=>{const s=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};
  writeFileSync(`${out}/${name}.csv`,keys.join(',')+'\n'+rows.map(r=>keys.map(k=>cell(r[k])).join(',')).join('\n')+'\n');
};
const baselineInventoryPath='docs/audit/s152-evidence/capture/raw-inventory.json';
const baselineRoot='runs/s152/measurement';
const baselineInventory=JSON.parse(readFileSync(baselineInventoryPath,'utf8')) as {path:string;sha256:string}[];
for(const row of baselineInventory)assert.equal(createHash('sha256').update(readFileSync(row.path)).digest('hex'),row.sha256,'raw baseline changed: '+row.path);
writeFileSync(`${out}/started.json`,JSON.stringify({baseline:'S152 d4c187e2a6eeabe19e9aa8f6c625654d37a9c4ebf62ca8557f5c614e12f2b164',entry:'d2ccca82a5bbc9c82fc1b550cfae4b49aad88306',days:smoke?2:148,timing:'not measured: contended local host; hosted baseline requested'},null,2)+'\n',{flag:'wx'});
const {world}=seatsWorld('union-1861');
const checkpoints=JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
const observer=observeRun(checkpoints,world.start.startDate);
const armyIds=new Set([...world.start.posts,...world.start.temporaryPosts].filter(p=>
  !['office','filter','intelligence'].includes(world.roleOf(p.kind)??'') &&
  !(world.map.world.organisationTemplates??[]).some(t=>t.posts.some(f=>f.id===p.id))).map(p=>p.id));
for(const t of world.map.world.organisationTemplates??[])armyIds.add(t.army);
const compositions:Record<string,unknown>[]=[], armyTotals:Record<string,unknown>[]=[], unmatched:Record<string,unknown>[]=[];
const go1Rows:ReturnType<typeof go1Holdings>[number][]=[];
let final:State|undefined;
const prior=new Map<string,string>();
const observedJoins=new Set<string>();
const lotPrior=new Map<string,string>();
const requests:unknown[]=[], answers:unknown[]=[], receipts:unknown[]=[];
function causal(day:number,kind:string,key:string,value:unknown) {
 const text=JSON.stringify(value), identity=`${kind}:${key}`;
 if(prior.get(identity)===text)return;
 prior.set(identity,text);
 const event={day,kind,key,value};
 appendFileSync(`${out}/causal-events.jsonl`,JSON.stringify(event)+'\n');
 if(kind==='request')requests.push(event);else if(kind.includes('answer'))answers.push(event);else if(kind.includes('receipt'))receipts.push(event);
}
let summary:ReturnType<typeof phase0Run>;
try { summary=phase0Run({pack:'union-1861',days:smoke?2:148,hash:'daily',replay:!smoke,
  ...(smoke?{}:{resumeAtDay:60,onSave:(text:string)=>writeFileSync(`${out}/save-60.json`,text)}),
  onTick(w,r){
    final=r.state;assert.equal(r.rejections.length,0,`stop at day ${r.day}: rejected command`);observer.onTick(w,r);
    for(const row of Object.values(r.state.forceRequests??{})) {
      causal(r.day,'request',row.freqId,{need:row.freqNeed,sentDay:row.freqDay,to:row.freqTo});
      row.freqAnswers.forEach((answer,index)=>causal(r.day,'answer',`${row.freqId}:${index}`,answer));
    }
    for(const row of Object.values(r.state.orderResponses))if(row.respKind==='allocation')causal(r.day,'allocation_answer',String(row.respOrder)+':'+String(row.respPerson)+':'+String(row.respRole),row);
    for(const row of Object.values(r.state.allocationRecords??{}))causal(r.day,'allocation_receipt',row.allocOrder,row);
    for(const row of Object.values(r.state.neutralOffers??{}))causal(r.day,'offer_receipt',row.offerCall,row);
    for(const [key,row] of Object.entries(r.state.serviceReceipts??{}))causal(r.day,'place_receipt',key,row);
    for(const msg of r.requestDispatches??[])causal(r.day,'dispatch',msg.id,msg);
    for(const msg of r.requestReceipts??[])causal(r.day,'paper_receipt',msg.id,msg);
    if(requestAudit) {
      for(const [post,plan] of Object.entries(r.state.planRecords))causal(r.day,'plan_record',post,plan);
      for(const [id,operation] of Object.entries(r.state.operationRecords))causal(r.day,'operation_record',id,operation);
      for(const [id,join] of Object.entries(r.state.forceJoins)) {
        const block=id as ForceBlockId;
        causal(r.day,'join_state',id,{join,location:r.state.forceLocations[block],assignment:r.state.forceAssignments[block],lots:r.state.forceBlockStates[block]?.fbLots.map(l=>l.lotId)});
      }
      for(const id of observedJoins)if(r.state.forceJoins[id as ForceBlockId]===undefined)causal(r.day,'join_state',id,null);
      observedJoins.clear();Object.keys(r.state.forceJoins).forEach(id=>observedJoins.add(id));
    }
    if(liveOrders||needRetention) {
      const papers=new Set(Object.values(r.state.forceRequests??{}).flatMap(request=>request.freqAnswers.flatMap(a=>a.fansAssignment===undefined?[]:[a.fansAssignment[0]])));
      const correlations=new Set([...Object.keys(r.state.forceRequests??{}),...Object.values(r.state.allocationRecords??{}).filter(a=>papers.has(a.allocPaper)).map(a=>a.allocOrder)]);
      for(const [seat,knowledge] of Object.entries(r.state.knowledgeBySeat))for(const report of knowledge.knownReports) {
        if(correlations.has(report.knownBody.reportAnswers??'')||correlations.has(report.knownBody.reportForceRequest??''))causal(r.day,'received_force_report',`${seat}:${report.id}`,{seat,report});
      }
      if(r.day>=84&&r.day<=90){put(`state-${r.day}`,r.state);go1Rows.push(...go1Holdings(r.state));}
    }
    // Read-only after-tick evidence; eligibility below is labelled for the following day.
    const date=formatIsoDate(dateOfDay(w.start.startDate,r.day+1));
    for(const paper of w.map.world.rules.allocationInstruments??[])if(date>=paper.fromDate) {
      const selection=allocationSelection(w,r.state,paper,r.day+1);
      causal(r.day,'instrument_gate',paper.id,{forDay:r.day+1,issuerHolder:paper.issuerPost===null?paper.issuer:r.state.postStates[paper.issuerPost]?.postHolder??null,
        sender:r.state.postStates[paper.from]?.postHolder??null,receiver:r.state.postStates[paper.to]?.postHolder??null,
        authority:allocationAuthority(w,r.state,paper,r.day+1),selection});
    }
    const liveLots=new Set<string>();
    for(const [id,b] of Object.entries(r.state.forceBlockStates))for(const lot of b.fbLots) {
      const block=id as ForceBlockId;liveLots.add(lot.lotId);
      const place={block,post:r.state.forceAssignments[block]??null,location:r.state.forceLocations[block],join:r.state.forceJoins[block]??null,regiment:lot.lotRegiment,generated:lot.lotGenerated,kind:lot.lotStrength.strengthKind,men:lot.lotMen};
      const text=JSON.stringify(place);if(lotPrior.get(lot.lotId)!==text){causal(r.day,'lot_place',lot.lotId,place);lotPrior.set(lot.lotId,text);}
    }
    for(const id of lotPrior.keys())if(!liveLots.has(id)){causal(r.day,'lot_place',id,null);lotPrior.delete(id);}
    if(r.day%20===0||r.day===148)console.log(`observed day ${r.day}`);
    if(![120,140,146].includes(r.day))return;
    const s=r.state;
    put(`state-${r.day}`,s);
    const lynchburgHolders=Object.keys(s.forceBlockStates).flatMap(b=>s.forceLocations[b as ForceBlockId]?.locRegion==='lynchburg' && s.forceAssignments[b as ForceBlockId]!==undefined?[s.forceAssignments[b as ForceBlockId]!]:[]);
    for(const army of [...new Set([...armyIds,...lynchburgHolders])].sort()) {
      const blocks=authorityBlocks(s,army);
      const lots=blocks.flatMap(b=>s.forceBlockStates[b]?.fbLots??[]);
      armyTotals.push({day:r.day,army,holder:s.postStates[army]?.postHolder??null,opened:s.postStates[army]!==undefined,lots:lots.length,...aggregateLots(lots)});
      for(const block of blocks)for(const lot of s.forceBlockStates[block]?.fbLots??[])compositions.push({day:r.day,army,block,assigned:s.forceAssignments[block],region:s.forceLocations[block]?.locRegion,marching:s.forceLocations[block]?.locMarch,regiment:lot.lotRegiment,generated:lot.lotGenerated,lot:lot.lotId,arm:lot.lotArm,men:lot.lotMen,kind:lot.lotStrength.strengthKind,strength_source:lot.lotStrength.strengthSource,service:lot.lotService});
    }
    for(const [b,force] of Object.entries(s.forceBlockStates))for(const lot of force.fbLots) {
      const block=b as ForceBlockId,assigned=s.forceAssignments[block],loc=s.forceLocations[block];
      const selections=Object.values(s.allocationRecords??{}).filter(a=>a.allocLots.includes(lot.lotId));
      const onward=(w.map.world.rules.onwardAssignments??[]).filter(p=>!lot.lotGenerated&&p.regiment===lot.lotRegiment&&p.call===lot.lotService?.enlCallId&&assigned!=null&&inSubtree(s,assigned,p.to));
      if(lot.lotService===null || selections.length || onward.length)continue;
      const scopes=(w.map.world.rules.allocationInstruments??[]).filter(p=>scopeMatches(lot,p));
      const reasons:string[]=[];
      const offer=s.neutralOffers?.[lot.lotService.enlCall];
      if(lot.lotGenerated && !offer?.offerReceived.includes(block))reasons.push(offer?'call_offer_unreceived_or_recalled':'call_offer_not_established');
      if(!scopes.length)reasons.push('no_declared_read_scope');
      else if(!scopes.some(p=>assigned!=null&&inSubtree(s,assigned,p.from)))reasons.push('outside_read_sending_command');
      else reasons.push('no_accepted_selection_yet');
      if(loc?.locMarch!==null)reasons.push('already_in_transit');
      unmatched.push({day:r.day,block,lot:lot.lotId,regiment:lot.lotRegiment,generated:lot.lotGenerated,kind:lot.lotStrength.strengthKind,men:lot.lotMen,call:lot.lotService.enlCallId??lot.lotService.enlCall,assigned,region:loc?.locRegion,reasons,applicable:scopes.map(p=>p.id)});
    }
  }});
} catch(error) {
  put('partial-state',final??null);put('partial',{lastCompletedDay:final?.stateDay??null,error:String(error)});throw error;
}
put('summary',summary);put('final-state',final);
if(smoke){assert.equal(summary.rejections,0);console.log(JSON.stringify({smoke:true,day:summary.finalDay,rejections:summary.rejections}));process.exit(0);}
assert(final);
const obs=observer.observations();
const coverage=coverageScore(historyPack('union-1861')?.pushbackRegisters??[],obs.pushbackActs??[],world.start.startDate,obs.lastDay,summary.daily);
assert.equal(coverage.rows.length,33);
put('coverage',coverage);csv('rows',coverage.rows as unknown as Record<string,unknown>[]);
put('army-totals',armyTotals);csv('army-totals',armyTotals);csv('army-lots',compositions);put('unmatched',unmatched);csv('unmatched',unmatched);
put('instrument-requests',world.map.world.rules.allocationInstruments??[]);
put('allocations',final.allocationRecords??{});put('requests',requests);put('answers',answers);put('receipts',receipts);put('service-receipts',final.serviceReceipts??{});put('offers',final.neutralOffers??{});
if(requestAudit)put('force-request-records',final.forceRequests??{});
if(liveOrders||needRetention){assert.equal(go1Rows.length,63);put('go1-holdings-84-90',go1Rows);}
const observed={...obs,battles:[...obs.battles],operations:[...obs.operations],snapshots:[...obs.snapshots],notHeld:[...obs.notHeld]};
put('observations',observed);
put('scores',{checkpoints:checkpointsScore(checkpoints,obs,world.start.startDate,false),operation:operationScore(obs),unknownStrength:unknownStrengthScore([{name:'union-1861',battles:obs.battles}])});
const inventory=baselineInventory;
const inputReceipts:unknown[]=[];
function baseline(name:string){const file=`${name}.json`,raw=readFileSync(`${baselineRoot}/${file}`);const expected=inventory.find(i=>i.path.endsWith(`/${file}`));assert(expected);const hash=createHash('sha256').update(raw).digest('hex');assert.equal(hash,expected.sha256);inputReceipts.push({file,sha256:hash,source:baselineRoot});return JSON.parse(raw.toString('utf8'));}
const oldSummary=baseline('summary'),oldObs=baseline('observations');
const oldBattles=new Map<string,unknown>(oldObs.battles),newBattles=new Map<string,unknown>(observed.battles);
const changedBattles=[...new Set([...oldBattles.keys(),...newBattles.keys()])].sort().flatMap(id=>JSON.stringify(oldBattles.get(id))===JSON.stringify(newBattles.get(id))?[]:[{id,before:oldBattles.get(id)??null,after:newBattles.get(id)??null}]);
put('changed-battles',changedBattles);
const reference=REFERENCE_RUNS.find(r=>r.kind==='full'&&r.pack==='union-1861')!;
const countChanges=summary.liveness.flatMap(a=>{const b=oldSummary.liveness.find((b:{mechanic:string})=>b.mechanic===a.mechanic);return b?.fires===a.fires&&b?.magnitude===a.magnitude?[]:[{mechanic:a.mechanic,before:b,after:a,band:reference.bands[a.mechanic]??null,newZero:(b?.fires??0)>0&&a.fires===0}];});
put('all-bands',Object.entries(reference.bands).map(([mechanic,band])=>({mechanic,band,before:oldSummary.liveness.find((x:{mechanic:string})=>x.mechanic===mechanic)??null,after:summary.liveness.find(x=>x.mechanic===mechanic)??null})));
put('battles',observed.battles);
const s141Zeros=JSON.parse(readFileSync('docs/audit/s141-evidence/corrected-capture/new-zeros.json','utf8')) as {mechanic:string}[];
put('s141-zero-disposition',s141Zeros.map(z=>({mechanic:z.mechanic,after:summary.liveness.find(x=>x.mechanic===z.mechanic)??null,band:reference.bands[z.mechanic]??null})));
put('band-count-changes',countChanges);put('gate-failures',gateFailures(reference,summary.liveness));put('new-zeros',countChanges.filter(r=>r.newZero));
put('input-receipts',inputReceipts);
assert(summary.replay?.matches);assert(summary.resume?.matches);assert(summary.resume?.savedLogReplays);
console.log(JSON.stringify({days:summary.finalDay,rejections:summary.rejections,rows:coverage.rows.length,armyRows:armyTotals.length,compositionRows:compositions.length,unmatched:unmatched.length,changedBattles:changedBattles.length,requests:requests.length,answers:answers.length,newZeros:countChanges.filter(r=>r.newZero).map(r=>r.mechanic),gateFailures:gateFailures(reference,summary.liveness).length,finalHash:summary.finalHash}));
