// ─── Lightweight Formula Engine ──────────────────────────────
// Supports: arithmetic, string ops, date math, conditionals
// Example: if(prop("Status") == "Done", prop("Points") * 2, 0)

export type FormulaValue = string | number | boolean | null;
export type FormulaContext = Record<string, FormulaValue>;

type Token =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'ident'; value: string }
  | { type: 'operator'; value: string }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' };

// ─── Tokenizer ───────────────────────────────────────────────

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) { i++; continue; }

    if (/\d/.test(ch) || (ch === '.' && /\d/.test(input[i + 1] || ''))) {
      let num = '';
      while (i < input.length && (/\d/.test(input[i]) || input[i] === '.')) {
        num += input[i++];
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let str = '';
      while (i < input.length && input[i] !== quote) {
        if (input[i] === '\\') { i++; }
        str += input[i++];
      }
      i++; // closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < input.length && /[a-zA-Z_0-9]/.test(input[i])) {
        ident += input[i++];
      }
      if (ident === 'true') tokens.push({ type: 'boolean', value: true });
      else if (ident === 'false') tokens.push({ type: 'boolean', value: false });
      else tokens.push({ type: 'ident', value: ident });
      continue;
    }

    if ('()'.includes(ch)) {
      tokens.push({ type: 'paren', value: ch as '(' | ')' });
      i++;
      continue;
    }

    if (ch === ',') { tokens.push({ type: 'comma' }); i++; continue; }

    // Multi-char operators
    const twoChar = input.slice(i, i + 2);
    if (['==', '!=', '>=', '<='].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar });
      i += 2;
      continue;
    }

    if ('+-*/><!'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    i++; // skip unknown
  }

  return tokens;
}

// ─── AST Nodes ───────────────────────────────────────────────

type ASTNode =
  | { type: 'literal'; value: FormulaValue }
  | { type: 'identifier'; name: string }
  | { type: 'binary'; op: string; left: ASTNode; right: ASTNode }
  | { type: 'call'; name: string; args: ASTNode[] };

// ─── Parser (Recursive Descent) ─────────────────────────────

