/** Public cohort/named selectors contain no State or validation dependencies. */
export type AllocationScope =
  | { readonly kind: 'named'; readonly regiments: readonly string[]; readonly calls?: readonly string[] }
  | { readonly kind: 'cohort'; readonly calls?: readonly string[]; readonly arm?: string; readonly minTermDays: number };
