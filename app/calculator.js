// Calculator, among the materials (not in the Infantil mode): a basic one with big keys, that follows the order of
// operations (2 + 3 × 4 = 14), and a scientific one (powers, roots, π, trigonometry in degrees or radians,
// logarithms, factorial); Primary starts with the basic one, Secondary and up with the scientific one, and each mode
// remembers the teacher's choice. The whole expression stays on screen and every result goes to a strip beside it,
// to talk about it in class; a result of the strip can be used again. The keyboard works too.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { t, escape, play, announce } = core;
    const lang = document.documentElement.lang || 'en';
    // The decimal sign of the language (a comma in Spanish), on the key and in the results.
    const COMMA = (1.5).toLocaleString(lang).includes(',');
    const DEC = COMMA ? ',' : '.';
    const byMode = core.byMode ? core.byMode('calculadora', {
        early: { sci: false }, primary: { sci: false }, secondary: { sci: true }, advanced: { sci: true },
    }) : { get: () => ({ sci: false }), set: () => {} };
    let sci = !!byMode.get().sci, rad = false, expr = '', shown = '', ans = 0, fresh = false;
    const tape = [];

    // The keys: what is shown, what goes into the expression, and the kind (for the colour).
    const BASIC = [
        ['C', 'clear', 'borra'], ['⌫', 'back', 'borra'], ['%', '%', 'op'], ['÷', '÷', 'op'],
        ['7', '7', 'num'], ['8', '8', 'num'], ['9', '9', 'num'], ['×', '×', 'op'],
        ['4', '4', 'num'], ['5', '5', 'num'], ['6', '6', 'num'], ['−', '−', 'op'],
        ['1', '1', 'num'], ['2', '2', 'num'], ['3', '3', 'num'], ['+', '+', 'op'],
        ['0', '0', 'num doble'], [DEC, DEC, 'num'], ['=', 'equals', 'igual'],
    ];
    const SCI = [
        ['sin', 'sin(', 'fn'], ['cos', 'cos(', 'fn'], ['tan', 'tan(', 'fn'], ['(', '(', 'fn'], [')', ')', 'fn'],
        ['sin⁻¹', 'asin(', 'fn'], ['cos⁻¹', 'acos(', 'fn'], ['tan⁻¹', 'atan(', 'fn'], ['x²', '²', 'fn'], ['xʸ', '^', 'fn'],
        ['ln', 'ln(', 'fn'], ['log', 'log(', 'fn'], ['√', '√(', 'fn'], ['π', 'π', 'fn'], ['e', 'e', 'fn'],
        ['1/x', 'inv', 'fn'], ['n!', '!', 'fn'], ['±', 'neg', 'fn'], ['Ans', 'Ans', 'fn'], ['DEG', 'angle', 'fn'],
    ];

    const panel = core.material.add('calc', t('mt_calc'), `
        <aside class="tarjeta ct-side ct-calc-side">
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('ca_kind'))}" id="ca-kind">
                <button type="button" role="radio" data-v="basic">${escape(t('ca_basic'))}</button>
                <button type="button" role="radio" data-v="sci">${escape(t('ca_sci'))}</button>
            </div>
            <p class="ante">${escape(t('ca_tape'))}</p>
            <ol class="ct-calc-tape" id="ca-tape" aria-live="polite"></ol>
            <p class="nota" id="ca-tape-empty">${escape(t('ca_tape_empty'))}</p>
            <button type="button" class="boton suave" id="ca-tape-clear"><span data-icono="limpiar"></span><span>${escape(t('ca_tape_clear'))}</span></button>
        </aside>
        <div class="tarjeta ct-stage ct-calc">
            <div class="ct-calc-display" role="status" aria-live="polite">
                <p class="ct-calc-expr" id="ca-expr"></p>
                <p class="ct-calc-result" id="ca-result">0</p>
            </div>
            <div class="ct-calc-keys" id="ca-keys"></div>
        </div>`, () => {});
    const $ = (s) => panel.querySelector(s);

    // --- Working it out ---------------------------------------------------------------------------------------
    // The expression as it is written (×, ÷, −, the decimal sign of the language) → tokens → a value, following the
    // order of operations; null if it cannot be worked out.
    const tokens = (s) => {
        const out = [];
        let i = 0;
        while (i < s.length) {
            const c = s[i];
            if (/[0-9.,]/.test(c)) {
                let j = i;
                while (j < s.length && /[0-9.,]/.test(s[j])) { j++; }
                const n = Number(s.slice(i, j).replace(',', '.'));
                if (!isFinite(n) || (s.slice(i, j).match(/[.,]/g) || []).length > 1) { return null; }
                out.push({ n }); i = j; continue;
            }
            const word = s.slice(i).match(/^(asin|acos|atan|sin|cos|tan|ln|log|Ans|√)/);
            if (word) { out.push(word[1] === 'Ans' ? { n: ans } : { f: word[1] }); i += word[1].length; continue; }
            if (c === 'π') { out.push({ n: Math.PI }); } else if (c === 'e') { out.push({ n: Math.E }); } else if ('+−×÷^()%²!'.includes(c)) {
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
    const evaluate = (s) => {
        const list = tokens(s);
        if (!list || !list.length) { return null; }
        let p = 0;
        const peek = () => list[p], next = () => list[p++];
        const angle = (x) => (rad ? x : (x * Math.PI) / 180), back = (x) => (rad ? x : (x * 180) / Math.PI);
        const FN = { sin: (x) => Math.sin(angle(x)), cos: (x) => Math.cos(angle(x)), tan: (x) => Math.tan(angle(x)),
            asin: (x) => back(Math.asin(x)), acos: (x) => back(Math.acos(x)), atan: (x) => back(Math.atan(x)),
            ln: Math.log, log: Math.log10, '√': Math.sqrt };
        // An atom: a number, a function with its argument, or a bracket; then what goes after it (², !, %).
        const starts = (tk) => tk && (tk.n !== undefined || tk.f || tk.o === '(');
        function atom() {
            const tk = next();
            if (!tk) { throw new Error('end'); }
            let v;
            if (tk.n !== undefined) { v = tk.n; } else if (tk.f) {
                if (peek() && peek().o === '(') { next(); v = sum(); if (peek() && peek().o === ')') { next(); } } else { v = power(); }
                v = FN[tk.f](v);
            } else if (tk.o === '(') {
                v = sum();
                if (peek() && peek().o === ')') { next(); }
            } else if (tk.o === '−') { return -power(); } else if (tk.o === '+') { return power(); } else { throw new Error('token'); }
            while (peek() && ['²', '!', '%'].includes(peek().o)) {
                const o = next().o;
                v = o === '²' ? v * v : (o === '!' ? fact(v) : v / 100);
            }
            return v;
        }
        // Powers go from the right (2^3^2 = 2^9).
        function power() {
            const b = atom();
            if (peek() && peek().o === '^') { next(); return Math.pow(b, power()); }
            return b;
        }
        // Times and divided by; a number next to a bracket, π or a function multiplies (2π, 3(4 + 1)).
        function product() {
            let v = power();
            for (;;) {
                const tk = peek();
                if (tk && (tk.o === '×' || tk.o === '÷')) { next(); const r = power(); v = tk.o === '×' ? v * r : v / r; } else if (starts(tk)) { v *= power(); } else { return v; }
            }
        }
        function sum() {
            let v = product();
            while (peek() && (peek().o === '+' || peek().o === '−')) { const o = next().o, r = product(); v = o === '+' ? v + r : v - r; }
            return v;
        }
        try {
            const v = sum();
            if (p < list.length && !(list[p].o === ')' && list.slice(p).every((x) => x.o === ')'))) { return null; }
            return isFinite(v) ? v : NaN;
        } catch (err) { return null; }
    };
    // A result as it is read: up to ten significant digits, in the language, and in powers of ten when very big or small.
    const format = (v) => {
        if (v === null) { return t('ca_error'); }
        if (Number.isNaN(v)) { return t('ca_undefined'); }
        const a = Math.abs(v);
        if (a !== 0 && (a >= 1e12 || a < 1e-7)) {
            const [m, x] = v.toExponential(6).split('e');
            return `${Number(m).toLocaleString(lang, { maximumFractionDigits: 6 })} × 10^${Number(x)}`;
        }
        return Number(v.toPrecision(10)).toLocaleString(lang, { maximumFractionDigits: 10 });
    };

    // --- The keys ---------------------------------------------------------------------------------------------
    const OPS = '+−×÷^';
    const press = (k) => {
        if (k === 'clear') { expr = ''; shown = ''; fresh = false; paint(); return; }
        if (k === 'back') { expr = fresh ? '' : expr.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|ln\(|log\(|√\(|Ans|.)$/, ''); fresh = false; paint(); return; }
        if (k === 'angle') { rad = !rad; paintKeys(); paint(); return; }
        if (k === 'equals') {
            if (!expr) { return; }
            const v = evaluate(expr);
            shown = format(v);
            if (v !== null && !Number.isNaN(v)) {
                ans = v;
                tape.unshift({ expr, result: shown, v });
                tape.length = Math.min(tape.length, 30);
                play('tic');
            } else { play('minus'); }
            announce(`${expr} = ${shown}`);
            fresh = true; paint(); paintTape(); return;
        }
        // After a result: an operation goes on from it; a number starts again.
        if (fresh) {
            expr = OPS.includes(k) || ['²', '!', '%', 'inv', 'neg'].includes(k) ? 'Ans' : '';
            fresh = false; shown = '';
        }
        if (k === 'inv') { expr = expr ? `1÷(${expr})` : '1÷'; } else if (k === 'neg') {
            expr = expr.startsWith('−(') && expr.endsWith(')') ? expr.slice(2, -1) : (expr ? `−(${expr})` : '−');
        } else if (OPS.includes(k) && OPS.includes(expr.slice(-1))) { expr = expr.slice(0, -1) + k; } else { expr += k; }
        expr = expr.slice(0, 120);
        paint();
    };
    const paintKeys = () => {
        const key = ([label, k, kind]) => `<button type="button" class="ct-calc-key ${kind}" data-k="${escape(k)}"${k === 'angle' ? ` aria-pressed="${rad}"` : ''}>${escape(k === 'angle' ? (rad ? 'RAD' : 'DEG') : label)}</button>`;
        $('#ca-keys').className = `ct-calc-keys ${sci ? 'cientifica' : 'basica'}`;
        // The scientific keys on the left, the basic ones on the right.
        $('#ca-keys').innerHTML = (sci ? `<div class="ct-calc-grid sci">${SCI.map(key).join('')}</div>` : '') + `<div class="ct-calc-grid">${BASIC.map(key).join('')}</div>`;
        panel.querySelectorAll('#ca-kind button').forEach((b) => b.setAttribute('aria-checked', String((b.dataset.v === 'sci') === sci)));
    };
    function paint() {
        const pretty = expr.replace(/Ans/g, t('ca_ans')).replace(/\./g, DEC);
        $('#ca-expr').textContent = shown ? `${pretty} =` : '';
        $('#ca-result').textContent = shown || pretty || '0';
        $('#ca-result').classList.toggle('larga', (shown || pretty).length > 14);
    }
    const paintTape = () => {
        $('#ca-tape').innerHTML = tape.map((x, i) => `<li><button type="button" data-i="${i}" title="${escape(t('ca_use'))}"><span>${escape(x.expr.replace(/Ans/g, t('ca_ans')))} =</span><strong>${escape(x.result)}</strong></button></li>`).join('');
        $('#ca-tape-empty').hidden = tape.length > 0;
        $('#ca-tape-clear').hidden = !tape.length;
    };
    $('#ca-keys').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { press(b.dataset.k); } });
    $('#ca-kind').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { sci = b.dataset.v === 'sci'; byMode.set({ sci }); paintKeys(); } });
    $('#ca-tape').addEventListener('click', (e) => {
        const b = e.target.closest('[data-i]');
        if (!b) { return; }
        const x = tape[Number(b.dataset.i)];
        ans = x.v; expr = fresh || !expr ? 'Ans' : expr + 'Ans'; fresh = false; shown = ''; paint();
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
        if (!early) { sci = !!byMode.get().sci; paintKeys(); }
    };
    document.addEventListener('classtools:mode', forMode);
    paintKeys(); paint(); paintTape(); forMode();

    window.ClasstoolsCalculator = { evaluate, format, press, state: () => ({ expr, shown, sci, rad, tape }) };   // for automated tests
})();
