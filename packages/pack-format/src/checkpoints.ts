/**
 * A pack's done-check bands (lane 1.14; FOUNDATION sections 11 and 12): `checkpoints.json` at the pack's root, beside
 * `pack.json`. Hand-written, optional, and never read by the kernel: the headless runner scores a history run against
 * it. Every band is set from a research lane's sourced figures before any run, never fitted from one, and cites them.
 *
 * - `checkpoints`: what must hold on a date. `side-set` (exactly these governments of these kinds are on one side),
 *   `government-side` (a government whose side could change, and the side it is on; null is neutral), `held` (a region's
 *   holder, on the date or every day to it), `men` (a side's men in blocks of known strength) and `operations-fought`
 *   (how many of a side's planned operations fought a battle).
 * - `pushback`: how often each kind of pushback fires from the start to a date, counted by a telemetry mechanic or by
 *   the rung of the addressees' answers. The lower bound is the record's sourced cases; the upper bound is the lead's.
 * - `victory`: the weights of the victory measure the lever sweep (D6) reads, from the same scores.
 */
import { z } from 'zod';
import { type IssueSink } from './issues.ts';
import { idOf, isoDate, termId } from './schemas.ts';

export const CHECKPOINTS_FILE = 'checkpoints.json';

const whole = z.number().int().min(0, 'zero or more');
const cite = z.string().trim().min(10, 'a citation: the research note and the sources it read');

const base = { id: termId, date: isoDate, cite };

export const CheckpointSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    ...base,
    kind: z.literal('side-set'),
    faction: idOf('faction'),
    departmentKinds: z.array(termId).min(1),
    exactly: z.array(idOf('department')),
  }).describe('Exactly these governments, of these department kinds, are on the faction’s side on the date (an exact band).'),
  z.strictObject({
    ...base,
    kind: z.literal('government-side'),
    /** A plain label for reports, not player text. */
    name: z.string().min(1),
    /** The governments that stand for it in the World; empty when the pack has none yet (a data gap, reported). */
    departments: z.array(idOf('department')),
    side: idOf('faction').nullable(),
  }).describe('A government whose side could change: each department listed is on `side` (null: neutral) on the date.'),
  z.strictObject({
    ...base,
    kind: z.literal('held'),
    region: idOf('region'),
    faction: idOf('faction'),
    throughout: z.boolean(),
  }).describe('The region is held by the faction on the date, or (throughout) on every day from the start to it.'),
  z.strictObject({
    ...base,
    kind: z.literal('men'),
    faction: idOf('faction'),
    min: whole,
    max: whole.nullable(),
    /** False: a run below `min` is reported, not failed (the research note's rule while no primary return bounds it). */
    floorBinding: z.boolean(),
  }).describe('The faction’s men in blocks of known strength on the date, inside [min, max] (max null: no upper bound yet).'),
  z.strictObject({
    ...base,
    kind: z.literal('operations-fought'),
    faction: idOf('faction'),
    min: whole,
    max: whole.nullable(),
  }).describe('How many of the faction’s operations (drafted, chosen, approved and executed) fought a battle by the date.'),
]);
export type Checkpoint = z.output<typeof CheckpointSchema>;

/** The compliance rungs a pushback band may count, as the addressee's own answer. */
export const PUSHBACK_RUNGS = ['comply_with_reservations', 'slow_walk', 'reinterpret', 'object', 'refuse'] as const;

export const PushbackBandSchema = z
  .strictObject({
    id: termId,
    /** A plain label for reports. */
    name: z.string().min(1),
    count: z.union([z.strictObject({ mechanic: z.string().regex(/^[a-z_]+\.[a-z_.]+$/, 'a telemetry mechanic, area.name') }), z.strictObject({ response: z.enum(PUSHBACK_RUNGS) })]),
    through: isoDate,
    min: whole,
    max: whole.nullable(),
    cite,
  })
  .describe('How often one kind of pushback fires from the start to `through`: a mechanic’s fires, or addressees’ answers on a rung.');
