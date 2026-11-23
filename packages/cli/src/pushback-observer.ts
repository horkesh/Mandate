/** Archive typed observations before State's ordinary retention removes them. */
import { phase0 } from '@mandate/kernel';
import type { CoverageAct } from './pushback-coverage.ts';

type Matter = Partial<Pick<CoverageAct, 'side' | 'callId' | 'regiments' | 'termDays' | 'subject' | 'objective' | 'posture' | 'post' | 'to'>>;
export function observePushback() {
  const matters = new Map<string, Matter>();
  const acts = new Map<string, CoverageAct>();
  const advice = new Map<string, string>();
  const onTick = (world: phase0.SeatsWorld, r: phase0.TickResult) => {
    const sideOfIssuer = (person: string | undefined): string | null => world.factionIds.find(f => world.faction(f).principal === person) ?? null;
    const merge = (id: string, data: Matter) => matters.set(id, { ...matters.get(id), ...data });
    const proposal = (body: phase0.ReportBody) => {
      if (body.reportProposal === undefined || body.reportAnswers === null || body.reportDay > r.day) return;
      const order = body.reportAnswers;
      const id = `${order}|${body.reportAuthor}|goal-proposal|${body.reportDay}`;
      if (acts.has(id)) return;
      // The paper answers the original order. Its proposed destination must not
      // replace the matter being challenged, and the answer cannot buy a second credit.
      acts.set(id, { id, creditKey: `${order}|${body.reportAuthor}|addressee|`, order, side: null,
        actor: body.reportAuthor, role: 'addressee', kind: 'goal-proposal', actual: 'propose', declared: 'propose', day: body.reportDay,
        ...(body.reportAuthorPost === null ? {} : { post: body.reportAuthorPost }) });
    };
    for (const m of r.state.messagesInTransit) {
      const order = m.msgOrder;
      const verb = m.msgVerb;
      if (order !== null) merge(m.msgOrigin, {
        side: sideOfIssuer(order.orderIssuer),
        ...(order.orderCall?.callId === undefined ? {} : { callId: order.orderCall.callId }),
        ...(order.orderCall == null ? {} : { regiments: order.orderCall.callRegiments, termDays: order.orderCall.callTermDays }),
        ...(order.orderGoal === null ? {} : { objective: order.orderGoal.goalObjective ?? undefined, posture: order.orderGoal.goalPosture }),
      });
      if (verb !== null) merge(m.msgOrigin, { side: sideOfIssuer(verb.verbIssuer), subject: verb.verbSubject ?? undefined, post: verb.verbPost ?? undefined, to: verb.verbTo ?? undefined });
      if (m.msgReport !== null && m.msgReport !== undefined) {
        proposal(m.msgReport);
        const recipient = m.msgPending.at(-1)?.hopPerson ?? m.msgTo;
        const side = sideOfIssuer(recipient);
        if (side !== null) merge(m.msgOrigin, { side, subject: m.msgReport.reportSubjectId });
        if (m.msgReport.reportAnswers !== null && m.msgReport.reportAdvice !== null) advice.set(`${m.msgReport.reportAnswers}|${m.msgReport.reportAuthor}`, m.msgReport.reportAdvice.adviceRecommends);
      }
    }
    for (const plan of Object.values(r.state.planRecords)) merge(plan.planOrder, { side: sideOfIssuer(plan.planIssuer), objective: plan.planGoal.goalObjective ?? undefined, posture: plan.planGoal.goalPosture });
    // Same-day calls can leave transit before onTick. A levy retains the original
    // service term and issuer, but its number raised must never stand for the number asked.
    for (const levy of Object.values(r.state.postLevies)) merge(levy.levyCall, { side: sideOfIssuer(levy.levyIssuer), termDays: levy.levyTermDays });
    for (const e of r.events) if (e.event === 'policy' && e.message !== null) merge(e.message, { side: sideOfIssuer(e.person) });
    for (const f of world.factionIds) {
      const held = r.state.knowledgeBySeat[phase0.seatIdFor(world.faction(f).principal)];
      for (const sent of held?.knownSentOrders ?? []) merge(sent.sentMessage, { side: f, ...(sent.sentGoal === undefined ? {} : { objective: sent.sentGoal.goalObjective ?? undefined, posture: sent.sentGoal.goalPosture }) });
      for (const report of held?.knownReports ?? []) {
        if (report.knownReceivedDay <= r.day) proposal(report.knownBody);
        const b = report.knownBody;
        if (b.reportAnswers !== null) {
          merge(b.reportAnswers, { side: f });
          if (b.reportAdvice !== null) advice.set(`${b.reportAnswers}|${b.reportAuthor}`, b.reportAdvice.adviceRecommends);
        }
      }
    }
    for (const [key, a] of Object.entries(r.state.orderResponses)) {
      if (a.respDay !== r.day) continue;
      const id = `${key}|${a.respRole}|${a.respActual}|${a.respDay}`;
      if (acts.has(id)) continue;
      acts.set(id, { id, creditKey: `${a.respOrder}|${a.respPerson}|${a.respRole}|${a.respNote ?? ''}`, order: a.respOrder, side: null, actor: a.respPerson, role: a.respRole, kind: a.respKind, actual: a.respActual, declared: a.respDeclared, day: a.respDay, ...(a.respPost === null || a.respPost === undefined ? {} : { post: a.respPost }), ...(a.respKind === 'call' ? { callId: a.respCallId ?? null } : {}),
        ...(a.respUndertaking === undefined ? {} : { undertaking: a.respUndertaking }),
        ...(a.respDeclaredUndertaking === undefined ? {} : { declaredUndertaking: a.respDeclaredUndertaking }),
        ...(a.respReservations === undefined ? {} : { reservations: a.respReservations }),
        ...(a.respDeclaredReservations === undefined ? {} : { declaredReservations: a.respDeclaredReservations }),
        ...(a.respReservationGaps === undefined ? {} : { reservationGaps: a.respReservationGaps }),
        ...(a.respDeclaredReservationGaps === undefined ? {} : { declaredReservationGaps: a.respDeclaredReservationGaps }),
      });
    }
    for (const e of r.events) {
      if (e.event !== 'filtered' || e.message === null) continue;
      for (const [actual, term] of [['hold', 'filter_hold'], ['trim', 'filter_trim']] as const) {
        if (!e.terms.some(t => t.termKind === term)) continue;
        const id = `${e.message}|${e.person}|filter|${actual}|${r.day}`;
        acts.set(id, { id, order: e.message, side: null, actor: e.person, role: 'filter', kind: 'incoming-report', actual, declared: actual, day: r.day });
      }
    }
  };
  return { onTick, observations: (): CoverageAct[] => [...acts.values()].map(a => ({ ...a, ...matters.get(a.order), ...(advice.has(`${a.order}|${a.actor}`) ? { advice: advice.get(`${a.order}|${a.actor}`)! } : {}) })) };
}
