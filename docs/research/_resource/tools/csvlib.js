// Minimal CSV parse/serialise that round-trips the pack's people.csv (RFC 4180 quoting, quote only when needed).
exports.parse = function parse(text) {
  const rows = []; let row = [], c = '', q = false, any = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    any = true;
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { c += '"'; i++; } else q = false; } else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(c); c = ''; }
    else if (ch === '\n') { row.push(c); rows.push(row); row = []; c = ''; any = false; }
    else c += ch;
  }
  if (any || row.length) { row.push(c); rows.push(row); }
  return rows;
};
exports.field = function field(v) {
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
exports.serialise = function serialise(rows) {
  return rows.map((r) => r.map(exports.field).join(',')).join('\n') + '\n';
};
