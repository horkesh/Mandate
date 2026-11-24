import { expect, it } from 'vitest';
// 0131 retires this history policy; preserve its generic mechanics on an explicit synthetic control.
import { seatsWorld } from './support/generic-concentration-control.ts';
import { readFileSync } from 'node:fs';
import { phase0 } from '@mandate/kernel';
import { toId } from '../../../packages/kernel/src/ids.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { viewFor } from '../../../packages/kernel/src/view/view.ts';
import { receivedDepartmentSides } from '../../../packages/kernel/src/seats/received.ts';
import { morningGround, pendingRequests } from '../../../packages/kernel/src/seats/requests.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';
import { createRuleSeat } from '@mandate/rule-seats';
import { answerEntries } from '../../../packages/kernel/src/log/session.ts';
import { applyMusters } from '../../../packages/kernel/src/forces/enlistment.ts';
import { placeAndRemove } from '../../../packages/kernel/src/movement/movement.ts';
import { musterAssignments } from '../../../packages/kernel/src/command/levies.ts';

it('S77: received military transfers confirm source governments without reading hidden accession state',()=>{
 const {world,setup}=seatsWorld('union-1861');const seat=toId('seat','seat:davis_jefferson');
 const start={...phase0.createState(world,setup),stateDay:148};
 for(const [notice,department,day] of [['tennessee_military_league','st_tennessee',65],['north_carolina_forces_transferred','st_north_carolina',114]] as const){
  const hidden={...start,departmentFactions:{...start.departmentFactions,[department]:'confederate' as ReturnType<typeof toId<'faction'>>}};
  const sides=(s:typeof start)=>receivedDepartmentSides(world,viewFor(world,s,seat));
  expect(sides(hidden).get(toId('department',department))).toBeNull();
  const paper=report(`m.s77.${notice}`,{reportAuthor:toId('person','walker_leroy_p'),reportAuthorPost:toId('post','cs_secretary_war'),reportSubjectKind:'situation',reportSubjectId:notice,reportDay:day},day+2);
  const heard=deliverReport(hidden,seat,paper,NO_TRUTH);
  expect(sides(heard).get(toId('department',department))).toBe('confederate');
  expect(sides(deliverReport(start,seat,paper,NO_TRUTH))).toEqual(sides(heard));
 }
});

it('S77: Confederate concentration asks governors for the raised regiments instead of only local opaque contingents',()=>{
 const {world}=seatsWorld('union-1861');
 const rows=world.map.world.rules.ruleSeats.principals.find(r=>r.faction==='confederate')!.concentrations!;
 const johnston=rows.find(r=>r.post==='cs_cmd_harpers_ferry')!;
 const beauregard=rows.find(r=>r.post==='cs_cmd_manassas')!;
 expect(johnston.fromPosts).toContain('st_gov_georgia');
 expect(johnston.fromPosts).not.toContain('st_gov_tennessee');
 expect(rows.find(r=>r.id==='johnston_tennessee_named')?.namedRegiments?.ids).toEqual(['tn_1_infantry','tn_3_infantry']);
 expect(rows.find(r=>r.id==='fredericksburg_bate_named')?.namedRegiments?.ids).toEqual(['tn_2_infantry']);
 for(const p of ['st_gov_alabama','st_gov_louisiana','st_gov_mississippi','st_gov_south_carolina','st_gov_virginia'])expect(beauregard.fromPosts).toContain(p);
 expect(johnston.receiveLevies).toBe(false);
 expect(beauregard.receiveLevies).toBe(false);
});

it('S77: S75 applies only federal contracts, preserves muster conflicts, and does not turn war service into days',()=>{
 const {world}=seatsWorld('union-1861');const catalogue=world.map.world.regimentCatalogue!;
 expect(catalogue.filter(r=>r.path.S75_term_status==='federal_term_sourced')).toHaveLength(43);
 expect(catalogue.find(r=>r.id==='ny_26_infantry')!.termDays).toEqual([90]);
 expect(catalogue.find(r=>r.id==='la_8_infantry')).toMatchObject({termDays:[],warTerm:true});
 for(const id of ['sc_2_infantry','sc_3_infantry','sc_4_infantry'])expect(catalogue.find(r=>r.id===id)!.termDays).toEqual([]);
 for(const id of ['ny_25_infantry','ny_27_infantry','ny_31_infantry','pa_26_infantry']){
  const r=catalogue.find(r=>r.id===id)!;
  expect(r.path.S75_muster_status).toBe('conflicting_sources_HOLD');
  expect(new Set(r.observations.filter(o=>o.observationKind==='muster_in').map(o=>o.source)).size).toBe(2);
 }
});

