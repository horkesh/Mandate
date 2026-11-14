import type { ScenarioData } from '../src/index.ts';

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] ? Mutable<U>[] : T[K] extends object ? Mutable<T[K]> : T[K] };

/**
 * A minimal, setting-free two-faction scenario for kernel tests (decision 0003).
 *
 *   a_cap -- a_front -- b_front -- b_cap
 */
export function fixture(): Mutable<ScenarioData> {
  return {
    id: 'fixture',
    seed: 7,
    minTurnDays: 1,
    maxTurnDays: 30,
    endDay: 400,
    objectiveValues: {
      attack: { honours: ['glory'], offends: ['caution'] },
      hold: { honours: ['caution'], offends: ['glory'] },
      transfer: { honours: ['order'], offends: [] },
    },
    factions: [
      { id: 'a', principalId: 'a_lead', capitalRegionId: 'a_cap', isPlayer: true, attentionPerTurn: 5, baseOversight: 700, oversightLossPerLinkDay: 60 },
      { id: 'b', principalId: 'b_lead', capitalRegionId: 'b_cap', isPlayer: false, attentionPerTurn: 0, baseOversight: 700, oversightLossPerLinkDay: 60 },
    ],
    persons: [
      { id: 'a_lead', factionId: 'a', values: ['order'], boldness: 500, candour: 700, competence: 500, standing: 500, regard: 1000 },
      { id: 'a_bold', factionId: 'a', values: ['glory', 'duty'], boldness: 800, candour: 800, competence: 700, standing: 300, regard: 500 },
      { id: 'a_wary', factionId: 'a', values: ['caution', 'order'], boldness: 200, candour: 700, competence: 600, standing: 400, regard: 0 },
      { id: 'a_spare', factionId: 'a', values: ['duty'], boldness: 500, candour: 500, competence: 500, standing: 200, regard: 200 },
      { id: 'a_clerk', factionId: 'a', values: ['order'], boldness: 300, candour: 800, competence: 500, standing: 200, regard: 300 },
      { id: 'b_lead', factionId: 'b', values: ['order'], boldness: 500, candour: 700, competence: 500, standing: 500, regard: 1000 },
      { id: 'b_cmd', factionId: 'b', values: ['caution'], boldness: 400, candour: 600, competence: 500, standing: 300, regard: 300 },
    ],
    posts: [
      { id: 'a_army', factionId: 'a', kind: 'field', regionId: 'a_front', holderId: 'a_wary', force: 600, linkDays: 3 },
      { id: 'a_office', factionId: 'a', kind: 'office', regionId: 'a_cap', holderId: 'a_clerk', force: 400, linkDays: 0 },
      { id: 'b_army', factionId: 'b', kind: 'field', regionId: 'b_front', holderId: 'b_cmd', force: 300, linkDays: 1 },
    ],
    regions: [
      { id: 'a_cap', controllerId: 'a', neighbours: ['a_front'], garrison: 100 },
      { id: 'a_front', controllerId: 'a', neighbours: ['a_cap', 'b_front'], garrison: 50 },
      { id: 'b_front', controllerId: 'b', neighbours: ['a_front', 'b_cap'], garrison: 50 },
      { id: 'b_cap', controllerId: 'b', neighbours: ['b_front'], garrison: 100 },
    ],
    blocs: [
      { id: 'a_hawks', factionId: 'a', weight: 500, values: ['glory'], support: 300 },
      { id: 'a_doves', factionId: 'a', weight: 500, values: ['caution', 'order'], support: 300 },
      { id: 'b_all', factionId: 'b', weight: 1000, values: ['order'], support: 300 },
    ],
    checkpoints: [],
  };
}
