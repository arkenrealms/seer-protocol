import get from 'lodash/get';

type AnyObj = Record<string, any>;

// --- same sugar compilation as web (keep it identical across runtimes) ---
function isObject(x: any) {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}
function isSugarExpr(x: any) {
  return isObject(x) && '$' in x;
}
function isJsonLogicExpr(x: any) {
  return isObject(x) && '$expr' in x;
}

function sugarArgToLogic(arg: any): any {
  if (typeof arg === 'string' && arg.startsWith('$')) return { var: arg.slice(1) };
  return arg;
}

export function compileSugarToJsonLogic(expr: any): any {
  if (!isSugarExpr(expr)) return expr;

  const raw = expr.$;
  if (!Array.isArray(raw) || raw.length === 0) return { $expr: raw };

  const [op, ...rest] = raw;
  const args = rest.map(sugarArgToLogic);

  const map: Record<string, (a: any[]) => any> = {
    var: (a) => ({ var: a[0] }),
    not: (a) => ({ '!': [a[0]] }),
    and: (a) => ({ and: a }),
    or: (a) => ({ or: a }),
    eq: (a) => ({ '==': [a[0], a[1]] }),
    ne: (a) => ({ '!=': [a[0], a[1]] }),
    gt: (a) => ({ '>': [a[0], a[1]] }),
    gte: (a) => ({ '>=': [a[0], a[1]] }),
    lt: (a) => ({ '<': [a[0], a[1]] }),
    lte: (a) => ({ '<=': [a[0], a[1]] }),
    cat: (a) => ({ cat: a }),
    if: (a) => ({ if: a }),
  };

  const fn = map[String(op)];
  const compiled = fn ? fn(args) : { [String(op)]: args };
  return { $expr: compiled };
}

// --- template-to-jsonlogic compiler (same logic as web) ---
function isTemplateString(s: any) {
  return typeof s === 'string' && s.includes('{{') && s.includes('}}');
}
function isSingleMustacheWholeString(s: string) {
  const t = s.trim();
  return t.startsWith('{{') && t.endsWith('}}') && t.indexOf('{{') === 0 && t.lastIndexOf('}}') === t.length - 2;
}

function parseInlineArgs(raw: string): string[] {
  const out: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: "'" | '"' | null = null;

  const push = () => {
    const s = buf.trim();
    if (s) out.push(s);
    buf = '';
  };

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (quote) {
      buf += ch;
      if (ch === quote && raw[i - 1] !== '\\') quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch as any;
      buf += ch;
      continue;
    }

    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ',' && depth === 0) {
      push();
      continue;
    }

    buf += ch;
  }

  push();
  return out;
}

function parseLiteralOrVar(token: string): any {
  const t = token.trim();

  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    try {
      if (t.startsWith("'")) return JSON.parse('"' + t.slice(1, -1).replace(/"/g, '\\"') + '"');
      return JSON.parse(t);
    } catch {
      return t.slice(1, -1);
    }
  }

  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null') return null;

  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);

  return { var: t };
}

function compileInlineMustacheToJsonLogic(expr: string): any {
  const s = expr.trim();

  if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[0-9]+\])*$/.test(s)) {
    return { var: s };
  }

  const m = /^([A-Za-z_$][\w$]*)\(([\s\S]*)\)$/.exec(s);
  if (!m) return { var: s };

  const fn = m[1];
  const argRaw = m[2] ?? '';
  const argTokens = parseInlineArgs(argRaw);
  const args = argTokens.map(parseLiteralOrVar);

  const map: Record<string, any> = {
    not: (a: any[]) => ({ '!': [a[0]] }),
    and: (a: any[]) => ({ and: a }),
    or: (a: any[]) => ({ or: a }),

    eq: (a: any[]) => ({ '==': [a[0], a[1]] }),
    ne: (a: any[]) => ({ '!=': [a[0], a[1]] }),
    gt: (a: any[]) => ({ '>': [a[0], a[1]] }),
    gte: (a: any[]) => ({ '>=': [a[0], a[1]] }),
    lt: (a: any[]) => ({ '<': [a[0], a[1]] }),
    lte: (a: any[]) => ({ '<=': [a[0], a[1]] }),

    cat: (a: any[]) => ({ cat: a }),
    if: (a: any[]) => ({ if: a }),
  };

  const builder = map[fn];
  if (builder) return builder(args);

  return { [fn]: args };
}

