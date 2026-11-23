import type { PersonId, PostId } from '../ids.ts';

/** Sourced preference. Its date records evidence and never schedules an act. */
export interface OrganisationPost {
  readonly id: PostId;
  readonly name: string;
  readonly kind: string;
  readonly parent: PostId;
  readonly commander: PersonId | null;
  /** An unresolved named identity opens vacant; it never gets a generated substitute. */
  readonly identityHeld: boolean;
}
export interface OrganisationBrigade {
  readonly post: PostId;
  readonly regiments: readonly string[];
}
export interface OrganisationTemplate {
  readonly id: string;
  readonly army: PostId;
  readonly evidenceDate: string;
  readonly sources: readonly string[];
  readonly posts: readonly OrganisationPost[];
  readonly brigades: readonly OrganisationBrigade[];
}
