// A balance scale, among the materials. To compare (Early years and Primary): weights on each pan, the beam leans to
// the heavier side and the sign between them says it (>, < or =). For equations (Secondary): boxes of an unknown
// weight x and weights of 1, in balance, written as an equation. What is taken from one pan has to be taken from the
// other, or the scale tips; taking the same from both pans, or sharing both out, leaves a box on its own: x worked
// out. The model only holds whole positive numbers, so the equations it takes have a whole solution above zero.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play, announce } = core;
    const t = core.t;
    const WEIGHTS = [1, 2, 5, 10];
    const MAX_ITEMS = 24;   // on one pan
    const SIDES = ['l', 'r'];
    const pan = (side) => `<div class="ct-ba-pan" data-side="${side}"><div class="ct-ba-items" id="ba-${side}"></div><div class="ct-ba-plate"></div></div>`;

    const panel = core.material.add('balanza', t('mt_balance'), `
        <aside class="tarjeta ct-side">
            <div class="segmentos" role="radiogroup" aria-label="${escape(t('mt_balance'))}" id="ba-kind">
                <button type="button" role="radio" aria-checked="false" data-v="compare">${escape(t('ba_compare'))}</button>
                <button type="button" role="radio" aria-checked="false" data-v="equation">${escape(t('ba_equation'))}</button>
            </div>
            <div class="ct-ba-box" id="ba-compare-box">
                <label class="interruptor"><input type="checkbox" id="ba-numbers"><span>${escape(t('ba_numbers'))}</span></label>
                <button type="button" class="boton suave" id="ba-empty"><span data-icono="limpiar"></span><span>${escape(t('ba_empty'))}</span></button>
                <p class="nota">${escape(t('ba_help'))}</p>
            </div>
            <div class="ct-ba-box" id="ba-equation-box">
                <button type="button" class="boton" id="ba-new"><span data-icono="otra"></span><span>${escape(t('ba_new'))}</span></button>
                <label class="campo apilado"><span>${escape(t('ba_write'))}</span>
                    <span class="ct-row"><input type="text" id="ba-eq" placeholder="2x + 3 = 11" autocomplete="off" spellcheck="false">
                    <button type="button" class="boton suave" id="ba-put">${escape(t('ba_put'))}</button></span></label>
                <div class="ct-ba-ops">
                    <button type="button" class="boton suave" id="ba-one">${escape(t('ba_both_one'))}</button>
                    <button type="button" class="boton suave" id="ba-x">${escape(t('ba_both_x'))}</button>
                    <button type="button" class="boton suave" id="ba-share"></button>
                    <button type="button" class="boton suave" id="ba-undo"><span data-icono="deshacer"></span><span>${escape(t('ba_undo'))}</span></button>
                    <button type="button" class="boton suave" id="ba-reveal"></button>
                </div>
                <p class="nota">${escape(t('ba_help_eq'))}</p>
            </div>
        </aside>
        <div class="tarjeta ct-stage ct-ba-stage">
            <p class="total ct-ba-text" id="ba-text" aria-live="polite"></p>
            <div class="ct-ba" id="ba-scale">
                <div class="ct-ba-beam" id="ba-beam">${pan('l')}${pan('r')}</div>
                <div class="ct-ba-post"></div>
            </div>
            <div class="ct-ba-add" id="ba-add">${SIDES.map((side) => `<div class="ct-row" data-side="${side}"></div>`).join('')}</div>
            <p class="nota ct-ba-note" id="ba-note" aria-live="polite"></p>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);
    const $$ = (s) => [...panel.querySelectorAll(s)];

    // Each screen mode starts with its own scale: plain cubes to compare in Early years, weights with numbers in
    // Primary, equations from Secondary.
    const byMode = core.byMode ? core.byMode('balanza-modo', {
        early: { kind: 'compare', numbers: false }, primary: { kind: 'compare', numbers: true },
        secondary: { kind: 'equation', numbers: true }, advanced: { kind: 'equation', numbers: true },
    }) : { get: () => ({}), set: () => {} };
    const st = Object.assign({ kind: 'compare', numbers: true, cmp: { l: [5], r: [2, 2] }, eq: null }, load('balanza', {}), byMode.get());
    let history = [];
    const keep = () => save('balanza', st);
    const cleanPans = (p) => Object.fromEntries(SIDES.map((s) => [s, (Array.isArray(p && p[s]) ? p[s] : []).map(Number)
        .filter((w) => WEIGHTS.includes(w)).slice(0, MAX_ITEMS)]));
    st.cmp = cleanPans(st.cmp);

    // An equation «ax + b = cx + d» with a whole solution: a box weighs x, and the pans balance.
    const random = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    const newEquation = () => {
        for (;;) {
            const x = random(1, 8), a = random(1, 4), c = random(0, a - 1), b = random(0, 9), d = (a - c) * x + b;
            if (d > 20 || (a === 1 && b === 0 && c === 0)) { continue; }
            const one = { x: a, u: b }, two = { x: c, u: d };
            return Math.random() < 0.5 ? { l: one, r: two, x, shown: false } : { l: two, r: one, x, shown: false };
        }
    };
    // «2x + 3 = 11»: each side a sum of boxes («2x», «x») and ones.
    const side = (text) => {
        let x = 0, u = 0;
        for (const term of text.replace(/\s+/g, '').split('+')) {
            const m = term.match(/^(\d*)[xX]$/);
            if (m) { x += m[1] === '' ? 1 : Number(m[1]); } else if (/^\d+$/.test(term)) { u += Number(term); } else { return null; }
        }
        return x + u <= MAX_ITEMS ? { x, u } : null;
    };
    const parse = (text) => {
        const parts = String(text || '').split('=');
        if (parts.length !== 2) { return null; }
        const l = side(parts[0]), r = side(parts[1]);
        if (!l || !r || l.x === r.x) { return null; }
        const x = (r.u - l.u) / (l.x - r.x);
        return Number.isInteger(x) && x >= 1 && x <= 20 ? { l, r, x, shown: false } : null;
    };
    const validEq = (e) => e && e.l && e.r && Number.isInteger(e.x) && e.x >= 1
        && SIDES.every((s) => Number.isInteger(e[s].x) && Number.isInteger(e[s].u) && e[s].x >= 0 && e[s].u >= 0);
    if (!validEq(st.eq)) { st.eq = newEquation(); }

    // What each pan weighs, and how far the beam leans: any difference tips it, a bigger one a little more.
    const weight = (s) => (st.kind === 'compare' ? st.cmp[s].reduce((a, w) => a + w, 0) : st.eq[s].x * st.eq.x + st.eq[s].u);
    const sign = () => { const d = weight('l') - weight('r'); return d > 0 ? '>' : (d < 0 ? '<' : '='); };
    const angle = () => {
        const l = weight('l'), r = weight('r');
        if (l === r) { return 0; }
        return Math.sign(r - l) * Math.min(14, 5 + 9 * Math.abs(r - l) / Math.max(l, r));
    };
    const term = (p) => {
        const parts = [];
        if (p.x) { parts.push(p.x === 1 ? 'x' : `${p.x}x`); }
        if (p.u || !parts.length) { parts.push(String(p.u)); }
        return parts.join(' + ');
    };
    const solved = () => sign() === '=' && SIDES.some((s) => {
        const o = st.eq[s === 'l' ? 'r' : 'l'];
        return st.eq[s].x === 1 && st.eq[s].u === 0 && o.x === 0;
    });
    // Sharing both pans out by the boxes on one of them: only when everything on both pans can be split that way.
    const shareBy = () => {
        const withX = SIDES.find((s) => st.eq[s].x > 1 && st.eq[s === 'l' ? 'r' : 'l'].x === 0);
        if (!withX) { return 0; }
        const k = st.eq[withX].x;
        return SIDES.every((s) => st.eq[s].x % k === 0 && st.eq[s].u % k === 0) ? k : 0;
    };

    function paint() {
        const cmp = st.kind === 'compare';
        $$('#ba-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === st.kind)));
        $('#ba-compare-box').hidden = !cmp;
        $('#ba-equation-box').hidden = cmp;
        $('#ba-numbers').checked = !!st.numbers;
        SIDES.forEach((s) => {
            $('#ba-' + s).innerHTML = cmp
                ? st.cmp[s].map((w, i) => `<button type="button" class="ct-ba-w w${w}" data-side="${s}" data-i="${i}" aria-label="${escape(t('ba_take_weight', w))}">${st.numbers ? w : ''}</button>`).join('')
                : Array.from({ length: st.eq[s].x }, () => `<button type="button" class="ct-ba-x" data-side="${s}" data-k="x" aria-label="${escape(t('ba_take_box'))}">${st.eq.shown ? st.eq.x : 'x'}</button>`).join('')
                    + Array.from({ length: st.eq[s].u }, () => `<button type="button" class="ct-ba-u" data-side="${s}" data-k="u" aria-label="${escape(t('ba_take_one'))}">1</button>`).join('');
        });
        $('#ba-beam').style.setProperty('--a', angle() + 'deg');
        // The weights to put on each pan: cubes of 1 without numbers, all four with them.
        const kinds = st.numbers ? WEIGHTS : [1];
        $$('#ba-add [data-side]').forEach((row) => {
            const s = row.dataset.side;
            row.hidden = !cmp;
            row.innerHTML = kinds.map((w) => `<button type="button" class="boton suave" data-add="${w}" aria-label="${escape(t(s === 'l' ? 'ba_add_left' : 'ba_add_right', w))}"${st.cmp[s].length < MAX_ITEMS ? '' : ' disabled'}><span class="ct-ba-w w${w}">${st.numbers ? w : ''}</span>${core.icon('mas')}</button>`).join('');
        });
        if (cmp) {
            // Without numbers, only the sign: which pan weighs more.
            $('#ba-text').textContent = st.numbers ? `${weight('l')} ${sign()} ${weight('r')}` : sign();
            $('#ba-note').textContent = '';
        } else {
            $('#ba-text').textContent = `${term(st.eq.l)} ${sign()} ${term(st.eq.r)}`;
            $('#ba-note').textContent = sign() !== '=' ? t('ba_unbalanced') : (solved() ? t('ba_solved', st.eq.x) : '');
            $('#ba-one').disabled = !(st.eq.l.u && st.eq.r.u);
            $('#ba-x').disabled = !(st.eq.l.x && st.eq.r.x);
            const k = shareBy();
            $('#ba-share').disabled = !k || sign() !== '=';
            $('#ba-share').textContent = k ? t('ba_share', k) : t('ba_share_any');
            $('#ba-undo').disabled = !history.length;
            $('#ba-reveal').textContent = st.eq.shown ? t('ba_hide') : t('ba_reveal');
        }
    }

    // Every change of the equation can be undone, back to where it was set.
    const change = (fn) => {
        history.push(JSON.stringify(st.eq));
        if (history.length > 60) { history.shift(); }
        const was = solved();
        fn();
        keep(); paint();
        if (!was && solved()) { st.eq.shown = true; keep(); paint(); play('elegido'); announce(t('ba_solved', st.eq.x)); }
    };
    const setEquation = (e) => { st.eq = e; history = []; keep(); paint(); play('card'); };

    $('#ba-kind').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-v]');
        if (!b) { return; }
        st.kind = b.dataset.v; byMode.set({ kind: st.kind }); keep(); paint(); play('tic');
    });
    $('#ba-numbers').addEventListener('change', () => {
        st.numbers = $('#ba-numbers').checked;
        // Without numbers there are only cubes of 1.
        if (!st.numbers) { st.cmp = { l: st.cmp.l.filter((w) => w === 1), r: st.cmp.r.filter((w) => w === 1) }; }
        byMode.set({ numbers: st.numbers }); keep(); paint();
    });
    $('#ba-add').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-add]');
        if (!b || b.disabled) { return; }
        const s = b.closest('[data-side]').dataset.side;
        st.cmp[s].push(Number(b.dataset.add)); keep(); paint(); play('tic');
    });
    $('#ba-scale').addEventListener('click', (e) => {
        const b = e.target.closest('button[data-side]');
        if (!b) { return; }
        const s = b.dataset.side;
        if (st.kind === 'compare') { st.cmp[s].splice(Number(b.dataset.i), 1); keep(); paint(); play('tic'); return; }
        // Off one pan only: the scale tips, and says so.
        change(() => { st.eq[s][b.dataset.k] -= 1; });
        play(sign() === '=' ? 'tic' : 'wrong');
    });
    $('#ba-empty').addEventListener('click', () => { st.cmp = { l: [], r: [] }; keep(); paint(); });
    $('#ba-new').addEventListener('click', () => setEquation(newEquation()));
    $('#ba-put').addEventListener('click', () => {
        const e = parse($('#ba-eq').value);
        if (!e) { $('#ba-note').textContent = t('ba_bad'); play('wrong'); return; }
        setEquation(e);
    });
    $('#ba-eq').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#ba-put').click(); } });
    $('#ba-one').addEventListener('click', () => { change(() => { st.eq.l.u -= 1; st.eq.r.u -= 1; }); play('card'); });
    $('#ba-x').addEventListener('click', () => { change(() => { st.eq.l.x -= 1; st.eq.r.x -= 1; }); play('card'); });
    $('#ba-share').addEventListener('click', () => {
        const k = shareBy();
        if (!k) { return; }
        change(() => { SIDES.forEach((s) => { st.eq[s].x /= k; st.eq[s].u /= k; }); });
        play('card');
    });
    $('#ba-undo').addEventListener('click', () => {
        if (!history.length) { return; }
        st.eq = JSON.parse(history.pop()); keep(); paint(); play('tic');
    });
    $('#ba-reveal').addEventListener('click', () => { st.eq.shown = !st.eq.shown; keep(); paint(); play(st.eq.shown ? 'elegido' : 'tic'); });
    document.addEventListener('classtools:mode', () => {
        const v = byMode.get();
        st.kind = v.kind === 'equation' ? 'equation' : 'compare';
        st.numbers = v.numbers !== false;
        keep(); paint();
    });
    paint();

    window.ClasstoolsBalance = { state: () => st, weight, sign, solved, parse };   // for automated tests
})();
