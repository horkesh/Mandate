/**
 * A small RFC 4180 CSV reader for pack source tables: comma-separated,
 * double-quoted fields with `""` for a quote, CRLF or LF line ends, a header
 * row, UTF-8 with an optional byte-order mark. No dependency, so the reader's
 * behaviour is pinned by our own tests.
 */

export interface CsvTable {
  readonly header: readonly string[];
  /** Data rows with their 1-based line number in the file (the header is line 1). */
  readonly rows: readonly { readonly line: number; readonly cells: readonly string[] }[];
}

export class CsvError extends Error {
  constructor(
    readonly line: number,
    message: string,
  ) {
    super(`line ${line}: ${message}`);
    this.name = 'CsvError';
  }
}

export function parseCsv(text: string): CsvTable {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const records: { line: number; cells: string[] }[] = [];
  let cells: string[] = [];
  let cell = '';
  let quoted = false;
  let line = 1;
  let recordLine = 1;
  let i = 0;
  const endRecord = () => {
    cells.push(cell);
    // A blank line is no record.
    if (!(cells.length === 1 && cells[0] === '')) records.push({ line: recordLine, cells });
    cells = [];
    cell = '';
  };
  while (i < src.length) {
    const c = src[i]!;
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        const next = src[i];
        if (next !== undefined && next !== ',' && next !== '\n' && next !== '\r') throw new CsvError(line, 'text after a closing quote');
        continue;
      }
      if (c === '\n') line++;
      cell += c;
      i++;
      continue;
    }
    if (c === '"') {
      if (cell !== '') throw new CsvError(line, 'a quote inside an unquoted field');
      quoted = true;
      i++;
    } else if (c === ',') {
      cells.push(cell);
      cell = '';
      i++;
    } else if (c === '\r' || c === '\n') {
      endRecord();
      i += c === '\r' && src[i + 1] === '\n' ? 2 : 1;
      line++;
      recordLine = line;
    } else {
      cell += c;
      i++;
    }
  }
  if (quoted) throw new CsvError(recordLine, 'a quoted field is never closed');
  if (cell !== '' || cells.length > 0) endRecord();
  const [head, ...rest] = records;
  if (!head) throw new CsvError(1, 'no header row');
  const width = head.cells.length;
  for (const r of rest) {
    if (r.cells.length !== width) throw new CsvError(r.line, `${r.cells.length} fields where the header has ${width}`);
  }
  return { header: head.cells.map((h) => h.trim()), rows: rest };
}

/** Write a CSV table (used by tests and fixtures): quotes only fields that need it, LF line ends. */
export function writeCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const field = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return [header, ...rows].map((r) => r.map(field).join(',')).join('\n') + '\n';
}
