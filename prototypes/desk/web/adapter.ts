/** The browser's only contact with the local game. No runtime kernel imports. */
import type { OptionView, ReportView, SeatRequest, SeatView } from '@mandate/kernel/seat-api';
import type { MapGeometry } from './map/model.ts';
import type {MapPlan} from './map/model.ts';
import type {AtlasManifest} from './map/atlas-disk.ts';
import type {FurnitureManifest} from './map/furniture-plan.ts';

export interface DeskDay {
  day: number; date: string; reports: readonly ReportView[];
  refused: readonly { command: unknown; reason: string; commandIndex?:number }[];
  points: readonly string[];
}
export interface DeskTurn {
 days: readonly DeskDay[]; stopped: 'week' | readonly string[];
 /** The desk's own signed slips at dispatch, never an acknowledgement. */
 submitted?: readonly {line:string;text:string}[];
 /** Received-report projections, made by the kernel on the server. */
 controlUpdates?:Readonly<Record<string,Pick<SeatView,'controlBeliefs'|'claimedFronts'>>>;
}
export interface DeskSnapshot {
  pack: string; morning: SeatRequest; date: string;
  strings: Readonly<Record<string, string>>;
  queue: readonly { line: string; text: string }[];
  history: readonly DeskTurn[]; help: readonly string[]; closed: boolean;
  paperText: Readonly<Record<string, string>>;
  /** Previously shown routes whose approval the kernel accepted in this session. */
  approvedPlans?:readonly MapPlan[];
}
export interface DeskReply {
  ok: boolean; snapshot: DeskSnapshot; message?: string;
  preview?: { ok: true; plan: OptionView } | { ok: false; reason: string };
  turn?: DeskTurn;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}
export const deskApi = {
  furnitureManifest:(pack:string)=>{
    if(pack!=='union-1861')return Promise.reject(new Error('Unknown geographic sign pack'));
    return fetch(`/map-data/${pack}-signs/manifest.json`,{cache:'no-cache'}).then(read<FurnitureManifest>);
  },
  runtimeGeometry:(pack:string)=>{
    if(pack!=='union-1861'&&pack!=='testbed')return Promise.reject(new Error('Unknown map'));
    return fetch(`/map-data/${pack}-atlas/geometry.json`,{cache:'no-cache'}).then(read<MapGeometry>);
  },
  atlasManifest:(pack:string)=>{
    if(pack!=='union-1861'&&pack!=='testbed')return Promise.reject(new Error('Unknown map'));
    return fetch(`/map-data/${pack}-atlas/manifest.json`,{cache:'no-cache'}).then(read<AtlasManifest>);
  },
  geometry: (pack: string) => {
    if (pack !== 'union-1861' && pack !== 'testbed') return Promise.reject(new Error('Unknown map'));
    return fetch(`/map-data/${pack}.json`, { cache: 'no-cache' }).then(read<MapGeometry>);
  },
  snapshot: () => fetch('/api/desk', { cache: 'no-store' }).then(read<DeskSnapshot>),
  command: (line: string, day: number) => fetch('/api/command', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line, day }),
  }).then(read<DeskReply>),
};
