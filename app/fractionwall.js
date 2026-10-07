// Fraction wall, among the materials: one whole on top and below it the same whole in halves, thirds, quarters…
// Pieces are coloured with a tap; the board says which coloured parts are the same amount («1/2 = 2/4 = 3/6»), and a
// ruler that slides across the wall lines them up.
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
    const ROWS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
    // Each row in its colour (the light ones with dark text).
    const COLOURS = { 1: ['#164281'], 2: ['#ce1423'], 3: ['#067e36'], 4: ['#fbbe17', true], 5: ['#5b2fb8'], 6: ['#ea7317'], 8: ['#0e7c86'], 10: ['#8b5a2b'], 12: ['#d6336c'] };
    const LABELS = ['fraction', 'decimal', 'percent', 'none'];

    const panel = core.material.add('fractions', t('mt_fractions'), `
        <aside class="tarjeta ct-side">
            <p class="ante">${escape(t('fw_rows'))}</p>
            <div class="ct-fw-rows" id="fw-rows">${ROWS.map((d) => `<label class="ct-fw-chip"><input type="checkbox" value="${d}"><span>${d === 1 ? '1' : `1/${d}`}</span></label>`).join('')}</div>
            <label class="campo apilado"><span>${escape(t('fw_labels'))}</span><select id="fw-labels">
                ${LABELS.map((k) => `<option value="${k}">${escape(t('fw_l_' + k))}</option>`).join('')}
            </select></label>
            <label class="interruptor"><input type="checkbox" id="fw-ruler"><span>${escape(t('fw_ruler'))}</span></label>
            <button type="button" class="boton suave" id="fw-clear"><span data-icono="limpiar"></span>${escape(t('nl_clear'))}</button>
            <p class="nota">${escape(t('fw_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-fw-stage">
            <svg class="ct-fw-svg" id="fw-svg" role="application" aria-label="${escape(t('mt_fractions'))}"></svg>
            <p class="total ct-fw-sum" id="fw-sum" aria-live="polite"></p>
        </div>`, () => paint());
    const $ = (s) => panel.querySelector(s);

    const st = Object.assign({ rows: [1, 2, 3, 4, 6, 8, 12], labels: 'fraction', ruler: false, at: 0.5, on: {} }, load('muro', {}));
    st.rows = (Array.isArray(st.rows) ? st.rows : []).map(Number).filter((d) => ROWS.includes(d));
    if (!st.rows.length) { st.rows = [1, 2, 4]; }
    const keep = () => save('muro', st);

    const el = (name, attrs, parent) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        if (parent) { parent.append(e); }
        return e;
    };
    const decimal = (v, digits) => new Intl.NumberFormat(lang, { maximumFractionDigits: digits }).format(v);
    const W = 1000, LEFT = 0, BAR = 860, ROW = 64, GAP = 8, TOP = 34;
    const shaded = (d) => (st.on[d] || []).length;
    function paint() {
        const svg = $('#fw-svg'), rows = ROWS.filter((d) => st.rows.includes(d));
        const H = TOP + rows.length * (ROW + GAP) + 10;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.innerHTML = '';
        rows.forEach((d, r) => {
            const y = TOP + r * (ROW + GAP), w = BAR / d, [c, light] = COLOURS[d];
            for (let i = 0; i < d; i++) {
                const on = (st.on[d] || []).includes(i);
                const g = el('g', { class: 'ct-fw-piece' + (on ? ' on' : '') + (light ? ' claro' : ''), 'data-d': d, 'data-i': i, style: `--c:${c}`, tabindex: 0, role: 'button', 'aria-pressed': String(on), 'aria-label': d === 1 ? '1' : `1/${d}` }, svg);
                el('rect', { x: LEFT + i * w + 2, y, width: w - 4, height: ROW, rx: 10 }, g);
                const cx = LEFT + i * w + w / 2, cy = y + ROW / 2;
                if (st.labels === 'none') { continue; }
                if (st.labels === 'fraction' && d > 1) {
                    el('text', { x: cx, y: cy - 6, class: 'ct-fw-txt small' }, g).textContent = '1';
                    el('line', { x1: cx - 12, x2: cx + 12, y1: cy, y2: cy, class: 'ct-fw-bar' }, g);
                    el('text', { x: cx, y: cy + 20, class: 'ct-fw-txt small' }, g).textContent = String(d);
                } else {
                    const text = st.labels === 'decimal' ? decimal(1 / d, 3) : (st.labels === 'percent' ? `${decimal(100 / d, 1)} %` : '1');
                    el('text', { x: cx, y: cy + 8, class: 'ct-fw-txt' + (text.length > 4 ? ' small' : '') }, g).textContent = text;
                }
            }
            // How much of the row is coloured, on its right.
            const n = shaded(d);
            if (n) {
                const x = BAR + 70, cy = y + ROW / 2;
                if (d === 1 || n === d) { el('text', { x, y: cy + 10, class: 'ct-fw-count' }, svg).textContent = String(n / d); } else {
                    el('text', { x, y: cy - 6, class: 'ct-fw-count small' }, svg).textContent = String(n);
                    el('line', { x1: x - 16, x2: x + 16, y1: cy, y2: cy, class: 'ct-fw-bar dark' }, svg);
                    el('text', { x, y: cy + 22, class: 'ct-fw-count small' }, svg).textContent = String(d);
                }
            }
        });
        if (st.ruler) {
            const x = LEFT + st.at * BAR;
            const g = el('g', { class: 'ct-fw-ruler', tabindex: 0, role: 'slider', 'aria-label': t('fw_ruler'), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(st.at * 100) }, svg);
            el('line', { x1: x, x2: x, y1: 18, y2: H - 4 }, g);
            el('path', { d: `M${x - 14} 2h28l-14 18z` }, g);
        }
        sum();
    }
    // The coloured amounts that are equal: «1/2 = 2/4 = 4/8».
    const sum = () => {
        const parts = ROWS.filter((d) => st.rows.includes(d) && shaded(d)).map((d) => [shaded(d), d]);
        const groups = [];
        parts.forEach(([n, d]) => {
            const g = groups.find((x) => x[0][0] * d === n * x[0][1]);
            if (g) { g.push([n, d]); } else { groups.push([[n, d]]); }
        });
        const same = groups.filter((g) => g.length > 1);
        const box = $('#fw-sum');
        const show = ([n, d]) => (n === d ? '1' : `${n}/${d}`);
        box.className = 'total ct-fw-sum' + (same.length ? '' : ' espera');
        box.textContent = same.length ? same.map((g) => g.map(show).join(' = ')).join('   ·   ') : (parts.length ? t('fw_compare') : t('fw_start'));
    };

    // Taps colour or clear a piece; the ruler moves with its handle (or the arrows).
    let drag = false;
    const svgX = (e) => {
        const svg = $('#fw-svg'), p = svg.createSVGPoint();
        p.x = e.clientX; p.y = e.clientY;
        return p.matrixTransform(svg.getScreenCTM().inverse()).x;
    };
    $('#fw-svg').addEventListener('pointerdown', (e) => {
        if (e.target.closest('.ct-fw-ruler')) {
            drag = true; $('#fw-svg').setPointerCapture(e.pointerId); e.preventDefault(); return;
        }
        const g = e.target.closest('.ct-fw-piece'); if (!g) { return; }
        toggle(Number(g.dataset.d), Number(g.dataset.i));
    });
    $('#fw-svg').addEventListener('pointermove', (e) => {
        if (!drag) { return; }
        st.at = Math.max(0, Math.min(1, (svgX(e) - LEFT) / BAR));
        // Close to a common edge (halves, thirds, quarters…), it sticks there.
        const edges = st.rows.flatMap((d) => Array.from({ length: d + 1 }, (_, i) => i / d));
        const near = edges.find((x) => Math.abs(x - st.at) < 0.008);
        if (near !== undefined) { st.at = near; }
        paint();
    });
    const drop = () => { if (drag) { drag = false; keep(); } };
    $('#fw-svg').addEventListener('pointerup', drop);
    $('#fw-svg').addEventListener('pointercancel', drop);
    $('#fw-svg').addEventListener('keydown', (e) => {
        const g = e.target.closest('.ct-fw-piece');
        if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(Number(g.dataset.d), Number(g.dataset.i)); }
        if (e.target.closest('.ct-fw-ruler') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            e.preventDefault(); st.at = Math.max(0, Math.min(1, st.at + (e.key === 'ArrowLeft' ? -0.01 : 0.01))); keep(); paint();
            $('#fw-svg .ct-fw-ruler').focus();
        }
    });
    const toggle = (d, i) => {
        const on = st.on[d] || [];
        st.on[d] = on.includes(i) ? on.filter((x) => x !== i) : on.concat(i);
        play(on.includes(i) ? 'tic' : 'card');
        keep(); paint();
        const again = $(`#fw-svg .ct-fw-piece[data-d="${d}"][data-i="${i}"]`); if (again && document.activeElement && document.activeElement.closest && document.activeElement.closest('#fw-svg')) { again.focus(); }
    };
    $('#fw-rows').addEventListener('change', () => {
        st.rows = [...panel.querySelectorAll('#fw-rows input:checked')].map((x) => Number(x.value));
        keep(); paint();
    });
    $('#fw-labels').addEventListener('change', () => { st.labels = $('#fw-labels').value; keep(); paint(); });
    $('#fw-ruler').addEventListener('change', () => { st.ruler = $('#fw-ruler').checked; keep(); paint(); });
    $('#fw-clear').addEventListener('click', () => { st.on = {}; keep(); paint(); });
    panel.querySelectorAll('#fw-rows input').forEach((x) => { x.checked = st.rows.includes(Number(x.value)); });
    $('#fw-labels').value = LABELS.includes(st.labels) ? st.labels : 'fraction';
    $('#fw-ruler').checked = st.ruler;
    paint();

    window.ClasstoolsFractions = { state: () => st, toggle, paint };   // for automated tests
})();
