/** The browser's only contact with the local game. No runtime kernel imports. */
import type { OptionView, ReportView, SeatRequest } from '@mandate/kernel/seat-api';
import type { MapGeometry } from './map/model.ts';
import type {AtlasManifest} from './map/atlas-disk.ts';

export interface DeskDay {
  day: number; date: string; reports: readonly ReportView[];
  refused: readonly { command: unknown; reason: string }[];
  points: readonly string[];
}
export interface DeskTurn { days: readonly DeskDay[]; stopped: 'week' | readonly string[] }
export interface DeskSnapshot {
  pack: string; morning: SeatRequest; date: string;
  strings: Readonly<Record<string, string>>;
  queue: readonly { line: string; text: string }[];
  history: readonly DeskTurn[]; help: readonly string[]; closed: boolean;
  paperText: Readonly<Record<string, string>>;
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
