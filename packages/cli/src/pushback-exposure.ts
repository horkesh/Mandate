/** Read-only issue/receipt audit. End-of-day transit alone misses zero-day deliveries. */
import { phase0, world as calendar } from '@mandate/kernel';
import type { PushbackRegister } from '@mandate/pack-format';
import type { CoverageAct } from './pushback-coverage.ts';

export interface RequestExposure {
  readonly order: string;
  readonly side: string | null;
  readonly kind: string;
  readonly actor: string;
  readonly post?: string;
  readonly to?: string;
  readonly subject?: string;
  readonly callId?: string | null;
  readonly regiments?: number | null;
  readonly termDays?: number | null;
  readonly objective?: string;
  readonly posture?: string;
  readonly issuedDay: number;
  readonly receivedDays: readonly number[];
}
export function observeExposure() {
  const requests = new Map<string, RequestExposure>();
  const receipts = new Map<string, Set<number>>();
  const onTick = (world: phase0.SeatsWorld, result: phase0.TickResult) => {
    for (const msg of result.requestDispatches ?? []) {
      const o = msg.msgOrder, v = msg.msgVerb;
      if (o === null && v === null) continue;
      const issuer = o?.orderIssuer ?? v!.verbIssuer;
      const last = msg.msgPending.at(-1);
      const call = o?.orderCall;
      const request: RequestExposure = {
        order: msg.msgOrigin, side: world.factionIds.find(f => world.faction(f).principal === issuer) ?? null,
        kind: o?.orderKind ?? `verb:${v!.verbKind}`, actor: last?.hopPerson ?? msg.msgTo,
        issuedDay: o?.orderIssuedDay ?? v!.verbIssuedDay, receivedDays: [],
        ...(o === null ? {} : { post: o.orderTarget }),
        ...(call == null ? {} : { callId: call.callId ?? null, regiments: call.callRegiments, termDays: call.callTermDays }),
        ...(o?.orderGoal == null ? {} : { objective: o.orderGoal.goalObjective ?? undefined, posture: o.orderGoal.goalPosture }),
        ...(v === null ? {} : { subject: v.verbSubject ?? undefined, post: v.verbPost ?? undefined, to: v.verbTo ?? undefined }),
      };
      requests.set(request.order, request);
    }
    for (const msg of result.requestReceipts ?? []) {
      if (msg.msgRole !== 'addressee') continue;
      const key = `${msg.msgOrigin}|${msg.msgTo}`;
      const days = receipts.get(key) ?? new Set<number>();
      days.add(result.day); receipts.set(key,days);
      // Office-addressed calls resolve their named recipient at delivery.
      const old = requests.get(msg.msgOrigin);
      if (old !== undefined) requests.set(msg.msgOrigin,{ ...old, actor: msg.msgTo });
    }
  };
  return { onTick, observations: () => [...requests.values()].map(r => ({ ...r, receivedDays: [...(receipts.get(`${r.order}|${r.actor}`) ?? [])].sort((a,b) => a-b) })) };
}

export function exposureRows(registers: readonly PushbackRegister[], requests: readonly RequestExposure[], answers: readonly CoverageAct[], start: string, lastDay: number) {
  return registers.flatMap(register => register.rows.filter(r => r.status === 'eligible').map(row => {
    const horizon = calendar.daysFromCivil(calendar.parseIsoDate(register.through))-calendar.daysFromCivil(calendar.parseIsoDate(start));
    const match = row.match;
    const demand = match === undefined ? undefined : { ...match, kind: match.kind === 'goal-proposal' ? 'goal' : match.kind };
    const exact = demand === undefined ? [] : requests.filter(r => r.issuedDay <= horizon && r.side === row.side && r.actor === row.actor &&
      (['kind','callId','regiments','termDays','subject','objective','posture','post','to'] as const).every(k => demand[k] === undefined || demand[k] === r[k]));
    const received = exact.filter(r => r.receivedDays.some(day => day <= horizon));
    const replied = received.flatMap(r => answers.filter(a => a.order === r.order && a.actor === row.actor && a.role === row.role && a.day <= horizon));
    const gap = row.gap !== undefined;
    return { id: row.id, side: row.side, actor: row.actor, horizon, issued: exact.length > 0, received: received.length > 0, answered: replied.length > 0,
      cause: gap ? 'request_not_representable' : lastDay < horizon ? 'horizon_incomplete' : exact.length === 0 ? 'request_absent' : received.length === 0 ? 'not_received_by_horizon' : replied.length === 0 ? 'received_without_answer' : 'answered',
      orders: exact, answers: replied.map(a => a.id),
      nearbyRequests: requests.filter(r => r.actor === row.actor && r.side === row.side && r.issuedDay <= horizon).map(r => r.order),
      limitation: gap ? row.gap!.reason : null,
    };
  }));
}
