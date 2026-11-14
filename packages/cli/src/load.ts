import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ScenarioData } from '@mandate/kernel';

/** Path of a pack folder relative to the repo root. */
export function packPath(packId: string, file: string): string {
  return fileURLToPath(new URL(`../../../packs/${packId}/${file}`, import.meta.url));
}

export function loadScenario(packId: string): ScenarioData {
  return JSON.parse(readFileSync(packPath(packId, 'scenario.json'), 'utf8')) as ScenarioData;
}
