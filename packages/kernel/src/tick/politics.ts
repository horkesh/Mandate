/**
 * The politics phase (lane 1.6; FOUNDATION section 10's phase 7, "bloc drift", and the chambers by the calendar),
 * after the weekly people step (4e). `politics` applies, in order:
 *  1. today's proposals: addresses (lane 1.5's verb) and situations' effects on the fields it builds;
 *  2. on the people step's week: each bloc's drift toward its rest, and the ladder's pull on blocs (M2's rules);
 *  3. on the press's cadence: each paper's front page, sent to its side's readers, its effects proposed to `politics`
 *     (blocs) and `people` (a commander's standing);
 *  4. the chambers by the calendar and any call, and the ledger met by a chamber that sits.
 * Fields it does not build yet (the foreign clocks, national will: 1B) are left reported, as before.
 */
import { strictCompare } from '../compare.ts';
import { heldPost, sideOfPerson } from '../command/command.ts';
import type { FactionId, PersonId } from '../ids.ts';
import { rungIndex, rungOf } from '../ladder/ladder.ts';
import { term } from '../knowledge/truth.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { addressChanges, applyPolitics, driftChanges, type PoliticsChange } from '../politics/politics.ts';
import { frontPage } from '../politics/press.ts';
import type { PoliticsRules } from '../politics/rules.ts';
import type { State } from '../root-state.ts';
import { fire, sendReport, type Proposal, type TickContext } from './context.ts';
import { isPeopleWeek } from './people-week.ts';

/** The fields of `politics` a situation's effect may name: the ones built here, and the ones 1B builds (reported, not applied). */
export const POLITICS_FIELDS = ['bloc-support', 'framing', 'ledger-act', 'ledger-answer', 'session-call'] as const;
export const POLITICS_RESERVED_FIELDS = ['foreign-patience', 'national-will'] as const;

export const POLITICS_MECHANICS = [
  'politics.act',
  'politics.adjourned',
  'politics.answered',
  'politics.called',
  'politics.framing',
  'politics.front_page',
  'politics.met',
  'politics.opened',
  'politics.press_silent',
  'politics.refused',
  'politics.support',
] as const;

/** A situation's effect on `politics` as a change, or the reason it cannot be one (null: a field 1B builds). */
export function effectChange(p: Extract<Proposal, { proposal: 'effect' }>): PoliticsChange | string | null {
  switch (p.field) {
    case 'bloc-support':
      return p.subject === null ? 'bloc-support names no bloc' : { change: 'support', bloc: p.subject, delta: p.delta, reason: p.reason };
    case 'framing': {
      const faction = (p.subject ?? p.side) as FactionId | null;
      return faction === null ? 'framing names no side' : { change: 'framing', faction, delta: p.delta, reason: p.reason };
    }
    case 'ledger-act':
      return p.subject === null || p.side === null ? 'a ledger act needs its id and side' : { change: 'act', act: p.subject, side: p.side, situation: p.situation, option: p.option };
    case 'ledger-answer':
      return p.side === null ? 'an answer needs its side' : { change: 'answer', act: p.subject, side: p.side };
    case 'session-call':
      return p.subject === null ? 'a call names no session' : { change: 'call', session: p.subject };
    default:
      return (POLITICS_RESERVED_FIELDS as readonly string[]).includes(p.field) ? null : `politics has no field ${p.field}`;
  }
}

/** The ladder's weekly pull on blocs (M2's `ladder.ts`): a man lobbying or above drains his own bloc, and more. */
function ladderChanges(ctx: TickContext, state: State, rules: PoliticsRules): PoliticsChange[] {
  const out: PoliticsChange[] = [];
  const lobbying = rungIndex('lobbying');
  const blocOf = new Map(ctx.world.map.world.people.map((r) => [r.id, r.bloc] as const));
  for (const p of [...ctx.world.personIds].sort(strictCompare)) {
    const index = rungIndex(rungOf(state, p));
    if (index < lobbying) continue;
    const bloc = blocOf.get(p) ?? null;
    const own = bloc !== null && rules.blocs.some((b) => b.id === bloc) ? bloc : null;
    if (own !== null) out.push({ change: 'support', bloc: own, delta: (index - lobbying + 1) * rules.ladder.lobbyingPerRung, reason: `ladder:${p}` });
    if (index >= rungIndex('public_defiance')) {
      const side = sideOfPerson(ctx.world.map, state, p);
      for (const b of [...rules.blocs].sort((x, y) => strictCompare(x.id, y.id))) if (b.faction === side) out.push({ change: 'support', bloc: b.id, delta: rules.ladder.publicDefiance, reason: `defiance:${p}` });
    }
    if (own !== null && state.personRivals[p] !== undefined) out.push({ change: 'support', bloc: own, delta: rules.ladder.rival, reason: `rival:${p}` });
  }
  return out.filter((c) => c.change !== 'support' || c.delta !== 0);
}

