import { beforeAll, expect, it } from 'vitest';
import { ids } from '@mandate/kernel';
import { replayS29, s29Commands } from '../../../docs/playtests/s35-replay.ts';

let replay: ReturnType<typeof replayS29>;
beforeAll(() => { replay = replayS29(); });

it('S35 replays the S29 zero-day wait redraft then edit without dropping its note term', () => {
  const {world,run,summary} = replay;
  expect(summary.rejections).toEqual([]);
  const record = run.state.planRecords[ids.toId('post','us_dc_militia')]!;
  const counter = record.planCounters.find(c => c.counterDay === 140)!;
  expect(counter.counterInvalid).toBeNull();
  expect(counter.counterDistance).toBe(0);
  expect(counter.counterFell.some(t => t.dropTerm === 'notes')).toBe(false);
  const chosen = record.planDraft!.draftCandidates.find(c => c.id === record.planChosen)!;
  expect(chosen.candTerms.find(t => t.contribTerm === 'notes')!.contribAmount).toBe(world.map.world.rules.plans.notes.scoreWeight);
  expect(record.planApproved!.candTerms.find(t => t.contribTerm === 'notes')!.contribAmount).toBe(world.map.world.rules.plans.notes.scoreWeight);
  const response = run.state.orderResponses[counter.counterResponse!]!;
  expect(response.respReasons.some(r => r.kind === 'departs_from_judgement')).toBe(false);
});

it('the recorded commands, with the disclosed S58 receipt delay, bring received hour-stamped Manassas papers by the July horizon', () => {
  expect(replay.summary.battles.some(b => b.id.startsWith('battle:manassas:'))).toBe(true);
  expect(replay.summary.fieldPapers.some(p => p.claims.some(c => c.region === 'manassas'))).toBe(true);
});

it('S58 preserves the source submission and records exactly the decision delayed until received', () => {
  const line = 'decide pickens_refused courier_order special_expedition';
  expect(s29Commands().filter(c => c.line === line)).toEqual([{ day: 33, line, ok: true }]);
  expect(replay.summary.deferredCommands).toEqual([{
    // Day-2 choice + 31-day interval, next-day receipt, next morning's menu.
    recordedDay: 33, submittedDay: 35, line,
    cause: 'S58: the refusal must be received before its decision is offered',
  }]);
  const entries = replay.run.log.filter(e => e.command.cmd === 'decide' && e.command.situation === 'pickens_refused');
  expect(entries).toHaveLength(1);
  expect(entries[0]!.day).toBe(35);
});
