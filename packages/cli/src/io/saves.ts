/**
 * Save files on disk. The kernel encodes and decodes the versioned envelope
 * (`packages/kernel/src/serialize/save.ts`); this module only moves the text,
 * and writes it atomically.
 */
import { readFileSync } from 'node:fs';
import { decodeSave, encodeSave, type SaveContent, type SaveEnvelope } from '@mandate/kernel';
import { writeFileAtomic } from './atomic.ts';

export function writeSaveFile(path: string, content: SaveContent): string {
  writeFileAtomic(path, `${encodeSave(content)}\n`);
  return path;
}

export function readSaveFile(path: string, expectedWorldHash?: string): SaveEnvelope {
  return decodeSave(readFileSync(path, 'utf8'), expectedWorldHash === undefined ? {} : { expectedWorldHash });
}
