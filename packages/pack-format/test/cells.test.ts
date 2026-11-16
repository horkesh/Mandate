import { describe, expect, it } from 'vitest';
import type { world as w } from '@mandate/kernel';
import { CsvError, parseCentre, parseCitation, parseCitations, parseCsv, parseDegrees, parseMonths, parseSeasons, writeCsv } from '../src/index.ts';
import { MESSAGE_RULES } from './support/fixture.ts';

describe('the CSV reader (RFC 4180)', () => {
  it('reads quotes, doubled quotes, embedded newlines, CRLF, a BOM and blank lines', () => {
    const t = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n"two\nlines",z\n');
    expect(t.header).toEqual(['a', 'b']);
    expect(t.rows.map((r) => [r.line, ...r.cells])).toEqual([
      [2, 'x, y', 'say "hi"'],
      [4, 'two\nlines', 'z'],
    ]);
  });

  it('round-trips what it writes', () => {
    const rows = [['1', 'a "quoted", text'], ['2', 'line\nbreak']];
    expect(parseCsv(writeCsv(['id', 'v'], rows)).rows.map((r) => r.cells)).toEqual(rows);
  });

  it('refuses ragged rows, unclosed quotes and text after a closing quote (positive controls)', () => {
    expect(() => parseCsv('a,b\n1\n')).toThrow(CsvError);
    expect(() => parseCsv('a,b\n1,"open\n')).toThrow('never closed');
    expect(() => parseCsv('a\n"x"y\n')).toThrow('after a closing quote');
    expect(() => parseCsv('')).toThrow('no header');
  });
});

describe('cell grammars', () => {
  it('reads degrees as integer microdegrees without floating point', () => {
    expect(parseDegrees('-77.03')).toEqual({ ok: true, value: -77_030_000 });
    expect(parseDegrees('38.9')).toEqual({ ok: true, value: 38_900_000 });
    expect(parseDegrees('0.000001')).toEqual({ ok: true, value: 1 });
    expect(parseDegrees('1.2345678').ok).toBe(false);
  });

  it('reads months, ranges that wrap the year, and lists', () => {
    expect(parseMonths('12-3')).toEqual({ ok: true, value: [1, 2, 3, 12] });
    expect(parseMonths('6+7+9-10')).toEqual({ ok: true, value: [6, 7, 9, 10] });
    expect(parseMonths('13').ok).toBe(false);
  });

  it('fills a season without months from the pack defaults, and refuses free text', () => {
    const rules = {
      capacityMax: 5,
      supplyControlPermille: 250,
      retreatControlPermille: 50,
      seasons: [{ reason: 'mud' as const, defaultMonths: [1, 2], lengthPermille: 1500, capacityPermille: 600 }],
      stores: { menPerCapacityUnit: 20000, capDays: 30, lowDays: 7 },
      contest: { occupyPermille: 100, occupyFullMen: 5000, contestPermille: 200 },
      movement: { marchMinCapacityPermille: 1000, courierPermille: 333 },
      ruleSeats: { warFlags: [] },
      ...(MESSAGE_RULES as unknown as Pick<w.WorldRules, 'latency' | 'reportTemplates' | 'standing' | 'people'>),
    };
    expect(parseSeasons('mud', rules)).toEqual({ ok: true, value: [{ reason: 'mud', months: [1, 2], depthFeet: null }] });
    expect(parseSeasons('low_water:8-10:3', rules)).toEqual({ ok: true, value: [{ reason: 'low_water', months: [8, 9, 10], depthFeet: 3 }] });
    expect(parseSeasons('none', rules)).toEqual({ ok: true, value: [] });
    expect(parseSeasons('low water Aug-Oct (to confirm)', rules).ok).toBe(false);
  });

  it('cites the longest matching source key, and keeps the rest as the place', () => {
    const keys = ['OR I', 'OR I-1', 'CEN1860-RR'];
    expect(parseCitation('OR I-1 p.489', keys)).toEqual({ source: 'OR I-1', at: 'p.489' });
    expect(parseCitation('OR I p.2', keys)).toEqual({ source: 'OR I', at: 'p.2' });
    expect(parseCitation('CEN1860-RR (Baltimore line)', keys)).toEqual({ source: 'CEN1860-RR', at: '(Baltimore line)' });
    expect(parseCitation('OR I-10 p.3', keys)).toEqual({ source: 'OR I-10 p.3', at: null });
  });

  it('splits a citation list on separators outside parentheses only', () => {
    expect(parseCitations('CEN1860-RR (first line; second line); OR I-1 p.4', ['CEN1860-RR', 'OR I-1'])).toEqual([
      { source: 'CEN1860-RR', at: '(first line; second line)' },
      { source: 'OR I-1', at: 'p.4' },
    ]);
  });

  it('reads a stat centre with citations, or unknown', () => {
    expect(parseCentre('above:REG p.1+DESIGN', ['REG', 'DESIGN'])).toEqual({
      ok: true,
      value: { direction: 'above', cites: [{ source: 'REG', at: 'p.1' }, { source: 'DESIGN', at: null }] },
    });
    expect(parseCentre('unknown', [])).toEqual({ ok: true, value: { direction: null, cites: [] } });
    expect(parseCentre('superb:REG', ['REG']).ok).toBe(false);
  });
});
