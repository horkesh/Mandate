import type { CanonicalValue } from '../serialize/canonical.ts';

/** Forces owns the provenance migration; serialization only invokes it. */
export function migrateStrengthKinds(state: CanonicalValue): unknown {
    // Old envelopes can contain pre-kernel fixtures; only the owned lot table is migrated.
    const root = state as { readonly [key: string]: CanonicalValue };
    if (root === null || typeof root !== 'object' || Array.isArray(root) || root.forceBlockStates === undefined) return state;
    const blocks = root.forceBlockStates as Record<string, { fbLots?: readonly Record<string, CanonicalValue>[] }>;
    const forceBlockStates = Object.fromEntries(Object.entries(blocks).map(([id, block]) => [id, {
      ...block,
      ...(block.fbLots === undefined ? {} : { fbLots: block.fbLots.map(lot => {
        if (lot.lotStrength !== undefined) return lot;
        const service = lot.lotService as Record<string, CanonicalValue> | null | undefined;
        const raised = service?.enlSourceAct === undefined && (lot.lotGenerated === true || typeof service?.enlCall === 'string');
        const rule = raised && typeof lot.lotMen === 'number';
        return { ...lot, lotMen: rule ? lot.lotMen : null, lotStrength: {
          strengthKind: rule ? 'rule' : 'unknown',
          strengthSource: rule ? `legacy model call:${service?.enlCall ?? lot.lotId}` : null,
          strengthDate: null,
        } };
      }) }),
    }]));
    return { ...root, forceBlockStates };
  }
