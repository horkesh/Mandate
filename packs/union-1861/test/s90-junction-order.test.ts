import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { relayChain } from '../../../packages/kernel/src/seats/posts.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';
import { createRuleSeat } from '@mandate/rule-seats';
import { principalMenu, morningGround } from '../../../packages/kernel/src/seats/requests.ts';

const id = ids.toId;
const aig = id('post', 'cs_war_adjutant_inspector_general');
const army = id('post', 'cs_cmd_harpers_ferry');
const davis = id('person', 'davis_jefferson');

it('the received July notice asks Johnston to relieve Beauregard with his own arrangements, never to take Manassas', () => {
  const { world, setup } = seatsWorld('union-1861');
  const seat = phase0.seatIdFor(davis);
  const initial = { ...phase0.createState(world, setup), stateDay: 140,
    situationFlags: { war_begun_confederate: 38 } };
  const notice = report('s90.advance', { reportAuthor: id('person','walker_leroy_p'),
    reportAuthorPost: id('post','cs_secretary_war'), reportSubjectKind: 'situation',
    reportSubjectId: 'manassas_advance_received', reportDay: 139 }, 140);
  const received = deliverReport(initial, seat, notice, NO_TRUTH);
  const request = phase0.pendingRequests(world, received).find(r => r.requestSeat === seat)!;
  if(request.menu.menuKind !== 'principal') throw Error('principal required');
  const row = request.menu.doctrine.offensives.find(o => o.post === army)!;
  expect(row).toMatchObject({ posture: 'relieve', ready: true, issued: false });
  // Isolate the issued goal from unrelated doctrine attention and appointments.
  const target = {post:army,holder:id('person','johnston_joseph_e'),relays:[aig],routes:[{route:'courier' as const,typicalDays:3,price:0}],men:1000,raising:false,inTransit:[]};
  const menu = {...request.menu, attention:{...request.menu.attention,left:null},
    commandable:[target], raising:[],vacancies:[],candidates:[],reviews:[],awaiting:[],situations:[],historicalAppointments:[],
    doctrine:{...request.menu.doctrine,appointments:[],calls:[],concentrateAt:null,concentrations:[],offensives:[row]}};
  const answer=createRuleSeat().respond({...request,menu});
  if(answer.answerKind!=='commands')throw Error('commands required');
  const orders=answer.commands.filter(c=>c.cmd==='order');
  expect(orders).toHaveLength(1);
  expect(orders[0]).toMatchObject({cmd:'order',to:army,goal:{objective:'manassas',posture:'relieve',rail:true,approveAsDrafted:true,awaitWord:false},bypass:false});
});

it('a retry menu projects the own sent letter and excludes future copies',()=>{
  const {world,setup}=seatsWorld('union-1861'),seat=phase0.seatIdFor(davis);
  const initial={...phase0.createState(world,setup),stateDay:140};
  const goal={goalObjective:id('region','manassas'),goalPosture:'relieve' as const,goalRisk:200,goalDeadlineDays:11,
    goalRail:false,goalRiver:true,goalSea:false,goalNeutral:false,goalCommitted:[id('forceBlock','copy.only')],goalAwaitWord:true,goalApproveAsDrafted:false};
  const sent={sentPost:army,sentMessage:id('message','copy.original'),sentKind:'goal' as const,sentDay:139,sentPaper:null,sentGoal:goal};
  const state={...initial,knowledgeBySeat:{...initial.knowledgeBySeat,[seat]:{...initial.knowledgeBySeat[seat]!,knownSentOrders:[sent,{...sent,sentMessage:id('message','future.copy'),sentDay:141}]}}};
  const menu=principalMenu(world,state,id('faction','confederate'),morningGround(world,state,141));
  expect(menu.sentGoals).toEqual([{post:army,message:sent.sentMessage,goal:{objective:'manassas',posture:'relieve',risk:200,deadlineDays:11,
    rail:false,river:true,sea:false,neutral:false,committed:goal.goalCommitted,awaitWord:true,approveAsDrafted:false}}]);
  expect(menu.sentGoals![0]!.goal.committed).not.toBe(goal.goalCommitted);
});
