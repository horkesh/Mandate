import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { phase0Run } from '../packages/cli/src/phase0-run.ts';
import { seatsWorld } from '../packages/cli/src/seats-world.ts';
import { historyPack } from '../packages/cli/src/done-check.ts';
import { observeRun, checkpointsScore, operationScore, unknownStrengthScore } from '../packages/cli/src/history-run.ts';
import { coverageScore } from '../packages/cli/src/pushback-coverage.ts';
import { gateFailures, REFERENCE_RUNS } from '../packages/cli/src/liveness-gate.ts';
import { authorityBlocks, inSubtree } from '../packages/kernel/src/command/authority.ts';
import { aggregateLots } from '../packages/kernel/src/forces/lots.ts';
import { scopeMatches } from '../packages/kernel/src/command/allocation.ts';
import type { State } from '../packages/kernel/src/root-state.ts';
import type { PostId, ForceBlockId } from '../packages/kernel/src/ids.ts';

const smoke=process.argv.includes('--smoke');
const out=`runs/s141/${smoke?'smoke':process.argv.includes('--corrected')?'measurement-corrected':'measurement'}`;
assert(!existsSync(`${out}/summary.json`),'do not overwrite or rerun the measurement');
mkdirSync(out,{recursive:true});
const put=(name:string,value:unknown)=>writeFileSync(`${out}/${name}.json`,JSON.stringify(value,null,2)+'\n');
const csv=(name:string,rows:Record<string,unknown>[])=>{
  const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const cell=(v:unknown)=>{const s=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n\r]/.test(s)?`"${s.replaceAll('"','""')}"`:s;};
  writeFileSync(`${out}/${name}.csv`,keys.join(',')+'\n'+rows.map(r=>keys.map(k=>cell(r[k])).join(',')).join('\n')+'\n');
};
const {world}=seatsWorld('union-1861');
const checkpoints=JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
const observer=observeRun(checkpoints,world.start.startDate);
const armyIds=new Set([...world.start.posts,...world.start.temporaryPosts].filter(p=>
  !['office','filter','intelligence'].includes(world.roleOf(p.kind)??'') &&
  !(world.map.world.organisationTemplates??[]).some(t=>t.posts.some(f=>f.id===p.id))).map(p=>p.id));
for(const t of world.map.world.organisationTemplates??[])armyIds.add(t.army);
const compositions:Record<string,unknown>[]=[], armyTotals:Record<string,unknown>[]=[], unmatched:Record<string,unknown>[]=[];
let final:State|undefined;
let summary:ReturnType<typeof phase0Run>;
try { summary=phase0Run({pack:'union-1861',days:smoke?2:148,hash:'daily',replay:!smoke,
  ...(smoke?{}:{resumeAtDay:60,onSave:(text:string)=>writeFileSync(`${out}/save-60.json`,text)}),
  onTick(w,r){
    observer.onTick(w,r);final=r.state;
    if(![120,140,146].includes(r.day))return;
    const s=r.state;
    put(`state-${r.day}`,s);
    for(const army of [...armyIds].sort()) {
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
put('allocations',final.allocationRecords??{});
const observed={...obs,battles:[...obs.battles],operations:[...obs.operations],snapshots:[...obs.snapshots],notHeld:[...obs.notHeld]};
put('observations',observed);
put('scores',{checkpoints:checkpointsScore(checkpoints,obs,world.start.startDate,false),operation:operationScore(obs),unknownStrength:unknownStrengthScore([{name:'union-1861',battles:obs.battles}])});
const baselineRoot='C:/Pyrrhic/sprint-july/runs/s134/repair-capture';
const inventory=JSON.parse(readFileSync('docs/audit/s134-evidence/repair/raw-inventory.json','utf8')) as {path:string;sha256:string}[];
const receipts:unknown[]=[];
function baseline(name:string){const file=`union-1861-${name}.json`,raw=readFileSync(`${baselineRoot}/${file}`);const expected=inventory.find(i=>i.path.endsWith(`/${file}`));assert(expected);const hash=createHash('sha256').update(raw).digest('hex');assert.equal(hash,expected.sha256);receipts.push({file,sha256:hash,source:baselineRoot});return JSON.parse(raw.toString('utf8'));}
const oldSummary=baseline('summary'),oldObs=baseline('observations');
const oldBattles=new Map<string,unknown>(oldObs.battles),newBattles=new Map<string,unknown>(observed.battles);
const changedBattles=[...new Set([...oldBattles.keys(),...newBattles.keys()])].sort().flatMap(id=>JSON.stringify(oldBattles.get(id))===JSON.stringify(newBattles.get(id))?[]:[{id,before:oldBattles.get(id)??null,after:newBattles.get(id)??null}]);
put('changed-battles',changedBattles);
const reference=REFERENCE_RUNS.find(r=>r.kind==='full'&&r.pack==='union-1861')!;
const countChanges=summary.liveness.flatMap(a=>{const b=oldSummary.liveness.find((b:{mechanic:string})=>b.mechanic===a.mechanic);return b?.fires===a.fires&&b?.magnitude===a.magnitude?[]:[{mechanic:a.mechanic,before:b,after:a,band:reference.bands[a.mechanic]??null,newZero:(b?.fires??0)>0&&a.fires===0}];});
put('band-count-changes',countChanges);put('gate-failures',gateFailures(reference,summary.liveness));put('new-zeros',countChanges.filter(r=>r.newZero));
put('input-receipts',receipts);
assert(summary.replay?.matches);assert(summary.resume?.matches);assert(summary.resume?.savedLogReplays);
console.log(JSON.stringify({days:summary.finalDay,rejections:summary.rejections,rows:coverage.rows.length,armyRows:armyTotals.length,compositionRows:compositions.length,unmatched:unmatched.length,changedBattles:changedBattles.length,newZeros:countChanges.filter(r=>r.newZero).map(r=>r.mechanic),gateFailures:gateFailures(reference,summary.liveness).length,finalHash:summary.finalHash}));
