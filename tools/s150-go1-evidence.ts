/** Observe GO1's named bodies; no assignment, identity or roster is written into the game. */
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {canonicalHash,decodeSave,phase0} from '../packages/kernel/src/index.ts';
import {seatsWorld} from '../packages/cli/src/seats-world.ts';
import {createRuleSeat} from '../packages/rule-seats/src/index.ts';
import type {State} from '../packages/kernel/src/root-state.ts';

export const GO1_BODIES=[
 {brigade:'Stone',printed:'First Michigan',primaryCandidate:'mi_1_3m_infantry',candidates:['mi_1_3m_infantry']},
 {brigade:'Stone',printed:'New York Zouaves',primaryCandidate:'ny_11_infantry',candidates:['ny_11_infantry']},
 {brigade:'Stone',printed:'Fifth Massachusetts',primaryCandidate:'ma_5_militia_infantry',candidates:['ma_5_militia_infantry']},
 {brigade:'Heintzelman',printed:'Eighth New York',primaryCandidate:'ny_8_militia_infantry',candidates:['ny_8_militia_infantry','ny_8_infantry']},
 {brigade:'Heintzelman',printed:'Twelfth New York',primaryCandidate:'ny_12_militia_infantry',candidates:['ny_12_militia_infantry','ny_12_infantry']},
 {brigade:'Heintzelman',printed:'Twenty-fifth New York',primaryCandidate:'ny_25_militia_infantry',candidates:['ny_25_militia_infantry','ny_25_infantry']},
 {brigade:'Hunter',printed:'Fifth New York',primaryCandidate:'ny_5_militia_infantry',candidates:['ny_5_militia_infantry']},
 {brigade:'Hunter',printed:'Twenty-eighth New York',primaryCandidate:'ny_28_militia_infantry',candidates:['ny_28_militia_infantry','ny_28_infantry']},
 {brigade:'Hunter',printed:'Sixty-ninth New York',primaryCandidate:'ny_69_militia_infantry',candidates:['ny_69_militia_infantry']},
] as const;
export function go1Holdings(state:State){
 return GO1_BODIES.map(body=>({day:state.stateDay,brigade:body.brigade,printed:body.printed,primaryCandidate:body.primaryCandidate,
  candidates:body.candidates.map(regiment=>({regiment,lots:Object.entries(state.forceBlockStates).flatMap(([block,force])=>force.fbLots.filter(l=>!l.lotGenerated&&l.lotRegiment===regiment).map(lot=>{
   const post=state.forceAssignments[block as keyof typeof state.forceAssignments],chain:string[]=[];
   for(let p=post;p!==undefined&&p!==null&&!chain.includes(p);p=state.postStates[p]?.postParent??undefined)chain.push(p);
   return {block,lot:lot.lotId,regiment:lot.lotRegiment,post,holder:post==null?null:state.postStates[post]?.postHolder??null,
    chain,underMcDowell:chain.includes('us_dept_northeastern_virginia'),location:state.forceLocations[block as keyof typeof state.forceLocations],men:lot.lotMen,strength:lot.lotStrength,service:lot.lotService};
  }))}))}));
}

if(process.argv.includes('--baseline')){
 const out='runs/s150-0135/go1-baseline';assert(!existsSync(`${out}/started.json`),'one retained baseline recovery only');mkdirSync(out,{recursive:true});
 writeFileSync(`${out}/started.json`,JSON.stringify({baseline:'S150 0134 capture',command:'node --import tsx tools/s150-go1-evidence.ts --baseline',method:'Continue retained day60 save for30days and assert original daily hashes; no pack edits, reference capture or movement mechanism'},null,2)+'\n',{flag:'wx'});
 const {world,worldHash}=seatsWorld('union-1861'),root='runs/s150/measurement-0134';
 const summary=JSON.parse(readFileSync(`${root}/summary.json`,'utf8'));
 assert.equal(worldHash,summary.worldHash);
 const saved=decodeSave(readFileSync(`${root}/save-60.json`,'utf8'),{expectedWorldHash:worldHash});
 const state=saved.state as unknown as State;
 assert.equal(state.stateDay,60);assert.equal(canonicalHash(state),summary.turns.find((t:{turn:number})=>t.turn===60).hash);
 const rows:ReturnType<typeof go1Holdings>[number][]=[],hashes:{day:number;hash:string}[]=[];
 const seat=createRuleSeat();
 const played=phase0.playDays(world,state,()=>seat,30,{freeze:true,onDay:r=>{
  assert.equal(r.rejections.length,0,`rejection at${r.day}`);const hash=canonicalHash(r.state);
  assert.equal(hash,summary.turns.find((t:{turn:number})=>t.turn===r.day).hash,`retained baseline mismatch${r.day}`);hashes.push({day:r.day,hash});
  if(r.day>=84)rows.push(...go1Holdings(r.state));
 }});
 assert.equal(rows.length,63);
 writeFileSync(`${out}/holdings.json`,JSON.stringify(rows,null,2)+'\n');
 writeFileSync(`${out}/verification.json`,JSON.stringify({baselineHash:summary.finalHash,worldHash,matchedDays:hashes.length,hashes,rejections:0,lastDay:played.state.stateDay,go1RegimentDayRows:rows.length,ambiguities:'Printed NY numbers do not resolve militia/volunteer identities; candidates are reported separately, not assigned.'},null,2)+'\n');
 console.log(JSON.stringify({matchedDays:hashes.length,rejections:0,lastDay:played.state.stateDay,go1Rows:rows.length}));
}
