import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Prototypes (`prototypes/*`) are self-contained spikes with their own
 * package.json and lockfile. They stay outside the npm workspaces: the
 * package scans (banned APIs, one writer, pack boundary) read only
 * `packages/*`, and the licence check reads every lockfile. If a prototype
 * became a workspace package it would have to move under `packages/` and
 * declare whether it is deterministic, like any other package.
 */
const root = new URL('../../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as { workspaces?: string[] };

/** Workspace globs that would take in a path outside `packages/`. Empty when every workspace is under it. */
export function workspacesOutsidePackages(workspaces: readonly string[]): string[] {
  return workspaces.filter((w) => !/^packages\/[^/]+$|^packages\/\*$/.test(w));
}

describe('prototypes stay outside the npm workspaces', () => {
  it('every workspace glob lies under packages/', () => {
    expect(pkg.workspaces?.length).toBeGreaterThan(0);
    expect(workspacesOutsidePackages(pkg.workspaces ?? [])).toEqual([]);
  });

  it('no prototype is named like a workspace package', () => {
    const protoDir = new URL('prototypes/', root);
    const named = existsSync(protoDir)
      ? readdirSync(protoDir)
          .filter((d) => existsSync(new URL(`prototypes/${d}/package.json`, root)))
          .map((d) => (JSON.parse(readFileSync(new URL(`prototypes/${d}/package.json`, root), 'utf8')) as { name?: string }).name ?? '')
          .filter((n) => n.startsWith('@mandate/'))
      : [];
    expect(named).toEqual([]);
  });

  it('flags a workspace glob reaching outside packages/ (positive control)', () => {
    expect(workspacesOutsidePackages(['packages/*', 'prototypes/*', '*', 'packages/kernel'])).toEqual(['prototypes/*', '*']);
  });
});
