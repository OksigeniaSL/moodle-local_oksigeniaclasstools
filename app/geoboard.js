// Geoboard, among the materials: a board of pegs where rubber bands are stretched with taps (a tap on the first peg
// closes the shape), the corners can be dragged to other pegs, and the board can say the area in little squares and
// the perimeter.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play } = core;
    const t = core.t;
    const NS = 'http://www.w3.org/2000/svg';
    const lang = document.documentElement.lang || 'en';
    const COLOURS = ['#ce1423', '#164281', '#067e36', '#5b2fb8', '#ea7317', '#0e7c86', '#d6336c', '#8b5a2b'];
    const SIZES = [5, 7, 10];

    const panel = core.material.add('geoboard', t('mt_geoboard'), `
        <aside class="tarjeta ct-side">
            <label class="campo apilado"><span>${escape(t('gb_size'))}</span><select id="gb-size">
                ${SIZES.map((n) => `<option value="${n}">${escape(t('gb_n_by_n', n))}</option>`).join('')}
            </select></label>
            <label class="interruptor"><input type="checkbox" id="gb-measure"><span>${escape(t('gb_measure'))}</span></label>
            <label class="interruptor"><input type="checkbox" id="gb-squares"><span>${escape(t('gb_squares'))}</span></label>
            <div class="ct-row">
                <button type="button" class="boton suave" id="gb-undo"><span data-icono="deshacer"></span>${escape(t('nl_undo'))}</button>
                <button type="button" class="boton suave" id="gb-clear"><span data-icono="limpiar"></span>${escape(t('nl_clear'))}</button>
            </div>
            <p class="nota">${escape(t('gb_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-gb-stage">
            <svg class="ct-gb-svg" id="gb-svg" role="application" aria-label="${escape(t('mt_geoboard'))}"></svg>
            <p class="total ct-gb-sum" id="gb-sum" aria-live="polite"></p>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);

    // Bands: their pegs ([column, row]), whether they are closed, and their colour.
    const st = Object.assign({ n: 5, measure: false, squares: false, bands: [], drawing: null }, load('geoplano', {}));
    if (!SIZES.includes(Number(st.n))) { st.n = 5; }
    st.bands = (Array.isArray(st.bands) ? st.bands : []).filter((b) => b && Array.isArray(b.p));
    const keep = () => save('geoplano', st);

    const S = 100, M = 50;   // distance between pegs and margin, in the drawing
    const el = (name, attrs, parent) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        if (parent) { parent.append(e); }
        return e;
    };
    const xy = ([c, r]) => [M + c * S, M + r * S];
    const number = (v) => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(v);
    // Area by the shoelace formula, in little squares; perimeter by the length of each side.
    const area = (p) => Math.abs(p.reduce((a, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return a + x * y2 - x2 * y; }, 0)) / 2;
    const sides = (b) => b.p.map((q, i) => (i + 1 < b.p.length || b.closed ? Math.hypot(b.p[(i + 1) % b.p.length][0] - q[0], b.p[(i + 1) % b.p.length][1] - q[1]) : 0));
    const perimeter = (b) => sides(b).reduce((a, x) => a + x, 0);

    function paint() {
        const svg = $('#gb-svg'), n = st.n, size = 2 * M + (n - 1) * S;
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.innerHTML = '';
        el('rect', { x: 6, y: 6, width: size - 12, height: size - 12, rx: 26, class: 'ct-gb-board' }, svg);
        if (st.squares) {
            for (let i = 0; i < n; i++) {
                el('line', { x1: M, x2: M + (n - 1) * S, y1: M + i * S, y2: M + i * S, class: 'ct-gb-grid' }, svg);
                el('line', { y1: M, y2: M + (n - 1) * S, x1: M + i * S, x2: M + i * S, class: 'ct-gb-grid' }, svg);
            }
        }
        const all = st.drawing ? st.bands.concat(st.drawing) : st.bands;
        all.forEach((b, k) => {
            const pts = b.p.map((q) => xy(q).join(',')).join(' ');
            const c = COLOURS[b.c % COLOURS.length];
            const shape = el(b.closed ? 'polygon' : 'polyline', { points: pts, class: 'ct-gb-band' + (b.closed ? ' closed' : '') + (b === st.drawing ? ' drawing' : ''), style: `--c:${c}`, 'data-k': k }, svg);
            shape.setAttribute('aria-hidden', 'true');
        });
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const [x, y] = xy([c, r]);
                el('circle', { cx: x, cy: y, r: 11, class: 'ct-gb-peg' }, svg);
            }
        }
        if (st.drawing && st.drawing.p.length) {
            const [x, y] = xy(st.drawing.p[0]);
            el('circle', { cx: x, cy: y, r: 20, class: 'ct-gb-first', style: `--c:${COLOURS[st.drawing.c % COLOURS.length]}` }, svg);
        }
        sum();
        $('#gb-undo').disabled = !st.bands.length && !st.drawing;
        $('#gb-clear').disabled = !st.bands.length && !st.drawing;
    }
    const sum = () => {
        const box = $('#gb-sum');
        const last = st.drawing || st.bands[st.bands.length - 1];
        if (st.drawing) { box.className = 'total espera ct-gb-sum'; box.textContent = st.drawing.p.length > 2 ? t('gb_close') : t('gb_next'); return; }
        if (!last) { box.className = 'total espera ct-gb-sum'; box.textContent = t('gb_start'); return; }
        if (!st.measure) { box.className = 'total espera ct-gb-sum'; box.textContent = t('gb_drag'); return; }
        const p = perimeter(last), exact = Math.abs(p - Math.round(p)) < 1e-9;
        const per = exact ? number(Math.round(p)) : `≈ ${number(p)}`;
        box.className = 'total ct-gb-sum';
        box.textContent = last.closed ? t('gb_area_perimeter', { area: number(area(last.p)), perimeter: per }) : t('gb_length', per);
    };

    // Pegs: the nearest one to the pointer.
    const peg = (e) => {
        const svg = $('#gb-svg'), q = svg.createSVGPoint();
        q.x = e.clientX; q.y = e.clientY;
        const p = q.matrixTransform(svg.getScreenCTM().inverse());
        const c = Math.round((p.x - M) / S), r = Math.round((p.y - M) / S);
        if (c < 0 || r < 0 || c >= st.n || r >= st.n || Math.hypot(p.x - (M + c * S), p.y - (M + r * S)) > S * 0.45) { return null; }
        return [c, r];
    };
    const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
    let press = null;   // a press on a corner: it becomes a drag if the finger moves to another peg
    $('#gb-svg').addEventListener('pointerdown', (e) => {
        const q = peg(e); if (!q) { return; }
        e.preventDefault();
        if (!st.drawing) {
            const k = st.bands.map((b, i) => [b, i]).reverse().find(([b]) => b.p.some((x) => same(x, q)));
            if (k) { press = { band: k[0], i: k[0].p.findIndex((x) => same(x, q)), from: q, moved: false }; $('#gb-svg').setPointerCapture(e.pointerId); return; }
        }
        tap(q);
    });
    $('#gb-svg').addEventListener('pointermove', (e) => {
        if (!press) { return; }
        const q = peg(e);
        if (q && !same(q, press.band.p[press.i])) { press.band.p[press.i] = q; press.moved = true; paint(); }
    });
    const up = () => {
        if (!press) { return; }
        const p = press; press = null;
        if (p.moved) { play('tic'); keep(); paint(); } else { tap(p.from); }
    };
    $('#gb-svg').addEventListener('pointerup', up);
    $('#gb-svg').addEventListener('pointercancel', up);
    const tap = (q) => {
        const d = st.drawing;
        if (!d) {
            st.drawing = { p: [q], closed: false, c: st.bands.length ? Math.max(...st.bands.map((b) => b.c)) + 1 : 0 };
            play('tic');
        } else if (d.p.length > 2 && same(q, d.p[0])) {
            d.closed = true; st.bands.push(d); st.drawing = null; play('card');
        } else if (same(q, d.p[d.p.length - 1])) {
            // The last peg again: the band stays open (a line), or goes away if it was only one peg.
            if (d.p.length > 1) { st.bands.push(d); }
            st.drawing = null; play('tic');
        } else if (!d.p.some((x) => same(x, q))) {
            d.p.push(q); play('tic');
        }
        keep(); paint();
    };
    $('#gb-undo').addEventListener('click', () => {
        if (st.drawing) { st.drawing.p.pop(); if (!st.drawing.p.length) { st.drawing = null; } } else { st.bands.pop(); }
        keep(); paint();
    });
    $('#gb-clear').addEventListener('click', () => { st.bands = []; st.drawing = null; keep(); paint(); });
    $('#gb-size').addEventListener('change', () => { st.n = Number($('#gb-size').value); st.bands = []; st.drawing = null; keep(); paint(); });
    $('#gb-measure').addEventListener('change', () => { st.measure = $('#gb-measure').checked; keep(); paint(); });
    $('#gb-squares').addEventListener('change', () => { st.squares = $('#gb-squares').checked; keep(); paint(); });
    $('#gb-size').value = st.n; $('#gb-measure').checked = st.measure; $('#gb-squares').checked = st.squares;
    paint();

    window.ClasstoolsGeoboard = { state: () => st, tap, area, perimeter, paint };   // for automated tests
})();