function parse(tokens: Token[]): ASTNode {
  let pos = 0;

  function peek(): Token | undefined { return tokens[pos]; }
  function advance(): Token { return tokens[pos++]; }

  function parseExpression(): ASTNode {
    return parseComparison();
  }

  function parseComparison(): ASTNode {
    let left = parseAddSub();
    while (peek()?.type === 'operator' && ['==', '!=', '>', '<', '>=', '<='].includes(peek()!.value as string)) {
      const op = (advance() as { value: string }).value;
      const right = parseAddSub();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  function parseAddSub(): ASTNode {
    let left = parseMulDiv();
    while (peek()?.type === 'operator' && ['+', '-'].includes(peek()!.value as string)) {
      const op = (advance() as { value: string }).value;
      const right = parseMulDiv();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  function parseMulDiv(): ASTNode {
    let left = parseUnary();
    while (peek()?.type === 'operator' && ['*', '/'].includes(peek()!.value as string)) {
      const op = (advance() as { value: string }).value;
      const right = parseUnary();
      left = { type: 'binary', op, left, right };
    }
    return left;
  }

  function parseUnary(): ASTNode {
    if (peek()?.type === 'operator' && peek()!.value === '-') {
      advance();
      const node = parsePrimary();
      return { type: 'binary', op: '*', left: { type: 'literal', value: -1 }, right: node };
    }
    return parsePrimary();
  }

  function parsePrimary(): ASTNode {
    const token = peek();
    if (!token) return { type: 'literal', value: null };

    if (token.type === 'number') { advance(); return { type: 'literal', value: token.value }; }
    if (token.type === 'string') { advance(); return { type: 'literal', value: token.value }; }
    if (token.type === 'boolean') { advance(); return { type: 'literal', value: token.value }; }

    if (token.type === 'ident') {
      const name = token.value;
      advance();
      if (peek()?.type === 'paren' && peek()!.value === '(') {
        advance(); // consume (
        const args: ASTNode[] = [];
        while (peek() && !(peek()!.type === 'paren' && peek()!.value === ')')) {
          args.push(parseExpression());
          if (peek()?.type === 'comma') advance();
        }
        if (peek()?.type === 'paren') advance(); // consume )
        return { type: 'call', name, args };
      }
      return { type: 'identifier', name };
    }

    if (token.type === 'paren' && token.value === '(') {
      advance();
      const node = parseExpression();
      if (peek()?.type === 'paren' && peek()!.value === ')') advance();
      return node;
    }

    advance();
    return { type: 'literal', value: null };
  }

  return parseExpression();
}

// ─── Evaluator ───────────────────────────────────────────────

const builtins: Record<string, (...args: FormulaValue[]) => FormulaValue> = {
  // Math
  abs: (a) => Math.abs(Number(a)),
  round: (a) => Math.round(Number(a)),
  ceil: (a) => Math.ceil(Number(a)),
  floor: (a) => Math.floor(Number(a)),
  min: (...args) => Math.min(...args.map(Number)),
  max: (...args) => Math.max(...args.map(Number)),
  sum: (...args) => args.reduce((s, v) => (s as number) + Number(v), 0),

  // String
  concat: (...args) => args.map(String).join(''),
  length: (a) => String(a || '').length,
  contains: (a, b) => String(a).includes(String(b)),
  replace: (a, b, c) => String(a).replace(String(b), String(c)),
  upper: (a) => String(a).toUpperCase(),
  lower: (a) => String(a).toLowerCase(),
  slice: (a, b, c) => String(a).slice(Number(b), c != null ? Number(c) : undefined),

  // Logic
  not: (a) => !a,
  and: (...args) => args.every(Boolean),
  or: (...args) => args.some(Boolean),
  empty: (a) => a == null || a === '',

  // Date
  now: () => new Date().toISOString(),
  dateAdd: (date, amount, unit) => {
    const d = new Date(String(date));
    const n = Number(amount);
    const u = String(unit);
    if (u === 'days') d.setDate(d.getDate() + n);
    else if (u === 'months') d.setMonth(d.getMonth() + n);
    else if (u === 'years') d.setFullYear(d.getFullYear() + n);
    return d.toISOString();
  },
  dateBetween: (a, b, unit) => {
    const d1 = new Date(String(a)).getTime();
    const d2 = new Date(String(b)).getTime();
    const diff = d1 - d2;
    const u = String(unit);
    if (u === 'days') return Math.floor(diff / 86400000);
    if (u === 'hours') return Math.floor(diff / 3600000);
    if (u === 'minutes') return Math.floor(diff / 60000);
    return diff;
  },

  // Conditional
  if: (cond, then, else_) => cond ? then : (else_ ?? null),
};

function evaluate(node: ASTNode, context: FormulaContext): FormulaValue {
  switch (node.type) {
    case 'literal':
      return node.value;
    case 'identifier':
      return context[node.name] ?? null;
    case 'call': {
      if (node.name === 'prop') {
        const propName = evaluate(node.args[0], context);
        return context[String(propName)] ?? null;
      }
      if (node.name === 'if') {
        const cond = evaluate(node.args[0], context);
        return cond ? evaluate(node.args[1], context) : evaluate(node.args[2], context);
      }
      const fn = builtins[node.name];
      if (!fn) return null;
      const args = node.args.map((a) => evaluate(a, context));
      return fn(...args);
    }
    case 'binary': {
      const left = evaluate(node.left, context);
      const right = evaluate(node.right, context);
      switch (node.op) {
        case '+': return typeof left === 'string' || typeof right === 'string' ? String(left) + String(right) : Number(left) + Number(right);
        case '-': return Number(left) - Number(right);
        case '*': return Number(left) * Number(right);
        case '/': return Number(right) !== 0 ? Number(left) / Number(right) : null;
        case '==': return left === right;
        case '!=': return left !== right;
        case '>': return Number(left) > Number(right);
        case '<': return Number(left) < Number(right);
        case '>=': return Number(left) >= Number(right);
        case '<=': return Number(left) <= Number(right);
        default: return null;
      }
    }
  }
}

// ─── Public API ──────────────────────────────────────────────

export function evaluateFormula(formula: string, context: FormulaContext): FormulaValue {
  try {
    const tokens = tokenize(formula);
    const ast = parse(tokens);
    return evaluate(ast, context);
  } catch {
    return null;
  }
}