/** The readers of a side's papers: its principal and every serving holder of one of its posts. */
function readers(ctx: TickContext, state: State, faction: FactionId): PersonId[] {
  const out = new Set<PersonId>();
  if (ctx.world.factionIds.includes(faction)) out.add(ctx.world.faction(faction).principal);
  for (const post of Object.keys(state.postStates).sort(strictCompare)) {
    const holder = state.postStates[post as keyof typeof state.postStates]!.postHolder;
    if (holder === null || state.personStatus[holder]?.statusKind !== 'serving') continue;
    if (sideOfPerson(ctx.world.map, state, holder) === faction) out.add(holder);
  }
  return [...out].sort(strictCompare);
}

export function politicsPhase(ctx: TickContext, start: State): State {
  const rules = ctx.world.map.world.rules.politics;
  const changes: PoliticsChange[] = [];
  // 1. Today's proposals, in the order they were made.
  for (const p of ctx.proposals) {
    if (p.proposal === 'address') changes.push(...addressChanges(rules, p.bloc));
    else if (p.proposal === 'effect' && p.owner === 'politics') {
      const c = effectChange(p);
      if (typeof c === 'string') {
        ctx.mapEvents.push({ event: 'proposal_refused', owner: 'politics', reason: p.field, why: c });
        fire(ctx, 'politics.refused');
      } else if (c !== null) changes.push(c);
    }
  }
  // 2. The week: drift, and the ladder's pull.
  if (isPeopleWeek(ctx)) changes.push(...driftChanges(rules, start), ...ladderChanges(ctx, start, rules));
  // 3. The press.
  let state = start;
  if (rules.press.cadenceDays > 0 && ctx.day % rules.press.cadenceDays === 0) {
    const people: PeopleChange[] = [];
    for (const paper of [...rules.press.papers].sort((x, y) => strictCompare(x.id, y.id))) {
      const editor = paper.editor;
      if (state.personStatus[editor]?.statusKind !== 'serving' || sideOfPerson(ctx.world.map, state, editor) !== paper.faction) {
        fire(ctx, 'politics.press_silent');
        continue;
      }
      // Its losses are its side's principal's returns, never the battle record (0008, 0052).
      const principal = ctx.world.factionIds.includes(paper.faction) ? ctx.world.faction(paper.faction).principal : null;
      const page = frontPage(rules, state, paper, ctx.day, principal, ctx.world.map.world.rules.operations.returns.revealDays);
      changes.push(...page.politics);
      people.push(...page.people);
      for (const reader of readers(ctx, state, paper.faction)) {
        if (reader === editor) continue;
        sendReport(ctx, state, {
          body: {
            reportType: 'press',
            reportSubtype: null,
            reportAuthor: editor,
            reportAuthorPost: heldPost(state, editor),
            reportSubjectKind: 'person',
            reportSubjectId: editor,
            reportClaims: page.claims,
            reportDay: ctx.day,
            reportHour: null,
            reportAdvice: null,
            reportAnswers: null,
          },
          truth: { truthTerms: [term('press_reach', paper.reachPermille, { person: editor, region: paper.region, rule: paper.id })], truthTrimmed: [] },
          to: reader,
          tag: `press.${paper.id}.${reader}`,
          fromRegion: paper.region,
        });
      }
      fire(ctx, 'politics.front_page');
    }
    if (people.length > 0) state = applyPeopleChanges(state, people, ctx.day, ctx.world.rules.people, ctx.world.map.world.vocabularies.ranks);
  }
  // 4. Apply, with the chambers and the ledger for today.
  const applied = applyPolitics(rules, state, changes, ctx.day);
  for (const e of applied.events) {
    fire(ctx, `politics.${e.polEvent}`);
    if (e.polEvent === 'refused') ctx.mapEvents.push({ event: 'proposal_refused', owner: 'politics', reason: e.polSubject, why: e.polWhy });
  }
  return applied.state;
}
