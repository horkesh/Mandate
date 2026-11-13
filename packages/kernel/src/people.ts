import type { Permille, SignedPermille } from './permille.ts';

/** Stable id of a person. Pack-defined. */
export type PersonId = string;

/**
 * A value a person cares about (e.g. caution, glory, party, duty). Values are
 * pack-defined ids (decision 0003); the engine knows only that directives can
 * honour or offend them.
 */
export type ValueId = string;

/**
 * The parts of a proxy that bear on how they read a directive.
 * This is the M0 slice of the Person model; M1 adds competences by domain,
 * ambitions, the insubordination ladder, knowledge and relationships.
 */
export interface ProxyProfile {
  readonly id: PersonId;
  /** The few values this person cares most about (Starfleet Career uses two). */
  readonly values: readonly ValueId[];
  /** 0..1000: how bold this person likes action to be (0 = never risk, 1000 = always attack). */
  readonly boldness: Permille;
  /** 0..1000: how truthfully this person reports their own conduct and intentions. */
  readonly candour: Permille;
  /** 0..1000: the person's own political capital (fame, constituency, patrons). Shields them (P6). */
  readonly standing: Permille;
  /** -1000..1000: long-term regard for the leader. */
  readonly regard: SignedPermille;
}
