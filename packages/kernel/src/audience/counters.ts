/**
 * The audience's counters as a command carries them (lane 1.5; M2's typed counters). Kept apart from `audience.ts`, which
 * reads State, so the command list (and through it the view layer's seat API) imports no State module.
 */
export const COUNTER_KINDS = ['frame', 'adjust', 'reinforce', 'promise_advancement', 'withdraw_overseer', 'ease_pressure', 'vindicate', 'threaten'] as const;
export type CounterKind = (typeof COUNTER_KINDS)[number];

/** A counter as a command carries it. `value` is for frame, `boldness` for adjust, `from` and `men` for reinforce. */
export interface CounterTerms {
  readonly kind: CounterKind;
  readonly value: string | null;
  readonly boldness: number | null;
  readonly from: string | null;
  readonly men: number | null;
}