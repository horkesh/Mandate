/** Forces alone changes the service department on command's receiving receipt. */
import type { DepartmentId, ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
export function receiveOfferedBlocks(state: State, blocks: readonly ForceBlockId[], department: DepartmentId): State {
 const records = {...state.forceBlockStates};
 for (const id of blocks) records[id] = {...records[id]!,fbDepartment:department};
 return {...state,forceBlockStates:records};
}
