// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Number line, among the materials: whole numbers, negatives, decimals or fractions, with the jumps drawn as arcs
 * («2 + 3 + 4 = 9») and the numbers that can be hidden and uncovered one by one. A tap on the line starts at a point;
 * each tap after it jumps there (in Early years, a frog jumps). «Intervals» (Secondary and Advanced) draws an interval,
 * an inequality or an absolute value («[−2, 3)», «x ≥ 1», «|x − 1| < 2») and writes it the other ways; a tap on an end
 * opens or closes it, and one at random can come with its notation hidden.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play, announce } = core;
    const t = core.t;
    const NS = 'http://www.w3.org/2000/svg';
    const COLOURS = ['#ce1423', '#164281', '#067e36', '#5b2fb8', '#c2410c', '#0e7c86'];
    const decimal = new Intl.NumberFormat(document.documentElement.lang || 'en', { maximumFractionDigits: 3 });

    // The lines: from, to and the step as a fraction [numerator, denominator].
    const PRESETS = {
        to10: [0, 10, [1, 1]], to20: [0, 20, [1, 1]], to100: [0, 100, [1, 1]], to1000: [0, 1000, [10, 1]],
        negative: [-10, 10, [1, 1]], tenths: [0, 1, [1, 10]], halves: [0, 3, [1, 2]], thirds: [0, 2, [1, 3]], quarters: [0, 2, [1, 4]],
        negquarters: [-2, 2, [1, 4]],
    };
    const STEPS = [[1, 1], [2, 1], [5, 1], [10, 1], [100, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 8], [1, 10], [1, 100]];
    const stepLabel = ([n, d]) => (d === 1 ? String(n) : (d % 10 === 0 ? decimal.format(n / d) : `${n}/${d}`));

    const panel = core.material.add('line', t('mt_line'), `
        <aside class="tarjeta ct-side">
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('mt_line'))}" id="nl-kind">
                <button type="button" role="radio" aria-checked="false" data-v="jumps">${escape(t('nl_kind_jumps'))}</button>
                <button type="button" role="radio" aria-checked="false" data-v="intervals">${escape(t('nl_kind_intervals'))}</button>
            </div>
            <label class="campo apilado"><span>${escape(t('nl_numbers'))}</span><select id="nl-preset">
                ${Object.keys(PRESETS).map((k) => `<option value="${k}">${escape(t('nl_p_' + k))}</option>`).join('')}
                <option value="custom">${escape(t('nl_p_custom'))}</option>
            </select></label>
            <div class="ct-range" id="nl-custom" hidden>
                <label class="campo"><span>${escape(t('ch_from'))}</span><input type="number" id="nl-from" min="-1000" max="1000" step="1"></label>
                <label class="campo"><span>${escape(t('ch_to'))}</span><input type="number" id="nl-to" min="-1000" max="1000" step="1"></label>
                <label class="campo"><span>${escape(t('nl_step'))}</span><select id="nl-step">${STEPS.map((s, i) => `<option value="${i}">${escape(stepLabel(s))}</option>`).join('')}</select></label>
            </div>
            <label class="interruptor"><input type="checkbox" id="nl-hide"><span>${escape(t('nl_hide'))}</span></label>
            <div class="ct-row" id="nl-jumps-box">
                <button type="button" class="boton suave" id="nl-undo"><span data-icono="deshacer"></span>${escape(t('nl_undo'))}</button>
                <button type="button" class="boton suave" id="nl-clear"><span data-icono="limpiar"></span>${escape(t('nl_clear'))}</button>
            </div>
            <div class="ct-nl-ivbox" id="nl-iv-box">
                <label class="campo apilado"><span>${escape(t('iv_write'))}</span>
                    <span class="ct-row"><input type="text" id="nl-iv" placeholder="[−2, 3)" autocomplete="off" spellcheck="false">
                    <button type="button" class="boton suave" id="nl-iv-put">${escape(t('iv_put'))}</button></span></label>
                <button type="button" class="boton" id="nl-iv-random"><span data-icono="azar"></span><span>${escape(t('iv_random'))}</span></button>
                <label class="interruptor"><input type="checkbox" id="nl-iv-hide"><span>${escape(t('iv_hide'))}</span></label>
            </div>
            <p class="nota" id="nl-help"></p>
        </aside>
        <div class="tarjeta ct-stage ct-nl-stage">
            <svg class="ct-nl-svg" id="nl-svg" viewBox="0 0 1000 300" role="application" aria-label="${escape(t('mt_line'))}"></svg>
            <p class="total ct-nl-sum" id="nl-sum" aria-live="polite"></p>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);
    const $$ = (s) => [...panel.querySelectorAll(s)];

    // What is kept: the line, the jumps (tick to tick, in chains) and which hidden numbers are uncovered.
    // Each screen mode starts with its own line (to 10, to 20, with negatives, quarters around zero) and remembers what
    // the teacher changes in it.
    const byMode = core.byMode ? core.byMode('recta-modo', {
        early: { preset: 'to10', kind: 'jumps' }, primary: { preset: 'to20', kind: 'jumps' },
        secondary: { preset: 'negative', kind: 'jumps' }, advanced: { preset: 'negquarters', kind: 'intervals' },
    }) : { get: () => ({}), set: () => {} };
    const st = Object.assign({ preset: 'to10', from: 0, to: 10, step: 0, hide: false, jumps: [], cur: null, chain: 0, shown: [],
        kind: 'jumps', iv: '[-2, 3)', ivHide: false, ivShown: true }, load('recta', {}), byMode.get());
    if (!['jumps', 'intervals'].includes(st.kind)) { st.kind = 'jumps'; }
    if (!PRESETS[st.preset] && st.preset !== 'custom') { st.preset = 'to10'; }
    const keep = () => save('recta', st);
    let fresh = false;   // the last jump was just made: its arc is drawn as it flies

    // The line itself: its ticks, each with its value as a fraction p/d.
    const line = () => {
        let from, to, step;
        if (st.preset === 'custom') {
            from = Math.round(Number(st.from) || 0); to = Math.round(Number(st.to) || 0); step = STEPS[st.step] || STEPS[0];
            if (to <= from) { to = from + 1; }
        } else {
            [from, to, step] = PRESETS[st.preset];
        }
        const [n, d] = step;
        // At most 200 steps: further away the ticks would be a blur.
        const count = Math.max(1, Math.min(200, Math.floor(((to - from) * d) / n)));
        return { from, d, n, count, value: (i) => from * d + i * n };   // value(i) / d is the number
    };
    const label = (p, d) => {
        const sign = p < 0 ? '−' : '';
        const a = Math.abs(p);
        if (a % d === 0) { return { text: sign + (a / d) }; }
        if (d % 10 === 0) { return { text: sign + decimal.format(a / d) }; }
        return { num: sign + a, den: d };
    };
    const diff = (a, b, L) => {
        const p = (L.value(b) - L.value(a));
        const l = label(Math.abs(p), L.d);
        return { sign: p < 0 ? '−' : '+', l, p };
    };
    const plain = (l) => (l.text !== undefined ? l.text : `${l.num}/${l.den}`);

    // Intervals: each a {a, b, ac, bc} (from, to, and whether each end is closed), one or two of them (a union).
    const NUM = '[-+]?\\d+(?:[.,]\\d+)?(?:/\\d+)?';
    const toNum = (x) => {
        const v = x.replace(',', '.');
        if (v.includes('/')) { const [a, b] = v.split('/'); return Number(a) / Number(b); }
        return Number(v);
    };
    const end = (x) => {
        const v = x.trim().toLowerCase();
        if (/^\+?(∞|inf|infinito|infinity)$/.test(v)) { return Infinity; }
        if (/^-(∞|inf|infinito|infinity)$/.test(v)) { return -Infinity; }
        return new RegExp('^' + NUM + '$').test(v) && Number.isFinite(toNum(v)) ? toNum(v) : null;
    };
    const tidy = (segs) => (segs.length && segs.length <= 2 ? segs.sort((p, q) => p.a - q.a) : null);
    const ray = (op, v) => (op === '<' || op === '≤'
        ? tidy([{ a: -Infinity, b: v, ac: false, bc: op === '≤' }]) : tidy([{ a: v, b: Infinity, ac: op === '≥', bc: false }]));
    // «[−2, 3)», «(−∞; 1,5] ∪ [4, +∞)», «x ≥ 1», «−1 < x ≤ 4», «|x|  < 3», «|x − 1| ≥ 2».
    const parseIntervals = (text) => {
        const s = String(text || '').replace(/[−–]/g, '-').replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/\s+/g, ' ').trim();
        if (/^[[(]/.test(s)) {
            const segs = [];
            for (const part of s.split(/\s*(?:∪|\bU\b|\bu\b)\s*/)) {
                const m = part.match(/^([[(])(.*)([\])])$/);
                if (!m) { return null; }
                let ends = m[2].includes(';') ? m[2].split(';') : m[2].split(',');
                if (ends.length !== 2) { ends = m[2].split(/,\s+/); }
                if (ends.length !== 2) { return null; }
                const a = end(ends[0]), b = end(ends[1]);
                if (a === null || b === null || !(a < b) || a === Infinity || b === -Infinity) { return null; }
                segs.push({ a, b, ac: m[1] === '[' && Number.isFinite(a), bc: m[3] === ']' && Number.isFinite(b) });
            }
            return tidy(segs);
        }
        let m = s.match(new RegExp('^\\|\\s*x\\s*(?:([-+])\\s*(' + NUM + '))?\\s*\\|\\s*([<>≤≥])\\s*(' + NUM + ')$'));
        if (m) {
            const c = m[2] ? (m[1] === '-' ? 1 : -1) * toNum(m[2]) : 0, r = toNum(m[4]), closed = m[3] === '≤' || m[3] === '≥';
            if (!(r > 0)) { return null; }
            return m[3] === '<' || m[3] === '≤' ? tidy([{ a: c - r, b: c + r, ac: closed, bc: closed }])
                : tidy([{ a: -Infinity, b: c - r, ac: false, bc: closed }, { a: c + r, b: Infinity, ac: closed, bc: false }]);
        }
        m = s.match(new RegExp('^(' + NUM + ')\\s*([<≤])\\s*x\\s*([<≤])\\s*(' + NUM + ')$'));
        if (m) { const a = toNum(m[1]), b = toNum(m[4]); return a < b ? tidy([{ a, b, ac: m[2] === '≤', bc: m[3] === '≤' }]) : null; }
        m = s.match(new RegExp('^x\\s*([<>≤≥])\\s*(' + NUM + ')$'));
        if (m) { return ray(m[1], toNum(m[2])); }
        m = s.match(new RegExp('^(' + NUM + ')\\s*([<>≤≥])\\s*x$'));
        if (m) { return ray({ '<': '>', '>': '<', '≤': '≥', '≥': '≤' }[m[2]], toNum(m[1])); }
        return null;
    };
    const fmt = (v) => (v === Infinity ? '+∞' : (v === -Infinity ? '−∞' : (v < 0 ? '−' : '') + decimal.format(Math.abs(v))));
    // With decimals the ends are split by a semicolon, so that «2,5» is not read as two numbers.
    const asInterval = (segs) => {
        const sep = segs.some((g) => [g.a, g.b].some((v) => Number.isFinite(v) && !Number.isInteger(v))) ? '; ' : ', ';
        return segs.map((g) => `${g.ac ? '[' : '('}${fmt(g.a)}${sep}${fmt(g.b)}${g.bc ? ']' : ')'}`).join(' ∪ ');
    };
    const asInequality = (segs) => segs.map((g) => {
        if (g.a === -Infinity) { return `x ${g.bc ? '≤' : '<'} ${fmt(g.b)}`; }
        if (g.b === Infinity) { return `x ${g.ac ? '≥' : '>'} ${fmt(g.a)}`; }
        return `${fmt(g.a)} ${g.ac ? '≤' : '<'} x ${g.bc ? '≤' : '<'} ${fmt(g.b)}`;
    }).join(` ${t('iv_or')} `);
    // As an absolute value, when it is one: an interval with both ends alike, or the outside of one.
    const asAbsolute = (segs) => {
        const ax = (c) => (c === 0 ? '|x|' : `|x ${c > 0 ? '−' : '+'} ${decimal.format(Math.abs(c))}|`);
        const [p, q] = segs;
        if (!q && Number.isFinite(p.a) && Number.isFinite(p.b) && p.ac === p.bc) {
            return `${ax((p.a + p.b) / 2)} ${p.ac ? '≤' : '<'} ${decimal.format((p.b - p.a) / 2)}`;
        }
        if (q && p.a === -Infinity && q.b === Infinity && p.bc === q.ac && p.b < q.a) {
            return `${ax((p.b + q.a) / 2)} ${p.bc ? '≥' : '>'} ${decimal.format((q.a - p.b) / 2)}`;
        }
        return '';
    };
    // One at random, with whole ends inside the line: an interval, a ray, or the outside of an interval.
    const randomIntervals = (L) => {
        const hi = L.value(L.count) / L.d, ints = [];
        for (let v = Math.ceil(L.from) + 1; v <= Math.floor(hi) - 1; v++) { ints.push(v); }
        if (ints.length < 2) { return null; }
        const pick = () => ints[Math.floor(Math.random() * ints.length)];
        let a = pick(), b = pick();
        while (b === a) { b = pick(); }
        if (a > b) { [a, b] = [b, a]; }
        const c1 = Math.random() < 0.5, c2 = Math.random() < 0.5, r = Math.random();
        if (r < 0.2) { return [{ a: -Infinity, b, ac: false, bc: c2 }]; }
        if (r < 0.4) { return [{ a, b: Infinity, ac: c1, bc: false }]; }
        if (r < 0.55) { return [{ a: -Infinity, b: a, ac: false, bc: c1 }, { a: b, b: Infinity, ac: c1, bc: false }]; }
        return [{ a, b, ac: c1, bc: c2 }];
    };

    const X0 = 50, X1 = 950, Y = 190;
    const el = (name, attrs, parent) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        if (parent) { parent.append(e); }
        return e;
    };
    const fraction = (g, x, y, l, cls) => {
        if (l.text !== undefined) { el('text', { x, y: y + 8, class: cls }, g).textContent = l.text; return; }
        el('text', { x, y: y - 4, class: cls + ' ct-nl-frac' }, g).textContent = l.num;
        el('line', { x1: x - 11, x2: x + 11, y1: y + 4, y2: y + 4, class: 'ct-nl-bar' }, g);
        el('text', { x, y: y + 24, class: cls + ' ct-nl-frac' }, g).textContent = l.den;
    };
    function paint() {
        const svg = $('#nl-svg'), L = line();
        const gap = (X1 - X0) / L.count, xi = (i) => X0 + i * gap;
        svg.innerHTML = '';
        // Which ticks carry a number: all if they fit; otherwise every 2, 5, 10… (on fractions, the whole numbers).
        const wide = Math.max(...[0, L.count].map((i) => plain(label(L.value(i), L.d)).length)) * 13 + 10;
        let every = 1;
        if (gap < wide) {
            const perUnit = L.d / L.n;
            every = (Number.isInteger(perUnit) && perUnit > 1 && L.d % 10 !== 0) ? perUnit : [2, 5, 10, 20, 25, 50, 100].find((k) => gap * k >= wide) || 100;
        }
        el('line', { x1: X0 - 30, x2: X1 + 30, y1: Y, y2: Y, class: 'ct-nl-line' }, svg);
        el('path', { d: `M${X1 + 38} ${Y}l-14 -9v18z`, class: 'ct-nl-tip' }, svg);
        el('path', { d: `M${X0 - 38} ${Y}l14 -9v18z`, class: 'ct-nl-tip' }, svg);
        for (let i = 0; i <= L.count; i++) {
            const p = L.value(i), whole = p % L.d === 0, big = i % every === 0;
            const h = big ? 14 : (whole ? 11 : 7);
            el('line', { x1: xi(i), x2: xi(i), y1: Y - h, y2: Y + h, class: 'ct-nl-tick' + (big ? ' big' : '') }, svg);
            if (!big) { continue; }
            const ends = i === 0 || i === L.count;
            if (st.hide && !ends && !st.shown.includes(i)) {
                el('rect', { x: xi(i) - 13, y: Y + 30, width: 26, height: 30, rx: 7, class: 'ct-nl-hidden' }, svg);
            } else {
                fraction(svg, xi(i), Y + 44, label(p, L.d), 'ct-nl-num' + (p === 0 ? ' zero' : ''));
            }
        }
        if (st.kind === 'intervals') { paintIntervals(svg, L); fresh = false; return; }
        // The jumps: arcs above the line, each chain in its colour, with an arrow and the step («+3», «−1/4»).
        st.jumps.forEach((j) => {
            if (j.a > L.count || j.b > L.count) { return; }
            const c = COLOURS[j.chain % COLOURS.length], xa = xi(j.a), xb = xi(j.b);
            const h = Math.min(130, 28 + Math.abs(xb - xa) * 0.42), top = Y - 18 - h;
            const last = j === st.jumps[st.jumps.length - 1];
            const g = el('g', { class: 'ct-nl-jump' + (last && fresh ? ' nuevo' : ''), style: `--c:${c}` }, svg);
            el('path', { d: `M${xa} ${Y - 18}C${xa} ${top} ${xb} ${top} ${xb} ${Y - 18}`, class: 'ct-nl-arc' }, g);
            el('path', { d: `M${xb} ${Y - 8}l-8 -14h16z`, class: 'ct-nl-head' }, g);
            const dd = diff(j.a, j.b, L), mid = (xa + xb) / 2, ty = Y - 18 - h * 0.75;
            const txt = dd.sign + plain(dd.l);
            el('rect', { x: mid - (txt.length * 8 + 14), y: ty - 34, width: txt.length * 16 + 28, height: 38, rx: 19, class: 'ct-nl-pill' }, g);
            el('text', { x: mid, y: ty - 7, class: 'ct-nl-step' }, g).textContent = txt;
        });
        if (st.cur !== null && st.cur <= L.count) {
            if (core.mode && core.mode() === 'early') {
                // In Early years a frog sits on the number, and hops when it jumps.
                const g = el('g', { transform: `translate(${xi(st.cur)} ${Y - 46}) scale(1.6)` }, svg);
                const f = el('g', { class: 'ct-nl-frog' + (fresh ? ' nuevo' : '') }, g);
                el('ellipse', { cx: -15, cy: 20, rx: 10, ry: 5, class: 'cuerpo' }, f);
                el('ellipse', { cx: 15, cy: 20, rx: 10, ry: 5, class: 'cuerpo' }, f);
                el('ellipse', { cx: 0, cy: 6, rx: 22, ry: 15, class: 'cuerpo' }, f);
                [-10, 10].forEach((ex) => { el('circle', { cx: ex, cy: -9, r: 7, class: 'ojo' }, f); el('circle', { cx: ex, cy: -9, r: 3, class: 'pupila' }, f); });
                el('path', { d: 'M-9 8Q0 15 9 8', class: 'boca' }, f);
            } else {
                el('circle', { cx: xi(st.cur), cy: Y, r: 12, class: 'ct-nl-here', style: `--c:${COLOURS[st.chain % COLOURS.length]}` }, svg);
            }
        }
        fresh = false;
        sum(L);
        $('#nl-help').textContent = st.hide ? t('nl_help_hidden') : t('nl_help');
        kindControls();
        $('#nl-undo').disabled = !st.jumps.length;
        $('#nl-clear').disabled = !st.jumps.length && st.cur === null;
    }
    // The intervals over the line: a thick band, closed ends filled and open ones hollow, an arrow where it goes on.
    const valueX = (v, L) => {
        const hi = L.value(L.count) / L.d;
        return X0 + ((v - L.from) / (hi - L.from)) * (X1 - X0);
    };
    function paintIntervals(svg, L) {
        const segs = parseIntervals(st.iv), hi = L.value(L.count) / L.d, box = $('#nl-sum');
        kindControls();
        $('#nl-help').textContent = t('iv_help');
        if (!segs) { box.className = 'total espera ct-nl-sum'; box.textContent = t('iv_bad'); return; }
        const g = el('g', { class: 'ct-nl-iv' }, svg);
        segs.forEach((s) => {
            const left = s.a < L.from, right = s.b > hi;
            const xa = left ? X0 - 30 : valueX(s.a, L), xb = right ? X1 + 30 : valueX(s.b, L);
            el('line', { x1: xa, x2: xb, y1: Y, y2: Y, class: 'ct-nl-band' }, g);
            if (left) { el('path', { d: `M${X0 - 44} ${Y}l18 -13v26z`, class: 'ct-nl-band-tip' }, g); }
            if (right) { el('path', { d: `M${X1 + 44} ${Y}l-18 -13v26z`, class: 'ct-nl-band-tip' }, g); }
            if (!left) { el('circle', { cx: xa, cy: Y, r: 12, class: 'ct-nl-end' + (s.ac ? ' cerrado' : '') }, g); }
            if (!right) { el('circle', { cx: xb, cy: Y, r: 12, class: 'ct-nl-end' + (s.bc ? ' cerrado' : '') }, g); }
        });
        const abs = asAbsolute(segs);
        if (st.ivHide && !st.ivShown) {
            box.className = 'total espera ct-nl-sum ct-nl-ask'; box.textContent = t('iv_ask');
        } else {
            box.className = 'total ct-nl-sum';
            box.textContent = [asInterval(segs), asInequality(segs), abs].filter(Boolean).join('   ·   ');
        }
    }
    const kindControls = () => {
        $$('#nl-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.kind)));
        // Intervals belong to Secondary and Advanced: in the other modes the choice stays out of the way.
        $('#nl-kind').hidden = st.kind === 'jumps' && core.mode && ['early', 'primary'].includes(core.mode());
        $('#nl-jumps-box').hidden = st.kind !== 'jumps';
        $('#nl-iv-box').hidden = st.kind !== 'intervals';
        $('#nl-iv-hide').checked = !!st.ivHide;
    };
    // The last chain as an addition: «2 + 3 + 4 = 9», «9 − 2 = 7».
    const sum = (L) => {
        const chain = st.jumps.filter((j) => j.chain === st.chain);
        const box = $('#nl-sum');
        if (!chain.length) { box.className = 'total espera ct-nl-sum'; box.textContent = st.cur === null ? t('nl_start') : t('nl_now_jump'); return; }
        const parts = [plain(label(L.value(chain[0].a), L.d))];
        chain.forEach((j) => { const d = diff(j.a, j.b, L); parts.push(`${d.sign} ${plain(d.l)}`); });
        box.className = 'total ct-nl-sum';
        box.textContent = `${parts.join(' ')} = ${plain(label(L.value(chain[chain.length - 1].b), L.d))}`;
    };

    // Taps: on the line, jumps; on a hidden number, uncover it (or cover it again).
    $('#nl-svg').addEventListener('pointerdown', (e) => {
        const svg = $('#nl-svg'), p = svg.createSVGPoint();
        p.x = e.clientX; p.y = e.clientY;
        const q = p.matrixTransform(svg.getScreenCTM().inverse()), L = line();
        const i = Math.max(0, Math.min(L.count, Math.round((q.x - X0) / ((X1 - X0) / L.count))));
        if (st.kind === 'intervals' && q.y <= Y + 24) {
            const segs = parseIntervals(st.iv);
            if (!segs) { return; }
            let best = null;
            segs.forEach((g) => [['a', 'ac'], ['b', 'bc']].forEach(([k, c]) => {
                if (!Number.isFinite(g[k])) { return; }
                const d = Math.abs(valueX(g[k], L) - q.x);
                if (d < 26 && (!best || d < best.d)) { best = { g, c, d }; }
            }));
            if (!best) { return; }
            best.g[best.c] = !best.g[best.c];
            st.iv = asInterval(segs); st.ivShown = true; $('#nl-iv').value = st.iv;
            play('tic'); keep(); paint();
            return;
        }
        if (q.y > Y + 24) {
            if (!st.hide) { return; }
            st.shown = st.shown.includes(i) ? st.shown.filter((x) => x !== i) : st.shown.concat(i);
            play('card');
        } else if (st.cur === null) {
            st.cur = i; play('tic');
            announce(t('nl_starts', plain(label(L.value(i), L.d))));
        } else if (i === st.cur) {
            // Tapping the point again lets go of it: the next tap starts somewhere else.
            st.cur = null; st.chain = st.jumps.length ? Math.max(...st.jumps.map((j) => j.chain)) + 1 : st.chain;
        } else {
            st.jumps.push({ a: st.cur, b: i, chain: st.chain });
            st.cur = i; fresh = true; play('dado');
            const d = diff(st.jumps[st.jumps.length - 1].a, i, L);
            announce(`${d.sign}${plain(d.l)} → ${plain(label(L.value(i), L.d))}`);
        }
        keep(); paint();
    });
    $('#nl-undo').addEventListener('click', () => {
        const j = st.jumps.pop();
        if (j) { st.cur = j.a; st.chain = j.chain; }
        keep(); paint();
    });
    $('#nl-clear').addEventListener('click', () => { st.jumps = []; st.cur = null; st.chain = 0; keep(); paint(); });
    const changed = () => { st.jumps = []; st.cur = null; st.chain = 0; st.shown = []; keep(); paint(); };
    $('#nl-preset').addEventListener('change', () => {
        st.preset = $('#nl-preset').value; $('#nl-custom').hidden = st.preset !== 'custom'; byMode.set({ preset: st.preset }); changed();
    });
    ['#nl-from', '#nl-to', '#nl-step'].forEach((s) => $(s).addEventListener('change', () => {
        st.from = Number($('#nl-from').value); st.to = Number($('#nl-to').value); st.step = Number($('#nl-step').value);
        byMode.set({ from: st.from, to: st.to, step: st.step }); changed();
    }));
    $('#nl-hide').addEventListener('change', () => { st.hide = $('#nl-hide').checked; st.shown = []; byMode.set({ hide: st.hide }); keep(); paint(); });
    $('#nl-kind').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) { return; }
        st.kind = b.dataset.v; byMode.set({ kind: st.kind }); keep(); paint(); play('tic');
    });
    $('#nl-iv-put').addEventListener('click', () => {
        const segs = parseIntervals($('#nl-iv').value);
        if (!segs) { $('#nl-sum').className = 'total espera ct-nl-sum'; $('#nl-sum').textContent = t('iv_bad'); play('wrong'); return; }
        st.iv = $('#nl-iv').value.trim(); st.ivShown = true; keep(); paint(); play('card');
    });
    $('#nl-iv').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#nl-iv-put').click(); } });
    $('#nl-iv-random').addEventListener('click', () => {
        const segs = randomIntervals(line());
        if (!segs) { return; }
        st.iv = asInterval(segs); st.ivShown = false; $('#nl-iv').value = st.ivHide ? '' : st.iv;
        keep(); paint(); play('dado');
    });
    $('#nl-iv-hide').addEventListener('change', () => { st.ivHide = $('#nl-iv-hide').checked; st.ivShown = !st.ivHide; keep(); paint(); });
    $('#nl-sum').addEventListener('click', () => {
        if (st.kind !== 'intervals' || !st.ivHide || st.ivShown) { return; }
        st.ivShown = true; $('#nl-iv').value = st.iv; keep(); paint(); play('elegido');
    });
    const controls = () => {
        $('#nl-iv').value = st.ivHide && !st.ivShown ? '' : st.iv;
        $('#nl-preset').value = st.preset; $('#nl-custom').hidden = st.preset !== 'custom';
        $('#nl-from').value = st.from; $('#nl-to').value = st.to; $('#nl-step').value = st.step;
        $('#nl-hide').checked = st.hide;
    };
    document.addEventListener('classtools:mode', () => {
        const before = JSON.stringify(line());
        Object.assign(st, { from: 0, to: 10, step: 0, hide: false }, byMode.get());
        if (!PRESETS[st.preset] && st.preset !== 'custom') { st.preset = 'to10'; }
        controls();
        if (JSON.stringify(line()) !== before) { changed(); } else { keep(); paint(); }
    });
    controls();
    paint();

    window.ClasstoolsNumberLine = { state: () => st, line, paint, parseIntervals, asInterval, asInequality, asAbsolute };   // for automated tests
})();
