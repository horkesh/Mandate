import { posix } from 'node:path';
import { parseSync, transformSync } from 'rolldown/utils';
import { lexSource } from '../../packages/kernel/test/support/source.ts';
import { fingerprint, type Finding } from './common.ts';

export interface Source { path: string; code: string }
export interface Derivation { path: string; symbol: string; hash: string; citation: string; reason: string }
interface Unit { path: string; symbol: string; code: string; raw: string; reads: string[] }
interface Module { units: Unit[]; imports: Map<string, { path: string; name: string }>; exports: Map<string, { path: string; name: string }>; stars: string[] }
const KEYS = ['postStates', 'departmentFactions', 'personService', 'battleRecords', 'reportTruth'];
const rootPath = (p: string) => /^(?:packages\/kernel\/src\/view\/|packages\/kernel\/src\/seats\/(?:requests|believed)\.[cm]?[jt]s$|packages\/cli\/src\/desk\/|prototypes\/desk\/(?:web\/|server\/adapter\.ts$))/.test(p) && !/(?:\/test[s]?\/|\.test\.|\.d\.ts$)/.test(p);

type Ast = { type: string; start: number; end: number; [key: string]: unknown };
const isNode = (n: unknown): n is Ast => n !== null && typeof n === 'object' && typeof (n as Ast).type === 'string';
const nodeName = (n: unknown): string => isNode(n) ? String(n.name ?? n.value ?? '') : '';
function walk(n: Ast, fn: (n: Ast) => void): void {
  fn(n);
  for (const value of Object.values(n)) {
    if (isNode(value)) walk(value, fn);
    else if (Array.isArray(value)) for (const v of value) if (isNode(v)) walk(v, fn);
  }
}
function reads(nodes: Ast[]): string[] {
  const aliases = new Map<string, string>();
  for (const n of nodes) walk(n, a => { if (a.type === 'VariableDeclarator' && isNode(a.init) && a.init.type === 'Literal' && typeof a.init.value === 'string') aliases.set(nodeName(a.id), a.init.value); });
  const keyOf = (n: unknown) => isNode(n) && n.type === 'Identifier' ? aliases.get(nodeName(n)) ?? '' : nodeName(n);
  const found = new Set<string>();
  for (const n of nodes) walk(n, a => {
    if (a.type === 'MemberExpression') {
      const key = a.computed ? keyOf(a.property) : nodeName(a.property);
      if (KEYS.includes(key)) found.add(key);
    }
    if (a.type === 'ObjectPattern') for (const p of a.properties as Ast[]) {
      const key = p.computed ? keyOf(p.key) : nodeName(p.key); if (KEYS.includes(key)) found.add(key);
    }
    if (a.type === 'CallExpression' && isNode(a.callee) && a.callee.type === 'MemberExpression' && nodeName(a.callee.object) === 'Reflect' && nodeName(a.callee.property) === 'get') {
      const key = keyOf((a.arguments as Ast[])[1]); if (KEYS.includes(key)) found.add(key);
    }
  });
  return [...found].sort();
}

/** Parsed declaration/reference graph: deliberately type-blind and conservative.
 * Function references (not just calls) are followed so callbacks and aliases cannot launder a read.
 * An unparseable file fails closed through the shared lexer.
 */