it('S119: a received call answer opens named transfer after the normal muster window', () => {
 const loaded = seatsWorld('union-1861');
 const {setup} = loaded;
 const notices = ['virginia_military_convention', 'tennessee_military_league'];
 // This legacy generic-policy control must not simultaneously invoke the
 // historical0126 Lynchburg offer. Its named-transfer assertions test the
 // retired generic mechanism, not permission to seize a still-pending offer.
 const world = {...loaded.world, situations: loaded.world.situations.filter(s => notices.includes(s.id)),
   map:{...loaded.world.map,world:{...loaded.world.map.world,rules:{...loaded.world.map.world.rules,
     ruleSeats:{...loaded.world.map.world.rules.ruleSeats,principals:loaded.world.map.world.rules.ruleSeats.principals.map(p=>({...p,
       calls:p.calls.map(c=>c.id==='cs_apr22_absolute_tennessee'?{...c,offer:undefined}:c)}))}}}}};
 const initial = phase0.createState(world, setup);
 const seat = toId('seat','seat:davis_jefferson');
 const donor = toId('post','st_gov_tennessee');
 const harris = toId('person','harris_isham_g');
 const conf = toId('faction','confederate');
 const callId = 'cs_apr22_absolute_tennessee';
 const calls = world.map.world.rules.ruleSeats.principals.find(p => p.faction === conf)!.calls;
 const call = calls.find(c => c.id === callId)!;
 const receivers = world.start.temporaryPosts.filter(p => p.id === 'cs_cmd_fredericksburg' || p.id === 'cs_cmd_harpers_ferry');
 const office = initial.postStates[toId('post','cs_war_adjutant_inspector_general')]!;
 let state: typeof initial = {...initial, stateDay: 118,
   factionCapitals: {...initial.factionCapitals, [conf]: toId('region','richmond')},
   departmentFactions: {...initial.departmentFactions, [toId('department','st_tennessee')]: conf, [toId('department','st_virginia')]: conf},
   postStates: {...initial.postStates, ...Object.fromEntries(receivers.map(p => [p.id, {...office,
     postKind:p.kind, postDepartment:p.department, postParent:p.parent, postHolder:p.holder, postSeat:p.region}]))},
   personService: {...initial.personService, ...Object.fromEntries(receivers.map(p => [p.holder!,
     {serviceFaction:conf, serviceBloc:null, serviceChoice:'resign' as const, serviceDay:44}]))},
   situationFlags: {...initial.situationFlags, war_begun_confederate: 38, virginia_seceded: 44, tennessee_seceded: 65}};
 const add = (p: ReturnType<typeof report>) => { state = deliverReport(state, seat, p, NO_TRUTH); };
 for (const notice of notices) add(report(`m.s119.${notice}`, {reportAuthor: toId('person','walker_leroy_p'),
   reportSubjectKind: 'situation', reportSubjectId: notice, reportDay: 70}, 71));
 for (const p of receivers) add(report(`m.s119.${p.id}`, {reportAuthor: p.holder!, reportAuthorPost: p.id,
   reportSubjectKind: 'post', reportSubjectId: p.id, reportDay: 100}, 101));
 add(report('m.s119.harris', {reportAuthor:harris, reportAuthorPost:donor, reportSubjectKind:'post', reportSubjectId:donor, reportDay:100}, 101));
 const dispatch = phase0.tick(world, state, [{day:119, seat, command:{cmd:'call', to:donor, regiments:call.regiments,
   ...(call.men === undefined ? {} : {men:call.men}), termDays:call.termDays, callId, route:'courier', bypass:false}}], {freeze:true});
 expect(dispatch.rejections).toEqual([]);
 const letter = dispatch.requestDispatches!.find(m => m.msgOrder?.orderCall?.callId === callId)!;
 expect(letter.msgTo).toBe(harris);
 const tick = (s: typeof state, day: number) => phase0.tick(world, {...s, stateDay:day-1}, [], {freeze:true});
 const heard = tick(dispatch.state, letter.msgArriveDay);
 const answer = heard.state.messagesInTransit.find(m => m.msgReport?.reportRequisition === callId)!;
 expect(answer.msgReport?.reportClaims).toContainEqual(expect.objectContaining({claimKind:'call-answer', claimValue:3}));
 expect(Object.values(heard.state.postLevies).find(levy => levy.levyCall === letter.msgOrigin)?.levyRegiments).toBe(3);
 const latest = heard.day + world.map.world.rules.recruitment.musterDays + Math.max(...world.map.world.rules.recruitment.rungs.map(r => r.delayDays));
 const confirmReceivers = (s: typeof state) => receivers.reduce((soFar,p) => deliverReport(soFar, seat,
   report(`m.s119.established.${p.id}`, {reportAuthor:p.holder!, reportAuthorPost:p.id,
     reportSubjectKind:'post', reportSubjectId:p.id, reportDay:s.stateDay}, s.stateDay), NO_TRUTH), s);
 const syntheticReceipt = (at: number, withPrivateAnswer: boolean, withPaper = true) => {
   const s = confirmReceivers({...heard.state, stateDay:at, orderResponses:withPrivateAnswer ? heard.state.orderResponses : {}});
   return withPaper ? deliverReport(s, seat, report('m.s119.answer', answer.msgReport!, at), NO_TRUTH) : s;
 };
 const request = (s: typeof state) => pendingRequests(world,s).find(r => r.requestSeat === seat)!;
 const named = (s: typeof state) => {
   const m = request(s).menu;
   return m.menuKind === 'principal' ? m.doctrine.namedConcentrationTransfers ?? [] : [];
 };
 expect(named(syntheticReceipt(latest-1,true))).toEqual([]);
 expect(named(syntheticReceipt(latest,true,false))).toEqual([]);
 const ready = named(syntheticReceipt(latest,true));
 expect(ready.map(t => t.regiments)).toEqual([['tn_1_infantry','tn_3_infantry'],['tn_2_infantry']]);
 expect(named(syntheticReceipt(latest,false))).toEqual(ready);
 const mustered = tick(heard.state, Math.max(latest, answer.msgArriveDay)).state;
 const ordinaryCall = 'cs_mar09_alabama';
 const existingAnswer = Object.values(mustered.orderResponses).find(r => r.respCallId === callId)!;
 // The fixture skipped earlier mornings. Mark their already issued requisitions while leaving a competing order available.
 const priorCalls = Object.fromEntries(calls.filter(c => c.id !== undefined && c.id !== callId && c.id !== ordinaryCall).map(c => [c.id!,
   {...existingAnswer, respPost:c.post, respCallId:c.id!}]));
 const cavalry = toId('forceBlock','earlier_cavalry');
 const reserve = applyMusters(world.map, mustered, [{change:'create', cause:'recruitment', create:{block:cavalry, name:'raised.st_gov_tennessee',
   department:toId('department','st_tennessee'), arm:'cavalry', strength:1000, storesDays:5,
   enlistment:{enlPost:donor, enlRaisedBy:harris, enlCall:toId('message','earlier_call'), enlRegiments:null, enlMusterDay:120, enlEndsDay:null}}}]).state;
 const positioned = placeAndRemove(world.map,reserve,[{block:cavalry,region:toId('region','nashville'),day:reserve.stateDay}],[]);
 const augmented = musterAssignments({...positioned, orderResponses:{...positioned.orderResponses,...priorCalls}},[],[{block:cavalry,post:donor}],[]);
 const withPaper = deliverReport(confirmReceivers(augmented), seat, report('m.s119.delivered', answer.msgReport!, mustered.stateDay), NO_TRUTH);
 const name = (regiment: string) => Object.values(withPaper.forceBlockStates).flatMap(b => b.fbLots).find(l => l.lotRegiment === regiment);
 expect(name('tn_2_infantry')).toMatchObject({lotMen:780,lotStragglers:0,lotStrength:{strengthKind:'rule'}});
 expect(name('tn_3_infantry')).toBeUndefined();
 const offered = request(withPaper);
 const entries = answerEntries(offered, createRuleSeat());
 expect(entries.find(e => e.command.cmd === 'call' && e.command.callId === ordinaryCall)).toBeDefined();
 const transfers = entries.filter(e => e.command.cmd === 'transfer' && e.command.from === donor);
 expect(transfers.map(e => e.command)).toMatchObject([
   {concentration:'johnston_tennessee_named',regiments:['tn_1_infantry','tn_3_infantry']},
   {concentration:'fredericksburg_bate_named',regiments:['tn_2_infantry']},
 ]);
 const sent = phase0.tick(world, withPaper, entries, {freeze:true});
 expect(sent.rejections).toEqual([]);
 const transfer = sent.requestDispatches!.find(m => m.msgVerb?.verbSubject === 'fredericksburg_bate_named')!;
 expect(transfer.msgVerb?.verbRegiments).toEqual(['tn_2_infantry']);
 const moved = tick(sent.state, transfer.msgArriveDay).state;
 for (const [regiment, receiver] of [['tn_1_infantry','cs_cmd_harpers_ferry'],['tn_2_infantry','cs_cmd_fredericksburg']] as const) {
   const [id, block] = Object.entries(moved.forceBlockStates).find(([,b]) => b.fbLots.some(l => l.lotRegiment === regiment))!;
   expect(block.fbLots.map(l => l.lotRegiment)).toEqual([regiment]);
   expect(moved.forceAssignments[toId('forceBlock',id)]).toBe(receiver);
   expect(moved.forceJoins[toId('forceBlock',id)]).toBeDefined();
 }
 const overflow = Object.keys(moved.forceBlockStates).find(id => moved.forceBlockStates[toId('forceBlock',id)]!.fbLots.some(l => l.lotGenerated && l.lotService?.enlCallId === callId))!;
 expect(moved.forceAssignments[toId('forceBlock',overflow)]).toBe(donor);
 expect(moved.forceAssignments[cavalry]).toBe(donor);
 expect(named(moved).some(t => t.id === 'fredericksburg_bate_named')).toBe(false);
});

