import { type Finding, type JsonItem } from './common.ts';
import { packContent } from './pack-content.ts';
import { signedFindings } from './signed-situations.ts';

export function signedPackFindings(root: string, items: readonly JsonItem[]): Finding[] {
  const found: Finding[] = [];
  for (const pack of [...new Set(items.map(i => i.path.split('/')[1]!))].sort()) {
    const { strings, provenance } = packContent(root, pack);
    found.push(...signedFindings(items.filter(i => i.path.startsWith(`packs/${pack}/`)), strings, provenance));
  }
  return found;
}
