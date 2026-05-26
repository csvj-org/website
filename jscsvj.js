// Vendored from csvj-org/jscsvj @ c9261de1d2f55596ab6fc7ffe4e68bb327dab912.
// MIT, copyright (c) 2026 CSVJ.org.
// Source: https://github.com/csvj-org/jscsvj/blob/c9261de1/dist/index.js
function parse(input) {
  const lines = splitLines(input);
  trimTrailingEmpty(lines);
  if (lines.length === 0) {
    throw new Error("csvj: empty input");
  }
  const rawHeader = parseLine(lines[0], 0);
  const header = new Array(rawHeader.length);
  for (let i = 0; i < rawHeader.length; i++) {
    const v = rawHeader[i];
    if (typeof v !== "string") {
      throw new Error("csvj: non-string item at csvj header");
    }
    header[i] = v;
  }
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    rows.push(parseLine(lines[i], i));
  }
  return { header, rows };
}
function stringify(table) {
  const out = [];
  out.push(serializeRow(table.header));
  const expected = table.header.length;
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (row.length !== expected) {
      throw new Error(
        `csvj: row ${i} has ${row.length} values, expected ${expected}`
      );
    }
    out.push(serializeRow(row));
  }
  return out.join("\n") + "\n";
}
var VERSION = "0.0.0";
function splitLines(input) {
  const raw = input.split("\n");
  const out = new Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    let s = raw[i];
    if (s.length > 0 && s.charCodeAt(s.length - 1) === 13) {
      s = s.slice(0, -1);
    }
    out[i] = s.trim();
  }
  return out;
}
function trimTrailingEmpty(lines) {
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
}
function parseLine(line, lineNumber) {
  let parsed;
  try {
    parsed = JSON.parse("[" + line + "]");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`csvj: parse error row ${lineNumber}: ${msg}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`csvj: parse error row ${lineNumber}: not an array`);
  }
  for (let i = 0; i < parsed.length; i++) {
    const v = parsed[i];
    if (v === null) continue;
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") continue;
    throw new Error(`csvj: row ${lineNumber} parse error at item ${i}`);
  }
  return parsed;
}
function serializeRow(row) {
  for (let i = 0; i < row.length; i++) {
    const v = row[i];
    if (v === null) continue;
    const t = typeof v;
    if (t === "string" || t === "boolean") continue;
    if (t === "number") {
      if (!Number.isFinite(v)) {
        throw new Error(
          `csvj: item ${i} is not CSVJ type-safe: non-finite number`
        );
      }
      continue;
    }
    throw new Error(`csvj: item ${i} is not CSVJ type-safe: ${t}`);
  }
  const json = JSON.stringify(row);
  return json.slice(1, -1);
}
export {
  VERSION,
  parse,
  stringify
};
