/** Presentation only. Inputs are the seat request and static geometry, never a game, State or World. */
import type { OptionView, ReportView, SeatRequest } from '@mandate/kernel/seat-api';

export type Point = [number, number];
export interface GeoShape { type: string; coordinates: unknown }
export interface MapRegion {
  id: string; name: string; kind: string; point: Point | null; shape: GeoShape | null;
  label: { anchor: Point | null; spine: Point[]; size: string | null; minZoom: number | null };
}
export interface MapGeometry {
  version: number; pack: string; schematic: boolean;
  regions: MapRegion[];
  atlasDetail?:{sourceTolerance?:number;countyDate?:string;counties:number;stations:number;reliefRows:boolean};
  regionAngles?:Record<string,number>;
  baseCoverage?: { geographicBox: [number,number,number,number]; worldBounds: [number,number,number,number] };
  base: { kind: 'land' | 'coast' | 'lake' | 'river'; shape: GeoShape; rank?: number }[];
  cartography?: {
    rail: GeoShape[];
    relief: { a: Point; b: Point; strength: number; slope?:number; contour?:number }[];
    rivers: { name: string; rank?:number; shape: GeoShape }[];
    sources: string;
    lod?: {sourceTolerance:number;renderTolerance:number;regions:Record<string,GeoShape>;base:MapGeometry['base'];counties:{name:string;state:string;shape:GeoShape}[];countyDate:string;states:{name:string;shape:GeoShape}[];stations:Point[];relief?:{a:Point;b:Point;strength:number;slope:number;contour:number}[];reliefExtent?:[number,number,number,number]};
  };
}
export interface MapMark {
  id: string; kind: 'headquarters' | 'enemy' | 'works' | 'situation' | 'battle' | 'pocket' | 'operation' | 'goal';
  region: string; author: string; day: number; source: string; post: string | null;
  value: number | null; token: string | null; sources: number;
  caption?: string;
  corrects?:string[];
}
export interface MapPlan { post: string; holder: string; source: string; day: number; plan: OptionView; approved?:boolean }
export interface MapModel {
 marks: MapMark[]; plans: MapPlan[];
 control: SeatRequest['view']['controlBeliefs']; fronts: SeatRequest['view']['claimedFronts'];
 faction: string|null; day:number;
 unplaced: { source: string; reason: 'no-location' | 'missing-author' | 'missing-plan-date' }[]; absent: string[];
}

export const ABSENT_LAYERS = ['fronts', 'claimed-control', 'supply', 'rail-and-road-lines', 'relief', 'courier-positions', 'obstruction-edge-positions', 'approved-plan-routes'] as const;
export function markState(today: number, day: number) {
  const age = Math.max(0, today - day);
  return age > 28 ? { stage: 'old', opacity: .36 } : age > 14 ? { stage: 'faded', opacity: .5 } : age > 7 ? { stage: 'aged', opacity: .68 } : { stage: 'pencil', opacity: .92 };
}

