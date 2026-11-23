/** 0121/0124: declared instruments are not receipts or enacted authority. */
import type { PersonId, PostId, RegionId } from '../ids.ts';
import type { PaperSelector } from './paper-selectors.ts';
import type { World } from './world.ts';
import type { ScenarioStart } from './scenario.ts';
import { parseIsoDate } from './calendar.ts';

export interface MandateParent {
  readonly parentPost: PostId;
  readonly parentKey: string;
}
export interface MandateCeiling {
  /** The assigned force, not a second balance of troops. */
  readonly ceilingPost: PostId;
  readonly ceilingMen: number | null;
}
export interface MandateGrant {
  readonly mandateKey: string;
  readonly mandateRevision: number;
  readonly mandateIssuer: PersonId;
  readonly mandateIssuerPost: PostId | null;
  readonly mandateHolder: PersonId;
  readonly mandatePost: PostId;
  readonly mandateParent: MandateParent | null;
  readonly mandateActions: readonly ('hold' | 'relieve' | 'take' | 'approve' | 'assign')[];
  readonly mandateRecipients: readonly PostId[];
  readonly mandateRegions: readonly RegionId[];
  readonly mandateModes: readonly ('land' | 'rail' | 'river' | 'sea')[];
  readonly mandateCeiling: MandateCeiling | null;
  /** Men retained at the holder's post; null is an explicit absence of a guard. */
  readonly mandateGuard: number | null;
  readonly mandateExpires: number | null;
  readonly mandateReports: readonly string[];
  readonly mandateOnward: boolean;
  readonly mandateRevoke: boolean;
}
export interface MandatePaper {
  readonly id: string;
  readonly fromDate: string;
  readonly source: string;
  readonly requiresPapers?: readonly PaperSelector[];
  readonly grant: MandateGrant;
}

/** Kernel adapters are checked too; rank and missing fields cannot create a root. */
export function mandateProblems(world: World, start: ScenarioStart): string[] {
  const problems: string[] = [];
  const papers = world.rules.mandates;
  if (papers === undefined) return problems;
  if (!Array.isArray(papers)) return ['mandates must be an array'];
  const posts = new Map([...start.posts, ...start.temporaryPosts].map(p => [p.id,p]));
  const people = new Set(world.people.map(p => p.id));
  const regions = new Set(world.regions.map(r => r.id));
  const ids = new Set<string>(), revisions = new Set<string>();
  const familyIssuers = new Map<string, PersonId>();
  for (const paper of papers) {
    const at = `mandates.${paper.id}`;
    if (!paper.id || ids.has(paper.id)) problems.push(`${at}: duplicate or missing instrument id`);
    ids.add(paper.id);
    try { parseIsoDate(paper.fromDate); } catch { problems.push(`${at}: invalid earliest date`); }
    if (typeof paper.source !== 'string' || paper.source.trim().length === 0) problems.push(`${at}: source required`);
    const g = paper.grant;
    if (g == null) { problems.push(`${at}: enclosure required`); continue; }
    const family = `${g.mandatePost}:${g.mandateKey}`;
    const issuer = familyIssuers.get(family);
    if (issuer !== undefined && issuer !== g.mandateIssuer) problems.push(`${at}: a mandate family cannot change granting issuer`);
    else familyIssuers.set(family, g.mandateIssuer);
    const revision = `${g.mandateIssuer}:${g.mandatePost}:${g.mandateKey}:${g.mandateRevision}`;
    if (!g.mandateKey || revisions.has(revision) || !Number.isSafeInteger(g.mandateRevision) || g.mandateRevision < 1) problems.push(`${at}: invalid or duplicated revision`);
    revisions.add(revision);
    if (!people.has(g.mandateIssuer) || !people.has(g.mandateHolder) || !posts.has(g.mandatePost) ||
      (g.mandateIssuerPost !== null && !posts.has(g.mandateIssuerPost))) problems.push(`${at}: unknown issuer, holder or post`);
    for (const [name, allowed] of [
      ['mandateActions', ['hold','take','relieve','approve','assign']], ['mandateModes',['land','rail','river','sea']],
      ['mandateRecipients',[...posts.keys()]], ['mandateRegions',[...regions]],
    ] as const) {
      const values = g[name];
      if (!Array.isArray(values) || new Set(values).size !== values.length || !values.every(v => (allowed as readonly string[]).includes(v))) problems.push(`${at}: invalid ${name}`);
    }
    if (g.mandateCeiling !== null && (g.mandateCeiling === undefined || !posts.has(g.mandateCeiling.ceilingPost) ||
      (g.mandateCeiling.ceilingMen !== null && (!Number.isSafeInteger(g.mandateCeiling.ceilingMen) || g.mandateCeiling.ceilingMen < 0)))) problems.push(`${at}: explicit force ceiling required`);
    for (const n of [g.mandateGuard,g.mandateExpires]) if (n !== null && (!Number.isSafeInteger(n) || n < 0)) problems.push(`${at}: invalid guard or expiry`);
    if (typeof g.mandateOnward !== 'boolean' || typeof g.mandateRevoke !== 'boolean' || !Array.isArray(g.mandateReports)) problems.push(`${at}: explicit onward, revocation and reporting fields required`);
    if (g.mandateParent === null) {
      if (g.mandateIssuerPost === null) {
        if (!start.factions.some(f => f.principal === g.mandateIssuer)) problems.push(`${at}: root requires a principal`);
      } else if (!world.rules.recruitment.raisingPostKinds.includes(posts.get(g.mandateIssuerPost)?.kind ?? '')) problems.push(`${at}: state root requires its raising office`);
    } else if (g.mandateParent === undefined || !papers.some(p => p.grant?.mandatePost === g.mandateParent!.parentPost && p.grant.mandateKey === g.mandateParent!.parentKey && p.grant.mandateHolder === g.mandateIssuer)) problems.push(`${at}: missing parent instrument`);
  }
  return problems;
}
