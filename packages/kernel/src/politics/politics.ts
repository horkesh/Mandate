/**
 * Politics (lane 1.6; FOUNDATION section 7; 0028, 0040, 0046): blocs, the legislature's chambers and the accountability
 * ledger, and the framing term, owned by `politics`; the mandate and the principal's credibility derived from them.
 *
 * - **Blocs** (M2's `derive`, recast): each holds signed-permille support, moved by addresses, the ladder, the press
 *   and situations' proposals, and drifting weekly back toward its rest. The mandate is their support weighted by voice,
 *   plus the framing term.
 * - **Chambers** sit, stand adjourned, or have a special session called (0040), by the pack's calendar and by calls.
 * - **The ledger** (0046): an act a situation marks as owed to the legislature is entered on the day it is taken. It is
 *   met on the first day a chamber of its side sits, and answered when an option answers it (S20's ratification).
 * - **Framing** (0028, 0040): who each side's public believes began the war, signed permille (positive: the other side).
 *
 * Nothing here draws a die. Each change is a typed delta from its proposer; this module is the only writer of the four
 * fields, and every derived number returns its terms (hard rule 6).
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId, SituationId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import type { PoliticsRules, SessionRule } from './rules.ts';

export const CHAMBER_STATES = ['adjourned', 'called', 'sitting'] as const;
export type ChamberStateKind = (typeof CHAMBER_STATES)[number];

/** A chamber today. `chamSession` is the session it sits in or has been called to; the days are from the calendar or the call. */
export interface ChamberState {
  readonly chamState: ChamberStateKind;
  readonly chamSession: string | null;
  readonly chamOpens: number | null;
  readonly chamCloses: number | null;
  /** The session was called, not regular: it holds until it closes, whatever the calendar says. */
  readonly chamCalled: boolean;
  /** The day it entered this state. */
  readonly chamSince: number;
}

/** An act taken that the legislature is owed an answer for (0046). */
export interface CongressAct {
  readonly ledgerAct: string;
  readonly ledgerSide: FactionId;
  readonly ledgerDay: number;
  readonly ledgerSituation: SituationId | null;
  readonly ledgerOption: string | null;
  /** The first day a chamber of its side sat with it on the ledger (the day taken, if one sat then). */
  readonly ledgerMetDay: number | null;
  readonly ledgerAnsweredDay: number | null;
}

/** A typed delta for `politics`. */
export type PoliticsChange =
  | { readonly change: 'support'; readonly bloc: string; readonly delta: number; readonly reason: string }
  | { readonly change: 'framing'; readonly faction: FactionId; readonly delta: number; readonly reason: string }
  | { readonly change: 'act'; readonly act: string; readonly side: FactionId; readonly situation: SituationId | null; readonly option: string | null }
  | { readonly change: 'answer'; readonly act: string | null; readonly side: FactionId }
  | { readonly change: 'call'; readonly session: string };

/** What a change did, or why it was refused (a refusal changes nothing). */
export interface PoliticsEvent {
  readonly polEvent: 'support' | 'framing' | 'act' | 'answered' | 'called' | 'opened' | 'adjourned' | 'met' | 'refused';
  readonly polSubject: string;
  readonly polValue: number;
  readonly polWhy: string;
}

/** One term of a derived political number (hard rule 6). */
export interface PoliticsTerm {
  readonly polKind: 'bloc' | 'framing' | 'base' | 'mandate' | 'reliefs' | 'floor' | 'ceiling';
  readonly polSubject: string | null;
  readonly polValue: number;
}

const clampSigned = (v: number): number => Math.max(-1000, Math.min(1000, v));
const scale = (v: number, permille: number): number => Math.trunc((v * permille) / 1000);

/** A bloc's support: absent is its rest (the start is the rest, 0072: the pack states it). */
export function supportOf(rules: PoliticsRules, state: State, bloc: string): number {
  const held = state.blocSupport[bloc];
  if (held !== undefined) return held;
  return rules.blocs.find((b) => b.id === bloc)?.rest ?? 0;
}

/** The support of every bloc at the start: its rest. */
export function initialBlocSupport(rules: PoliticsRules): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of [...rules.blocs].sort((x, y) => strictCompare(x.id, y.id))) out[b.id] = b.rest;
  return out;
}

