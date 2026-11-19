import { expect, it } from 'vitest';
import { seatsWorld } from '../../cli/src/seats-world.ts';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import type { ReportBody, ReportClaim } from '../src/knowledge/report.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { frontPage } from '../src/politics/press.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { viewFor } from '../src/view/view.ts';
import type { State } from '../src/root-state.ts';
import type { BattleRecord } from '../src/combat/records.ts';
import { battleReports } from '../src/tick/battle-reports.ts';
import { ctxFor } from './support/tick-context.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { tick } from '../src/tick/tick.ts';

it('prints the testbed editor’s received story and principal’s returns, independently of battle truth', () => {
  const { world, setup } = seatsWorld('testbed');
  const rules = world.map.world.rules.politics, paper = rules.press.papers[0]!;
  const principal = world.faction(paper.faction).principal;
  const region = toId('region', 'w_valley'), commander = toId('person', 'n_fighter');
  const battle = 'battle:w_valley:2';
  let state = createState(world, setup);
  const receive = (who: typeof principal, id: string, type: ReportBody['reportType'], day: number, claims: ReportClaim[]) => {
    state = deliverReport(state, seatIdFor(who), {
      id: toId('message', id), knownReceivedDay: day, knownRoute: 'wire', knownVia: [],
      knownBody: { reportType: type, reportSubtype: null, reportAuthor: commander, reportAuthorPost: null,
        reportSubjectKind: 'region', reportSubjectId: region, reportClaims: claims, reportDay: day,
        reportHour: null, reportAdvice: null, reportAnswers: null },
    }, NO_TRUTH);
  };
  const claim = (kind: ReportClaim['claimKind'], value: number, token: string, days: number[]) => ({
    claimKind: kind, claimValue: value, claimToken: token, claimRegion: region, claimConfidence: 600,
    claimBattle: battle, claimBattleDays: days, claimCommander: commander,
  });
  receive(paper.editor, 'm.public', 'wire-dispatch', 4, [claim('battle-result', 0, 'lost', [3, 4])]);
  receive(principal, 'm.first3', 'casualty-return', 3, [claim('own-losses', 12, 'first', [3]), claim('missing', 5, 'first', [3])]);
  // A full return for one day does not authorize splitting out the captured for the whole battle.
  receive(principal, 'm.full4', 'casualty-return', 5, [claim('own-losses', 20, 'full', [4]), claim('captured', 7, 'full', [4])]);
  const inaccessible = { ...state, get battleRecords(): State['battleRecords'] { throw Error('press read battle truth'); } };
  const page = frontPage(rules, inaccessible, paper, 7, principal, 1);
  expect(page.battles).toEqual([{ battle, region, commander, result: 'lost', casualties: 44, captured: 0, returned: 'first' }]);
  expect(page.claims[0]).toMatchObject({ claimKind: 'battle-result', claimToken: 'lost', claimValue: 44, claimBattle: battle, claimCommander: commander });
  const noFirst = { ...state, knowledgeBySeat: {...state.knowledgeBySeat,
    [seatIdFor(principal)]: {knownReports:state.knowledgeBySeat[seatIdFor(principal)]!.knownReports.filter(r=>r.id!=='m.first3')},
  } };
  expect(frontPage(rules,noFirst,paper,7,principal,1).battles[0]).toMatchObject({casualties:27,returned:'first',captured:0});
  const printed = { ...state, stateDay: 9 };
  const body: ReportBody = { reportType: 'press', reportSubtype: null, reportAuthor: paper.editor, reportAuthorPost: null,
    reportSubjectKind: 'person', reportSubjectId: paper.editor, reportClaims: page.claims, reportDay: 7, reportHour: null, reportAdvice: null, reportAnswers: null };
  const delivered = deliverReport(printed, seatIdFor(principal), { id: toId('message', 'm.page'), knownReceivedDay: 8, knownRoute: 'mail', knownVia: [], knownBody: body }, NO_TRUTH);
  const view = viewFor(world, delivered, seatIdFor(principal)).reports.find(r => r.id === 'm.page')!;
  expect(view.claims[0]).toMatchObject({ kind: 'battle-result', token: 'lost', value: 44, battle, commander });
  // Changing later returns cannot rewrite the page already received.
  receive(principal, 'm.later', 'casualty-return', 8, [claim('own-losses', 999, 'full', [3])]);
  expect(frontPage(rules,state,paper,7,principal,1).claims).toEqual(page.claims);
  const later = {...delivered,knowledgeBySeat:{...state.knowledgeBySeat,
    [seatIdFor(principal)]:{knownReports:[...state.knowledgeBySeat[seatIdFor(principal)]!.knownReports,
      delivered.knowledgeBySeat[seatIdFor(principal)]!.knownReports.find(r=>r.id==='m.page')!]}}};
  expect(viewFor(world,later,seatIdFor(principal)).reports.find(r=>r.id==='m.page')!.claims).toEqual(view.claims);
  const uninformed = {...state,knowledgeBySeat:{...state.knowledgeBySeat,[seatIdFor(paper.editor)]:{knownReports:[]}}};
  expect(frontPage(rules,uninformed,paper,7,principal,1).battles).toEqual([]);
});

it('routes the public surrender report to a testbed editor even when the force sends no return',()=>{
  const {world,setup}=seatsWorld('testbed');
  const rules=world.map.world.rules.politics,paper=rules.press.papers[0]!,side=paper.faction;
  const other=world.factionIds.find(f=>f!==side)!;
  const region=paper.region,principal=world.faction(side).principal;
  const row=(f:typeof side,cut:'surrender'|null)=>({bsideFaction:f,bsideCommander:null,bsidePost:null,
    bsideResult:'held',bsideCutOff:cut,bsideKw:0,bsideKilled:0,bsideWounded:0,bsideMissing:0,bsideCaptured:0,
    bsideCapturedParts:[],bsidePresent:100,bsideFlankBroken:false,bsideRetreatTo:null,bsideHit:null,bsidePursue:null});
  const record={battleRegion:region,battleStartDay:1,battleEndDay:1,battleFactions:[side,other],battleCauses:[],
    battleDays:[{bdayDay:1,bdayType:'meeting',bdaySides:[row(side,'surrender'),row(other,null)]}]} as unknown as BattleRecord;
  const start={...createState(world,setup),battleRecords:{'battle.public':record}};
  const ctx={...ctxFor(world,start,1),telemetry:undefined};
  battleReports(ctx,start,start.regionControl);
  const publicReport=ctx.outbox.find(m=>m.msgTo===paper.editor&&m.msgReport?.reportClaims.some(c=>c.claimKind==='battle-result'))!;
  expect(publicReport.msgReport!.reportClaims[0]).toMatchObject({claimBattle:'battle.public',claimToken:'lost',claimValue:0});
  expect(ctx.outbox.some(m=>m.msgReport?.reportType==='casualty-return')).toBe(false);
  expect(frontPage(rules,start,paper,1,principal,1).battles).toEqual([]);
  let state={...sendMessages(start,ctx.outbox),stateDay:1};
  for(let day=2;day<=Math.max(2,publicReport.msgArriveDay);day++)state=tick(world,state,[]).state;
  expect(frontPage(rules,state,paper,7,principal,1).battles).toEqual([{battle:'battle.public',region,result:'lost',commander:null,casualties:0,captured:0,returned:'none'}]);
});
