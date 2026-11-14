import {
  advance,
  createGame,
  DEFAULT_KERNEL_RULES,
  mandate,
  playerFactionId,
  sanctionCredibility,
  sortedKeys,
  viewFor,
  type Decision,
  type FactionView,
  type GameState,
  type KernelRules,
  type TurnResult,
} from '@mandate/kernel';
import * as fmt from './format.ts';
import { loadScenario } from './load.ts';

export type Script = (view: FactionView, rules: KernelRules) => Decision[];

export interface RunLog {
  readonly turns: readonly TurnResult[];
  readonly final: GameState;
  readonly lines: readonly string[];
}

/** Run a pack headless for up to `maxTurns`, driving the player with `script`. */
export function runPack(packId: string, script: Script, maxTurns: number, rules: KernelRules = DEFAULT_KERNEL_RULES): RunLog {
  let state = createGame(loadScenario(packId));
  const player = playerFactionId(state);
  const lines: string[] = [];
  const turns: TurnResult[] = [];

  for (let i = 0; i < maxTurns && !state.verdict; i++) {
    const decisions = script(viewFor(state, player, rules), rules);
    const ledgerStart = state.ledger.length;
    const claimsStart = state.claims.length;
    const result = advance(state, decisions, rules);
    turns.push(result);
    state = result.state;

    lines.push(`\n=== Turn ${state.turn} · day ${result.fromDay} -> ${result.toDay} · stopped: ${result.stoppedBecause}`);
    lines.push(`You decided: ${decisions.length ? decisions.map(fmt.decision).join(' | ') : '(nothing)'}`);
    for (const r of result.rejections) lines.push(`  rejected: ${fmt.decision(r.decision)} (${r.reason})`);
    for (const f of sortedKeys(result.botDecisions)) {
      const d = result.botDecisions[f]!;
      lines.push(`${f} decided: ${d.length ? d.map(fmt.decision).join(' | ') : '(nothing)'}`);
    }
    lines.push('You were told:');
    const told = state.claims.slice(claimsStart).filter((c) => c.factionId === player);
    for (const c of told) lines.push(`  ${fmt.claim(c)}`);
    if (told.length === 0) lines.push('  (nothing)');
    lines.push('What actually happened:');
    for (const e of state.ledger.slice(ledgerStart)) {
      if (e.kind.startsWith('verb_')) continue;
      lines.push(`  ${fmt.ledger(e)}`);
    }
    lines.push(`Mandate ${mandate(state, player)} · sanction credibility ${sanctionCredibility(state, player, rules)} · attention ${state.factions[player]!.attentionPerTurn}/turn`);
  }

  lines.push('\n=== Verdict');
  lines.push(state.verdict ? `${state.verdict.kind}${state.verdict.factionId ? ` (${state.verdict.factionId})` : ''} on day ${state.verdict.day}: ${state.verdict.causes.join('; ')}` : `no verdict after ${turns.length} turns (day ${state.day})`);
  for (const f of sortedKeys(state.factions)) lines.push(`  ${f}: mandate ${mandate(state, f)}, regions ${Object.values(state.regions).filter((r) => r.controllerId === f).length}`);

  lines.push('\n=== What you were not told');
  const lies = Object.values(state.directives).filter((d) => d.factionId === player && d.response && d.response.declared !== d.response.actual);
  for (const d of lies) lines.push(`  ${d.response!.holderId} said "${d.response!.declared}" to ${d.id} but did "${d.response!.actual}" (willingness ${d.response!.willingness})`);
  if (lies.length === 0) lines.push('  every declared response matched the action');
  for (const id of sortedKeys(state.persons)) {
    const p = state.persons[id]!;
    if (p.factionId !== player || p.id === state.factions[player]!.principalId) continue;
    lines.push(`  ${p.id}: truly ${p.ladder}, regard ${p.regard}, standing ${p.standing}${p.rival ? ', RIVAL' : ''}, grievances ${p.grievances.map((g) => `${g.kind}:${g.weight}`).join(',') || 'none'}`);
  }
  return { turns, final: state, lines };
}