export function buildMapModel(request: SeatRequest, geometry: MapGeometry): MapModel {
  const model: MapModel = { marks: [], plans: [], control:request.view.controlBeliefs??{}, fronts:request.view.claimedFronts??[], faction:request.view.faction, day:request.requestDay, unplaced: [], absent: ABSENT_LAYERS.filter(layer=>layer!=='fronts'&&layer!=='claimed-control') };
  const regions = new Map(geometry.regions.map(r => [r.id, r]));
  const reports = [...request.view.reports].sort((a,b) => a.day - b.day || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const byId = new Map<string, ReportView>(reports.map(r => [r.id, r]));
  const latest = new Map<string, MapMark>();
  const put = (key: string, mark: MapMark) => {
    if (!regions.get(mark.region)?.point) { model.unplaced.push({ source: mark.source, reason: 'no-location' }); return; }
    latest.set(key, mark);
  };
  for (const report of reports) for (const [i, claim] of report.claims.entries()) {
    if (!claim.region) continue;
    const post = report.subjectKind === 'post' ? report.subjectId : report.authorPost;
    let kind: MapMark['kind'] | null = null;
    if (claim.kind === 'position' && post && request.menu.menuKind === 'principal' && request.menu.commandable.some(p=>p.post===post)) kind = 'headquarters';
    if (claim.kind === 'enemy-strength') kind = 'enemy';
    if (claim.kind === 'works') kind = 'works';
    if (claim.kind === 'battle-phase' || claim.kind === 'battle-result') kind = 'battle';
    if (claim.kind === 'pocket') kind = 'pocket';
    if (claim.kind === 'operation') kind = 'operation';
    if (claim.kind === 'goal-status') kind = 'goal';
    if (!kind) continue;
    const key = `${kind}:${report.author}:${kind === 'headquarters' ? post : claim.region}`;
    put(key, { id: `${report.id}:${i}`, kind, region: claim.region, author: report.author, day: report.day, source: report.id, post, value: kind === 'headquarters' ? null : claim.value, token: claim.token, sources: 1 });
  }
  // Beliefs are useful even when the paper has been pruned, but an author cannot be invented.
  for (const [kind, beliefs] of [['enemy', request.view.enemyBeliefs], ['works', request.view.worksBeliefs]] as const) {
    for (const [region,belief] of Object.entries(beliefs).sort(([a],[b])=>a<b?-1:1)) {
      const source = byId.get(belief.source);
      if (!source) { model.unplaced.push({ source: belief.source, reason: 'missing-author' }); continue; }
      const key = `${kind}:${source.author}:${region}`;
      if (!latest.has(key)) put(key, { id: `${kind}:${region}:${belief.source}`, kind, region, author: source.author, day: belief.asOfDay, source: belief.source, value: belief.value, token: null, post: source.authorPost, sources: 1 });
    }
  }
  // A situation is geographically placed only when one of its own papers explicitly names a region.
  for (const situation of request.view.situations) {
    if (!['open', 'waiting', 'noticed'].includes(situation.status)) continue;
    const papers = reports.filter(r => r.subjectKind === 'situation' && r.subjectId === situation.id);
    for (const report of papers.slice(-1)) {
      const region = report.claims.find(c => c.region !== null)?.region;
      if (region) put(`situation:${situation.id}`, { id: situation.id, kind: 'situation', region, author: report.author, day: report.day, source: report.id, value: null, token: situation.title, post: report.authorPost, sources: 1 });
    }
  }
  model.marks = [...latest.values()].filter(m => !['enemy','works'].includes(m.kind) || (m.value??0)>0).sort((a,b) => a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.author < b.author ? -1 : a.author > b.author ? 1 : a.id < b.id ? -1 : 1);
  for(const mark of model.marks)if(byId.get(mark.source)?.type==='observer-letter'){
    const prior=model.marks.filter(m=>m.kind===mark.kind&&m.region===mark.region&&m.day<=mark.day&&m.author!==mark.author&&m.value!==mark.value);
    if(prior.length)mark.corrects=prior.map(m=>m.id);
  }
  // Independent authors agreeing on the same claim earn ink. Different estimates remain separate.
  for (const mark of model.marks) mark.sources = new Set(model.marks.filter(other => other.kind === mark.kind && other.region === mark.region && other.post === mark.post && other.value === mark.value && other.token === mark.token).map(other => other.author)).size;
  if (request.menu.menuKind === 'principal') for (const review of request.menu.reviews) {
    const paper = byId.get(review.report);
    if (!paper) { model.unplaced.push({ source: review.report, reason: 'missing-plan-date' }); continue; }
    model.plans.push({ post: review.post, holder: review.holder, source: review.report, day: paper.day, plan: review.plan });
  }
  return model;
}

export type MapEditKind = 'objective' | 'waypoints' | 'remove_axis';
const identifier = (value: string) => { if (!/^[a-zA-Z0-9_:.\-]+$/.test(value)) throw Error('Invalid console identifier'); return value; };
export function editLine(post: string, axis: string, kind: MapEditKind, region?: string): string {
  const base = `edit ${identifier(post)} ${kind} axis=${identifier(axis)}`;
  if (kind === 'remove_axis') return base;
  if (!region) throw Error('A map edit needs a region');
  return base + (kind === 'objective' ? ` region=${identifier(region)}` : ` via=${region.split(',').map(identifier).join(',')}`);
}
/** Alphabetical region navigation is presentation navigation, never movement or routing. */
export function regionStep(regions: readonly MapRegion[], current: string, direction: number): string {
  const ids = regions.filter(r => r.point).map(r => r.id).sort();
  const i = ids.indexOf(current);
  return ids[Math.max(0, Math.min(ids.length - 1, i + direction))] ?? current;
}

export function reportDate(requestDay: number, isoDate: string, day: number): string {
  const d = new Date(isoDate + 'T12:00:00Z');
  if (!Number.isFinite(d.valueOf())) return String(day);
  d.setUTCDate(d.getUTCDate() + day - requestDay);
  return d.toISOString().slice(0,10);
}
