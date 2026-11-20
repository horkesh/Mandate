import { gateContentHash, SituationSchema, type LocaleStrings, type ProvenanceFile } from '@mandate/pack-format';
import { fingerprint, type Finding, type JsonItem } from './common.ts';

/** Unlike the release gate, this runs for every signature, even a draft or an item now tagged gate.none.
 * Reuse the canonical signing algorithm: resolved text in every locale and cited source rows are signed content.
 */
export function signedFindings(items: readonly JsonItem[], strings: LocaleStrings, provenance: ProvenanceFile): Finding[] {
  return items.flatMap(({ path, value }) => {
    const def = SituationSchema.parse(value);
    if (def.gateReview === null) return [];
    const actual = gateContentHash(def, strings, provenance);
    const signed = def.gateReview.contentHash;
    return actual === signed ? [] : [{ rule: 'signed-content', path, hash: fingerprint({ actual, signed }), detail: `content hash ${actual} differs from sign-off ${signed}; gate re-review required` }];
  });
}
export function signaturePresenceFindings(items: readonly JsonItem[], required: readonly string[]): Finding[] {
  const signed = new Set(items.filter(i => i.value.gateReview != null).map(i => i.path));
  const expected = new Set(required);
  const finding = (path: string, detail: string): Finding => ({ rule: 'signed-presence', path, detail, hash: fingerprint({ path, detail }) });
  return [
    ...required.filter(path => !signed.has(path)).map(path => finding(path, 'a previously signed situation or its sign-off was removed')),
    ...[...signed].filter(path => !expected.has(path)).map(path => finding(path, 'new signed situation must enter the signature inventory after gate review')),
    ...(expected.size !== required.length ? [finding('tools/rules/signed-inventory.json', 'duplicate signed path')] : []),
  ];
}