/** The faction's mandate (P10): its blocs' support weighted by voice, plus the framing term. Range -1000..1000. */
export function mandateOf(rules: PoliticsRules, state: State, faction: FactionId): { readonly value: number; readonly terms: readonly PoliticsTerm[] } {
  const terms: PoliticsTerm[] = [];
  for (const b of [...rules.blocs].sort((x, y) => strictCompare(x.id, y.id))) {
    if (b.faction !== faction) continue;
    terms.push({ polKind: 'bloc', polSubject: b.id, polValue: scale(supportOf(rules, state, b.id), b.voice) });
  }
  const framing = state.warFraming[faction] ?? 0;
  if (framing !== 0) terms.push({ polKind: 'framing', polSubject: faction, polValue: scale(framing, rules.framing.mandatePermille) });
  return { value: clampSigned(terms.reduce((a, t) => a + t.polValue, 0)), terms };
}

/**
 * The principal's sanction credibility (P7), derived (replaces the stand-in of 0079): the pack's base, a share of his
 * mandate, and the men who hold a relief against him, within the pack's bounds. Each term is returned.
 */
export function credibilityOf(rules: PoliticsRules, state: State, faction: FactionId | null, principal: PersonId | null): { readonly value: number; readonly terms: readonly PoliticsTerm[] } {
  const c = rules.credibility;
  const terms: PoliticsTerm[] = [{ polKind: 'base', polSubject: null, polValue: c.base }];
  if (faction !== null) terms.push({ polKind: 'mandate', polSubject: faction, polValue: scale(mandateOf(rules, state, faction).value, c.mandatePermille) });
  if (principal !== null) {
    let reliefs = 0;
    for (const p of Object.keys(state.personGrievances).sort(strictCompare) as PersonId[]) {
      if (state.personGrievances[p]!.some((g) => g.grievanceKind === 'relieved' && g.grievanceAgainst === principal)) reliefs += 1;
    }
    if (reliefs > 0) terms.push({ polKind: 'reliefs', polSubject: principal, polValue: reliefs * c.perRelief });
  }
  const raw = terms.reduce((a, t) => a + t.polValue, 0);
  const value = Math.max(c.min, Math.min(c.max, raw));
  if (value > raw) terms.push({ polKind: 'floor', polSubject: null, polValue: value - raw });
  if (value < raw) terms.push({ polKind: 'ceiling', polSubject: null, polValue: value - raw });
  return { value, terms };
}

/** Whether any chamber of `faction` sits today. */
export function sideSits(rules: PoliticsRules, state: State, faction: FactionId): boolean {
  return rules.chambers.some((c) => c.faction === faction && state.chamberStates[c.id]?.chamState === 'sitting');
}

/** A session's day, counted from the calendar's day 0. */
function dayOfIso(calendarStart: string, iso: string): number {
  return daysFromCivil(parseIsoDate(iso)) - daysFromCivil(parseIsoDate(calendarStart));
}

/** A regular session's days. */
function regularDays(calendarStart: string, s: SessionRule): { readonly opens: number; readonly closes: number } {
  return { opens: dayOfIso(calendarStart, s.opens!), closes: dayOfIso(calendarStart, s.closes!) };
}

/** A callable session's days, called on `day`. */
function calledDays(calendarStart: string, s: SessionRule, day: number): { readonly opens: number; readonly closes: number } {
  const opens = s.opens !== null ? Math.max(dayOfIso(calendarStart, s.opens), day + 1) : day + s.afterCallDays!;
  const closes = s.closes !== null ? Math.max(opens, dayOfIso(calendarStart, s.closes)) : opens + s.sitsDays! - 1;
  return { opens, closes };
}

/**
 * Each chamber on `day`: a called session holds until it closes; otherwise the regular session the calendar has
 * sitting today, or adjourned. Pure; `chamberStep` writes it.
 */
