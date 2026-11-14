import type { Reason } from './directive.ts';
import { newId, type Author, type ClaimBody, type FactionId, type GameState, type LedgerEntry, type MessagePayload } from './state.ts';

/** Put a message on the wire. It arrives `delay` days after `sentDay` (P8). */
export function send(state: GameState, sentDay: number, delay: number, payload: MessagePayload): void {
  state.messages.push({ id: newId(state, 'msg'), sentDay, deliverDay: sentDay + delay, payload });
}

/** Send an authored claim to a faction's principal (P4). */
export function report(
  state: GameState,
  factionId: FactionId,
  author: Author,
  body: ClaimBody,
  delay: number,
): void {
  send(state, state.day, delay, {
    kind: 'claim',
    claim: { factionId, author, aboutDay: state.day, body },
  });
}

/** Append a ground-truth ledger entry with its causes. */
export function log(
  state: GameState,
  entry: {
    kind: string;
    factionId: FactionId | null;
    actors: readonly string[];
    reasons?: readonly Reason[];
    causes?: readonly string[];
    detail?: LedgerEntry['detail'];
  },
): void {
  state.ledger.push({
    day: state.day,
    kind: entry.kind,
    factionId: entry.factionId,
    actors: entry.actors,
    reasons: entry.reasons ?? [],
    causes: entry.causes ?? [],
    detail: entry.detail ?? {},
  });
}
