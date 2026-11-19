import {ConsoleGame} from '../../../packages/cli/src/console/game.ts';
import {DeskAdapter} from '../server/adapter.ts';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const repo=fileURLToPath(new URL('../../..',import.meta.url));
const main=process.env.MANDATE_MAIN??resolve(repo,'../ByOrderOfThePresident');
const out=resolve(main,'art-masters/R29');mkdirSync(out,{recursive:true});
const peace=new DeskAdapter(new ConsoleGame({pack:'union-1861'})).snapshot();
const game=new ConsoleGame({pack:'union-1861',atWar:true}),desk=new DeskAdapter(game),war=desk.snapshot();
const commands=['inquire us_general_in_chief','inquire us_dc_militia','inquire us_fort_monroe'];
for(const command of commands){const r=desk.execute(command);if(!r.ok)throw Error(r.message);}
const queued=desk.snapshot(),reply=desk.execute('end');if(!reply.ok||!reply.turn)throw Error('No real week');
const base=war.morning.view.reports[0]!;if(!base)throw Error('Opening bulletin missing');
// This is an isolated renderer proof, outside the playable SeatRequest.
// The kernel derives it from explicitly synthetic received control reports.
const paper={...base,id:'r29-illustrative-control',day:1,receivedDay:1,claims:[
 {kind:'control',region:'northern_virginia',token:'union',value:550,confidence:900},
 {kind:'control',region:'northern_virginia',token:'confederate',value:450,confidence:900},
 {kind:'control-government',region:'northern_virginia',token:'st_virginia',value:0,confidence:900},
 {kind:'control',region:'manassas',token:'confederate',value:900,confidence:900},
 {kind:'control-government',region:'manassas',token:'st_virginia',value:0,confidence:900},
]} as unknown as typeof base;
const proof={...war,controlExample:game.controlFromReports([...war.morning.view.reports,paper])};
// A real submitted plan stops this shorter turn. It keeps the complete recording
// below a minute without dropping reports or changing the playback speed.
const recordingDesk=new DeskAdapter(new ConsoleGame({pack:'union-1861',atWar:true}));
const accepted=recordingDesk.execute('order us_dc_militia take baltimore bypass');if(!accepted.ok)throw Error(accepted.message);
const recordingQueued=recordingDesk.snapshot(),recordingReply=recordingDesk.execute('end');if(!recordingReply.ok||!recordingReply.turn)throw Error('No recording turn');
for(const [name,data] of Object.entries({peace,war,queued,reply,proof,commands,recordingQueued,recordingReply}))writeFileSync(`${out}/fixture-${name}.json`,JSON.stringify(data,null,2));
const summary={peace:peace.date,war:war.date,end:reply.snapshot.date,days:reply.turn.days.length,reports:reply.turn.days.flatMap(d=>d.reports).length,controlReports:reply.turn.days.flatMap(d=>d.reports).filter(r=>r.claims.some(c=>c.kind==='control')).length,openingBeliefs:Object.keys(war.morning.view.controlBeliefs).length,openingContested:Object.entries(war.morning.view.controlBeliefs).filter(([,b])=>b.contested).map(([r])=>r),openingFronts:war.morning.view.claimedFronts.length,proof:'Synthetic control reports projected by the kernel; comparison route only, never added to a playable request.'};
writeFileSync(`${out}/fixture-summary.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
