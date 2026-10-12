// Calculator, among the materials (not in the Infantil mode): a basic one with big keys and brackets, that follows the
// order of operations (2 + 3 × 4 = 14), and a scientific one (powers, roots, π, trigonometry in degrees or radians,
// logarithms, factorial, powers of ten, with a «2nd» key for the inverse functions); Primary starts with the basic
// one, Secondary and up with the scientific one, and each mode remembers the teacher's choice. Two ways of using it in
// class: «Step by step» shows how a combined operation is worked out, one level of the order of operations at a time,
// with what is being done marked; «Estimate first» hides the result until the class has said how much it will be.
// The whole expression stays on screen and every result goes to a strip beside it, to talk about it; a result of the
// strip can be used again. The keyboard works too.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { t, escape, play, announce, setIcon } = core;
    const lang = document.documentElement.lang || 'en';
    // The decimal sign of the language (a comma in Spanish), on the key and in the results.
    const COMMA = (1.5).toLocaleString(lang).includes(',');
    const DEC = COMMA ? ',' : '.';
    const byMode = core.byMode ? core.byMode('calculadora', {
        early: { sci: false, steps: true, guess: false }, primary: { sci: false, steps: true, guess: false },
        secondary: { sci: true, steps: false, guess: false }, advanced: { sci: true, steps: false, guess: false },
    }) : { get: () => ({ sci: false, steps: true, guess: false }), set: () => {} };
    const saved = byMode.get();
    let sci = !!saved.sci, steps = saved.steps !== false, guess = !!saved.guess;
    let rad = false, second = false, expr = '', shown = '', ans = 0, fresh = false, hiddenResult = false, lines = [];
    const tape = [];

    // The keys: what is shown, what goes into the expression, and the kind (for the colour). With «2nd», some
    // scientific keys do their inverse.
    const BASIC = [
        ['C', 'clear', 'borra'], ['⌫', 'back', 'borra'], ['(', '(', 'par'], [')', ')', 'par'],
        ['7', '7', 'num'], ['8', '8', 'num'], ['9', '9', 'num'], ['÷', '÷', 'op'],
        ['4', '4', 'num'], ['5', '5', 'num'], ['6', '6', 'num'], ['×', '×', 'op'],
        ['1', '1', 'num'], ['2', '2', 'num'], ['3', '3', 'num'], ['−', '−', 'op'],
        ['0', '0', 'num'], [DEC, DEC, 'num'], ['%', '%', 'op'], ['+', '+', 'op'],
        ['=', 'equals', 'igual'],
    ];
    const SCI = [
        ['2nd', 'second', 'fn segunda'], ['sin', 'sin(', 'fn'], ['cos', 'cos(', 'fn'], ['tan', 'tan(', 'fn'], ['DEG', 'angle', 'fn'],
        ['x²', '²', 'fn'], ['xʸ', '^', 'fn'], ['√', '√(', 'fn'], ['ln', 'ln(', 'fn'], ['log', 'log(', 'fn'],
        ['π', 'π', 'fn'], ['e', 'e', 'fn'], ['×10ˣ', '×10^', 'fn'], ['1/x', 'inv', 'fn'], ['n!', '!', 'fn'],
        ['±', 'neg', 'fn'], ['Ans', 'Ans', 'fn'],
    ];
    const SECOND = { 'sin(': ['sin⁻¹', 'asin('], 'cos(': ['cos⁻¹', 'acos('], 'tan(': ['tan⁻¹', 'atan('], '²': ['x³', '³'],
        '√(': ['∛', '∛('], 'ln(': ['eˣ', 'e^('], 'log(': ['10ˣ', '10^('] };

    const panel = core.material.add('calc', t('mt_calc'), `
        <aside class="tarjeta ct-side ct-calc-side">
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('ca_kind'))}" id="ca-kind">
                <button type="button" role="radio" data-v="basic">${escape(t('ca_basic'))}</button>
                <button type="button" role="radio" data-v="sci">${escape(t('ca_sci'))}</button>
            </div>
            <label class="interruptor"><input type="checkbox" id="ca-steps-on"><span>${escape(t('ca_steps'))}</span></label>
            <label class="interruptor"><input type="checkbox" id="ca-guess-on"><span>${escape(t('ca_guess'))}</span></label>
            <p class="ante">${escape(t('ca_tape'))}</p>
            <ol class="ct-calc-tape" id="ca-tape" aria-live="polite"></ol>
            <p class="nota" id="ca-tape-empty">${escape(t('ca_tape_empty'))}</p>
            <button type="button" class="boton suave" id="ca-tape-clear"><span data-icono="limpiar"></span><span>${escape(t('ca_tape_clear'))}</span></button>
        </aside>
        <div class="tarjeta ct-stage ct-calc">
            <div class="ct-calc-display" role="status" aria-live="polite">
                <p class="ct-calc-flags" id="ca-flags" aria-hidden="true"></p>
                <p class="ct-calc-expr" id="ca-expr"></p>
                <p class="ct-calc-result" id="ca-result">0</p>
            </div>
            <div class="ct-calc-cuerpo">
                <div class="ct-calc-keys" id="ca-keys"></div>
                <div class="ct-calc-pasos" id="ca-sheet" hidden>
                    <p class="ante">${escape(t('ca_steps'))}</p>
                    <ol id="ca-lines"></ol>
                    <div class="botonera centro">
                        <button type="button" class="boton grande" id="ca-reveal"><span data-icono="ocultar"></span><span>${escape(t('ca_reveal'))}</span></button>
                        <button type="button" class="boton suave" id="ca-keys-back"><span data-icono="numeros"></span><span>${escape(t('ca_keys'))}</span></button>
                    </div>
                </div>
            </div>
        </div>`, () => {});
    const $ = (s) => panel.querySelector(s);
    panel.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));

    // --- Working it out ---------------------------------------------------------------------------------------
    // The expression as it is written (×, ÷, −, the decimal sign of the language) → tokens → a tree that follows the
    // order of operations → a value; null if it cannot be worked out.
    const tokens = (s) => {
        const out = [];
        let i = 0;
        while (i < s.length) {
            const c = s[i];
            if (/[0-9.,]/.test(c)) {
                let j = i;
                while (j < s.length && /[0-9.,]/.test(s[j])) { j++; }
                const text = s.slice(i, j), n = Number(text.replace(',', '.'));
                if (!isFinite(n) || (text.match(/[.,]/g) || []).length > 1) { return null; }
                out.push({ n, s: text.replace(/[.,]/, DEC) }); i = j; continue;
            }
            const word = s.slice(i).match(/^(asin|acos|atan|sin|cos|tan|ln|log|Ans|√|∛)/);
            if (word) { out.push(word[1] === 'Ans' ? { n: ans, s: t('ca_ans') } : { f: word[1] }); i += word[1].length; continue; }
            if (c === 'π') { out.push({ n: Math.PI, s: 'π' }); } else if (c === 'e') { out.push({ n: Math.E, s: 'e' }); } else if ('+−×÷^()%²³!'.includes(c)) {
                out.push({ o: c });
            } else if (c !== ' ') { return null; }
            i++;
        }
        return out;
    };
    const fact = (n) => {
        if (n < 0 || n > 170 || Math.round(n) !== n) { return NaN; }
        let r = 1;
        for (let k = 2; k <= n; k++) { r *= k; }
        return r;
    };
    // The tree: n (a number, with the way it was written), u (minus), f (a function), p (², ³, !, % after it) and
    // b (an operation; «imp» when it is a product without its sign, as in 2π). «par» marks what was in brackets.
    const parse = (s) => {
        const list = tokens(s);
        if (!list || !list.length) { return null; }
        let p = 0;
        const peek = () => list[p], next = () => list[p++];
        const starts = (tk) => tk && (tk.n !== undefined || tk.f || tk.o === '(');
        function atom() {
            const tk = next();
            if (!tk) { throw new Error('end'); }
            let v;
            if (tk.n !== undefined) { v = { t: 'n', v: tk.n, s: tk.s }; } else if (tk.f) {
                if (peek() && peek().o === '(') {
                    next(); const x = sum(); if (peek() && peek().o === ')') { next(); }
                    v = { t: 'f', f: tk.f, x, par: true };
                } else { v = { t: 'f', f: tk.f, x: power(), par: false }; }
            } else if (tk.o === '(') {
                v = Object.assign({}, sum(), { par: true });
                if (peek() && peek().o === ')') { next(); }
            } else if (tk.o === '−') {
                const x = power();
                // A negative number is a number, not an operation to do.
                return x.t === 'n' && !x.par ? { t: 'n', v: -x.v, s: '−' + x.s } : { t: 'u', x };
            } else if (tk.o === '+') { return power(); } else { throw new Error('token'); }
            while (peek() && ['²', '³', '!', '%'].includes(peek().o)) { v = { t: 'p', op: next().o, x: v }; }
            return v;
        }
        // Powers go from the right (2^3^2 = 2^9).
        function power() {
            const b = atom();
            if (peek() && peek().o === '^') { next(); return { t: 'b', op: '^', l: b, r: power() }; }
            return b;
        }
        // Times and divided by; a number next to a bracket, π or a function multiplies (2π, 3(4 + 1)).
        function product() {
            let v = power();
            for (;;) {
                const tk = peek();
                if (tk && (tk.o === '×' || tk.o === '÷')) { next(); v = { t: 'b', op: tk.o, l: v, r: power() }; } else if (starts(tk)) {
                    v = { t: 'b', op: '×', l: v, r: power(), imp: true };
                } else { return v; }
            }
        }
        function sum() {
            let v = product();
            while (peek() && (peek().o === '+' || peek().o === '−')) { const o = next().o; v = { t: 'b', op: o, l: v, r: product() }; }
            return v;
        }
        try {
            const tree = sum();
            // Brackets left open at the end are closed; anything else left over is a mistake.
            if (p < list.length && !list.slice(p).every((x) => x.o === ')')) { return null; }
            return tree;
        } catch (err) { return null; }
    };
    const angle = (x) => (rad ? x : (x * Math.PI) / 180), back = (x) => (rad ? x : (x * 180) / Math.PI);
    const FN = { sin: (x) => Math.sin(angle(x)), cos: (x) => Math.cos(angle(x)), tan: (x) => Math.tan(angle(x)),
        asin: (x) => back(Math.asin(x)), acos: (x) => back(Math.acos(x)), atan: (x) => back(Math.atan(x)),
        ln: Math.log, log: Math.log10, '√': Math.sqrt, '∛': Math.cbrt };
    const value = (n) => {
        if (n.t === 'n') { return n.v; }
        if (n.t === 'u') { return -value(n.x); }
        if (n.t === 'f') { return FN[n.f](value(n.x)); }
        if (n.t === 'p') { const x = value(n.x); return n.op === '²' ? x * x : (n.op === '³' ? x * x * x : (n.op === '!' ? fact(x) : x / 100)); }
        const l = value(n.l), r = value(n.r);
        return { '+': l + r, '−': l - r, '×': l * r, '÷': l / r, '^': Math.pow(l, r) }[n.op];
    };
    const evaluate = (s) => {
        const tree = parse(s);
        if (!tree) { return null; }
        const v = value(tree);
        return isFinite(v) ? v : NaN;
    };
    // A result as it is read: up to ten significant digits, in the language, and in powers of ten when very big or small.
    const format = (v) => {
        if (v === null) { return t('ca_error'); }
        if (Number.isNaN(v)) { return t('ca_undefined'); }
        const a = Math.abs(v);
        if (a !== 0 && (a >= 1e12 || a < 1e-7)) {
            const [m, x] = v.toExponential(6).split('e');
            return `${Number(m).toLocaleString(lang, { maximumFractionDigits: 6 })} × 10^${Number(x)}`.replace(/^-/, '−');
        }
        return Number(v.toPrecision(10)).toLocaleString(lang, { maximumFractionDigits: 10 }).replace(/^-/, '−');
    };

    // --- Step by step -----------------------------------------------------------------------------------------
    // Each step does every operation that can be done at the highest level of the order of operations: first what is
    // in the innermost brackets, then powers, roots and functions, then × and ÷, then + and −; the ones of the same
    // level that do not depend on each other go together (2 × 3 + 4 × 5 → 6 + 20).
    const NAMES = { asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹' };
    const RANK = { '+': 1, '−': 1, '×': 2, '÷': 2, '^': 3 };
    const kids = (n) => (n.t === 'b' ? [n.l, n.r] : (n.x ? [n.x] : []));
    const pick = (tree) => {
        const found = [];
        // The brackets of a function are around its argument, not around the function.
        const walk = (n, depth) => {
            const d = depth + (n.par && n.t !== 'f' ? 1 : 0);
            if (n.t !== 'n' && kids(n).every((k) => k.t === 'n')) { found.push({ n, score: d * 10 + (n.t === 'b' ? RANK[n.op] : 3) }); }
            kids(n).forEach((k) => walk(k, d + (n.t === 'f' && n.par ? 1 : 0)));
        };
        walk(tree, 0);
        const best = Math.max(...found.map((x) => x.score));
        return new Set(found.filter((x) => x.score === best).map((x) => x.n));
    };
    const reduce = (n, chosen, made) => {
        if (chosen.has(n)) {
            const v = value(n);
            const leaf = { t: 'n', v, s: format(v) };
            made.add(leaf);
            return leaf;
        }
        if (n.t === 'n') { return n; }
        const copy = Object.assign({}, n);
        if (n.t === 'b') { copy.l = reduce(n.l, chosen, made); copy.r = reduce(n.r, chosen, made); } else { copy.x = reduce(n.x, chosen, made); }
        // Minus a number is that negative number (−2² → −4 in one step).
        if (copy.t === 'u' && copy.x.t === 'n' && !copy.par) {
            const leaf = { t: 'n', v: -copy.x.v, s: format(-copy.x.v) };
            if (made.has(copy.x)) { made.add(leaf); }
            return leaf;
        }
        return copy;
    };
    // The expression, written as in the notebook (powers raised), with what is about to be done and what has just
    // been worked out marked.
    const print = (n, chosen, made, inner = false) => {
        let html;
        const neg = n.t === 'n' && n.v < 0;
        if (n.t === 'n') { html = escape(n.s); } else if (n.t === 'u') { html = `−${print(n.x, chosen, made, true)}`; } else if (n.t === 'f') {
            const name = escape(NAMES[n.f] || n.f);
            html = n.par ? `${name}(${print(n.x, chosen, made)})` : `${name} ${print(n.x, chosen, made, true)}`;
        } else if (n.t === 'p') { html = `${print(n.x, chosen, made, true)}${n.op}`; } else if (n.op === '^') {
            html = `${print(n.l, chosen, made, true)}<sup>${print(n.r, chosen, made)}</sup>`;
        } else if (n.imp) { html = `${print(n.l, chosen, made, true)}${print(n.r, chosen, made, true)}`; } else {
            html = `${print(n.l, chosen, made)} ${n.op} ${print(n.r, chosen, made, true)}`;
        }
        // Brackets as they were written; a negative number inside an operation, in brackets.
        if (n.par && n.t !== 'f') { html = `(${html})`; } else if (neg && inner) { html = `(${html})`; }
        if (chosen.has(n)) { html = `<span class="ca-hacer">${html}</span>`; }
        if (made.has(n)) { html = `<span class="ca-hecho">${html}</span>`; }
        return html;
    };
    const workOut = (s) => {
        let tree = parse(s);
        if (!tree) { return []; }
        const out = [];
        let made = new Set();
        for (let i = 0; i < 30 && tree.t !== 'n'; i++) {
            const chosen = pick(tree);
            out.push(print(tree, chosen, made));
            made = new Set();
            tree = reduce(tree, chosen, made);
            if (tree.t === 'n' && !isFinite(tree.v)) { break; }
        }
        out.push(print(tree, new Set(), made));
        return out;
    };

    // --- The keys ---------------------------------------------------------------------------------------------
    const OPS = '+−×÷^';
    const keep = (v) => {
        tape.unshift({ expr, result: format(v), v });
        tape.length = Math.min(tape.length, 30);
        paintTape();
    };
    // The steps, over the keys, after «=» (when there is more than one operation, or while the result is hidden);
    // a key, a tap on them or «Keys» brings the keys back.
    const openSheet = () => {
        const many = lines.length > 2;
        const show = (steps && many) || hiddenResult;
        $('#ca-sheet').hidden = !show;
        $('#ca-keys').hidden = show;
        if (!show) { return; }
        $('#ca-lines').innerHTML = hiddenResult
            ? `<li class="ca-adivina">${escape(t('ca_guess_now'))}</li>`
            : lines.map((l, i) => `<li>${i ? '<b>=</b> ' : ''}${l}</li>`).join('');
        $('#ca-sheet').querySelector('.ante').hidden = hiddenResult;
        $('#ca-reveal').hidden = !hiddenResult;
    };
    const closeSheet = () => { $('#ca-sheet').hidden = true; $('#ca-keys').hidden = false; };
    const reveal = () => {
        if (!hiddenResult) { return; }
        hiddenResult = false;
        keep(ans);
        play('elegido');
        // Estimated first and then checked: the sticker of the calculator.
        if (core.logro) { core.logro('echacuentas'); }
        announce(`${expr} = ${shown}`);
        paint(); openSheet();
    };
    const press = (k) => {
        if (k === 'second') { second = !second; paintKeys(); paint(); return; }
        if (k === 'angle') { rad = !rad; paintKeys(); paint(); return; }
        // With «2nd», the key does its inverse (once).
        if (second && SECOND[k]) { k = SECOND[k][1]; }
        if (second) { second = false; paintKeys(); }
        if (k === 'clear') { expr = ''; shown = ''; fresh = false; hiddenResult = false; closeSheet(); paint(); return; }
        if (k === 'back') {
            expr = fresh ? '' : expr.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|ln\(|log\(|√\(|∛\(|Ans|.)$/, '');
            fresh = false; shown = ''; hiddenResult = false; closeSheet(); paint(); return;
        }
        if (k === 'equals') {
            if (!expr) { return; }
            // Estimating: a second «=» shows it.
            if (fresh && hiddenResult) { reveal(); return; }
            if (fresh) { return; }
            // Brackets left open are closed, as they are worked out: «∛(27» is shown as «∛(27)».
            const open = (expr.match(/\(/g) || []).length - (expr.match(/\)/g) || []).length;
            if (open > 0) { expr += ')'.repeat(open); }
            const v = evaluate(expr);
            shown = format(v);
            const ok = v !== null && !Number.isNaN(v);
            lines = ok ? workOut(expr) : [];
            hiddenResult = ok && guess;
            if (ok) {
                ans = v;
                if (!hiddenResult) { keep(v); }
                play('tic');
            } else { play('minus'); }
            announce(hiddenResult ? t('ca_guess_now') : `${expr} = ${shown}`);
            fresh = true; paint(); openSheet(); return;
        }
        closeSheet();
        // After a result: an operation goes on from it; a number starts again.
        if (fresh) {
            if (hiddenResult) { keep(ans); hiddenResult = false; }
            expr = OPS.includes(k[0]) || ['²', '³', '!', '%', 'inv', 'neg'].includes(k) ? 'Ans' : '';
            fresh = false; shown = '';
        }
        if (k === 'inv') { expr = expr ? `1÷(${expr})` : '1÷'; } else if (k === 'neg') {
            expr = expr.startsWith('−(') && expr.endsWith(')') ? expr.slice(2, -1) : (expr ? `−(${expr})` : '−');
        } else if (OPS.includes(k) && OPS.includes(expr.slice(-1))) { expr = expr.slice(0, -1) + k; } else { expr += k; }
        expr = expr.slice(0, 120);
        paint();
    };
    const paintKeys = () => {
        const key = ([label, k, kind]) => {
            const [l2, k2] = second && SECOND[k] ? SECOND[k] : [label, k];
            const text = k === 'angle' ? (rad ? 'RAD' : 'DEG') : l2;
            const pressed = k === 'angle' ? ` aria-pressed="${rad}"` : (k === 'second' ? ` aria-pressed="${second}"` : '');
            return `<button type="button" class="ct-calc-key ${kind}${k2 !== k ? ' invertida' : ''}" data-k="${escape(k)}"${pressed}>${escape(text)}</button>`;
        };
        $('#ca-keys').className = `ct-calc-keys ${sci ? 'cientifica' : 'basica'}`;
        // The scientific keys on the left, the basic ones on the right.
        $('#ca-keys').innerHTML = (sci ? `<div class="ct-calc-grid sci">${SCI.map(key).join('')}</div>` : '') + `<div class="ct-calc-grid">${BASIC.map(key).join('')}</div>`;
        panel.querySelectorAll('#ca-kind button').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === 'sci') === sci)));
    };
    // What is being written, as it is written (only the decimal sign and «Ans» in the language).
    const pretty = (s) => s.replace(/Ans/g, t('ca_ans')).replace(/[.,]/g, DEC);
    function paint() {
        $('#ca-expr').textContent = shown ? `${pretty(expr)} =` : '';
        const text = hiddenResult ? '?' : (shown || pretty(expr) || '0');
        $('#ca-result').textContent = text;
        $('#ca-result').classList.toggle('larga', text.length > 14);
        $('#ca-result').classList.toggle('oculto', hiddenResult);
        $('#ca-flags').textContent = sci ? [rad ? 'RAD' : 'DEG', second ? '2nd' : ''].filter(Boolean).join(' · ') : '';
    }
    const paintTape = () => {
        $('#ca-tape').innerHTML = tape.map((x, i) => `<li><button type="button" data-i="${i}" title="${escape(t('ca_use'))}"><span>${escape(pretty(x.expr))} =</span><strong>${escape(x.result)}</strong></button></li>`).join('');
        $('#ca-tape-empty').hidden = tape.length > 0;
        $('#ca-tape-clear').hidden = !tape.length;
    };
    $('#ca-keys').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { press(b.dataset.k); } });
    $('#ca-kind').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (b) { sci = b.dataset.v === 'sci'; second = false; byMode.set({ sci }); paintKeys(); paint(); }
    });
    $('#ca-steps-on').checked = steps;
    $('#ca-steps-on').addEventListener('change', () => { steps = $('#ca-steps-on').checked; byMode.set({ steps }); if (fresh) { openSheet(); } });
    $('#ca-guess-on').checked = guess;
    $('#ca-guess-on').addEventListener('change', () => { guess = $('#ca-guess-on').checked; byMode.set({ guess }); if (!guess) { reveal(); } });
    $('#ca-reveal').addEventListener('click', (e) => { e.stopPropagation(); reveal(); });
    $('#ca-keys-back').addEventListener('click', (e) => { e.stopPropagation(); if (hiddenResult) { reveal(); } closeSheet(); });
    $('#ca-sheet').addEventListener('click', () => { if (!hiddenResult) { closeSheet(); } });
    $('#ca-tape').addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]');
        if (!b) { return; }
        const x = tape[Number(b.dataset.i)];
        ans = x.v; expr = fresh || !expr ? 'Ans' : expr + 'Ans'; fresh = false; shown = ''; hiddenResult = false; closeSheet(); paint();
    });
    $('#ca-tape-clear').addEventListener('click', () => { tape.length = 0; paintTape(); });
    // The keyboard, while the calculator is on screen.
    const KEYS = { '*': '×', x: '×', '/': '÷', ':': '÷', '-': '−', '+': '+', '^': '^', '(': '(', ')': ')', '%': '%', '!': '!', '.': DEC, ',': DEC };
    document.addEventListener('keydown', (e) => {
        if (panel.hidden || panel.closest('[hidden]') || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable="true"]')) { return; }
        let k = null;
        if (/^[0-9]$/.test(e.key)) { k = e.key; } else if (KEYS[e.key]) { k = KEYS[e.key]; } else if (e.key === 'Enter' || e.key === '=') { k = 'equals'; } else if (e.key === 'Backspace') {
            k = 'back';
        } else if (e.key === 'Escape' || e.key === 'Delete') { k = 'clear'; }
        if (k) { e.preventDefault(); press(k); }
    });

    // Not for the youngest: in the Infantil mode its button goes away (and another material is shown).
    const forMode = () => {
        const early = (core.mode ? core.mode() : 'primary') === 'early';
        const button = document.querySelector('#mt-mode [data-mode="calc"]');
        if (button) { button.hidden = early; }
        if (early && !panel.hidden) {
            const other = document.querySelector('#mt-mode button:not([data-mode="calc"]):not([hidden])');
            if (other) { other.click(); }
        }
        if (!early) {
            const now = byMode.get();
            sci = !!now.sci; steps = now.steps !== false; guess = !!now.guess;
            $('#ca-steps-on').checked = steps; $('#ca-guess-on').checked = guess;
            paintKeys(); paint();
        }
    };
    document.addEventListener('classtools:mode', forMode);
    paintKeys(); paint(); paintTape(); forMode();

    // For automated tests.
    window.ClasstoolsCalculator = { evaluate, format, press, steps: workOut, state: () => ({ expr, shown, sci, rad, second, tape, hidden: hiddenResult }) };
})();
