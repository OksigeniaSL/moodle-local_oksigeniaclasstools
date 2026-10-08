// Formulas for the board: written in one line, the way they are said («3/4», «x^2 + 1», «raíz(2)», «{2x + y = 5;
// x − y = 1}»), and drawn as in a book: fractions one number over the other, powers and indices up and down, roots,
// brackets as tall as what they hold, systems with their brace, sums, integrals and limits. A «□» is an empty box to
// fill in («3 + □ = 5»). Laid out once at a size of reference and drawn at any size.
//
// What can be written:
//   a/b  fraction (brackets around a or b are only for grouping)     a^b  power       a_b  index
//   raíz(x), sqrt(x), √x  square root     raíz(n, x), root(n, x)  root of index n
//   |x|, abs(x)  absolute value     vec(v)  vector     {a; b}  system     (…) […] brackets
//   sum(i=1, n, x), int(a, b, f), lim(x->0, f)  sum, integral, limit
//   * × · : ÷ <= >= != +- -> => <=> ~= and the names of the Greek letters (alfa, pi, Delta…), inf, sin, cos, log…
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const S = 100;   // the size of reference, in pixels
    const AXIS = 0.3 * S, ASC = 0.74 * S, DESC = 0.24 * S;
    const FONT = 'Nunito, system-ui, sans-serif';
    const ctx0 = document.createElement('canvas').getContext('2d');

    // --- Words -----------------------------------------------------------------------------------------------
    const GREEK = { alfa: 'α', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', theta: 'θ', lambda: 'λ', mu: 'μ',
        pi: 'π', rho: 'ρ', ro: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', fi: 'φ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ',
        Lambda: 'Λ', Sigma: 'Σ', Phi: 'Φ', Omega: 'Ω', inf: '∞', infinito: '∞', infinity: '∞' };
    const FUNCS = ['sin', 'sen', 'cos', 'tan', 'tg', 'log', 'ln', 'exp', 'max', 'min', 'máx', 'mín', 'mod'];
    const SPECIAL = ['raíz', 'raiz', 'sqrt', 'root', 'abs', 'vec', 'sum', 'int', 'lim', 'lím'];
    // Symbols written with more than one sign, longest first.
    const MULTI = [['<=>', '⇔'], ['=>', '⇒'], ['->', '→'], ['<=', '≤'], ['>=', '≥'], ['!=', '≠'], ['+-', '±'], ['~=', '≈']];
    const ONE = { '*': '×', '-': '−' };
    const BINARY = '+−=<>≤≥≠±×÷·:→⇒⇔≈∈∉⊂∪∩';
    const SETS = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ' };

    // --- Reading it ------------------------------------------------------------------------------------------
    const tokenize = (src) => {
        const out = [];
        let i = 0;
        while (i < src.length) {
            const c = src[i];
            if (/\s/.test(c)) { const from = i; while (i < src.length && /\s/.test(src[i])) { i++; } out.push({ t: 'sp', n: i - from }); continue; }
            if (/[0-9]/.test(c)) {
                // A decimal comma or point needs a digit right after it (a comma and a space separates).
                let j = i + 1;
                while (j < src.length && (/[0-9]/.test(src[j]) || (/[.,]/.test(src[j]) && /[0-9]/.test(src[j + 1] || '')))) { j++; }
                out.push({ t: 'num', v: src.slice(i, j) }); i = j; continue;
            }
            if (/[A-Za-zÁÉÍÓÚÑáéíóúñü]/.test(c)) {
                let j = i + 1;
                while (j < src.length && /[A-Za-zÁÉÍÓÚÑáéíóúñü]/.test(src[j])) { j++; }
                out.push({ t: 'word', v: src.slice(i, j) }); i = j; continue;
            }
            const m = MULTI.find(([k]) => src.startsWith(k, i));
            if (m) { out.push({ t: 'op', v: m[1] }); i += m[0].length; continue; }
            if ('()[]{}|'.includes(c)) { out.push({ t: c }); } else if ('/^_,;'.includes(c)) { out.push({ t: c }); } else if (c === '□') {
                out.push({ t: 'box' });
            } else if (c === '√') { out.push({ t: 'word', v: 'raíz', bare: true }); } else { out.push({ t: 'op', v: ONE[c] || c }); }
            i++;
        }
        return out;
    };
    // A tree: {k: 'row', items}, {k: 'num'|'var'|'txt'|'op'|'fn', v}, {k: 'frac', a, b}, {k: 'sup'|'sub', a, b}, {k: 'subsup',
    // a, b, c}, {k: 'root', a, n}, {k: 'fence', l, r, a}, {k: 'vec', a}, {k: 'sys', rows}, {k: 'big', v, lo, hi, a},
    // {k: 'lim', lo, a}, {k: 'box'}.
    const parse = (src) => {
        const tk = tokenize(String(src || ''));
        let p = 0;
        const peek = (o = 0) => tk[p + o], next = () => tk[p++];
        const skip = () => { while (peek() && peek().t === 'sp') { p++; } };
        // Arguments of a call: «(a, b, c)», split at commas and semicolons at the top.
        const args = () => {
            const list = [];
            next();   // (
            for (;;) {
                const r = row([')', ',', ';']);
                list.push(r);
                const e = next();
                if (!e || e.t === ')') { return list; }
            }
        };
        const strip = (x) => (x.k === 'fence' && x.l === '(' && x.r === ')' ? x.a : x);
        // Whether the sign before the word just read (spaces apart) is one of these (ℝ after ∈).
        const after = (re) => { let i = p - 2; while (i >= 0 && tk[i].t === 'sp') { i--; } return i >= 0 && tk[i].t === 'op' && re.test(tk[i].v); };
        function atom() {
            skip();
            const tk1 = peek();
            if (!tk1) { return null; }
            if (tk1.t === 'num') { next(); return { k: 'num', v: tk1.v }; }
            if (tk1.t === 'box') { next(); return { k: 'box' }; }
            if (tk1.t === '(' || tk1.t === '[') {
                next();
                const close = tk1.t === '(' ? ')' : ']', inner = row([close]);
                if (peek() && peek().t === close) { next(); }
                return { k: 'fence', l: tk1.t, r: close, a: inner };
            }
            if (tk1.t === '{') {
                // A system if it has semicolons; if not, braces only group.
                next();
                const rows = [row(['}', ';'])];
                while (peek() && peek().t === ';') { next(); rows.push(row(['}', ';'])); }
                if (peek() && peek().t === '}') { next(); }
                return rows.length > 1 ? { k: 'sys', rows } : rows[0];
            }
            if (tk1.t === '|') {
                next();
                const inner = row(['|']);
                if (peek() && peek().t === '|') { next(); }
                return { k: 'fence', l: '|', r: '|', a: inner };
            }
            if (tk1.t === 'op') {
                next();
                return { k: 'op', v: tk1.v };
            }
            if (tk1.t === 'word') {
                next();
                const w = tk1.v, call = peek() && peek().t === '(';
                if (SPECIAL.includes(w) && (call || tk1.bare)) {
                    if (tk1.bare && !call) { return { k: 'root', a: strip(unit()) }; }
                    const a = args();
                    if (w === 'raíz' || w === 'raiz' || w === 'sqrt' || w === 'root') {
                        return a.length > 1 ? { k: 'root', n: a[0], a: a[1] } : { k: 'root', a: a[0] };
                    }
                    if (w === 'abs') { return { k: 'fence', l: '|', r: '|', a: a[0] }; }
                    if (w === 'vec') { return { k: 'vec', a: a[0] }; }
                    if (w === 'sum' || w === 'int') {
                        const [lo, hi, body] = a.length >= 3 ? a : [null, null, a[a.length - 1]];
                        return { k: 'big', v: w === 'sum' ? 'Σ' : '∫', lo, hi, a: body };
                    }
                    return { k: 'lim', lo: a.length > 1 ? a[0] : null, a: a[a.length - 1] };
                }
                // A function with its bracket is one piece (sen(x)/x is the sine over x).
                if (FUNCS.includes(w)) { return call ? { k: 'row', items: [{ k: 'fn', v: w }, atom()] } : { k: 'fn', v: w }; }
                if (GREEK[w]) { return { k: 'var', v: GREEK[w], up: w.startsWith('inf') }; }
                if (w.length === 1 && SETS[w] && after(/[∈∉⊂]/)) { return { k: 'var', v: SETS[w], up: true }; }
                // A short word, letters multiplied (xy); a longer one, a word (base, área).
                if (w.length <= 2) {
                    const letters = [...w].map((v) => ({ k: 'var', v }));
                    return letters.length === 1 ? letters[0] : { k: 'row', items: letters };
                }
                return { k: 'txt', v: w };
            }
            next();
            return null;
        }
        // An atom with what goes after it: powers and indices, «!», «'», «°», «%».
        function unit() {
            let a = atom();
            if (!a) { return null; }
            for (;;) {
                const n = peek();
                if (n && (n.t === '^' || n.t === '_')) {
                    next();
                    skip();
                    let b;
                    if (peek() && peek().t === 'op' && peek().v === '−') { next(); const u = unit(); b = { k: 'row', items: [{ k: 'op', v: '−', unary: true }, u ? strip(u) : { k: 'box' }] }; } else { const u = unit(); b = u ? strip(u) : { k: 'box' }; }
                    if (n.t === '^' && a.k === 'sub') { a = { k: 'subsup', a: a.a, b: a.b, c: b }; } else if (n.t === '_' && a.k === 'sup') {
                        a = { k: 'subsup', a: a.a, b, c: a.b };
                    } else { a = { k: n.t === '^' ? 'sup' : 'sub', a, b }; }
                } else if (n && n.t === 'op' && ["'", '!', '°', '%', '′'].includes(n.v)) {
                    next(); a = { k: 'row', items: [a, { k: 'op', v: n.v === "'" ? '′' : n.v, tight: true }] };
                } else { return a; }
            }
        }
        // A unit, or a fraction of units (left to right: a/b/c is (a/b)/c).
        function piece() {
            let a = unit();
            if (!a) { return null; }
            for (;;) {
                const save = p;
                skip();
                if (peek() && peek().t === '/') {
                    next();
                    const b = unit();
                    a = { k: 'frac', a: strip(a), b: b ? strip(b) : { k: 'box' } };
                } else { p = save; return a; }
            }
        }
        function row(stops) {
            const items = [];
            let gap = false;
            for (;;) {
                const n = peek();
                if (!n || stops.includes(n.t)) { break; }
                if (n.t === 'sp') {
                    next(); gap = true;
                    // Two spaces or more: room between two things (3 + 4 = 7   5 − 1 = 4).
                    if (n.n > 1 && items.length) { items.push({ k: 'gap', wide: true }); }
                    continue;
                }
                if (n.t === ',' || n.t === ';') { next(); items.push({ k: 'op', v: n.t, tight: true }); continue; }
                const before = p, x = piece();
                if (!x) { if (p === before) { next(); } continue; }
                // A number, a space and a fraction: a mixed number (1 1/2), drawn close.
                const prev = items[items.length - 1];
                if (gap && x.k === 'frac' && prev && prev.k === 'num') { x.mixed = true; } else if (gap && prev && prev.k !== 'op' && prev.k !== 'gap' && x.k !== 'op') {
                    // One space between two things that are not signs: a little room (2 x, a b).
                    items.push({ k: 'gap' });
                }
                items.push(x);
                gap = false;
            }
            return items.length === 1 ? items[0] : { k: 'row', items };
        }
        return row([]);
    };

    // --- Laying it out ---------------------------------------------------------------------------------------
    // A box: width, ascent and descent from the baseline, and how to paint it at (x, baseline y).
    const font = (size, italic, weight = 700) => `${italic ? 'italic ' : ''}${weight} ${size}px ${FONT}`;
    const text = (v, size, italic = false) => {
        ctx0.font = font(size, italic);
        const w = ctx0.measureText(v).width + (italic ? size * 0.05 : 0);
        return { w, a: ASC * size / S, d: DESC * size / S, paint: (g, x, y) => { g.font = font(size, italic); g.fillText(v, x, y); } };
    };
    const space = (w) => ({ w, a: 0, d: 0, paint: () => {} });
    const hrow = (boxes) => {
        let w = 0, a = 0, d = 0;
        boxes.forEach((b) => { w += b.w; a = Math.max(a, b.a); d = Math.max(d, b.d); });
        return { w, a, d, paint: (g, x, y) => { let at = x; boxes.forEach((b) => { b.paint(g, at, y); at += b.w; }); } };
    };
    const stroke = (g, size, fn) => { g.save(); g.lineWidth = Math.max(1, size * 0.06); g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); fn(); g.stroke(); g.restore(); };
    const lay = (n, size, level = 0) => {
        if (!n) { return space(0); }
        const small = Math.max(size * 0.7, S * 0.42);
        switch (n.k) {
            case 'num': return text(n.v, size);
            case 'var': return text(n.v, size, !n.up && /[a-zα-ω]/i.test(n.v));
            case 'txt': return text(n.v, size);
            case 'fn': return hrow([text(n.v, size), space(size * 0.08)]);
            case 'gap': return space(size * (n.wide ? 1 : 0.22));
            case 'op': {
                const t = text(n.v, size);
                if (n.tight || n.unary) { return n.v === ',' || n.v === ';' ? hrow([t, space(size * 0.18)]) : t; }
                return hrow([space(size * 0.22), t, space(size * 0.22)]);
            }
            case 'box': {
                const w = size * 0.62, h = size * 0.68;
                return { w: w + size * 0.08, a: h, d: size * 0.04, paint: (g, x, y) => {
                    g.save(); g.globalAlpha *= 0.65; g.setLineDash([size * 0.09, size * 0.07]);
                    stroke(g, size, () => g.rect(x + size * 0.04, y - h, w, h));
                    g.restore();
                } };
            }
            case 'row': {
                // An operator at the start, or after another one, is a sign (−3), drawn close.
                const items = n.items.map((x, i) => (x.k === 'op' && BINARY.includes(x.v) && (i === 0 || n.items[i - 1].k === 'op') && '−+±'.includes(x.v) ? Object.assign({}, x, { unary: true }) : x));
                const boxes = [];
                items.forEach((x, i) => {
                    if (x.k === 'frac' && x.mixed) { boxes.push(space(size * 0.06)); }
                    // Letters and brackets next to each other: a thin space so they do not touch.
                    if (i && x.k !== 'op' && x.k !== 'gap' && items[i - 1].k !== 'op' && items[i - 1].k !== 'gap' && !(x.k === 'frac' && x.mixed)) { boxes.push(space(size * 0.04)); }
                    boxes.push(lay(x, size, level));
                });
                return hrow(boxes);
            }
            case 'frac': {
                const s2 = level ? small : size;
                const a = lay(n.a, s2, level + 1), b = lay(n.b, s2, level + 1), bar = Math.max(1.5, size * 0.06), gap = size * 0.12;
                const w = Math.max(a.w, b.w) + size * 0.24, axis = AXIS * size / S;
                return { w: w + size * 0.08, a: axis + bar / 2 + gap + a.d + a.a, d: Math.max(0, b.a + gap + b.d + bar / 2 - axis), paint: (g, x, y) => {
                    const left = x + size * 0.04;
                    a.paint(g, left + (w - a.w) / 2, y - axis - bar / 2 - gap - a.d);
                    b.paint(g, left + (w - b.w) / 2, y - axis + bar / 2 + gap + b.a);
                    g.fillRect(left, y - axis - bar / 2, w, bar);
                } };
            }
            case 'sup': case 'sub': case 'subsup': {
                const base = lay(n.a, size, level);
                const up = n.k === 'sup' ? n.b : (n.k === 'subsup' ? n.c : null), down = n.k === 'sub' ? n.b : (n.k === 'subsup' ? n.b : null);
                const hi = up ? lay(up, small, level + 1) : null, lo = down ? lay(down, small, level + 1) : null;
                const raise = Math.max(base.a - size * 0.28, size * 0.42), drop = Math.max(size * 0.18, base.d);
                const w = base.w + Math.max(hi ? hi.w : 0, lo ? lo.w : 0) + size * 0.04;
                return { w, a: Math.max(base.a, hi ? raise + hi.a : 0), d: Math.max(base.d, lo ? drop + lo.d - lo.a * 0.3 : 0), paint: (g, x, y) => {
                    base.paint(g, x, y);
                    if (hi) { hi.paint(g, x + base.w + size * 0.03, y - raise); }
                    if (lo) { lo.paint(g, x + base.w + size * 0.03, y + drop - lo.a * 0.3); }
                } };
            }
            case 'root': {
                const a = lay(n.a, size, level), idx = n.n ? lay(n.n, Math.max(size * 0.5, S * 0.35), level + 1) : null;
                const gap = size * 0.12, top = a.a + gap + size * 0.04, sign = size * 0.55, lead = idx ? Math.max(0, idx.w - sign * 0.45) : 0;
                return { w: lead + sign + a.w + size * 0.12, a: top + size * 0.04, d: a.d + size * 0.04, paint: (g, x, y) => {
                    const sx = x + lead;
                    stroke(g, size, () => {
                        g.moveTo(sx + sign * 0.05, y - a.a * 0.35); g.lineTo(sx + sign * 0.25, y - a.a * 0.5);
                        g.lineTo(sx + sign * 0.5, y + a.d); g.lineTo(sx + sign * 0.85, y - top); g.lineTo(sx + sign + a.w + size * 0.08, y - top);
                    });
                    if (idx) { idx.paint(g, x, y - a.a * 0.55); }
                    a.paint(g, sx + sign, y);
                } };
            }
            case 'fence': {
                const a = lay(n.a, size, level), mid = (a.a - a.d) / 2;
                const top = Math.max(a.a, ASC * size / S), bottom = Math.max(a.d, DESC * size / S), wf = size * 0.32;
                const fence = (side, ch) => ({ w: wf, a: top, d: bottom, paint: (g, x, y) => {
                    const l = side === 'l', x0 = l ? x + wf * 0.75 : x + wf * 0.25, x1 = l ? x + wf * 0.2 : x + wf * 0.8;
                    stroke(g, size, () => {
                        if (ch === '|') { g.moveTo(x + wf / 2, y - top); g.lineTo(x + wf / 2, y + bottom); } else if (ch === '[' || ch === ']') {
                            g.moveTo(x0, y - top); g.lineTo(x1, y - top); g.lineTo(x1, y + bottom); g.lineTo(x0, y + bottom);
                        } else { g.moveTo(x0, y - top); g.quadraticCurveTo(x1 - (l ? wf * 0.15 : -wf * 0.15), y - mid, x0, y + bottom); }
                    });
                } });
                return hrow([fence('l', n.l), a, fence('r', n.r)]);
            }
            case 'vec': {
                const a = lay(n.a, size, level), lift = size * 0.14;
                return { w: a.w, a: a.a + lift + size * 0.06, d: a.d, paint: (g, x, y) => {
                    a.paint(g, x, y);
                    const yy = y - a.a - lift;
                    stroke(g, size * 0.8, () => { g.moveTo(x + size * 0.05, yy); g.lineTo(x + a.w - size * 0.05, yy); g.moveTo(x + a.w - size * 0.2, yy - size * 0.09); g.lineTo(x + a.w - size * 0.05, yy); g.lineTo(x + a.w - size * 0.2, yy + size * 0.09); });
                } };
            }
            case 'sys': {
                const rows = n.rows.map((r) => lay(r, size, level)), gap = size * 0.25;
                const total = rows.reduce((t, r) => t + r.a + r.d, 0) + gap * (rows.length - 1), axis = AXIS * size / S;
                const w = Math.max(...rows.map((r) => r.w)), wb = size * 0.4;
                return { w: wb + w + size * 0.1, a: axis + total / 2, d: total / 2 - axis, paint: (g, x, y) => {
                    const t0 = y - axis - total / 2, t1 = y - axis + total / 2, m = y - axis;
                    stroke(g, size, () => {
                        const xr = x + wb * 0.85, xm = x + wb * 0.45, xl = x + wb * 0.1;
                        g.moveTo(xr, t0); g.quadraticCurveTo(xm, t0, xm, t0 + (m - t0) * 0.3); g.lineTo(xm, m - (m - t0) * 0.25);
                        g.quadraticCurveTo(xm, m, xl, m); g.quadraticCurveTo(xm, m, xm, m + (t1 - m) * 0.25); g.lineTo(xm, t1 - (t1 - m) * 0.3);
                        g.quadraticCurveTo(xm, t1, xr, t1);
                    });
                    let at = t0;
                    rows.forEach((r) => { r.paint(g, x + wb, at + r.a); at += r.a + r.d + gap; });
                } };
            }
            case 'big': {
                const sym = text(n.v, size * (n.v === '∫' ? 1.6 : 1.4), n.v === '∫');
                const lo = n.lo ? lay(n.lo, small, level + 1) : null, hi = n.hi ? lay(n.hi, small, level + 1) : null, body = lay(n.a, size, level);
                const integral = n.v === '∫', shift = (sym.a - sym.d) / 2 - AXIS * size / S;
                const symBox = integral ? {
                    w: sym.w + Math.max(lo ? lo.w : 0, hi ? hi.w : 0) + size * 0.06, a: sym.a - shift + (hi ? hi.a * 0.3 : 0), d: sym.d + shift + (lo ? lo.d : 0),
                    paint: (g, x, y) => { sym.paint(g, x, y + shift); if (hi) { hi.paint(g, x + sym.w, y + shift - sym.a + hi.a * 0.8); } if (lo) { lo.paint(g, x + sym.w * 0.7, y + shift + sym.d); } },
                } : (() => {
                    const w = Math.max(sym.w, lo ? lo.w : 0, hi ? hi.w : 0);
                    return { w: w + size * 0.08, a: sym.a - shift + (hi ? hi.a + hi.d + size * 0.06 : 0), d: sym.d + shift + (lo ? lo.a + lo.d + size * 0.06 : 0), paint: (g, x, y) => {
                        sym.paint(g, x + (w - sym.w) / 2, y + shift);
                        if (hi) { hi.paint(g, x + (w - hi.w) / 2, y + shift - sym.a - size * 0.06 - hi.d); }
                        if (lo) { lo.paint(g, x + (w - lo.w) / 2, y + shift + sym.d + size * 0.06 + lo.a); }
                    } };
                })();
                return hrow([symBox, space(size * 0.08), body]);
            }
            case 'lim': {
                const word = text(/^es/.test(document.documentElement.lang || '') ? 'lím' : 'lim', size), lo = n.lo ? lay(n.lo, small, level + 1) : null, body = lay(n.a, size, level);
                const w = Math.max(word.w, lo ? lo.w : 0);
                const head = { w: w + size * 0.12, a: word.a, d: word.d + (lo ? lo.a + lo.d + size * 0.04 : 0), paint: (g, x, y) => {
                    word.paint(g, x + (w - word.w) / 2, y);
                    if (lo) { lo.paint(g, x + (w - lo.w) / 2, y + word.d + size * 0.04 + lo.a); }
                } };
                return hrow([head, body]);
            }
            default: return space(0);
        }
    };

    // What is shown: laid out once (at the size of reference) and kept, for drawing again at any size.
    const cache = new Map();
    const layout = (src) => {
        const key = String(src || '');
        if (!cache.has(key)) {
            if (cache.size > 200) { cache.clear(); }
            const box = lay(parse(key), S);
            cache.set(key, { w: box.w, a: box.a, d: box.d, paint: box.paint });
        }
        return cache.get(key);
    };
    /**
     * How big a formula is when drawn with letters of a height (its top left corner is where it is placed).
     * @param {string} src
     * @param {number} size
     * @return {{w: number, h: number}}
     */
    const measure = (src, size) => { const b = layout(src), k = size / S; return { w: b.w * k, h: (b.a + b.d) * k }; };
    /**
     * Draws a formula with its top left corner at (x, y).
     * @param {CanvasRenderingContext2D} g
     * @param {string} src
     * @param {number} x
     * @param {number} y
     * @param {number} size The height of its letters.
     * @param {string} colour
     */
    const draw = (g, src, x, y, size, colour) => {
        const b = layout(src), k = size / S;
        g.save();
        g.translate(x, y); g.scale(k, k);
        g.fillStyle = colour; g.strokeStyle = colour; g.textBaseline = 'alphabetic';
        b.paint(g, 0, b.a);
        g.restore();
    };
    // Fonts load late: what was laid out before them is laid out again.
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(() => cache.clear()); }

    // --- The editor --------------------------------------------------------------------------------------------
    // One line to write it, a preview as it is written, and buttons for what is harder to type: those of the level of
    // the screen (Primary: fractions, powers, roots, boxes to fill in; Secondary adds indices, roots of index n,
    // absolute values, systems, Greek letters; Superior, sums, integrals, limits, vectors…), and all of them on request.
    // Tab goes to the next box □.
    const core = window.ClasstoolsCore;
    const t = core ? core.t : (k) => k, escape = core ? core.escape : (s) => s;
    const PALETTE = [
        ['primary', [['□/□', 'a/b', 'fx_p_frac'], ['□ □/□', '1 a/b', 'fx_p_mixed'], ['×'], [':'], ['÷'], ['='], ['≠'], ['<'], ['>'],
            ['(□)', '(a)', 'fx_p_paren'], ['□^2', 'a^2', 'fx_p_square'], ['□^□', 'a^b', 'fx_p_power'], ['raíz(□)', '√a', 'fx_p_sqrt'], ['%'], ['°'], ['π'], ['□', '□', 'fx_p_box']]],
        ['secondary', [['□_□', 'a_b', 'fx_p_index'], ['raíz(□, □)', 'raíz(n, a)', 'fx_p_root'], ['±'], ['≤'], ['≥'], ['≈'], ['|□|', '|a|', 'fx_p_abs'],
            ['{□; □}', '{a; b}', 'fx_p_sys'], ['∞'], ['α'], ['β'], ['Δ'], ['→'], ['sen(□)', 'sen'], ['cos(□)', 'cos'], ['log(□)', 'log']]],
        ['advanced', [['sum(i=1, n, □)', 'sum(i=1, n, a)', 'fx_p_sum'], ['int(a, b, □)', 'int(a, b, f)', 'fx_p_int'], ['lim(x->0, □)', 'lim(x->0, f)', 'fx_p_lim'],
            ['vec(□)', 'vec(v)', 'fx_p_vec'], ['∈'], ['ℝ'], ['⇒'], ['⇔'], ['∀'], ['∃'], ['∂']]],
    ];
    const LEVELS = { early: 1, primary: 1, secondary: 2, advanced: 3 };
    let dialog = null, done = null, gone = null;
    const icon = (src) => {
        const c = document.createElement('canvas'), m = measure(src, 26);
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.ceil((m.w + 4) * dpr); c.height = Math.ceil((m.h + 4) * dpr);
        c.style.width = `${(m.w + 4)}px`; c.style.height = `${m.h + 4}px`;
        const g = c.getContext('2d'); g.scale(dpr, dpr);
        draw(g, src, 2, 2, 26, getComputedStyle(document.body).color || '#1c1a19');
        return c;
    };
    const build = () => {
        dialog = document.createElement('dialog');
        dialog.className = 'editor ct-fx-dialogo';
        dialog.innerHTML = `<form method="dialog" class="ct-fx">
            <h2 id="fx-title"></h2>
            <canvas class="ct-fx-ver" id="fx-ver" aria-hidden="true"></canvas>
            <input type="text" id="fx-src" maxlength="300" autocomplete="off" spellcheck="false" placeholder="${escape(t('fx_ph'))}" aria-label="${escape(t('fx_title'))}">
            <p class="nota">${escape(t('fx_hint'))}</p>
            <div class="ct-fx-botones" id="fx-pal"></div>
            <label class="interruptor"><input type="checkbox" id="fx-all"><span>${escape(t('fx_all'))}</span></label>
            <div class="botonera">
                <button type="submit" class="boton" id="fx-ok"></button>
                <button type="button" class="boton suave" id="fx-cancel">${escape(t('wb_cancel'))}</button>
                <button type="button" class="boton rojo-suave" id="fx-del">${escape(t('fx_delete'))}</button>
            </div></form>`;
        document.body.append(dialog);
        const $ = (s) => dialog.querySelector(s), input = $('#fx-src');
        const preview = () => {
            const c = $('#fx-ver'), box = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
            c.width = Math.round(box.width * dpr); c.height = Math.round(box.height * dpr);
            const g = c.getContext('2d'); g.scale(dpr, dpr);
            const src = input.value.trim();
            if (!src) { return; }
            const m = measure(src, 100), size = Math.min(56, (box.width - 24) / (m.w / 100), (box.height - 16) / (m.h / 100));
            const mm = measure(src, size);
            draw(g, src, (box.width - mm.w) / 2, (box.height - mm.h) / 2, size, getComputedStyle(document.body).color || '#1c1a19');
        };
        // Puts something where the cursor is (wrapping what is selected, in the first box), and selects the next box.
        const put = (snippet) => {
            const a = input.selectionStart, b = input.selectionEnd, chosen = input.value.slice(a, b);
            let text = snippet;
            if (chosen && snippet.includes('□')) { text = snippet.replace('□', chosen); }
            input.value = input.value.slice(0, a) + text + input.value.slice(b);
            const box = input.value.indexOf('□', a);
            input.focus();
            if (box >= 0 && box < a + text.length) { input.setSelectionRange(box, box + 1); } else { input.setSelectionRange(a + text.length, a + text.length); }
            preview();
        };
        $('#fx-pal').addEventListener('click', (e) => { const btn = e.target.closest('[data-put]'); if (btn) { put(btn.dataset.put); } });
        input.addEventListener('input', preview);
        input.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') { return; }
            const v = input.value, from = e.shiftKey ? input.selectionStart - 1 : input.selectionEnd;
            const at = e.shiftKey ? v.lastIndexOf('□', from) : v.indexOf('□', from);
            const box = at >= 0 ? at : (e.shiftKey ? v.lastIndexOf('□') : v.indexOf('□'));
            if (box >= 0) { e.preventDefault(); input.setSelectionRange(box, box + 1); }
        });
        $('#fx-all').addEventListener('change', () => palette($('#fx-all').checked ? 3 : dialog.level));
        const close = () => { if (dialog.close) { dialog.close(); } else { dialog.removeAttribute('open'); } };
        $('#fx-cancel').addEventListener('click', close);
        $('#fx-del').addEventListener('click', () => { close(); if (gone) { gone(); } });
        dialog.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const src = input.value.trim();
            close();
            if (src && done) { done(src); }
        });
        dialog.preview = preview;
    };
    const palette = (level) => {
        const pal = dialog.querySelector('#fx-pal');
        pal.innerHTML = '';
        PALETTE.slice(0, level).forEach(([, list]) => list.forEach(([put, show, tip]) => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'ct-fx-boton'; b.dataset.put = put;
            const name = tip ? t(tip) : (show || put).replace(/\(□\)$/, '');
            b.title = name; b.setAttribute('aria-label', name);
            b.append(icon(show || put));
            pal.append(b);
        }));
    };
    /**
     * Opens the editor.
     * @param {{src?: string, mode?: string, onDone: function(string), onDelete?: function}} o What there is (to change it),
     *     the screen mode (for the buttons), what to do with the formula and, for one already on the board, with «Delete».
     */
    const edit = (o) => {
        if (!dialog) { build(); }
        done = o.onDone; gone = o.onDelete || null;
        dialog.level = LEVELS[o.mode] || 1;
        dialog.querySelector('#fx-all').checked = false;
        palette(dialog.level);
        dialog.querySelector('#fx-title').textContent = t('fx_title');
        dialog.querySelector('#fx-ok').textContent = t(o.src ? 'fx_save' : 'fx_put');
        dialog.querySelector('#fx-del').hidden = !o.onDelete;
        const input = dialog.querySelector('#fx-src');
        input.value = o.src || '';
        if (dialog.showModal) { dialog.showModal(); } else { dialog.setAttribute('open', ''); }
        requestAnimationFrame(() => { dialog.preview(); input.focus(); input.select(); });
    };

    window.ClasstoolsFormula = { parse, measure, draw, edit };
})();
