// Hands-on materials for the board: Cuisenaire rods and a tangram. Pieces are dragged with a finger or the mouse
// and turned with a double tap; the tangram can be fitted into silhouettes (each one checked to have a solution with
// the seven pieces), with a hint that shows where the pieces go. Layouts are kept in the browser (the rods' and the
// tangram's).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-material');
    if (!core || !root) { return; }
    const { $, $$, t, escape, save, load, play, setIcon, announce, shuffle, random } = core;

    const STR = {
        modes: { rods: t('mt_rods'), tangram: t('mt_tangram') }, what: t('mt_what'),
        numbers: t('mt_numbers'), numbersA: t('mt_numbers_a'), numbersB: t('mt_numbers_b'), size: t('mt_size'), two: t('mt_two'), turn: t('mt_turn'), clear: t('mt_clear'), clearSure: t('mt_clear_sure'),
        rodsHelp: t('mt_rods_help'),
        rod: (n) => t('mt_rod', n),
        figure: t('mt_figure'), free: t('mt_free'), flip: t('mt_flip'), guides: t('mt_guides'), reset: t('mt_reset'),
        pictures: t('mt_group_figures'), shapes: t('mt_group_shapes'), next: t('mt_next_figure'), madeIt: (f) => t('mt_fig_done', f),
        tangramHelp: t('mt_tangram_help'),
        done: t('mt_done'), piece: t('mt_piece'),
    };
    const NS = 'http://www.w3.org/2000/svg';
    const el = (name, attrs = {}, parent = null) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        if (parent) { parent.append(e); }
        return e;
    };
    const toSvg = (svg, e) => {
        const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        return p.matrixTransform(svg.getScreenCTM().inverse());
    };
    const fmt = (n) => Number(n.toFixed(3));

    const RD_COLS = [12, 18, 24, 30, 40];   // columns of the rods table, from big cells to small ones
    root.innerHTML = `
        <div class="barra-herr ct-top">
            <div class="segmentos" role="radiogroup" aria-label="${escape(STR.what)}" id="mt-mode">
                ${Object.entries(STR.modes).map(([k, v]) => `<button type="button" role="radio" aria-checked="false" data-mode="${k}">${v}</button>`).join('')}
            </div>
        </div>
        <div class="ct-body">
            <div class="ct-panel" data-panel="rods" hidden>
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.size}</span><select id="rd-cols">${RD_COLS.map((c) => `<option value="${c}">${escape(t('mt_cols', c))}</option>`).join('')}</select></label>
                    <label class="interruptor"><input type="checkbox" id="rd-two"><span>${STR.two}</span></label>
                    <label class="interruptor"><input type="checkbox" id="rd-numbers"><span id="rd-numbers-label">${STR.numbers}</span></label>
                    <label class="interruptor" id="rd-numbers2-box" hidden><input type="checkbox" id="rd-numbers2"><span>${STR.numbersB}</span></label>
                    <button type="button" class="boton suave" id="rd-turn" disabled><span data-icono="girar"></span>${STR.turn}</button>
                    <button type="button" class="boton suave" id="rd-clear"><span data-icono="limpiar"></span><span>${STR.clear}</span></button>
                    <p class="nota">${STR.rodsHelp}</p>
                </aside>
                <div class="tarjeta ct-stage ct-mt-stage"><svg class="ct-mt-svg" id="rd-svg" role="application" aria-label="${escape(STR.modes.rods)}"></svg></div>
            </div>
            <div class="ct-panel" data-panel="tangram" hidden>
                <aside class="tarjeta ct-side">
                    <label class="campo apilado"><span>${STR.figure}</span><select id="tg-fig"></select></label>
                    <div class="ct-row">
                        <button type="button" class="boton suave" id="tg-turn"><span data-icono="girar"></span>${STR.turn}</button>
                        <button type="button" class="boton suave" id="tg-flip"><span data-icono="voltear"></span>${STR.flip}</button>
                    </div>
                    <label class="interruptor" id="tg-guides-box"><input type="checkbox" id="tg-guides"><span>${STR.guides}</span></label>
                    <button type="button" class="boton suave" id="tg-reset"><span data-icono="reiniciar"></span>${STR.reset}</button>
                    <p class="nota">${STR.tangramHelp}</p>
                </aside>
                <div class="tarjeta ct-stage ct-mt-stage">
                    <svg class="ct-mt-svg" id="tg-svg" role="application" aria-label="${escape(STR.modes.tangram)}"></svg>
                    <p class="total ct-mt-msg" id="tg-msg" aria-live="polite"></p>
                </div>
            </div>
        </div>`;
    $$('[data-icono]', root).forEach((e) => setIcon(e, e.dataset.icono));

    // A double tap (or double click) on the same piece, without dragging it, turns it.
    const tapper = () => {
        let last = { id: null, t: 0 };
        return (id) => { const now = performance.now(), dbl = last.id === id && now - last.t < 380; last = { id: dbl ? null : id, t: now }; return dbl; };
    };

    // =========================================================================================================
    // Cuisenaire rods: the staircase from 1 to 10 on the left, the table with its grid on the right.
    // =========================================================================================================
    const ROD_COLORS = [null, ['#f4f4f2', '#1c1a19'], ['#e03131', '#fff'], ['#8ccf3f', '#1c1a19'], ['#b45dc8', '#fff'], ['#fbd023', '#1c1a19'],
        ['#1f7a3a', '#fff'], ['#2b2b2b', '#fff'], ['#8b5a2b', '#fff'], ['#1f5fbf', '#fff'], ['#f08c00', '#1c1a19']];
    // The table: as many columns as chosen (more columns, smaller cells), and to compare, two tables side by side,
    // each one with its own numbers on or off. Rods keep their place as columns and rows of their table.
    const TRAY = 11.6, BX = 12, GAP = 1.5, COLS = RD_COLS;
    let RW = 30, RH = 14;
    const rd = Object.assign({ rods: [], numbers: false, numbers2: false, cols: 18, two: false }, load('regletas', {}));
    if (!COLS.includes(Number(rd.cols))) { rd.cols = 18; }
    rd.rods = Array.isArray(rd.rods) ? rd.rods.filter((r) => r && r.n >= 1 && r.n <= 10) : [];
    // Saved before there were tables: x was from the left of the scene.
    if (!rd.rv) { rd.rods.forEach((r) => { r.x -= BX; r.t = 0; }); rd.rv = 2; }
    rd.rods.forEach((r) => { r.t = rd.two && r.t === 1 ? 1 : 0; });
    let rdSel = null, rdDrag = null, clearTimer = 0;
    const rdTap = tapper();
    const rdSave = () => save('regletas', { rods: rd.rods.map(({ id, n, x, y, v, t }) => ({ id, n, x, y, v, t })), numbers: rd.numbers, numbers2: rd.numbers2, cols: rd.cols, two: rd.two, rv: 2 });
    const rdSize = (r) => (r.v ? [1, r.n] : [r.n, 1]);
    const origin = (t) => BX + t * (rd.cols + GAP);
    const rdNumbers = (t) => (t === 1 ? rd.numbers2 : rd.numbers);
    const rodShape = (g, n, vertical) => {
        const [w, h] = vertical ? [1, n] : [n, 1], [fill, ink] = ROD_COLORS[n];
        el('rect', { x: 0.04, y: 0.04, width: w - 0.08, height: h - 0.08, rx: 0.14, fill, class: 'ct-rd-body' + (n === 1 ? ' ct-rd-white' : '') }, g);
        const t = el('text', { x: w / 2, y: h / 2 + 0.02, fill: ink, class: 'ct-rd-num' }, g);
        t.textContent = String(n);
    };
    const rdClamp = (r) => {
        const [w, h] = rdSize(r);
        r.x = Math.max(0, Math.min(rd.cols - w, r.x)); r.y = Math.max(0, Math.min(RH - h, r.y));
    };
    const rdPaint = () => {
        const svg = $('#rd-svg');
        RW = BX + rd.cols * (rd.two ? 2 : 1) + (rd.two ? GAP : 0);
        svg.setAttribute('viewBox', `0 0 ${RW} ${RH}`);
        svg.classList.toggle('ct-rd-numbers', rd.numbers);
        svg.innerHTML = '';
        const defs = el('defs', {}, svg);
        const pat = el('pattern', { id: 'rd-grid', width: 1, height: 1, patternUnits: 'userSpaceOnUse' }, defs);
        el('path', { d: 'M1 0V1H0', fill: 'none', stroke: '#d9e2ee', 'stroke-width': 0.03 }, pat);
        (rd.two ? [0, 1] : [0]).forEach((t) => {
            el('rect', { x: origin(t), y: 0, width: rd.cols, height: RH, fill: 'url(#rd-grid)', class: 'ct-rd-table' }, svg);
            if (rd.two) { el('text', { x: origin(t) + 0.3, y: 0.55, class: 'ct-rd-mesa' }, svg).textContent = t ? 'B' : 'A'; }
        });
        if (rd.two) { el('line', { x1: origin(1) - GAP / 2, y1: 0.2, x2: origin(1) - GAP / 2, y2: RH - 0.2, class: 'ct-rd-division' }, svg); }
        const tray = el('g', { class: 'ct-rd-trayzone' }, svg);
        el('rect', { x: 0, y: 0, width: TRAY, height: RH, rx: 0.4, class: 'ct-rd-traybg' }, tray);
        for (let n = 1; n <= 10; n++) {
            const g = el('g', { class: 'ct-rd ct-rd-tray', 'data-n': n, transform: `translate(0.5 ${fmt(0.45 + (n - 1) * (RH - 0.9) / 10)})`, role: 'img', 'aria-label': STR.rod(n) }, tray);
            rodShape(g, n, false);
        }
        rd.rods.forEach((r) => rdAdd(svg, r));
        $('#rd-turn').disabled = !rd.rods.some((r) => r.id === rdSel);
    };
    const rdAdd = (svg, r) => {
        const g = el('g', { class: 'ct-rd ct-rd-on' + (r.id === rdSel ? ' ct-sel' : '') + (rdNumbers(r.t) ? ' ct-rd-con-num' : ''), 'data-id': r.id,
            transform: `translate(${fmt(origin(r.t) + r.x)} ${fmt(r.y)})`, tabindex: 0, role: 'img', 'aria-label': STR.rod(r.n) }, svg);
        rodShape(g, r.n, r.v);
        return g;
    };
    const rdTurn = (id) => {
        const r = rd.rods.find((x) => x.id === id); if (!r) { return; }
        r.v = !r.v; rdClamp(r); rdSave(); rdPaint(); play('tic');
    };
    const rdLayout = () => {
        const svg = $('#rd-svg'), box = svg.parentElement.getBoundingClientRect();
        if (!box.width) { return; }
        RW = BX + rd.cols * (rd.two ? 2 : 1) + (rd.two ? GAP : 0);
        RH = Math.max(12.4, Math.min(RW * 0.9, RW * box.height / box.width));
        rd.rods.forEach(rdClamp);
        rdPaint();
    };
    $('#rd-svg').addEventListener('pointerdown', (e) => {
        const svg = $('#rd-svg'), g = e.target.closest('.ct-rd');
        if (!g) { rdSel = null; rdPaint(); return; }
        e.preventDefault();
        const p = toSvg(svg, e);
        let r;
        if (g.classList.contains('ct-rd-tray')) {
            const n = Number(g.dataset.n), y0 = 0.45 + (n - 1) * (RH - 0.9) / 10;
            r = { id: 'r' + Date.now().toString(36) + random(1000), n, x: 0.5 - BX, y: y0, v: false, t: 0 };
            rd.rods.push(r);
        } else {
            r = rd.rods.find((x) => x.id === g.dataset.id);
            rd.rods = rd.rods.filter((x) => x !== r).concat(r);   // on top
        }
        rdSel = r.id;
        // While it is dragged, the rod is placed in scene units (ax, ay); on dropping it lands on a table.
        r.ax = origin(r.t) + r.x; r.ay = r.y;
        rdDrag = { r, dx: p.x - r.ax, dy: p.y - r.ay, sx: p.x, sy: p.y, moved: false, fresh: g.classList.contains('ct-rd-tray') };
        // No repainting while the finger is down: removing the touched element leaves the touch without its target,
        // and Android then swallows the next tap. The new rod is added and the touched one only comes to the front.
        if (rdDrag.fresh) { rdAdd(svg, r); } else { svg.append(g); }
        $$('#rd-svg .ct-rd-on').forEach((x) => x.classList.toggle('ct-sel', x.dataset.id === r.id));
        $('#rd-turn').disabled = false;
        svg.setPointerCapture(e.pointerId);
    });
    $('#rd-svg').addEventListener('pointermove', (e) => {
        if (!rdDrag) { return; }
        const p = toSvg($('#rd-svg'), e), d = rdDrag;
        d.r.ax = p.x - d.dx; d.r.ay = p.y - d.dy;
        if (Math.abs(p.x - d.sx) + Math.abs(p.y - d.sy) > 0.15) { d.moved = true; }
        const g = $(`#rd-svg [data-id="${d.r.id}"]`);
        if (g) { g.setAttribute('transform', `translate(${fmt(d.r.ax)} ${fmt(d.r.ay)})`); }
    });
    // The first free place, in table A and then in B.
    const rdFree = (r) => {
        const [w, h] = rdSize(r);
        const busy = (t, x, y) => rd.rods.some((o) => {
            if (o === r || o.t !== t) { return false; }
            const [ow, oh] = rdSize(o);
            return x < o.x + ow && o.x < x + w && y < o.y + oh && o.y < y + h;
        });
        for (const t of rd.two ? [0, 1] : [0]) {
            for (let y = 1; y + h <= Math.floor(RH); y++) {
                for (let x = 1; x + w <= rd.cols; x++) { if (!busy(t, x, y)) { r.t = t; r.x = x; r.y = y; return true; } }
            }
        }
        return false;
    };
    const rdDrop = () => {
        const d = rdDrag; rdDrag = null;
        if (!d) { return; }
        const r = d.r, [w] = rdSize(r);
        if (d.fresh && !d.moved) {
            // A tap on the staircase: the rod goes to the first free place of the table.
            if (!rdFree(r)) { rd.rods = rd.rods.filter((x) => x !== r); rdSel = null; } else { play('tic'); }
        } else if (r.ax + w / 2 < BX - 0.3) {
            // Back to the staircase: the rod goes away.
            rd.rods = rd.rods.filter((x) => x !== r); rdSel = null;
        } else {
            if (!d.moved && rdTap(r.id)) { r.v = !r.v; }
            // On the table where its middle is (between the two, the nearest).
            r.t = rd.two && r.ax + w / 2 > origin(1) - GAP / 2 ? 1 : 0;
            r.x = Math.round(r.ax - origin(r.t)); r.y = Math.round(r.ay); rdClamp(r);
            if (d.moved) { play('tic'); }
        }
        delete r.ax; delete r.ay;
        rdSave(); rdPaint();
        if (rdSel) { const g = $(`#rd-svg [data-id="${rdSel}"]`); if (g) { g.focus({ preventScroll: true }); } }
    };
    $('#rd-svg').addEventListener('pointerup', rdDrop);
    $('#rd-svg').addEventListener('pointercancel', rdDrop);
    $('#rd-svg').addEventListener('keydown', (e) => {
        const g = e.target.closest('.ct-rd-on'); if (!g) { return; }
        const r = rd.rods.find((x) => x.id === g.dataset.id); if (!r) { return; }
        const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (moves[e.key]) { r.x += moves[e.key][0]; r.y += moves[e.key][1]; rdClamp(r); }
        else if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') { r.v = !r.v; rdClamp(r); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { rd.rods = rd.rods.filter((x) => x !== r); rdSel = null; }
        else { return; }
        e.preventDefault(); e.stopPropagation();
        rdSel = rd.rods.includes(r) ? r.id : null;
        rdSave(); rdPaint();
        if (rdSel) { $(`#rd-svg [data-id="${rdSel}"]`).focus({ preventScroll: true }); }
    });
    $('#rd-svg').addEventListener('focusin', (e) => {
        const g = e.target.closest('.ct-rd-on');
        if (g && g.dataset.id !== rdSel) { rdSel = g.dataset.id; $$('#rd-svg .ct-rd-on').forEach((x) => x.classList.toggle('ct-sel', x === g)); $('#rd-turn').disabled = false; }
    });
    $('#rd-turn').addEventListener('click', () => rdTurn(rdSel));
    const rdControls = () => {
        $('#rd-numbers').checked = rd.numbers; $('#rd-numbers2').checked = rd.numbers2; $('#rd-two').checked = rd.two;
        $('#rd-numbers2-box').hidden = !rd.two;
        $('#rd-numbers-label').textContent = rd.two ? STR.numbersA : STR.numbers;
        $('#rd-cols').value = String(rd.cols);
    };
    $('#rd-numbers').addEventListener('change', () => { rd.numbers = $('#rd-numbers').checked; rdSave(); rdPaint(); });
    $('#rd-numbers2').addEventListener('change', () => { rd.numbers2 = $('#rd-numbers2').checked; rdSave(); rdPaint(); });
    $('#rd-two').addEventListener('change', () => {
        rd.two = $('#rd-two').checked;
        if (!rd.two) { rd.rods.forEach((r) => { r.t = 0; }); }
        rdControls(); rdSave(); rdLayout();
    });
    $('#rd-cols').addEventListener('change', () => { rd.cols = Number($('#rd-cols').value); rdSave(); rdLayout(); });
    rdControls();
    $('#rd-clear').addEventListener('click', () => {
        const b = $('#rd-clear');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); core.relabel(b, STR.clearSure);
            clearTimeout(clearTimer); clearTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.clear); }, 4000);
            return;
        }
        clearTimeout(clearTimer); b.classList.remove('confirma'); core.relabel(b, STR.clear);
        rd.rods = []; rdSel = null; rdSave(); rdPaint();
    });

    // =========================================================================================================
    // Tangram: seven pieces from a square of side 4. Figures were solved beforehand by exact cover, so every
    // silhouette can be made; «pieces» holds one solution, shown as the hint.
    // =========================================================================================================
    const FIGURES = {
        cuadrado: { name: t('mt_fig_square'), shape: true, outline: [[[0,0],[4,0],[4,4],[0,4]]],
            pieces: [[[0,0],[4,0],[2,2]],[[0,4],[0,0],[2,2]],[[4,0],[4,2],[3,1]],[[3,1],[4,2],[3,3],[2,2]],[[3,3],[1,3],[2,2]],[[4,4],[2,4],[4,2]],[[3,3],[1,3],[0,4],[2,4]]] },
        triangulo: { name: t('mt_fig_triangle'), shape: true, outline: [[[0,0],[8,0],[4,4]]],
            pieces: [[[0,0],[4,0],[2,2]],[[4,0],[4,4],[2,2]],[[4,0],[6,0],[4,2]],[[6,0],[7,1],[6,2],[5,1]],[[6,0],[8,0],[7,1]],[[5,1],[5,3],[4,4],[4,2]],[[5,3],[5,1],[6,2]]] },
        casa: { name: t('mt_fig_house'), outline: [[[0,0],[4,0],[4,2],[2,4],[0,2]],[[1,3],[2,4],[2,6],[1,5]],[[4,1],[5,0],[6,1],[5,2]]],
            pieces: [[[0,0],[4,0],[2,2]],[[0,2],[0,0],[2,2]],[[4,0],[4,2],[3,1]],[[5,0],[6,1],[5,2],[4,1]],[[4,2],[2,2],[3,1]],[[0,2],[4,2],[2,4]],[[2,6],[2,4],[1,3],[1,5]]] },
        barco: { name: t('mt_fig_boat'), outline: [[[2,0],[6,0],[8,2],[6,2],[4,4],[2,2],[0,2]]],
            pieces: [[[4,2],[0,2],[2,0]],[[2,0],[6,0],[4,2]],[[6,0],[6,2],[5,1]],[[6,2],[6,0],[8,2]],[[5,1],[6,2],[5,3],[4,2]],[[2,2],[4,2],[5,3],[3,3]],[[3,3],[5,3],[4,4]]] },
        pez: { name: t('mt_fig_fish'), outline: [[[0,2],[2,0],[4,2],[2,4]],[[4,2],[6,0],[6,4]],[[2,4],[3,5],[2,6],[1,5]],[[2,0],[3,-1],[5,-1],[4,0]]],
            pieces: [[[5,-1],[3,-1],[2,0],[4,0]],[[2,0],[2,4],[0,2]],[[2,4],[2,0],[4,2]],[[6,2],[4,2],[6,0]],[[4,2],[6,2],[5,3]],[[6,2],[6,4],[5,3]],[[2,4],[3,5],[2,6],[1,5]]] },
        gato: { name: t('mt_fig_cat'), outline: [[[0,0],[4,0],[0,4]],[[0,4],[1,5],[0,6],[-1,5]],[[-1,5],[0,6],[-1,7]],[[0,6],[1,5],[1,7]],[[4,0],[6,0],[7,1],[5,1]],[[-2,0],[0,0],[0,2]]],
            pieces: [[[0,0],[0,2],[-2,0]],[[0,0],[4,0],[2,2]],[[0,4],[0,0],[2,2]],[[4,0],[6,0],[7,1],[5,1]],[[0,4],[1,5],[0,6],[-1,5]],[[-1,7],[-1,5],[0,6]],[[1,5],[1,7],[0,6]]] },
        velero: { name: t('mt_fig_sailboat'), outline: [[[2,0],[4,0],[6,2],[0,2]],[[2,2],[6,2],[2,6]]],
            pieces: [[[4,2],[0,2],[2,0]],[[4,0],[4,2],[2,0]],[[4,2],[4,0],[5,1]],[[5,1],[6,2],[5,3],[4,2]],[[2,2],[4,2],[5,3],[3,3]],[[2,6],[2,2],[4,4]],[[3,3],[5,3],[4,4]]] },
        // The 13 convex figures of the tangram (the square and the triangle are above), found by search and solved.
        rectangulo: { name: t('mt_fig_rectangle'), shape: true, outline: [[[0,0],[0,2.8284],[-5.6569,2.8284],[-5.6569,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[-2.8284,2.8284],[0,0],[0,2.8284]],[[-4.2426,1.4142],[-5.6569,0],[-2.8284,0]],[[-4.2426,1.4142],[-2.8284,0],[-2.8284,1.4142]],[[-2.8284,1.4142],[-2.8284,2.8284],[-4.2426,2.8284],[-4.2426,1.4142]],[[-5.6569,0],[-4.2426,1.4142],[-4.2426,2.8284],[-5.6569,1.4142]],[[-5.6569,1.4142],[-4.2426,2.8284],[-5.6569,2.8284]]] },
        romboide: { name: t('mt_fig_rhomboid'), shape: true, outline: [[[0,0],[-2.8284,2.8284],[-8.4853,2.8284],[-5.6569,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[-2.8284,2.8284],[-5.6569,0],[-2.8284,0]],[[-5.6569,0],[-4.2426,1.4142],[-7.0711,1.4142]],[[-4.2426,1.4142],[-4.2426,2.8284],[-5.6569,2.8284],[-5.6569,1.4142]],[[-4.2426,1.4142],[-2.8284,2.8284],[-4.2426,2.8284]],[[-5.6569,1.4142],[-7.0711,2.8284],[-8.4853,2.8284],[-7.0711,1.4142]],[[-7.0711,2.8284],[-5.6569,1.4142],[-5.6569,2.8284]]] },
        trapecio: { name: t('mt_fig_trapezium'), shape: true, outline: [[[0,0],[-2.8284,2.8284],[-5.6569,2.8284],[-8.4853,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[-4.2426,1.4142],[-5.6569,0],[-2.8284,0]],[[-4.2426,1.4142],[-2.8284,0],[-2.8284,1.4142]],[[-2.8284,1.4142],[-2.8284,2.8284],[-4.2426,2.8284],[-4.2426,1.4142]],[[-5.6569,2.8284],[-8.4853,0],[-5.6569,0]],[[-5.6569,0],[-4.2426,1.4142],[-4.2426,2.8284],[-5.6569,1.4142]],[[-5.6569,1.4142],[-4.2426,2.8284],[-5.6569,2.8284]]] },
        trapecio_rect_1: { name: t('mt_fig_right_trapezium', 1), shape: true, outline: [[[0,0],[-2.8284,2.8284],[-7.0711,2.8284],[-7.0711,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[-2.8284,2.8284],[-5.6569,0],[-2.8284,0]],[[-5.6569,0],[-7.0711,1.4142],[-7.0711,0]],[[-5.6569,0],[-4.2426,1.4142],[-7.0711,1.4142]],[[-2.8284,2.8284],[-4.2426,1.4142],[-5.6569,1.4142],[-4.2426,2.8284]],[[-5.6569,1.4142],[-5.6569,2.8284],[-7.0711,2.8284],[-7.0711,1.4142]],[[-5.6569,1.4142],[-4.2426,2.8284],[-5.6569,2.8284]]] },
        trapecio_rect_2: { name: t('mt_fig_right_trapezium', 2), shape: true, outline: [[[0,0],[-6,0],[-6,4],[-4,4]]],
            pieces: [[[0,0],[-4,0],[-2,2]],[[-3,1],[-3,3],[-2,2]],[[-3,3],[-4,2],[-5,3],[-4,4]],[[-3,1],[-5,1],[-3,3]],[[-6,0],[-4,0],[-3,1],[-5,1]],[[-6,4],[-4,4],[-5,3]],[[-6,0],[-6,4],[-4,2]]] },
        pentagono_1: { name: t('mt_fig_pentagon', 1), shape: true, outline: [[[0,0],[0,1.4142],[-2.8284,4.2426],[-5.6569,1.4142],[-5.6569,0]]],
            pieces: [[[-1.4142,1.4142],[-2.8284,0],[0,0]],[[-1.4142,1.4142],[0,0],[0,1.4142]],[[0,1.4142],[-2.8284,4.2426],[-2.8284,1.4142]],[[-1.4142,1.4142],[-2.8284,0],[-4.2426,0],[-2.8284,1.4142]],[[-4.2426,0],[-4.2426,1.4142],[-5.6569,1.4142],[-5.6569,0]],[[-4.2426,0],[-2.8284,1.4142],[-4.2426,1.4142]],[[-2.8284,4.2426],[-5.6569,1.4142],[-2.8284,1.4142]]] },
        pentagono_2: { name: t('mt_fig_pentagon', 2), shape: true, outline: [[[0,0],[-6,0],[-7,1],[-7,3],[-3,3]]],
            pieces: [[[0,0],[-4,0],[-2,2]],[[-2,2],[-4,2],[-3,3]],[[-6,2],[-2,2],[-4,0]],[[-6,2],[-4,2],[-3,3],[-5,3]],[[-4,0],[-6,0],[-5,1]],[[-7,3],[-5,3],[-7,1]],[[-5,1],[-6,0],[-7,1],[-6,2]]] },
        hexagono_1: { name: t('mt_fig_hexagon', 1), shape: true, outline: [[[0,0],[1.4142,1.4142],[0,2.8284],[-4.2426,2.8284],[-5.6569,1.4142],[-4.2426,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[1.4142,1.4142],[0,2.8284],[0,0]],[[-2.8284,2.8284],[0,0],[0,2.8284]],[[-2.8284,0],[-2.8284,1.4142],[-4.2426,1.4142],[-4.2426,0]],[[-5.6569,1.4142],[-4.2426,0],[-4.2426,1.4142]],[[-2.8284,2.8284],[-4.2426,1.4142],[-2.8284,1.4142]],[[-2.8284,2.8284],[-4.2426,1.4142],[-5.6569,1.4142],[-4.2426,2.8284]]] },
        hexagono_2: { name: t('mt_fig_hexagon', 2), shape: true, outline: [[[0,0],[-1,1],[-5,1],[-7,-1],[-6,-2],[-2,-2]]],
            pieces: [[[0,0],[-4,0],[-2,-2]],[[-2,0],[0,0],[-1,1]],[[-1,1],[-3,1],[-4,0],[-2,0]],[[-6,-2],[-2,-2],[-4,0]],[[-5,1],[-5,-1],[-3,1]],[[-5,-1],[-6,0],[-7,-1],[-6,-2]],[[-5,-1],[-5,1],[-6,0]]] },
        hexagono_3: { name: t('mt_fig_hexagon', 3), shape: true, outline: [[[0,0],[0,2.8284],[-1.4142,4.2426],[-2.8284,4.2426],[-4.2426,2.8284],[-4.2426,0]]],
            pieces: [[[0,0],[-2.8284,2.8284],[-2.8284,0]],[[-2.8284,2.8284],[0,0],[0,2.8284]],[[-2.8284,0],[-4.2426,1.4142],[-4.2426,0]],[[-4.2426,1.4142],[-2.8284,0],[-2.8284,2.8284]],[[0,2.8284],[-1.4142,4.2426],[-1.4142,2.8284]],[[-1.4142,2.8284],[-1.4142,4.2426],[-2.8284,4.2426],[-2.8284,2.8284]],[[-4.2426,1.4142],[-2.8284,2.8284],[-2.8284,4.2426],[-4.2426,2.8284]]] },
        hexagono_4: { name: t('mt_fig_hexagon', 4), shape: true, outline: [[[0,0],[-2.8284,0],[-4.2426,-1.4142],[-4.2426,-4.2426],[-1.4142,-4.2426],[0,-2.8284]]],
            pieces: [[[0,0],[-2.8284,-2.8284],[0,-2.8284]],[[-2.8284,-2.8284],[0,0],[-2.8284,0]],[[-1.4142,-4.2426],[0,-2.8284],[-2.8284,-2.8284]],[[-2.8284,0],[-4.2426,-1.4142],[-2.8284,-1.4142]],[[-2.8284,-1.4142],[-4.2426,-1.4142],[-4.2426,-2.8284],[-2.8284,-2.8284]],[[-1.4142,-4.2426],[-2.8284,-2.8284],[-4.2426,-2.8284],[-2.8284,-4.2426]],[[-2.8284,-4.2426],[-4.2426,-2.8284],[-4.2426,-4.2426]]] },
    };
    // Each piece: its polygon around its own centre, and its colour.
    const centred = (poly) => {
        const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
        return poly.map(([x, y]) => [x - cx, y - cy]);
    };
    const PIECES = [
        ['L', [[0, 0], [4, 0], [2, 2]], '#ce1423'], ['L', [[0, 0], [4, 0], [2, 2]], '#164281'], ['M', [[0, 0], [2, 0], [0, 2]], '#067e36'],
        ['S', [[0, 0], [2, 0], [1, 1]], '#fbbe17'], ['S', [[0, 0], [2, 0], [1, 1]], '#5b2fb8'], ['Q', [[1, 0], [2, 1], [1, 2], [0, 1]], '#ea7317'],
        ['P', [[0, 0], [2, 0], [3, 1], [1, 1]], '#0e7c86'],
    ].map(([kind, poly, color], i) => ({ i, kind, local: centred(poly), color }));
    const TW = 22;
    let TH = 13;
    // Guide lines: on by default in «Early years», off in the other modes; the teacher's choice is kept for each mode.
    const guidesKey = () => 'tangram-guias-' + (core.mode ? core.mode() : 'primary');
    const guidesDefault = () => { const v = load(guidesKey(), null); return v === null ? (core.mode ? core.mode() : 'primary') === 'early' : v === true; };
    const tg = { fig: load('tangram-figura', 'cuadrado'), state: [], sel: null, hint: guidesDefault(), done: false };
    if (tg.fig !== 'free' && !FIGURES[tg.fig]) { tg.fig = 'cuadrado'; }
    let tgDrag = null;
    const tgTap = tapper();
    // Where the silhouette goes (right part of the table), in board coordinates (y down).
    const figPlace = () => {
        const f = FIGURES[tg.fig]; if (!f) { return null; }
        const pts = f.outline.flat();
        const minx = Math.min(...pts.map((p) => p[0])), maxx = Math.max(...pts.map((p) => p[0]));
        const miny = Math.min(...pts.map((p) => p[1])), maxy = Math.max(...pts.map((p) => p[1]));
        const cx = TW * 0.73, cy = TH / 2;
        const map = ([x, y]) => [fmt(cx + x - (minx + maxx) / 2), fmt(cy - (y - (miny + maxy) / 2))];
        return { outline: f.outline.map((poly) => poly.map(map)), pieces: f.pieces.map((poly) => poly.map(map)) };
    };
    const world = (p, s) => {
        const a = s.rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
        return p.local.map(([x0, y]) => { const x = s.flip ? -x0 : x0; return [s.x + x * c - y * sn, s.y + x * sn + y * c]; });
    };
    const scatter = () => {
        // Seven places in the left part, each piece turned a quarter at random. The middle place is narrow: it goes to
        // one of the small pieces (a small triangle or the square).
        const wide = shuffle([[2.5, 2.3], [7.2, 2.3], [2.5, 6.5], [7.2, 6.5], [2.5, 10.7], [7.2, 10.7]]);
        const small = [3, 4, 5][random(3)];
        tg.state = PIECES.map((p) => {
            const [x, y] = p.i === small ? [9.9, 6.5] : wide.shift();
            return { x, y: Math.max(1.4, Math.min(TH - 1.4, y * TH / 13)), rot: 90 * random(4), flip: false };
        });
        tg.sel = null; tg.done = false;
        tgSave();
    };
    // The pieces stay where they were left (per figure), also after reloading the page.
    const tgSave = () => save('tangram', { fig: tg.fig, th: TH, state: tg.state.map(({ x, y, rot, flip }) => ({ x: fmt(x), y: fmt(y), rot, flip })) });
    const tgRestore = () => {
        const k = load('tangram', null);
        if (!k || k.fig !== tg.fig || !Array.isArray(k.state) || k.state.length !== PIECES.length) { return false; }
        const dy = (TH - (Number(k.th) || TH)) / 2;
        tg.state = k.state.map((s) => ({ x: Number(s.x) || 1, y: Math.max(0.5, Math.min(TH - 0.5, (Number(s.y) || 1) + dy)), rot: (Number(s.rot) || 0) % 360, flip: !!s.flip }));
        return true;
    };
    const tgPaint = () => {
        const svg = $('#tg-svg');
        svg.setAttribute('viewBox', `0 0 ${TW} ${TH}`);
        svg.innerHTML = '';
        const place = figPlace();
        if (place) {
            const sil = el('g', { class: 'ct-tg-sil' }, svg);
            place.outline.forEach((poly) => el('polygon', { points: poly.map((p) => p.join(',')).join(' ') }, sil));
            if (tg.hint) {
                const h = el('g', { class: 'ct-tg-hint' }, svg);
                place.pieces.forEach((poly) => el('polygon', { points: poly.map((p) => p.join(',')).join(' ') }, h));
            }
        }
        PIECES.forEach((p) => {
            const s = tg.state[p.i];
            el('polygon', {
                class: 'ct-tg-piece' + (tg.sel === p.i ? ' ct-sel' : ''), 'data-i': p.i, fill: p.color, tabindex: 0, role: 'img', 'aria-label': STR.piece,
                points: p.local.map((q) => q.join(',')).join(' '),
                transform: `translate(${fmt(s.x)} ${fmt(s.y)}) rotate(${s.rot}) scale(${s.flip ? -1 : 1} 1)`,
            }, svg);
        });
        // The piece being moved or turned goes on top.
        if (tg.sel !== null) { const top = $(`#tg-svg [data-i="${tg.sel}"]`); if (top) { svg.append(top); } }
        $('#tg-guides-box').hidden = !place;
        $('#tg-guides').checked = tg.hint;
        const m = $('#tg-msg'); m.textContent = tg.done ? STR.done : ''; m.className = 'total ct-mt-msg' + (tg.done ? ' ct-win' : '');
    };
    // Magnet: if a corner of the piece is close to a corner of another piece or of the silhouette, they meet.
    const snap = (i) => {
        const s = tg.state[i], mine = world(PIECES[i], s);
        const others = PIECES.filter((p) => p.i !== i).flatMap((p) => world(p, tg.state[p.i]));
        const place = figPlace();
        const targets = others.concat(place ? place.outline.flat().concat(place.pieces.flat()) : []);
        let best = null;
        mine.forEach(([x, y]) => targets.forEach(([tx, ty]) => {
            const d = Math.hypot(tx - x, ty - y);
            if (d < 0.35 && (!best || d < best.d)) { best = { d, dx: tx - x, dy: ty - y }; }
        }));
        if (best) { s.x += best.dx; s.y += best.dy; }
        return !!best;
    };
    const inside = ([x, y], poly) => {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i], [xj, yj] = poly[j];
            if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) { c = !c; }
        }
        return c;
    };
    // Done when the pieces cover the silhouette and hardly anything sticks out (sampled on a fine grid).
    const check = () => {
        const place = figPlace();
        if (!place || tg.done) { return; }
        const polys = PIECES.map((p) => world(p, tg.state[p.i]));
        const pts = place.outline.flat();
        const x0 = Math.min(...pts.map((p) => p[0])) - 0.6, x1 = Math.max(...pts.map((p) => p[0])) + 0.6;
        const y0 = Math.min(...pts.map((p) => p[1])) - 0.6, y1 = Math.max(...pts.map((p) => p[1])) + 0.6;
        let inSil = 0, covered = 0, out = 0;
        for (let x = x0; x <= x1; x += 0.1) {
            for (let y = y0; y <= y1; y += 0.1) {
                const sil = place.outline.some((poly) => inside([x, y], poly)), piece = polys.some((poly) => inside([x, y], poly));
                if (sil) { inSil++; if (piece) { covered++; } } else if (piece) { out++; }
            }
        }
        if (inSil && covered / inSil > 0.97 && out / inSil < 0.03) {
            tg.done = true; tg.sel = null; tgPaint(); play('fin');
            const name = FIGURES[tg.fig].name;
            if (core.celebrate) {
                core.celebrate($('#tg-svg').parentElement, { title: STR.done, text: STR.madeIt(name), glow: [$('#tg-svg')], again: STR.next, onAgain: nextFigure });
            } else { announce(STR.done); }
        }
    };
    const tgTurn = (i) => {
        if (i === null || i === undefined) { return; }
        const s = tg.state[i]; s.rot = (s.rot + 45) % 360; tg.sel = i;
        snap(i); tgPaint(); play('tic'); check(); tgSave();
    };
    const tgFlip = (i) => {
        if (i === null || i === undefined) { return; }
        const s = tg.state[i]; s.flip = !s.flip; tg.sel = i;
        snap(i); tgPaint(); play('tic'); check(); tgSave();
    };
    const tgLayout = () => {
        const svg = $('#tg-svg'), box = svg.parentElement.getBoundingClientRect();
        if (!box.width) { return; }
        const before = TH;
        TH = Math.max(11, Math.min(20, TW * box.height / box.width));
        // The silhouette stays centred: the pieces move with it.
        if (tg.state.length) { tg.state.forEach((s) => { s.y = Math.max(0.5, Math.min(TH - 0.5, s.y + (TH - before) / 2)); }); } else if (!tgRestore()) { scatter(); }
        tgPaint();
    };
    $('#tg-svg').addEventListener('pointerdown', (e) => {
        const svg = $('#tg-svg'), g = e.target.closest('.ct-tg-piece');
        if (!g) { tg.sel = null; tgPaint(); return; }
        e.preventDefault();
        const i = Number(g.dataset.i), s = tg.state[i], p = toSvg(svg, e);
        tg.sel = i;
        tgDrag = { i, dx: p.x - s.x, dy: p.y - s.y, sx: p.x, sy: p.y, moved: false };
        svg.append(g); $$('#tg-svg .ct-tg-piece').forEach((x) => x.classList.toggle('ct-sel', x === g));
        svg.setPointerCapture(e.pointerId);
    });
    $('#tg-svg').addEventListener('pointermove', (e) => {
        if (!tgDrag) { return; }
        const p = toSvg($('#tg-svg'), e), d = tgDrag, s = tg.state[d.i];
        s.x = Math.max(0.5, Math.min(TW - 0.5, p.x - d.dx)); s.y = Math.max(0.5, Math.min(TH - 0.5, p.y - d.dy));
        if (Math.abs(p.x - d.sx) + Math.abs(p.y - d.sy) > 0.12) { d.moved = true; }
        $(`#tg-svg [data-i="${d.i}"]`).setAttribute('transform', `translate(${fmt(s.x)} ${fmt(s.y)}) rotate(${s.rot}) scale(${s.flip ? -1 : 1} 1)`);
    });
    const tgDrop = () => {
        const d = tgDrag; tgDrag = null;
        if (!d) { return; }
        if (!d.moved) { if (tgTap(d.i)) { tgTurn(d.i); } return; }
        if (snap(d.i)) { play('tic'); }
        tgPaint(); check(); tgSave();
        const g = !tg.done && $(`#tg-svg [data-i="${d.i}"]`); if (g) { g.focus({ preventScroll: true }); }
    };
    $('#tg-svg').addEventListener('pointerup', tgDrop);
    $('#tg-svg').addEventListener('pointercancel', tgDrop);
    $('#tg-svg').addEventListener('keydown', (e) => {
        const g = e.target.closest('.ct-tg-piece'); if (!g) { return; }
        const i = Number(g.dataset.i), s = tg.state[i];
        const moves = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] };
        if (moves[e.key]) { s.x += moves[e.key][0]; s.y += moves[e.key][1]; snap(i); tgPaint(); check(); tgSave(); }
        else if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') { tgTurn(i); }
        else if (e.key === 'f' || e.key === 'F') { tgFlip(i); }
        else { return; }
        e.preventDefault(); e.stopPropagation();
        const again = $(`#tg-svg [data-i="${i}"]`); if (again) { again.focus({ preventScroll: true }); }
    });
    $('#tg-svg').addEventListener('focusin', (e) => {
        const g = e.target.closest('.ct-tg-piece');
        if (g) { tg.sel = Number(g.dataset.i); $$('#tg-svg .ct-tg-piece').forEach((x) => x.classList.toggle('ct-sel', x === g)); }
    });
    const options = (shape) => Object.entries(FIGURES).filter(([, f]) => !!f.shape === shape).map(([k, f]) => `<option value="${k}">${escape(f.name)}</option>`).join('');
    $('#tg-fig').innerHTML = `<option value="free">${escape(STR.free)}</option><optgroup label="${escape(STR.pictures)}">${options(false)}</optgroup>`
        + `<optgroup label="${escape(STR.shapes)}">${options(true)}</optgroup>`;
    // «Otra figura» after a figure is done: the next one in the list (the pictures first, then the shapes).
    const nextFigure = () => {
        const keys = [...$('#tg-fig').options].map((o) => o.value).filter((v) => v !== 'free');
        tg.fig = keys[(keys.indexOf(tg.fig) + 1) % keys.length];
        $('#tg-fig').value = tg.fig; save('tangram-figura', tg.fig); scatter(); tgPaint(); play('card');
    };
    $('#tg-fig').value = tg.fig;
    $('#tg-fig').addEventListener('change', () => { tg.fig = $('#tg-fig').value; save('tangram-figura', tg.fig); scatter(); tgPaint(); });
    $('#tg-turn').addEventListener('click', () => tgTurn(tg.sel));
    $('#tg-flip').addEventListener('click', () => tgFlip(tg.sel));
    $('#tg-guides').addEventListener('change', () => { tg.hint = $('#tg-guides').checked; save(guidesKey(), tg.hint); tgPaint(); });
    document.addEventListener('classtools:mode', () => { tg.hint = guidesDefault(); if (tg.state.length) { tgPaint(); } });
    $('#tg-reset').addEventListener('click', () => { scatter(); tgPaint(); play('card'); });

    // =========================================================================================================
    // The other materials (number line, fraction wall…) come in files of their own and add themselves with
    // core.material.add(): a button in the bar, a panel, and what to do when it is shown or resized. Only the materials
    // the site wants (the administrator chooses them; none chosen: all).
    const SITE = window.CLASSTOOLS_SITE && Array.isArray(window.CLASSTOOLS_SITE.materials) && window.CLASSTOOLS_SITE.materials.length ? window.CLASSTOOLS_SITE.materials : null;
    const wants = (key) => !SITE || SITE.includes(key);
    const LAYOUT = {};
    [['rods', () => rdLayout()], ['tangram', () => tgLayout()]].forEach(([key, fn]) => {
        if (wants(key)) { LAYOUT[key] = fn; return; }
        const b = $(`#mt-mode [data-mode="${key}"]`), p = $(`.ct-panel[data-panel="${key}"]`, root);
        if (b) { b.remove(); }
        if (p) { p.remove(); }
    });
    const wanted = load('material-modo', 'rods');
    let mode = LAYOUT[wanted] ? wanted : (Object.keys(LAYOUT)[0] || 'rods');
    const showMode = (m) => {
        if (!LAYOUT[m]) { return; }
        mode = m; save('material-modo', m);
        $$('#mt-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
        $$('.ct-panel', root).forEach((p) => { p.hidden = p.dataset.panel !== m; });
        requestAnimationFrame(LAYOUT[m]);
    };
    const first = () => { if (!LAYOUT[mode]) { const k = Object.keys(LAYOUT)[0]; if (k) { showMode(k); } } };
    $('#mt-mode').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) { showMode(b.dataset.mode); } });
    if (window.ResizeObserver) {
        new ResizeObserver(() => requestAnimationFrame(LAYOUT[mode] || (() => {}))).observe(root);
    }
    core.material = {
        /**
         * Adds a material.
         *
         * @param {string} key
         * @param {string} label The name on its button.
         * @param {string} html Its panel (usually an aside with the settings and a stage).
         * @param {Function} layout What to do when it is shown or the screen changes size.
         * @return {HTMLElement} The panel.
         */
        add: (key, label, html, layout) => {
            if (!wants(key)) {
                // Not wanted: a panel that is never shown, so the material's code works on it without errors.
                const away = document.createElement('div');
                away.innerHTML = html;
                return away;
            }
            const b = document.createElement('button');
            b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.dataset.mode = key; b.textContent = label;
            $('#mt-mode').append(b);
            const panel = document.createElement('div');
            panel.className = 'ct-panel'; panel.dataset.panel = key; panel.hidden = true; panel.innerHTML = html;
            $$('[data-icono]', panel).forEach((e) => setIcon(e, e.dataset.icono));
            root.querySelector('.ct-body').append(panel);
            LAYOUT[key] = layout || (() => {});
            if (key === wanted || !LAYOUT[mode]) { showMode(key); }
            return panel;
        },
    };
    core.register('material', { entra: () => { first(); if (LAYOUT[mode]) { showMode(mode); } } });
    if (LAYOUT[mode]) { showMode(mode); }

    window.ClasstoolsMaterial = { showMode, rods: () => rd, tangram: () => tg, FIGURES, PIECES, world, check, snap, place: figPlace, paint: tgPaint };   // for automated tests
})();
