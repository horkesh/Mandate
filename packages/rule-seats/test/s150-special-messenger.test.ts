import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {createTelemetry,ids,phase0,world as w} from '@mandate/kernel';
import type {Seat,SeatRequest} from '@mandate/kernel/seat-api';
import {createRuleSeat} from '../src/index.ts';

it('messages.special_messenger: a live urgent bypass with no free wire connection sends a special messenger',()=>{
 const read=(p:string)=>JSON.parse(readFileSync(new URL(`../../../packs/testbed/data/${p}`,import.meta.url),'utf8'));
 const start=read('scenarios/opening.json') as w.ScenarioStart;
 const world=phase0.indexSeatsWorld(w.indexWorld(read('world.json') as w.World),start);
 const rule=createRuleSeat(),requests:SeatRequest[]=[];
 const driver:Seat={driver:'rules',respond(request){requests.push(request);return rule.respond(request);}};
 const opening=phase0.playDays(world,phase0.createState(world,{seed:start.seed,atWar:true}),()=>driver,1,{freeze:true});
 const leader=ids.toId('person','n_leader'),target=ids.toId('post','n_army_east');
 const original=phase0.knowledgeOf(opening.state,phase0.seatIdFor(leader)).knownSentOrders!.find(s=>s.sentPost===target&&s.sentKind==='goal')!;
 // Fictional received objection to the actual opening letter; isolate the urgent delivery, not the office's answer.
 // Neither endpoint has owned wire and the fixture declares no public wire connection.
 const state=phase0.deliverReport({...opening.state,regionControl:{}},phase0.seatIdFor(leader),{
  id:ids.toId('message','fictional-office-objection'),knownReceivedDay:1,knownRoute:'courier',knownVia:[],
  knownBody:{reportType:'advice',reportSubtype:'memorandum',reportAuthor:ids.toId('person','n_secretary'),reportAuthorPost:ids.toId('post','n_war_office'),
   reportSubjectKind:'post',reportSubjectId:target,reportClaims:[{claimKind:'order-objected',claimRegion:ids.toId('region','s_capital'),claimValue:1,claimToken:'goal',claimConfidence:1000}],
   reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:original.sentMessage},
 },{truthTerms:[],truthTrimmed:[]});
 const telemetry=createTelemetry([...phase0.TICK_MECHANICS,...phase0.MAP_MECHANICS]);
 const run=phase0.playDays(world,state,()=>driver,1,{freeze:true,telemetry,onDay:r=>expect(r.rejections).toEqual([])});
 const urgent=run.log.find(e=>e.command.cmd==='order'&&e.command.bypass&&e.command.to===target);
 expect(urgent).toMatchObject({day:2,command:{route:'special-messenger',bypass:true}});
 const request=requests.find(r=>r.requestDay===2&&r.requestSeat===phase0.seatIdFor(leader)&&r.menu.menuKind==='principal');
 if(request?.menu.menuKind!=='principal')throw new Error('Missing live principal request');
 const routes=request.menu.commandable.find(c=>c.post===target)!.routes;
 const messenger=routes.find(r=>r.route==='special-messenger')!;
 // The nominal free wire option falls back to the courier and is slower than the priced bearer.
 expect(world.rules.latency.publicWires).toEqual([]);
 expect(routes.filter(r=>r.price===0).every(r=>r.typicalDays>messenger.typicalDays)).toBe(true);
 expect(run.state.messagesInTransit.some(m=>m.msgSentDay===2&&m.msgRoute==='special-messenger'&&m.msgFrom===leader&&m.msgOrder?.orderTarget===target&&m.msgOrder.orderBypass)).toBe(true);
 expect(telemetry.mechanics['messages.special_messenger']!.fires).toBeGreaterThan(0);
});