function compileInterpolatedStringToCat(s: string): any {
  const parts: any[] = [];
  let i = 0;

  while (i < s.length) {
    const start = s.indexOf('{{', i);
    if (start === -1) {
      const tail = s.slice(i);
      if (tail) parts.push(tail);
      break;
    }

    const head = s.slice(i, start);
    if (head) parts.push(head);

    const end = s.indexOf('}}', start + 2);
    if (end === -1) {
      parts.push(s.slice(start));
      break;
    }

    const inner = s.slice(start + 2, end);
    parts.push(compileInlineMustacheToJsonLogic(inner));

    i = end + 2;
  }

  if (parts.length === 1) return parts[0];
  return { cat: parts };
}

function compileTemplateStringToJsonLogicValue(input: string): any {
  let out = String(input);

  const ifRe = /{{#if\s+([^}]+)}}([\s\S]*?)({{else}}([\s\S]*?))?{{\/if}}/g;

  for (let loop = 0; loop < 10; loop++) {
    const prev = out;
    out = out.replace(ifRe, (_m, condRaw, thenPart, _elseWhole, elsePart) => {
      const cond = String(condRaw ?? '').trim();
      const thenS = String(thenPart ?? '');
      const elseS = String(elsePart ?? '');
      return `__IF__(${cond})__THEN__(${thenS})__ELSE__(${elseS})__END__`;
    });
    if (out === prev) break;
  }

  const ifSentinelRe = /^__IF__\(([\s\S]*)\)__THEN__\(([\s\S]*)\)__ELSE__\(([\s\S]*)\)__END__$/;
  const mm = ifSentinelRe.exec(out);
  if (mm) {
    const condExpr = compileInlineMustacheToJsonLogic(mm[1]);
    const thenCompiled = compileTemplateStringToJsonLogicValue(mm[2]);
    const elseCompiled = compileTemplateStringToJsonLogicValue(mm[3]);
    return { if: [condExpr, thenCompiled, elseCompiled] };
  }

  if (isSingleMustacheWholeString(out) && !out.includes('{{#if')) {
    const inner = out.trim().slice(2, -2);
    return compileInlineMustacheToJsonLogic(inner);
  }

  if (out.includes('{{')) {
    return compileInterpolatedStringToCat(out);
  }

  return out;
}

function compileTemplateStringToExpr(s: string) {
  if (!isTemplateString(s)) return s;
  const compiled = compileTemplateStringToJsonLogicValue(s);
  if (compiled && typeof compiled === 'object') return { $expr: compiled };
  return compiled;
}

// --- canonicalize: walk any JSON-ish tree and rewrite templates/sugar into $expr ---
export function canonicalizeInterfaceDoc(input: any): any {
  const seen = new Map<any, any>();

  const walk = (v: any): any => {
    if (v === null || v === undefined) return v;
    if (typeof v === 'number' || typeof v === 'boolean') return v;

    // IMPORTANT: Seer canonicalization should NOT preserve functions (DB-safe only)
    if (typeof v === 'function') return undefined;

    if (typeof v === 'string') {
      // forbid legacy JS formulas at the canonical layer
      if (v.trim().startsWith('=')) {
        // best practice: reject, but you can also keep as-is if you must
        throw new Error('Canonical interface spec cannot contain legacy "=..." formulas.');
      }
      if (isTemplateString(v)) return walk(compileTemplateStringToExpr(v));
      return v;
    }

    if (Array.isArray(v)) return v.map(walk);

    if (typeof v === 'object') {
      if (seen.has(v)) return seen.get(v);

      // sugar -> $expr
      if (isSugarExpr(v)) return walk(compileSugarToJsonLogic(v));

      // already $expr: canonicalize inside it too (deep)
      if (isJsonLogicExpr(v)) {
        const out = { $expr: walk((v as any).$expr) };
        return out;
      }

      const out: AnyObj = {};
      seen.set(v, out);
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      return out;
    }

    return v;
  };

  return walk(input);
}