export function projectionFindings(sources: readonly Source[], allowed: readonly Derivation[]): Finding[] {
  for (const a of allowed) if (!a.citation.trim() || !a.reason.trim()) throw new Error(`uncited projection derivation ${a.path}:${a.symbol}`);
  const paths = new Set(sources.map(s => s.path));
  const resolve = (from: string, spec: string): string => {
    const p = spec.startsWith('.') ? posix.normalize(posix.join(posix.dirname(from), spec)) : spec.startsWith('@mandate/') ? `packages/${spec.slice(9)}/src/index.ts` : spec;
    return paths.has(p) ? p : paths.has(`${p}.ts`) ? `${p}.ts` : paths.has(`${p}/index.ts`) ? `${p}/index.ts` : p;
  };
  const modules = new Map<string, Module>();
  for (const original of sources) {
    // Erase types and lower JSX with the parser already pinned by Vite. The
    // one-writer lexer deliberately knows TS expressions, not JSX text.
    const transformed = transformSync(original.path, original.code, { lang: original.path.endsWith('x') ? 'tsx' : 'ts' });
    if (transformed.errors.length) throw new Error(`${original.path}: ${JSON.stringify(transformed.errors)}`);
    const source = { path: original.path, code: transformed.code };
    const parsed = parseSync(source.path, source.code, { lang: 'js' });
    if (parsed.errors.length) throw new Error(`${source.path}: ${JSON.stringify(parsed.errors)}`);
    const body = (parsed.program as unknown as { body: Ast[] }).body;
    const imports: Module['imports'] = new Map();
    const exports: Module['exports'] = new Map();
    const stars: string[] = [];
    const units: Unit[] = [];
    const moduleNodes: Ast[] = [];
    const makeUnit = (symbol: string, nodes: Ast[]): Unit => {
      const raw = nodes.map(n => source.code.slice(n.start, n.end)).join('\n');
      return { path: source.path, symbol, raw, code: lexSource(raw).code, reads: reads(nodes) };
    };
    for (const statement of body) {
      if (statement.type === 'ImportDeclaration') {
        const target = resolve(source.path, nodeName(statement.source));
        for (const spec of statement.specifiers as Ast[]) imports.set(nodeName(spec.local), { path: target, name: spec.type === 'ImportNamespaceSpecifier' ? '*' : spec.type === 'ImportDefaultSpecifier' ? 'default' : nodeName(spec.imported) });
        continue;
      }
      if (statement.type === 'ExportAllDeclaration') {
        const target = resolve(source.path, nodeName(statement.source));
        if (statement.exported) exports.set(nodeName(statement.exported), { path: target, name: '*' }); else stars.push(target);
        continue;
      }
      if (statement.type === 'ExportNamedDeclaration') for (const spec of statement.specifiers as Ast[]) exports.set(nodeName(spec.exported), { path: statement.source ? resolve(source.path, nodeName(statement.source)) : source.path, name: nodeName(spec.local) });
      const declaration = isNode(statement.declaration) ? statement.declaration : statement;
      if (declaration.type === 'ClassDeclaration') {
        const symbol = nodeName(declaration.id) || 'default';
        for (const method of (declaration.body as Ast).body as Ast[]) {
          if (method.kind === 'constructor') continue;
          units.push(makeUnit(`${symbol}.${nodeName(method.key)}`, [method]));
        }
      } else if (declaration.type === 'FunctionDeclaration') {
        const symbol = nodeName(declaration.id) || 'default';
        units.push(makeUnit(symbol, [declaration]));
        if (statement.type === 'ExportDefaultDeclaration') exports.set('default', { path: source.path, name: symbol });
      } else if (declaration.type === 'VariableDeclaration') {
        for (const d of declaration.declarations as Ast[]) {
          if (isNode(d.id) && d.id.type === 'Identifier') units.push(makeUnit(nodeName(d.id), [d])); else moduleNodes.push(d);
        }
      } else if (statement.type === 'ExportDefaultDeclaration') units.push(makeUnit('default', [declaration]));
      else if (!['ExportNamedDeclaration', 'EmptyStatement'].includes(statement.type)) moduleNodes.push(declaration);
    }
    units.push(makeUnit('<module>', moduleNodes));
    modules.set(source.path, { units, imports, exports, stars });
  }
  function symbolUnits(path: string, name: string, seen = new Set<string>()): Unit[] {
    const key = `${path}:${name}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const mod = modules.get(path);
    if (!mod) return [];
    const [head, ...tail] = name.split('.');
    const own = mod.units.filter(u => u.symbol === name);
    const exp = mod.exports.get(head!);
    return [...own, ...(exp ? symbolUnits(exp.path, exp.name === '*' ? tail.join('.') : [exp.name, ...tail].join('.'), seen) : []), ...mod.stars.flatMap(p => symbolUnits(p, name, seen))];
  }
  const symbolCache = new Map<string, Unit[]>();
  const resolvedUnits = (path: string, name: string): Unit[] => {
    const key = `${path}:${name}`;
    let result = symbolCache.get(key);
    if (result === undefined) { result = symbolUnits(path, name); symbolCache.set(key, result); }
    return result;
  };
  const dependencyCache = new Map<Unit, Unit[]>();
  function dependencies(u: Unit): Unit[] {
    const cached = dependencyCache.get(u);
    if (cached !== undefined) return cached;
    const mod = modules.get(u.path)!;
    const out = mod.units.filter(v => v !== u && v.symbol !== '<module>' && new RegExp(String.raw`\b${v.symbol}\b`).test(u.code));
    if (u.symbol.includes('.')) for (const m of u.code.matchAll(/\bthis\s*\.\s*(\w+)/g)) {
      out.push(...mod.units.filter(v => v.symbol === `${u.symbol.split('.')[0]}.${m[1]}`));
    }
    for (const [name, target] of mod.imports) {
      if (target.name === '*') {
        for (const m of u.code.matchAll(new RegExp(String.raw`\b${name}\s*\.\s*(\w+)`, 'g'))) out.push(...resolvedUnits(target.path, m[1]!));
      } else if (new RegExp(String.raw`\b${name}\b`).test(u.code)) {
        out.push(...resolvedUnits(target.path, target.name));
        for (const m of u.code.matchAll(new RegExp(String.raw`\b${name}\s*\.\s*(\w+)`, 'g'))) out.push(...resolvedUnits(target.path, `${target.name}.${m[1]}`));
      }
    }
    const result = [...new Set(out)];
    dependencyCache.set(u, result);
    return result;
  }
  const found: Finding[] = [];
  for (const [path, mod] of modules) {
    if (!rootPath(path)) continue;
    for (const unit of mod.units) {
      // Session construction is a host operation. The adapter methods that
      // project and return data are roots; its constructor factory is not.
      if (path === 'prototypes/desk/server/adapter.ts' && unit.symbol === 'createDeskAdapter') continue;
      const visited = new Set<Unit>();
      const hazards: Unit[] = [];
      const visit = (u: Unit) => { if (visited.has(u)) return; visited.add(u); if (u.reads.length) hazards.push(u); for (const d of dependencies(u)) visit(d); };
      visit(unit);
      if (!hazards.length) continue;
      hazards.sort((a, b) => `${a.path}:${a.symbol}` < `${b.path}:${b.symbol}` ? -1 : 1);
      const hash = fingerprint([unit.raw, hazards.map(u => [u.path, u.symbol, u.raw])]);
      if (allowed.some(a => a.path === path && a.symbol === unit.symbol && a.hash === hash)) continue;
      found.push({ rule: 'projection-truth', path, hash, detail: `${unit.symbol} reaches ${hazards.map(u => `${u.path}:${u.symbol} (${[...new Set(u.reads)].join(', ')})`).join('; ')}` });
    }
  }
  return found;
}
