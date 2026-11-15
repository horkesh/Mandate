/**
 * Setting-free builders for the forces, command, movement and infrastructure
 * tests (decision 0003: no setting names under packages/). They extend the map
 * fixture with departments, post kinds, arms, people, posts and force blocks.
 */
import { toId, type DepartmentId, type ForceBlockId, type PersonId, type PostId } from '../../src/ids.ts';
import type { PersonRecord } from '../../src/world/people.ts';
import type { ForceBlockStart, PostStart, ScenarioStart } from '../../src/world/scenario.ts';
import type { World } from '../../src/world/world.ts';
import { indexWorld, type WorldIndex } from '../../src/world/index.ts';
import { mapWorld, startWith, type WorldParts } from './map-fixture.ts';

export const P = (id: string): PostId => toId('post', id);
export const B = (id: string): ForceBlockId => toId('forceBlock', id);
export const DEP = (id: string): DepartmentId => toId('department', id);
export const PER = (id: string): PersonId => toId('person', id);

const centre = { direction: null, cites: [] } as const;

export function person(id: string, faction: string | null): PersonRecord {
  return {
    id: PER(id),
    name: `person.${id}.name`,
    invented: true,
    faction: faction === null ? null : toId('faction', faction),
    kind: 'officer',
    born: null,
    died: null,
    centres: { competence: centre, nerve: centre, experience: centre, reputation: centre },
    traits: [],
    bloc: null,
    ranks: [],
    unknowns: [],
    provenance: [],
  };
}

export interface ForcesParts extends WorldParts {
  readonly people?: readonly PersonRecord[];
}

export function forcesWorld(parts: ForcesParts): World {
  // Departments by the map fixture's convention: the prefix names the side, `neutral_` none.
  const base = mapWorld({ ...parts, departments: parts.departments ?? ['a_war', 'b_war', 'neutral_gov'] });
  return {
    ...base,
    vocabularies: {
      ...base.vocabularies,
      departmentKinds: [{ id: 'government', name: 'kind.government', government: true }],
      postKinds: [
        { id: 'office', name: 'kind.office', creatable: 'start_only', temporary: false, role: null },
        { id: 'army', name: 'kind.army', creatable: 'start_only', temporary: false, role: null },
        { id: 'corps', name: 'kind.corps', creatable: 'directive', temporary: false, role: null },
        { id: 'expedition', name: 'kind.expedition', creatable: 'directive', temporary: true, role: null },
      ],
      arms: [
        { id: 'infantry', name: 'arm.infantry', naval: false },
        { id: 'naval', name: 'arm.naval', naval: true },
      ],
    },
    people: parts.people ?? ['a_lead', 'a_gen', 'a_gen2', 'a_corps', 'b_lead', 'b_gen'].map((p) => person(p, p.slice(0, 1))),
  };
}

export function forcesIndex(parts: ForcesParts): WorldIndex {
  return indexWorld(forcesWorld(parts));
}

export function post(id: string, o: Partial<Omit<PostStart, 'id' | 'department'>> & { readonly department: string }): PostStart {
  return {
    id: P(id),
    name: `post.${id}.name`,
    kind: o.kind ?? 'army',
    department: DEP(o.department),
    parent: o.parent ?? null,
    holder: o.holder ?? null,
    acting: o.acting ?? false,
    intelligenceChief: o.intelligenceChief ?? null,
    region: o.region ?? null,
    temporary: o.temporary ?? null,
    installation: o.installation ?? null,
    railLine: o.railLine ?? null,
    links: o.links ?? [],
    departmentChanges: o.departmentChanges ?? [],
    standingOrders: o.standingOrders ?? [],
    unknowns: [],
    provenance: [],
  };
}

export function block(id: string, o: Partial<Omit<ForceBlockStart, 'id' | 'department' | 'region'>> & { readonly department: string; readonly region: string }): ForceBlockStart {
  return {
    id: B(id),
    name: `block.${id}.name`,
    kind: o.kind ?? 'block',
    parent: o.parent ?? null,
    department: DEP(o.department),
    post: o.post ?? null,
    region: toId('region', o.region),
    aboard: o.aboard ?? null,
    arm: o.arm ?? 'infantry',
    strength: o.strength === undefined ? 1000 : o.strength,
    strengthDate: null,
    nonCombatants: o.nonCombatants ?? 0,
    storesDays: o.storesDays === undefined ? 10 : o.storesDays,
    storesDate: o.storesDate === undefined ? null : o.storesDate,
    unknowns: [],
    provenance: [],
  };
}

/** A start with control, posts and blocks. */
export function forcesStart(
  control: Readonly<Record<string, Readonly<Record<string, number>>>>,
  posts: readonly PostStart[],
  blocks: readonly ForceBlockStart[],
  extra: Partial<ScenarioStart> = {},
): ScenarioStart {
  return { ...startWith(control, extra.startDate ?? '1900-06-01'), posts, forceBlocks: blocks, ...extra };
}
