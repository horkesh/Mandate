import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {phase0} from '@mandate/kernel';
import {parseLine} from '../../../packages/cli/src/desk/commands.ts';
const out=resolve('../../../ByOrderOfThePresident/art-masters/S19');mkdirSync(out,{recursive:true});
const game=new ConsoleGame({pack:'union-1861'}),desk=new DeskAdapter(game),script:string[]=[];
for(let turn=0;turn<40&&game.state.stateDay<65;turn++){
 const menu=game.morning().menu;
 if(menu.menuKind!=='principal')throw Error('Principal required');
 const call=menu.situations.find(s=>s.situation==='call_for_troops');
 if(call&&call.options.some(o=>o.optionId==='larger_longer')){desk.execute('decide call_for_troops larger_longer');script.push('decide call_for_troops larger_longer');}
 desk.execute('end');script.push('end');
 if(game.morning().view.congress?.ledger.length)break;
}
writeFileSync(`${out}/union-scene.json`,JSON.stringify(desk.snapshot()));
writeFileSync(`${out}/union-fixture.json`,JSON.stringify({script,day:game.state.stateDay,hash:game.hash(),ledger:game.morning().view.congress?.ledger},null,2));
// A real accepted invitation, seen after one tick. No State is edited and no answer is fabricated.
// This one-day fixture uses the public tick/seat request rather than forcing ConsoleGame's turn limit.
const host=new ConsoleGame({pack:'testbed',atWar:true}),hostDesk=new DeskAdapter(host);
hostDesk.execute('order n_army_west take salient_tip review');hostDesk.execute('end');
const before=host.morning(),command=parseLine('audience n_army_west',before);
if(command.kind!=='command')throw Error('Audience fixture grammar');
const entries=phase0.answerEntries(before,{driver:'human',respond:()=>({answerKind:'commands',commands:[command.command]})});
const result=phase0.tick(host.world,host.state,entries);
if(result.rejections.length)throw Error(`Invitation rejected: ${JSON.stringify(result.rejections)}`);
const request=phase0.pendingRequests(host.world,result.state).find(r=>r.requestSeat===host.seat)!;
const audience={...hostDesk.snapshot(),morning:{...request,turnStops:before.turnStops},date:host.dateOf(request.requestDay)};
if(!request.view.audiences?.some(a=>a.status==='granted'))throw Error('No granted audience after its accepted dispatch');
writeFileSync(`${out}/audience-scene.json`,JSON.stringify(audience));
writeFileSync(`${out}/audience-fixture.json`,JSON.stringify({command:'audience n_army_west',day:result.day,invitation:request.view.audiences,method:'One actual tick after an accepted invitation; no State editing; no predicted response'},null,2));
// A fictional received request exercises a vocabulary not yet emitted by production authors.
const requestId='m.s19.fictional-request' as phase0.KnownReport['id'];
const requestReport:phase0.KnownReport={id:requestId,knownReceivedDay:result.day,knownRoute:'courier',knownVia:[],knownBody:{reportType:'advice',reportSubtype:'requested',reportAuthor:request.view.audiences![0]!.person,reportAuthorPost:request.view.audiences![0]!.post,reportSubjectKind:'post',reportSubjectId:'n_army_west',reportDay:result.day,reportHour:null,reportAnswers:null,reportAdvice:null,reportClaims:[{claimKind:'audience-request',claimRegion:null,claimValue:1,claimToken:null,claimConfidence:1000}]}};
const received=phase0.deliverReport(result.state,host.seat,requestReport,{truthTerms:[],truthTrimmed:[]});
const receivedRequest=phase0.pendingRequests(host.world,received).find(r=>r.requestSeat===host.seat)!;
writeFileSync(`${out}/request-scene.json`,JSON.stringify({...audience,morning:{...receivedRequest,turnStops:before.turnStops},paperText:{...audience.paperText,[requestId]:'A fictional request to see the principal.'}}));
console.log(JSON.stringify({unionDay:game.state.stateDay,ledger:game.morning().view.congress?.ledger.length,invitationDay:result.day}));
