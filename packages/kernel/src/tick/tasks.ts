/** Task dispatch orchestration. Operations remains the sole writer; pure combat queries never import the tick. */
import type { PersonId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { TickContext } from './context.ts';
import { strictCompare } from '../compare.ts';
import { planAuthorized } from '../seats/local-actions.ts';
import { sendSupportRequest } from './support.ts';
import { putOperations, type OperationRecord, type OpRequest } from '../operations/operations.ts';
import { actualBlock, answered, liveOperation, recordDefaultTasks, type OperationTask, type TaskReason } from '../operations/tasks.ts';

/** No assignment or place is written. Pending instructions reserve blocks against double spending, but do not execute. */
export function allocateTask(ctx: TickContext, state: State, task: OperationTask): { state: State; reason: TaskReason } {
  const op = state.operationRecords[task.otaskOperation];
  const reject = (reason: TaskReason) => ({ state, reason });
  if (op === undefined || !liveOperation(state, op) || op.opCommander !== task.otaskIssuer) return reject('issuer_not_commanding');
  const record = state.planRecords[op.opPost];
  if (record !== undefined && !planAuthorized(ctx.world, state, op.opPost, record, ctx.day, record.planApproved ?? undefined)) return reject('authority_ended');
  if (!task.otaskId || !task.otaskPurpose.trim() || task.otaskBlocks.length === 0 || task.otaskScope.length === 0 ||
    task.otaskScope.some(r => !ctx.world.map.regions.has(r)) || new Set(task.otaskBlocks).size !== task.otaskBlocks.length ||
    task.otaskDefault !== undefined || task.otaskRequest !== undefined || task.otaskReleaseRequest !== undefined || task.otaskReleasedDay !== undefined || task.otaskEndedDay !== undefined || task.otaskEndReason !== undefined) return reject('invalid_task');
  if (!task.otaskBlocks.every(b => actualBlock(state, op, task, b))) return reject('outside_command');
  if (!task.otaskBlocks.every(b => op.opAxes.some(a => a.oaxBlocks.includes(b)))) return reject('outside_operation');
  if (!task.otaskBlocks.every(b => task.otaskScope.includes(state.forceLocations[b]!.locRegion))) return reject('outside_scope');
  if (record?.planAuthority !== undefined && task.otaskScope.some(r => !op.opAxes.some(a =>
    [a.oaxRoute.routeFrom, ...a.oaxRoute.routeLegs.map(l => l.legTo)].includes(r)))) return reject('outside_scope');
  for (const other of Object.values(state.operationRecords)) for (const t of other.opTasks ?? []) {
    if (!liveOperation(state, other) || t.otaskEndedDay !== undefined || t.otaskDefault) continue;
    const req = other.opRequests.find(r => r.oreqMessage === t.otaskRequest);
    if (req?.oreqAnswer === 'refused' || req?.oreqAnswer === 'vacant') continue;
    if (other === op && t.otaskId === task.otaskId) return reject('task_conflict');
    const released = (t.otaskReleasedDay !== undefined && t.otaskReleasedDay <= ctx.day) ||
      (t.otaskReleaseRequest !== undefined && answered(other, t.otaskReleaseRequest, ctx.day));
    if (!released && t.otaskBlocks.some(b => task.otaskBlocks.includes(b) && actualBlock(state, other, t, b))) return reject('task_conflict');
  }
  const requests = [...op.opRequests];
  const message = task.otaskPost === op.opPost ? undefined : taskRequest(ctx, state, op, task, false, requests);
  if (message === null) return reject('vacant');
  const saved: OperationTask = { ...task, otaskBlocks: [...task.otaskBlocks].sort(strictCompare), otaskScope: [...new Set(task.otaskScope)].sort(strictCompare),
    ...(message === undefined ? {} : { otaskRequest: message }) };
  return { state: putOperations(state, [{ id: task.otaskOperation, record: { ...op,
    opTasks: [...(recordDefaultTasks(op, task.otaskOperation).opTasks ?? []), saved], opRequests: requests } }]), reason: 'allocated' };
}

function taskRequest(ctx: TickContext, state: State, op: OperationRecord, task: OperationTask, release: boolean, requests: OpRequest[]) {
  const holder = state.postStates[task.otaskPost]?.postHolder;
  if (holder == null || (state.personStatus[holder]?.statusKind ?? 'serving') !== 'serving') return null;
  const goal = state.planRecords[op.opPost]?.planGoal;
  const message = sendSupportRequest(ctx, state, task.otaskIssuer, op.opPost, task.otaskPost, {
    goalObjective: release ? op.opAxes[0]?.oaxObjective ?? task.otaskScope[0]! : task.otaskScope[0]!,
    goalPosture: release || task.otaskKind === 'main_effort' || task.otaskKind === 'demonstration' ? 'take' : 'hold',
    goalRisk: goal?.goalRisk ?? ctx.world.map.world.rules.plans.goalDefaults.risk,
    goalDeadlineDays: goal?.goalDeadlineDays ?? ctx.world.map.world.rules.plans.goalDefaults.deadlineDays, goalRail: goal?.goalRail ?? false, goalRiver: goal?.goalRiver ?? false,
    goalSea: false, goalNeutral: false, goalCommitted: task.otaskBlocks.filter(b => actualBlock(state, op, task, b)), goalAwaitWord: false, goalApproveAsDrafted: true,
  });
  requests.push({ oreqTask: task.otaskId, oreqKind: 'cooperating_axis', oreqPost: task.otaskPost, oreqHolder: holder,
    oreqAxis: null, oreqMessage: message, oreqSentDay: ctx.day, oreqAnswer: 'pending', oreqRung: null,
    oreqResponse: null, oreqAnswerDay: null, oreqFrom: null });
  return message;
}

/** A reserve/guard joins the main effort only after its commander's ordinary accepted release. */
export function releaseTask(ctx: TickContext, state: State, operation: string, id: string, issuer: PersonId): { state: State; reason: TaskReason } {
  const op = state.operationRecords[operation];
  const task = op?.opTasks?.find(t => t.otaskId === id);
  if (op === undefined || !liveOperation(state, op) || op.opCommander !== issuer || task === undefined || task.otaskEndedDay !== undefined ||
    task.otaskRelease !== 'commander_order' || !answered(op, task.otaskRequest, ctx.day) ||
    !task.otaskBlocks.some(b => actualBlock(state, op, task, b))) return { state, reason: 'release_not_authorized' };
  const record = state.planRecords[op.opPost];
  if (record !== undefined && !planAuthorized(ctx.world, state, op.opPost, record, ctx.day, record.planApproved ?? undefined)) return { state, reason: 'authority_ended' };
  const prior = op.opRequests.find(r => r.oreqMessage === task.otaskReleaseRequest);
  if (task.otaskReleasedDay !== undefined || (task.otaskReleaseRequest !== undefined && prior?.oreqAnswer !== 'refused' && prior?.oreqAnswer !== 'vacant')) return { state, reason: 'release_already_sent' };
  const requests = [...op.opRequests];
  const message = task.otaskPost === op.opPost ? undefined : taskRequest(ctx, state, op, task, true, requests);
  if (message === null) return { state, reason: 'vacant' };
  const released = message === undefined ? { ...task, otaskKind: 'main_effort' as const, otaskReleasedDay: ctx.day,
    otaskScope: [...new Set(op.opAxes.flatMap(a => [a.oaxRoute.routeFrom, a.oaxObjective, ...a.oaxRoute.routeLegs.map(l => l.legTo)]))] } : { ...task, otaskReleaseRequest: message };
  return { state: putOperations(state, [{ id: operation, record: { ...op, opRequests: requests,
    opTasks: op.opTasks!.map(t => t === task ? released : t) } }]), reason: 'release_sent' };
}
