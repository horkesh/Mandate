import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';

it('browser imports stay inside web, apart from React and kernel seat-api types', () => {
  function visit(dir: string) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const path = resolve(dir, item.name);
      if (item.isDirectory()) { visit(path); continue; }
      if (!/\.tsx?$/.test(path)) continue;
      const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const match of source.matchAll(/\b(import|export)\s+(type\s+)?(?:[^;]*?\sfrom\s*)?['"]([^'"]+)['"]/g)) {
            const name = match[3]!;
            if (name.startsWith('@mandate/')) {
              expect(name, path).toBe('@mandate/kernel/seat-api');
              expect(match[1] === 'import' && !!match[2], path).toBe(true);
            } else if (name.startsWith('.')) {
              expect(resolve(dir, name).startsWith(resolve('web') + '\\') || resolve(dir, name).startsWith(resolve('web') + '/'), path).toBe(true);
            } else expect(['react', 'react-dom', 'react-dom/client', 'pixi.js', 'd3-geo'], path).toContain(name);
      }
      expect(source, path).not.toMatch(/\b(?:import\s*\(|require\s*\()/);
    }
  }
  visit(resolve('web'));
  expect(JSON.parse(readFileSync('package.json', 'utf8'))).not.toHaveProperty('playerFacing');
});
