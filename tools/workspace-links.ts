/**
 * Where `@mandate/*` resolves from a checkout (hard rule 7; lane 0.8's finding).
 *
 * A git worktree has its own `node_modules` folder but no `@mandate` links, so Node walks up the
 * directory tree to the main checkout's `node_modules/@mandate`, whose links point at the main
 * checkout's `packages/`. Code in the worktree that imports `@mandate/kernel` then runs against
 * main's kernel, not its own, and tests pass or fail for the wrong code. `workspaceLinkProblems`
 * does what Node does (the nearest `node_modules/@mandate/<name>` going up from the root) and
 * reports every workspace package that does not resolve to the package inside that root.
 */
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/** The workspace packages under `root/packages`: directory and name. */
export function workspacePackages(root: string): { readonly dir: string; readonly name: string }[] {
  const base = join(root, 'packages');
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(base, d.name, 'package.json')))
    .map((d) => ({ dir: d.name, name: (JSON.parse(readFileSync(join(base, d.name, 'package.json'), 'utf8')) as { name: string }).name }))
    .sort((a, b) => (a.dir < b.dir ? -1 : a.dir > b.dir ? 1 : 0));
}

/** The folder Node would find for `name` importing from `root`: the nearest `node_modules/<name>` upward, as a real path; null if none. */
export function nodeResolves(root: string, name: string): string | null {
  let dir = resolve(root);
  for (;;) {
    const candidate = join(dir, 'node_modules', ...name.split('/'));
    if (existsSync(candidate)) return realpathSync(candidate);
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Problems with how the workspace packages resolve from `root`. Empty when every one resolves to its own folder under it. */
export function workspaceLinkProblems(root: string): string[] {
  const problems: string[] = [];
  for (const { dir, name } of workspacePackages(root)) {
    const own = realpathSync(join(root, 'packages', dir));
    const found = nodeResolves(root, name);
    if (found === null) problems.push(`${name} does not resolve from ${root}: run npm install, or link it`);
    else if (found !== own) problems.push(`${name} resolves to ${found}, not this checkout's ${own}: code here would run against another checkout's package`);
  }
  return problems;
}