it('S91: 0112 retires pushback counts and retains every accepted obligation and exclusion',()=>{
 const checkpoints=JSON.parse(readFileSync('packs/union-1861/checkpoints.json','utf8'));
 expect(checkpoints.pushback).toEqual([]);
 expect(checkpoints.pushbackRegisters).toEqual(['pushback-union.json','pushback-confederate.json']);
 const rows=checkpoints.pushbackRegisters.flatMap((file:string)=>JSON.parse(readFileSync(`packs/union-1861/${file}`,'utf8')).rows);
 expect(rows.filter((r:any)=>r.status==='eligible').map((r:any)=>r.id)).toEqual([
  'U01','U02','U03a','U03b','U03c','U03d','U03e','U04','U05','U14','U25a','U25b','U32','U33','U34','U39','U40','U42',
  'C01','C02','C03','C04','C05','C06','C07','C09','C10','C11','C12','C14','C15','C16','C25',
 ]);
 expect(rows.filter((r:any)=>r.status==='excluded')).toHaveLength(38);
 expect(rows.filter((r:any)=>r.status==='qualified_source')).toHaveLength(3);
 expect(checkpoints.checkpoints.find((r:any)=>r.id==='men_confederate')).toMatchObject({min:100000,max:200000,floorBinding:true});
});

it('S77: the documented Winchester wire does not invent wire access at Harpers Ferry or an earlier opening',()=>{
 const {world,setup}=seatsWorld('union-1861');const state=phase0.createState(world,setup);
 const access=(day:number,to:string)=>morningGround(world,state,day).latency.publicWire!(toId('region','richmond'),toId('region',to),toId('faction','confederate'));
 expect(access(133,'lower_valley')).toBe(false);
 expect(access(134,'lower_valley')).toBe(true);
 expect(access(148,'lower_valley')).toBe(true);
 expect(access(149,'lower_valley')).toBe(false);
 expect(access(134,'harpers_ferry')).toBe(false);
});
