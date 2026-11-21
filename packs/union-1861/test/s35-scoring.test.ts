import { beforeAll, expect, it } from 'vitest';
import { ids } from '@mandate/kernel';
import { replayS29 } from '../../../docs/playtests/s35-replay.ts';

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

it('the same recorded human commands bring received hour-stamped Manassas papers by the July horizon', () => {
  expect(replay.summary.battles.some(b => b.id.startsWith('battle:manassas:'))).toBe(true);
  expect(replay.summary.fieldPapers.some(p => p.claims.some(c => c.region === 'manassas'))).toBe(true);
});
