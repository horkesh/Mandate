import { expect, it } from 'vitest';
import { ConsoleGame } from '../src/console/game.ts';
import { ConsoleSession } from '../src/console/session.ts';
import { parseLine } from '../src/desk/commands.ts';
import { deskStrings } from '../src/pack-text.ts';
import { canonicalHash, ids, phase0 } from '@mandate/kernel';

function ready() {
  const game = new ConsoleGame({ pack: 'testbed' });
  const session = new ConsoleSession(game);
  session.start();
  session.handle('order n_army_west take salient_tip review');
  session.handle('end');
  return { game, session };
}

it('the testbed console carries several typed notes through the command log and returns their account', () => {
  const { game, session } = ready();
  const line = 'sendback n_army_west wait:main:7 via:main:w_valley';
  const parsed = parseLine(line, game.morning(), deskStrings(game.strings, game.locale));
  expect(parsed.kind).toBe('command');
  if (parsed.kind !== 'command' || parsed.command.cmd !== 'review') throw Error('review expected');
  expect(parsed.command.notes).toHaveLength(2);
  session.handle(line);
  for (let i = 0; i < 8; i++) {
    session.handle('end');
    if (game.log.some(e => e.command.cmd === 'review' && e.command.notes?.length)) {
      const menu = game.morning().menu;
      if (menu.menuKind === 'principal' && menu.reviews.some(r => r.notes?.length)) break;
    }
  }
  const command = game.log.find(e => e.command.cmd === 'review')!.command;
  expect(command).toMatchObject({ notes: [{ markKind: 'wait', markDays: 7 }, { markKind: 'via', markVia: ['w_valley'] }] });
  const menu = game.morning().menu;
  expect(menu.menuKind === 'principal' && menu.reviews[0]?.notes).toHaveLength(2);
  const text = session.handle('plans').lines.join('\n');
  expect(text).toContain('Wait');
  expect(text).not.toContain('note.outcome.');
});

it('rejects malformed and stray notes rather than silently sending a bare sendback', () => {
  const { game } = ready();
  const t = deskStrings(game.strings, game.locale);
  for (const extra of ['wait:main:no', 'via:main:', 'avoid:main:', 'focus:main:salient_tip:extra', 'unknown:main:salient_tip', 'note=lost']) {
    expect(parseLine(`sendback n_army_west ${extra}`, game.morning(), t).kind, extra).toBe('error');
  }
  expect(parseLine('approve n_army_west wait:main:7', game.morning(), t).kind).toBe('error');
});

/** Acceptance cases on the actual fictional pack. Regard is changed through its owner, without changing pack data. */
function packRun(resentful=false,bounce=false) {
  const {game}=ready(),world=game.world,post=ids.toId('post','n_army_west');
  const holder=game.state.postStates[post]!.postHolder!,principal=world.start.factions.find(f=>f.playable)!.principal!;
  const start=phase0.applyPeopleChanges(game.state,[{change:'regard',person:holder,toward:principal,delta:resentful?-2000:2000}],game.state.stateDay,world.rules.people,world.map.world.vocabularies.ranks);
  const command:phase0.ReviewCommand={cmd:'review',to:post,action:'send_back',edit:null,notes:[{markKind:'wait',markAxis:'main',markDays:7,markRegion:null,markVia:[]}],route:'courier',bypass:true};
  const log=[{day:start.stateDay+1,seat:game.seat,command}];
  const sent=phase0.tick(world,start,log,{freeze:true});expect(sent.rejections).toEqual([]);
  const letter=sent.state.messagesInTransit.find(m=>m.msgOrder?.orderKind==='send_back')!;
  expect(letter).toBeDefined();
  let state=bounce?phase0.relieveHolder(sent.state,post):sent.state;
  for(let d=0;d<20;d++){
    state=phase0.tick(world,state,[],{freeze:true}).state;
    if(!bounce && state.planRecords[post]!.planDraft!.draftDay>start.stateDay && state.planRecords[post]!.planChosen!==null) break;
  }
  const record=state.planRecords[post]!,chosen=record.planDraft!.draftCandidates.find(c=>c.id===record.planChosen)!;
  const response=Object.values(state.orderResponses).find(r=>r.respOrder===letter.msgOrigin && r.respRole==='addressee');
  return {world,start,state,log,letter,record,chosen,response};
}

it('the testbed commander follows an accepted timing note without an edit or approval',()=>{
  const {record,chosen,response}=packRun();
  expect(response!.respActual).toBe('comply');
  expect(chosen.candNotes![0]).toMatchObject({noteFollowed:true,noteWhy:'followed'});
  expect(chosen.candAxes[0]!.axisPhases.find(p=>p.phaseKind==='concentrate')!.phaseDays).toBe(7000);
  expect(record.planStatus).toBe('review');expect(record.planCounters).toEqual([]);
});

it('the resentful testbed commander sets the note aside with a distrust reason',()=>{
  const {chosen,response}=packRun(true);
  expect(response!.respReasons).toContainEqual({kind:'distrusts_leader'});
  expect(chosen.candNotes![0]).toMatchObject({noteFollowed:false,noteWhy:'declined',noteAmount:0});
});

it('the testbed note bounces at a post left vacant while it travelled',()=>{
  const {state,letter,response}=packRun(false,true);
  expect(response).toBeUndefined();
  expect(Object.values(state.knowledgeBySeat).flatMap(k=>k.knownReports).some(r=>r.knownBody.reportAnswers===letter.msgOrigin && r.knownBody.reportClaims.some(c=>c.claimKind==='order-returned'&&c.claimToken==='vacant_post'))).toBe(true);
});

it('the loaded testbed note run has the same hash twice and on replay',()=>{
  const a=packRun();
  expect(canonicalHash(packRun().state)).toBe(canonicalHash(a.state));
  expect(canonicalHash(phase0.replay(a.world,a.start,a.log,a.state.stateDay).state)).toBe(canonicalHash(a.state));
});