export type PushbackBand = z.output<typeof PushbackBandSchema>;

export const VictoryWeightsSchema = z
  .strictObject({
    /** Each capital (a faction principal's seat region) its own side holds, and less for each the other side holds. */
    capital: whole,
    /** Each government on the side, less each on the other side. */
    government: whole,
    /** Per permille of all known men that are the side's, above an even share. */
    menShare: whole,
    /** Per permille of all control shares that are the side's, above an even share. */
    groundShare: whole,
    /** Per permille of the side's mandate above its rest (lane 1.6's derived mandate; G-1.14c). */
    mandate: whole,
    cite,
  })
  .describe('The victory measure’s weights (lane 1.14): the lever sweep scores each move by it, from the checkpoint scores.');
export type VictoryWeights = z.output<typeof VictoryWeightsSchema>;

export const CheckpointsSchema = z.strictObject({
  checkpoints: z.array(CheckpointSchema),
  pushback: z.array(PushbackBandSchema),
  victory: VictoryWeightsSchema,
});
export type Checkpoints = z.output<typeof CheckpointsSchema>;

/** What the bands name that the World does not have. */
export function validateCheckpoints(c: Checkpoints, world: { readonly factions: readonly { readonly id: string }[]; readonly regions: readonly { readonly id: string }[]; readonly departments: readonly { readonly id: string; readonly kind: string }[] }, startDate: string | null, sink: IssueSink): void {
  const err = (at: string, message: string, expected?: string) => sink.error('checkpoints', CHECKPOINTS_FILE, at, message, expected);
  const factions = new Set(world.factions.map((f) => f.id));
  const regions = new Set(world.regions.map((r) => r.id));
  const departments = new Map(world.departments.map((d) => [d.id, d.kind]));
  const kinds = new Set(world.departments.map((d) => d.kind));
  const ids = new Set<string>();
  const unique = (at: string, id: string) => {
    if (ids.has(id)) err(`${at}.id`, `"${id}" is used twice`);
    ids.add(id);
  };
  const dated = (at: string, date: string) => {
    if (startDate !== null && date < startDate) err(at, `${date} is before the start (${startDate})`);
  };
  const faction = (at: string, id: string | null) => {
    if (id !== null && !factions.has(id)) err(at, `faction "${id}" is not in the World`);
  };
  const band = (at: string, min: number, max: number | null) => {
    if (max !== null && max < min) err(`${at}.max`, `the upper bound ${max} is below the lower ${min}`);
  };
  c.checkpoints.forEach((k, i) => {
    const at = `checkpoints[${i}]`;
    unique(at, k.id);
    dated(`${at}.date`, k.date);
    if (k.kind === 'side-set') {
      faction(`${at}.faction`, k.faction);
      k.departmentKinds.forEach((kind, j) => kinds.has(kind) || err(`${at}.departmentKinds[${j}]`, `no department in the World is of kind "${kind}"`));
      k.exactly.forEach((d, j) => {
        const kind = departments.get(d);
        if (kind === undefined) err(`${at}.exactly[${j}]`, `department "${d}" is not in the World`);
        else if (!k.departmentKinds.includes(kind)) err(`${at}.exactly[${j}]`, `department "${d}" is of kind "${kind}", which the set does not count`);
      });
    } else if (k.kind === 'government-side') {
      faction(`${at}.side`, k.side);
      k.departments.forEach((d, j) => departments.has(d) || err(`${at}.departments[${j}]`, `department "${d}" is not in the World`));
    } else if (k.kind === 'held') {
      faction(`${at}.faction`, k.faction);
      if (!regions.has(k.region)) err(`${at}.region`, `region "${k.region}" is not in the World`);
    } else {
      faction(`${at}.faction`, k.faction);
      band(at, k.min, k.max);
    }
  });
  c.pushback.forEach((p, i) => {
    const at = `pushback[${i}]`;
    unique(at, p.id);
    dated(`${at}.through`, p.through);
    band(at, p.min, p.max);
  });
}
