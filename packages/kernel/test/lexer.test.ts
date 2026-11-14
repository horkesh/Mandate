import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lexSource, LexerError, repoPath, tsFiles, workspacePackages } from './support/source.ts';

/** The lexer behind the architecture scans: it must never misread code as a comment or string, and must fail closed. */
describe('source lexer', () => {
  it('keeps offsets: both views are the length of the source', () => {
    const src = "const a = 'x'; // note\nconst b = /re/g; /* c */ const t = `t${a}t`;";
    const lexed = lexSource(src);
    expect(lexed.code.length).toBe(src.length);
    expect(lexed.withStrings.length).toBe(src.length);
    expect(lexed.lineOf(src.indexOf('const b'))).toBe(2);
  });

  it('blanks comments in both views, and literal bodies only in the code view', () => {
    const lexed = lexSource("f('a//b', /x\\/y/i, `q${g('in')}r`); // tail");
    expect(lexed.withStrings.trimEnd()).toBe("f('a//b', /x\\/y/i, `q${g('in')}r`);");
    expect(lexed.code.replace(/\s+/g, ' ').trim()).toBe("f(' ', / /i, ` ${g(' ')} `);");
  });

  it('tells division from a regex by the previous token', () => {
    const division = lexSource('const x = a / b / c;');
    expect(division.code).toBe('const x = a / b / c;');
    const afterParen = lexSource('const y = (a) / 2 + f()/3;');
    expect(afterParen.code).toBe('const y = (a) / 2 + f()/3;');
    const regexes = lexSource("return /'/.test(s) || typeof /`/ === 'x' || [/a/];");
    expect(regexes.code).not.toContain("'/.test");
    expect(regexes.code).toContain('.test(s)');
  });

  it('handles escapes and character classes inside a regex', () => {
    const lexed = lexSource("const r = /[/*]\\/[\\]'\"]/u; const after = 1;");
    expect(lexed.code).toContain('const after = 1;');
  });

  it('fails closed on a string meeting a newline, and on EOF inside a string, template, regex or comment', () => {
    for (const [src, why] of [
      ["const s = 'open\nnext", 'a quoted string meets a newline'],
      ['const s = "open', 'file ends inside a string'],
      ['const t = `open ${x}', 'file ends inside a template literal'],
      ['const r = /open', 'file ends inside a regex literal'],
      ['/* open', 'file ends inside a block comment'],
    ] as const) {
      expect(() => lexSource(src), why).toThrow(LexerError);
      expect(() => lexSource(src), why).toThrow(why);
    }
  });

  it('lexes every source file in the repository without losing sync', () => {
    const files = workspacePackages().flatMap((p) => ['src', 'test', 'demo'].flatMap((d) => tsFiles(join(p.root, d))));
    const failures = files.flatMap((f) => {
      try {
        lexSource(readFileSync(f, 'utf8'));
        return [];
      } catch (e) {
        return [`${repoPath(f)}: ${(e as Error).message}`];
      }
    });
    expect(files.length).toBeGreaterThan(20);
    expect(failures).toEqual([]);
  });
});