export function chambersOn(rules: PoliticsRules, calendarStart: string | null, current: State['chamberStates'], day: number): Record<string, ChamberState> {
  const out: Record<string, ChamberState> = {};
  for (const c of [...rules.chambers].sort((x, y) => strictCompare(x.id, y.id))) {
    const now = current[c.id];
    let next: Omit<ChamberState, 'chamSince'>;
    if (now !== undefined && now.chamCalled && now.chamCloses !== null && day <= now.chamCloses) {
      next = { chamState: day >= now.chamOpens! ? 'sitting' : 'called', chamSession: now.chamSession, chamOpens: now.chamOpens, chamCloses: now.chamCloses, chamCalled: true };
    } else {
      const regular = calendarStart === null ? undefined : rules.sessions.find((s) => !s.callable && s.chambers.includes(c.id) && (() => { const d = regularDays(calendarStart, s); return d.opens <= day && day <= d.closes; })());
      if (regular !== undefined) {
        const d = regularDays(calendarStart!, regular);
        next = { chamState: 'sitting', chamSession: regular.id, chamOpens: d.opens, chamCloses: d.closes, chamCalled: false };
      } else {
        next = { chamState: 'adjourned', chamSession: null, chamOpens: null, chamCloses: null, chamCalled: false };
      }
    }
    const same = now !== undefined && now.chamState === next.chamState && now.chamSession === next.chamSession && now.chamOpens === next.chamOpens && now.chamCloses === next.chamCloses && now.chamCalled === next.chamCalled;
    out[c.id] = same ? now : { ...next, chamSince: day };
  }
  return out;
}

/**
 * Apply politics changes in order, then the chambers and the ledger for `day`. The only writer of `blocSupport`,
 * `chamberStates`, `congressLedger` and `warFraming`. A change that cannot be carried out is refused, with its reason.
 */
