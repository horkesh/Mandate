/**
 * Observers (lane 1.5; 0040: "send an observer may target any rostered person"), owned by `command`: a person sent to a
 * commander's headquarters, who writes observer letters to whoever sent him. While he is there the watched man holds a
 * `monitored` grievance (proposed to `people`), and the principal's oversight of him rises by the pack's amount, as its
 * own typed term on top of the oversight stand-in (the lead's condition: whoever replaces the stand-in keeps this term).
 */
import { strictCompare } from '../compare.ts';
import type { PersonId, PostId } from '../ids.ts';
import type { State } from '../root-state.ts';

export interface ObserverPosting {
  /** The post whose headquarters he watches. */
  readonly obsPost: PostId;
  /** Who sent him, and to whom he reports. */
  readonly obsSender: PersonId;
  /** The day he arrived. */
  readonly obsSince: number;
  /** The day of his last letter. */
  readonly obsLastLetter: number;
}

/** Post an observer (the only writer, with `recallObserver` and `noteLetter`). */
export function postObserver(state: State, observer: PersonId, post: PostId, sender: PersonId, day: number): State {
  return { ...state, observerPostings: { ...state.observerPostings, [observer]: { obsPost: post, obsSender: sender, obsSince: day, obsLastLetter: day } } };
}

export function recallObserver(state: State, observer: PersonId): State {
  if (state.observerPostings[observer] === undefined) return state;
  const next: Record<PersonId, ObserverPosting> = { ...state.observerPostings };
  delete next[observer];
  return { ...state, observerPostings: next };
}

export function noteLetter(state: State, observer: PersonId, day: number): State {
  const o = state.observerPostings[observer];
  if (o === undefined) return state;
  return { ...state, observerPostings: { ...state.observerPostings, [observer]: { ...o, obsLastLetter: day } } };
}

/** The observers watching a post, in id order. */
export function observersAt(state: State, post: PostId): PersonId[] {
  return (Object.keys(state.observerPostings) as PersonId[]).filter((o) => state.observerPostings[o]!.obsPost === post).sort(strictCompare);
}
