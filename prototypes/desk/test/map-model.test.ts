import { describe, expect, it } from 'vitest';
import { canonicalHash } from '@mandate/kernel';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../../packages/cli/src/console/session.ts';
import { DeskAdapter } from '../server/adapter.ts';
import { buildMapModel, editLine, markState, regionStep } from '../web/map/model.ts';
import type { MapGeometry } from '../web/map/model.ts';
import { mkdirSync, writeFileSync } from 'node:fs';

const geometry = { version: 1, pack: 'testbed', schematic: true, regions: ['n_west_front', 'w_valley', 'salient_tip', 'salient_base'].map((id, i) => ({ id, name: id, kind: 'land', point: [i, 0], shape: null, label: { anchor: null, spine: [], size: null, minZoom: null } })), base: [] } as MapGeometry;

describe('the staff map reads claims and never supplies missing knowledge', () => {
  it('keeps conflicting authors, removes older same-author positions, and never places a post from the menu', () => {
    const request = structuredClone(new ConsoleGame({ pack: 'testbed' }).morning());
    const make = (id: string, author: string, day: number, region: string) => ({ id, author, authorPost: 'n_army_west', day, receivedDay: day, type: 'wire-dispatch', subtype: null, subjectKind: 'post', subjectId: 'n_army_west', claims: [{ kind: 'position', region, value: 1, token: null, confidence: 1000 }], hour: null, advice: null, answers: null, route: 'wire', via: [] });
    (request.view as any).reports = [make('old', 'a', 1, 'salient_tip'), make('new', 'a', 4, 'w_valley'), make('other', 'b', 3, 'salient_base')];
    const before = JSON.stringify(request);
    const model = buildMapModel(request, geometry);
    expect(model.marks.filter(m => m.kind === 'headquarters').map(m => [m.author, m.region, m.day])).toEqual([['a', 'w_valley', 4], ['b', 'salient_base', 3]]);
    expect(model.marks.some(m => m.post === 'n_army_east')).toBe(false);
    expect(JSON.stringify(request)).toBe(before);
  });
  it('keeps enemy claims separate and does not invent an author for an orphaned belief', () => {
    const request = structuredClone(new ConsoleGame({ pack: 'testbed' }).morning());
    (request.view as any).reports = [];
    (request.view as any).enemyBeliefs = { salient_tip: { value: 4000, asOfDay: 1, source: 'missing' } };
    const model = buildMapModel(request, geometry);
    expect(model.marks.filter(m => m.kind === 'enemy')).toEqual([]);
    expect(model.unplaced.some(m => m.source === 'missing')).toBe(true);
    expect(model.fronts).toEqual(request.view.claimedFronts);
    expect(model.control).toEqual(request.view.controlBeliefs);
  });
  it('ages reports in three presentation steps without reading a clock', () => {
    expect([0, 8, 15, 29].map(age => markState(40, 40 - age).stage)).toEqual(['pencil', 'aged', 'faded', 'old']);
    expect(markState(40, 1).opacity).toBeGreaterThan(0);
    expect(regionStep(geometry.regions, 'n_west_front', 1)).toBe('salient_base');
    expect(regionStep(geometry.regions, 'w_valley', 1)).toBe('w_valley');
  });
  it('validates the actual testbed sea-waypoint fixture before UI captures', () => {
    const desk=new DeskAdapter(new ConsoleGame({pack:'testbed'}));
    desk.execute('order n_army_west take salient_tip review');desk.execute('end');
    const invalid=desk.execute('preview n_army_west waypoints via=mid_sea');
    expect(invalid.preview).toEqual({ok:false,reason:'waypoint mid_sea cannot be reached by land'});
    const strike=desk.execute('preview n_army_west remove_axis axis=main');
    expect(strike.preview).toEqual({ok:false,reason:'a plan needs one axis'});
    expect(editLine('n_army_west','partner','remove_axis')).toBe('edit n_army_west remove_axis axis=partner');
  });
});

it('map marks and the same typed edits produce identical commands and command-log hashes', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const typed = new ConsoleGame({ pack: 'testbed' });
  const desk = new DeskAdapter(game), console = new ConsoleSession(typed);
  console.start();
  for (const line of ['order n_army_west take salient_tip review', 'end']) { expect(desk.execute(line).ok).toBe(true); console.handle(line); }
  const request = desk.snapshot().morning;
  if (request.menu.menuKind !== 'principal') throw Error('principal expected');
  const review = request.menu.reviews.find(r => r.post === 'n_army_west')!;
  expect(review).toBeDefined();
  const axis = review.plan.axes[0]!.name;
  const generated = [editLine(review.post, axis, 'objective', 'salient_base'), editLine(review.post, axis, 'waypoints', 'w_valley')];
  const expected = [`edit n_army_west objective axis=${axis} region=salient_base`, `edit n_army_west waypoints axis=${axis} via=w_valley`];
  expect(generated).toEqual(expected);
  for (const [i, line] of generated.entries()) {
    const preview = desk.execute(line.replace(/^edit /, 'preview '));
    expect(preview.preview?.ok).toBe(true);
    expect(desk.execute(line).ok).toBe(true);
    console.handle(expected[i]!);
  }
  expect(desk.snapshot().queue.map(q => q.line)).toEqual(expected);
  desk.execute('end'); console.handle('end');
  expect(canonicalHash(game.log)).toBe(canonicalHash(typed.log));
  expect(game.hash()).toBe(typed.hash());
  const evidence = `../../art-masters/${process.env.DESK_EVIDENCE_REQUEST ?? 'R17'}`;
  mkdirSync(evidence, { recursive: true });
  writeFileSync(`${evidence}/map-edit-equivalence.json`, JSON.stringify({ commands:generated, deskLogHash:canonicalHash(game.log), consoleLogHash:canonicalHash(typed.log), equalState:game.hash() === typed.hash() }, null, 2));
});
