/** Commander task allocation. Operations owns it; force assignments and places remain with their owners. */
import type { ForceBlockId, PersonId, PostId, RegionId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { withinCommand } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import { putOperations, type OperationRecord } from './operations.ts';

export type TaskKind = 'main_effort' | 'reserve' | 'demonstration' | 'rear_guard' | 'route_guard' | 'local_defence';
export type TaskReason = 'allocated' | 'issuer_not_commanding' | 'authority_ended' | 'invalid_task' | 'outside_command' |
  'outside_operation' | 'outside_scope' | 'task_conflict' | 'vacant' | 'release_not_authorized' | 'release_already_sent' | 'release_sent';
export interface OperationTask {
  readonly otaskId: string;
  readonly otaskOperation: string;
  readonly otaskIssuer: PersonId;
  readonly otaskPost: PostId;
  readonly otaskBlocks: readonly ForceBlockId[];
  readonly otaskKind: TaskKind;
  readonly otaskPurpose: string;
  readonly otaskScope: readonly RegionId[];
  readonly otaskRelease: 'commander_order' | 'operation_end';
  readonly otaskDefault?: boolean;
  readonly otaskRequest?: string;
  readonly otaskReleaseRequest?: string;
  readonly otaskReleasedDay?: number;
  readonly otaskEndedDay?: number;
  readonly otaskEndReason?: 'operation_ended' | 'commander_lost' | 'allocation_lost' | 'authority_ended' | 'task_complete';
}
export function liveOperation(state: State, op: OperationRecord): boolean {
  return op.opEndDay === null && op.opCommander !== null && state.postStates[op.opPost]?.postHolder === op.opCommander &&
    (state.personStatus[op.opCommander]?.statusKind ?? 'serving') === 'serving';
}
export function answered(op: OperationRecord, message: string | undefined, day: number): boolean {
  if (message === undefined) return true;
  const req = op.opRequests.find(r => r.oreqMessage === message);
  return req !== undefined && (req.oreqAnswer === 'complied' || req.oreqAnswer === 'delayed') &&
    req.oreqAnswerDay !== null && req.oreqAnswerDay <= day && req.oreqFrom !== null && req.oreqFrom <= day;
}
export function actualBlock(state: State, op: OperationRecord, task: OperationTask, block: ForceBlockId): boolean {
  const executor = state.postStates[task.otaskPost]?.postHolder;
  const received = task.otaskRequest === undefined ? undefined : op.opRequests.find(r => r.oreqMessage === task.otaskRequest);
  if (executor == null || (state.personStatus[executor]?.statusKind ?? 'serving') !== 'serving' ||
    (task.otaskRequest !== undefined && received?.oreqHolder !== executor)) return false;
  // A cooperating axis belongs to its own commander and answers the existing support request; it is not a subordinate grant.
  const supportedPartner = task.otaskDefault && received?.oreqPost === task.otaskPost &&
    op.opAxes.some(a => a.oaxPost === task.otaskPost && a.oaxBlocks.includes(block));
  return state.forceBlockStates[block]?.fbSurrenderedDay === null && state.forceLocations[block] !== undefined &&
    withinCommand(state, state.forceAssignments[block] ?? null, task.otaskPost) &&
    (supportedPartner || withinCommand(state, task.otaskPost, op.opPost));
}

/** Derived effective allocation: accepted explicit task, otherwise the recorded approved-plan task. */
export function taskForBlock(state: State, block: ForceBlockId, day: number): OperationTask | undefined {
  let fallback: OperationTask | undefined;
  for (const id of Object.keys(state.operationRecords).sort(strictCompare)) {
    const op = state.operationRecords[id]!;
    if (!liveOperation(state, op)) continue;
    for (const task of [...(op.opTasks ?? [])].reverse()) {
      if (task.otaskEndedDay !== undefined || !task.otaskBlocks.includes(block) || !actualBlock(state, op, task, block) || !answered(op, task.otaskRequest, day)) continue;
      const effective = task.otaskReleaseRequest !== undefined && answered(op, task.otaskReleaseRequest, day) ? { ...task, otaskKind: 'main_effort' as const,
        otaskScope: [...new Set(op.opAxes.flatMap(a => [a.oaxRoute.routeFrom, a.oaxObjective, ...a.oaxRoute.routeLegs.map(l => l.legTo)]))] } : task;
      if (!task.otaskDefault) return effective;
      fallback ??= effective;
    }
  }
  return fallback;
}

/** Scope and execution stage constrain attack; every eligible regional defender is still exposed by combat. */
export function executesAttack(state: State, block: ForceBlockId, day: number): boolean {
  const task = taskForBlock(state, block, day);
  if (task === undefined) {
    // An old save has no task history. Consult its actual axis until the next execution boundary records the default.
    // A pending, ended or lost task on a still-live operation cannot fall through to a free attack.
    for (const op of Object.values(state.operationRecords)) {
      if (op.opEndDay !== null) continue;
      const axis = op.opAxes.find(a => a.oaxBlocks.includes(block) && withinCommand(state, state.forceAssignments[block] ?? null, a.oaxPost));
      if (axis !== undefined) return op.opTasks === undefined && liveOperation(state, op) && ['march', 'assault', 'pursue'].includes(axis.oaxStage);
    }
    return true; // No operation: the existing main/local-defensive duty, recorded by combat.
  }
  if (!['main_effort', 'demonstration'].includes(task.otaskKind)) return false;
  const op = state.operationRecords[task.otaskOperation]!;
  if (!task.otaskScope.includes(state.forceLocations[block]!.locRegion)) return false;
  if (task.otaskKind === 'demonstration' && op.opDemonstration !== undefined) {
    const event = op.opDemonstration.demEvents.at(-1);
    return event?.devStage === 'approaching' || event?.devStage === 'demonstrating' ||
      (event?.devReason === 'contact' && event.devDay === day);
  }
  return op.opAxes.some(a => a.oaxBlocks.includes(block) && ['march', 'assault', 'pursue'].includes(a.oaxStage));
}

/** Record the actual approved axes; no name, fraction or historical task is inferred. Old history stays absent until execution. */
export function recordDefaultTasks(op: OperationRecord, id: string): OperationRecord {
  if (op.opTasks !== undefined || op.opCommander === null) return op;
  return { ...op, opTasks: op.opAxes.map(a => ({ otaskId: `default:${a.oaxName}`, otaskOperation: id,
    otaskIssuer: op.opCommander!, otaskPost: a.oaxPost, otaskBlocks: a.oaxBlocks, otaskDefault: true,
    otaskKind: op.opDemonstration !== undefined ? 'demonstration' : op.opPosture === 'hold' ? 'local_defence' : 'main_effort',
    otaskPurpose: 'Execute the approved axis.', otaskScope: [...new Set([a.oaxRoute.routeFrom, a.oaxObjective, ...a.oaxRoute.routeLegs.map(l => l.legTo)])].sort(strictCompare),
    otaskRelease: 'operation_end', ...(op.opRequests.find(r => r.oreqAxis === a.oaxName)?.oreqMessage == null ? {} :
      { otaskRequest: op.opRequests.find(r => r.oreqAxis === a.oaxName)!.oreqMessage! }) })) };
}

/** End stale reservations through their sole writer. Historical tasks remain auditable with typed reasons. */
export function cleanTasks(state: State, day: number, isAuthorized?: (op: OperationRecord) => boolean): State {
  const records = [];
  for (const id of Object.keys(state.operationRecords).sort(strictCompare)) {
    const op = state.operationRecords[id]!;
    let changed = false;
    const authorized = isAuthorized?.(op) ?? true;
    const tasks = op.opTasks?.map(t => {
      if (t.otaskEndedDay !== undefined) return t;
      const reason = op.opEndDay !== null ? 'operation_ended' : !liveOperation(state, op) ? 'commander_lost' : !authorized ? 'authority_ended' :
        t.otaskDefault && op.opAxes.find(a => `default:${a.oaxName}` === t.otaskId)?.oaxStage === 'end' ? 'task_complete' :
        !t.otaskBlocks.some(b => actualBlock(state, op, t, b)) ? 'allocation_lost' : null;
      if (reason === null) return t;
      changed = true;
      return { ...t, otaskEndedDay: day, otaskEndReason: reason } as OperationTask;
    });
    if (changed) records.push({ id, record: { ...op, opTasks: tasks! } });
  }
  return putOperations(state, records);
}
