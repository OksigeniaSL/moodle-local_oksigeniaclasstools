// Quick drawing board for the classroom screen: pens in a few colours and thicknesses, an eraser, undo, and
// backgrounds for different lessons (plain, squared paper, handwriting lines, music staves). Several fingers can draw
// at once on a touch board. The drawing can be saved as a PNG. Nothing is sent anywhere.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-pizarra');
    if (!core || !root) { return; }
    const { $, $$, t, escape, save, load, setIcon, announce } = core;

    const STR = {
        colours: t('wb_colour'), size: t('wb_size'), sizes: { s: t('wb_size_s'), m: t('wb_size_m'), l: t('wb_size_l') }, eraser: t('wb_eraser'), undo: t('wb_undo'),
        clear: t('wb_clear'), clearSure: t('wb_clear_sure'), background: t('wb_background'), download: t('wb_download'),
        backgrounds: { blank: t('wb_bg_blank'), grid: t('wb_bg_grid'), lines: t('wb_bg_lines'), staff: t('wb_bg_staff') },
        board: t('wb_board'), saved: (f) => t('wb_saved', f), file: t('wb_file'),
    };
    const COLOURS = [[t('wb_black'), '#1c1a19'], [t('wb_blue'), '#164281'], [t('wb_red'), '#ce1423'], [t('wb_green'), '#067e36'],
        [t('wb_orange'), '#ea7317'], [t('wb_purple'), '#5b2fb8']];
    const SIZES = { s: 0.0035, m: 0.007, l: 0.014 };   // as a share of the board's width
    const ERASER = 0.03;

    const opt = Object.assign({ colour: COLOURS[1][1], size: 'm', bg: 'blank' }, load('pizarra-dibujo', {}));
    if (!COLOURS.some(([, c]) => c === opt.colour)) { opt.colour = COLOURS[1][1]; }
    if (!SIZES[opt.size]) { opt.size = 'm'; }
    if (!STR.backgrounds[opt.bg]) { opt.bg = 'blank'; }
    let erasing = false, clearTimer = 0;
    // Strokes in board units: x and y as shares of the width, so they keep their shape when the board is resized.
    const strokes = [];
    const live = new Map();   // pointerId → stroke being drawn (several fingers at once)

    root.innerHTML = `
        <div class="barra-herr ct-top ct-wb-bar">
            <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.colours)}" id="wb-colours">
                ${COLOURS.map(([n, c]) => `<button type="button" role="radio" class="ct-swatch" data-v="${c}" style="--c:${c}" aria-label="${escape(n)}" title="${escape(n)}"></button>`).join('')}
            </div>
            <div class="segmentos ct-wb-sizes" role="radiogroup" aria-label="${escape(STR.size)}" id="wb-size">
                ${Object.entries(STR.sizes).map(([k, v]) => `<button type="button" role="radio" data-v="${k}" aria-label="${escape(v)}" title="${escape(v)}"><span class="ct-wb-dot ct-wb-${k}"></span></button>`).join('')}
            </div>
            <button type="button" class="boton suave" id="wb-eraser" aria-pressed="false"><span data-icono="goma"></span>${STR.eraser}</button>
            <button type="button" class="boton suave" id="wb-undo"><span data-icono="deshacer"></span>${STR.undo}</button>
            <label class="campo ct-wb-bg"><span>${STR.background}</span><select id="wb-bg">${Object.entries(STR.backgrounds).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
            <button type="button" class="boton suave" id="wb-download"><span data-icono="descargar"></span>${STR.download}</button>
            <button type="button" class="boton rojo-suave ct-push" id="wb-clear"><span data-icono="borrar"></span><span>${STR.clear}</span></button>
        </div>
        <div class="tarjeta ct-wb-stage" id="wb-stage">
            <canvas class="ct-wb-bgcanvas" id="wb-bgc" aria-hidden="true"></canvas>
            <canvas class="ct-wb-ink" id="wb-ink" role="img" aria-label="${escape(STR.board)}"></canvas>
        </div>`;
    $$('[data-icono]', root).forEach((e) => setIcon(e, e.dataset.icono));
    const stage = $('#wb-stage'), bgc = $('#wb-bgc'), ink = $('#wb-ink');
    let W = 1, H = 1, dpr = 1;

    // --- Backgrounds ---------------------------------------------------------------------------------------
    const paintBackground = (ctx, w, h) => {
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        const u = w / 40;   // a square of the grid: a fortieth of the width
        ctx.lineWidth = Math.max(1, w / 1400);
        if (opt.bg === 'grid') {
            ctx.strokeStyle = '#cfdaea';
            ctx.beginPath();
            for (let x = u; x < w; x += u) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = u; y < h; y += u) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();
        } else if (opt.bg === 'lines') {
            // Handwriting lines: two guide lines for the small letters inside each pair of base lines.
            const row = u * 3;
            for (let y = row; y < h; y += row) {
                ctx.strokeStyle = '#8fa6c8'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
                ctx.strokeStyle = '#d6e0ee'; ctx.beginPath(); ctx.moveTo(0, y - u); ctx.lineTo(w, y - u); ctx.moveTo(0, y - 2 * u); ctx.lineTo(w, y - 2 * u); ctx.stroke();
            }
        } else if (opt.bg === 'staff') {
            // Music staves: five lines, with room between them.
            const gap = u * 0.75, block = gap * 4 + u * 3.2;
            ctx.strokeStyle = '#7f8fa6';
            for (let top = u * 2; top + gap * 4 < h; top += block) {
                ctx.beginPath();
                for (let k = 0; k < 5; k++) { const y = top + k * gap; ctx.moveTo(u, y); ctx.lineTo(w - u, y); }
                ctx.stroke();
            }
        }
    };

    // --- Ink ------------------------------------------------------------------------------------------------
    const ictx = () => ink.getContext('2d');
    const drawSegment = (ctx, s, from) => {
        const p = s.p, n = p.length;
        ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
        ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
        ctx.lineWidth = s.w * W; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (n === 1) {
            ctx.beginPath(); ctx.arc(p[0][0] * W, p[0][1] * W, (s.w * W) / 2, 0, Math.PI * 2); ctx.fill();
            return;
        }
        ctx.beginPath();
        const start = Math.max(1, from);
        ctx.moveTo(p[start - 1][0] * W, p[start - 1][1] * W);
        for (let i = start; i < n; i++) {
            // Smooth: a curve through the middle points.
            const [x0, y0] = p[i - 1], [x1, y1] = p[i];
            ctx.quadraticCurveTo(x0 * W, y0 * W, ((x0 + x1) / 2) * W, ((y0 + y1) / 2) * W);
        }
        ctx.lineTo(p[n - 1][0] * W, p[n - 1][1] * W);
        ctx.stroke();
    };
    const redraw = () => {
        const ctx = ictx();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        strokes.forEach((s) => drawSegment(ctx, s, 1));
        ctx.globalCompositeOperation = 'source-over';
        $('#wb-undo').disabled = !strokes.length;
    };
    const layout = () => {
        const box = stage.getBoundingClientRect();
        if (!box.width) { return; }
        W = box.width; H = box.height; dpr = Math.min(2, window.devicePixelRatio || 1);
        [bgc, ink].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
        const bctx = bgc.getContext('2d'); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintBackground(bctx, W, H);
        redraw();
    };
    const point = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) / W, (e.clientY - r.top) / W]; };
    ink.addEventListener('pointerdown', (e) => {
        if (e.button > 0) { return; }
        e.preventDefault();
        ink.setPointerCapture(e.pointerId);
        const s = { c: opt.colour, w: erasing ? ERASER : SIZES[opt.size], e: erasing, p: [point(e)] };
        strokes.push(s); live.set(e.pointerId, s);
        const ctx = ictx(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawSegment(ctx, s, 1);
        $('#wb-undo').disabled = false;
    });
    ink.addEventListener('pointermove', (e) => {
        const s = live.get(e.pointerId);
        if (!s) { return; }
        const before = s.p.length;
        (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach((ev) => s.p.push(point(ev)));
        const ctx = ictx(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawSegment(ctx, s, before);
        ctx.globalCompositeOperation = 'source-over';
    });
    const end = (e) => { live.delete(e.pointerId); };
    ink.addEventListener('pointerup', end);
    ink.addEventListener('pointercancel', end);

    // --- Controls -------------------------------------------------------------------------------------------
    const paintControls = () => {
        $$('#wb-colours .ct-swatch').forEach((b) => b.setAttribute('aria-checked', String(!erasing && b.dataset.v === opt.colour)));
        $$('#wb-size button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.size)));
        $('#wb-eraser').setAttribute('aria-pressed', String(erasing));
        $('#wb-eraser').classList.toggle('activo', erasing);
        $('#wb-bg').value = opt.bg;
        stage.classList.toggle('ct-wb-erasing', erasing);
    };
    const persist = () => save('pizarra-dibujo', opt);
    $('#wb-colours').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.colour = b.dataset.v; erasing = false; persist(); paintControls(); } });
    $('#wb-size').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.size = b.dataset.v; persist(); paintControls(); } });
    $('#wb-eraser').addEventListener('click', () => { erasing = !erasing; paintControls(); });
    $('#wb-undo').addEventListener('click', () => { strokes.pop(); redraw(); });
    $('#wb-bg').addEventListener('change', () => { opt.bg = $('#wb-bg').value; persist(); layout(); });
    $('#wb-clear').addEventListener('click', () => {
        const b = $('#wb-clear');
        if (!b.classList.contains('confirma') && strokes.length) {
            b.classList.add('confirma'); core.relabel(b, STR.clearSure);
            clearTimeout(clearTimer); clearTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.clear); }, 4000);
            return;
        }
        clearTimeout(clearTimer); b.classList.remove('confirma'); core.relabel(b, STR.clear);
        strokes.length = 0; redraw();
    });
    $('#wb-download').addEventListener('click', () => {
        const c = document.createElement('canvas');
        c.width = ink.width; c.height = ink.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(bgc, 0, 0); ctx.drawImage(ink, 0, 0);
        const name = STR.file + '-' + new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-') + '.png';
        c.toBlob((blob) => {
            if (!blob) { return; }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob); a.download = name;
            document.body.append(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            announce(STR.saved(name));
        }, 'image/png');
    });
    // Ctrl+Z undoes, while the board is on screen.
    document.addEventListener('keydown', (e) => {
        if (root.hidden || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || document.querySelector('dialog[open]')) { return; }
        e.preventDefault(); strokes.pop(); redraw();
    });
    if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(layout)).observe(stage); }
    core.register('pizarra', { entra: () => requestAnimationFrame(layout) });
    paintControls();

    window.ClasstoolsWhiteboard = { strokes: () => strokes, layout, opt: () => opt };   // for automated tests
})();
