import type { Claim, Decision, LedgerEntry, Reason } from '@mandate/kernel';

export function reason(r: Reason): string {
  if ('value' in r) return `${r.kind}(${r.value})`;
  if ('shortfall' in r) return `${r.kind}(${r.shortfall})`;
  if ('gap' in r) return `${r.kind}(${r.gap})`;
  return r.kind;
}

export function decision(d: Decision): string {
  switch (d.verb) {
    case 'direct':
      return `direct ${d.postId}: ${d.objective.kind}${d.objective.kind === 'attack' ? ` ${d.objective.targetRegionId}` : ''} @${d.boldness}`;
    case 'allocate':
      return `allocate ${d.amount} ${d.fromPostId} -> ${d.toPostId}`;
    case 'appoint':
      return `appoint ${d.personId} to ${d.postId}`;
    case 'address':
      return `address ${d.blocId}`;
    case 'insist':
    case 'accept_counter':
      return `${d.verb} on ${d.directiveId}`;
    default:
      return `${d.verb} ${d.personId}`;
  }
}

export function claim(c: Claim): string {
  const who = c.author.kind === 'person' ? c.author.personId : c.author.kind === 'overseer' ? `overseer watching ${c.author.watchingId}` : 'public word';
  const b = c.body;
  let what: string;
  switch (b.kind) {
    case 'response':
      what = `on ${b.directiveId}: "${b.declared}"${b.statedReasons.length ? ` because ${b.statedReasons.map(reason).join(', ')}` : ''}${b.counterBoldness !== null ? `; proposes boldness ${b.counterBoldness} instead` : ''}`;
      break;
    case 'op_result':
      what = `battle at ${b.regionId}: ${b.outcome}; enemy ${b.reportedEnemyForce}, our losses ${b.reportedOwnLosses}`;
      break;
    case 'signal':
      what = `${b.personId} is now ${b.rung}`;
      break;
    case 'enemy_strength':
      what = `enemy at ${b.regionId}: ${b.force}`;
      break;
  }
  return `[day ${c.knownDay}] ${who}: ${what}`;
}

export function ledger(e: LedgerEntry): string {
  const detail = Object.entries(e.detail).map(([k, v]) => `${k}=${v}`).join(' ');
  const reasons = e.reasons.length ? ` | reasons: ${e.reasons.map(reason).join(', ')}` : '';
  const causes = e.causes.length ? ` | causes: ${e.causes.join('; ')}` : '';
  return `[day ${e.day}] ${e.factionId ?? '-'} ${e.kind} ${e.actors.join(' ')}${detail ? ` {${detail}}` : ''}${reasons}${causes}`;
}