export function applyPolitics(rules: PoliticsRules, start: State, changes: readonly PoliticsChange[], day: number): { readonly state: State; readonly events: readonly PoliticsEvent[] } {
  const events: PoliticsEvent[] = [];
  const support: Record<string, number> = { ...start.blocSupport };
  const framing: Record<FactionId, number> = { ...start.warFraming };
  let ledger: CongressAct[] = [...start.congressLedger];
  let chambers: Record<string, ChamberState> = { ...start.chamberStates };
  const refuse = (subject: string, why: string) => events.push({ polEvent: 'refused', polSubject: subject, polValue: 0, polWhy: why });
  for (const c of changes) {
    switch (c.change) {
      case 'support': {
        if (!rules.blocs.some((b) => b.id === c.bloc)) { refuse(c.bloc, `no bloc ${c.bloc}`); break; }
        const before = support[c.bloc] ?? supportOf(rules, start, c.bloc);
        support[c.bloc] = clampSigned(before + c.delta);
        events.push({ polEvent: 'support', polSubject: c.bloc, polValue: support[c.bloc]! - before, polWhy: c.reason });
        break;
      }
      case 'framing': {
        const before = framing[c.faction] ?? 0;
        framing[c.faction] = clampSigned(before + c.delta);
        events.push({ polEvent: 'framing', polSubject: c.faction, polValue: framing[c.faction]! - before, polWhy: c.reason });
        break;
      }
      case 'act': {
        const sits = rules.chambers.some((ch) => ch.faction === c.side && chambers[ch.id]?.chamState === 'sitting');
        ledger.push({ ledgerAct: c.act, ledgerSide: c.side, ledgerDay: day, ledgerSituation: c.situation, ledgerOption: c.option, ledgerMetDay: sits ? day : null, ledgerAnsweredDay: null });
        events.push({ polEvent: 'act', polSubject: c.act, polValue: sits ? 1 : 0, polWhy: sits ? 'before_the_legislature' : 'taken_while_away' });
        break;
      }
      case 'answer': {
        const owed = ledger.filter((e) => e.ledgerSide === c.side && e.ledgerMetDay !== null && e.ledgerAnsweredDay === null && (c.act === null || e.ledgerAct === c.act));
        if (owed.length === 0) { refuse(c.act ?? c.side, 'nothing before the legislature to answer'); break; }
        ledger = ledger.map((e) => (owed.includes(e) ? { ...e, ledgerAnsweredDay: day } : e));
        for (const e of owed) events.push({ polEvent: 'answered', polSubject: e.ledgerAct, polValue: day - e.ledgerDay, polWhy: 'answered' });
        break;
      }
      case 'call': {
        const s = rules.sessions.find((x) => x.id === c.session);
        if (s === undefined || !s.callable) { refuse(c.session, `no callable session ${c.session}`); break; }
        if (start.calendarStart === null) { refuse(c.session, 'no calendar'); break; }
        if (s.chambers.some((ch) => chambers[ch]?.chamCalled === true || chambers[ch]?.chamState === 'sitting')) { refuse(c.session, 'a chamber already sits or is called'); break; }
        const d = calledDays(start.calendarStart, s, day);
        for (const ch of s.chambers) chambers[ch] = { chamState: 'called', chamSession: s.id, chamOpens: d.opens, chamCloses: d.closes, chamCalled: true, chamSince: day };
        events.push({ polEvent: 'called', polSubject: s.id, polValue: d.opens, polWhy: 'called' });
        break;
      }
    }
  }
  // The chambers today, then the ledger met by any that sits.
  const next = chambersOn(rules, start.calendarStart, chambers, day);
  for (const id of Object.keys(next).sort(strictCompare)) {
    const was = chambers[id]?.chamState;
    const now = next[id]!.chamState;
    if (was !== 'sitting' && now === 'sitting') events.push({ polEvent: 'opened', polSubject: id, polValue: day, polWhy: next[id]!.chamSession ?? '' });
    if (was === 'sitting' && now !== 'sitting') events.push({ polEvent: 'adjourned', polSubject: id, polValue: day, polWhy: chambers[id]!.chamSession ?? '' });
  }
  chambers = next;
  ledger = ledger.map((e) => {
    if (e.ledgerMetDay !== null) return e;
    if (!rules.chambers.some((ch) => ch.faction === e.ledgerSide && chambers[ch.id]!.chamState === 'sitting')) return e;
    events.push({ polEvent: 'met', polSubject: e.ledgerAct, polValue: day - e.ledgerDay, polWhy: 'met' });
    return { ...e, ledgerMetDay: day };
  });
  const sameChambers = Object.keys(chambers).length === Object.keys(start.chamberStates).length && Object.keys(chambers).every((k) => chambers[k] === start.chamberStates[k]);
  const sameLedger = ledger.length === start.congressLedger.length && ledger.every((e, i) => e === start.congressLedger[i]);
  const changedSupport = changes.some((c) => c.change === 'support');
  const changedFraming = changes.some((c) => c.change === 'framing');
  if (sameChambers && sameLedger && !changedSupport && !changedFraming) return { state: start, events };
  return {
    state: {
      ...start,
      blocSupport: changedSupport ? support : start.blocSupport,
      warFraming: changedFraming ? framing : start.warFraming,
      chamberStates: sameChambers ? start.chamberStates : chambers,
      congressLedger: sameLedger ? start.congressLedger : ledger,
    },
    events,
  };
}

/** The weekly drift (M2's `blocDrift`): each bloc closes 1/divisor of the gap to its rest. As changes, for `applyPolitics`. */
export function driftChanges(rules: PoliticsRules, state: State): PoliticsChange[] {
  const out: PoliticsChange[] = [];
  for (const b of [...rules.blocs].sort((x, y) => strictCompare(x.id, y.id))) {
    const delta = Math.trunc((b.rest - supportOf(rules, state, b.id)) / rules.drift.divisor);
    if (delta !== 0) out.push({ change: 'support', bloc: b.id, delta, reason: 'drift' });
  }
  return out;
}

/** An address (M2's): the bloc gains, and the side's blocs sharing none of its values lose. */
export function addressChanges(rules: PoliticsRules, bloc: string): PoliticsChange[] {
  const target = rules.blocs.find((b) => b.id === bloc);
  if (target === undefined) return [{ change: 'support', bloc, delta: 0, reason: 'address' }];
  const out: PoliticsChange[] = [{ change: 'support', bloc, delta: rules.address.support, reason: 'address' }];
  for (const b of [...rules.blocs].sort((x, y) => strictCompare(x.id, y.id))) {
    if (b.id === bloc || b.faction !== target.faction) continue;
    if (!b.values.some((v) => target.values.includes(v))) out.push({ change: 'support', bloc: b.id, delta: rules.address.othersPenalty, reason: 'address_elsewhere' });
  }
  return out;
}
