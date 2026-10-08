// Quick drawing board for the classroom screen: a pen, a highlighter, straight lines, arrows, rectangles, circles and
// text, in a few colours and thicknesses, an eraser, undo and redo, and backgrounds for different lessons (plain,
// squared paper, handwriting lines, double lines, single lines, music staves), bigger or smaller and with a margin line
// if wanted. Several fingers can draw at once on a touch board. The drawing can be saved as a PNG.
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
        redo: t('wb_redo'), tool: t('wb_tool'),
        clear: t('wb_clear'), clearSure: t('wb_clear_sure'), background: t('wb_background'), download: t('wb_download'),
        backgrounds: { blank: t('wb_bg_blank'), grid: t('wb_bg_grid'), lines: t('wb_bg_lines'), double: t('wb_bg_double'), ruled: t('wb_bg_ruled'), staff: t('wb_bg_staff') },
        bgSize: t('wb_bg_size'), smaller: t('wb_bg_smaller'), bigger: t('wb_bg_bigger'), margin: t('wb_margin'), textPh: t('wb_text_ph'),
        board: t('wb_board'), saved: (f) => t('wb_saved', f), file: t('wb_file'),
        send: t('wb_send'), sendTitle: t('wb_send_title'), sendFor: t('wb_send_for'), sendName: t('wb_send_name'),
        sendFormat: t('wb_send_format'), sendNote: t('wb_send_note'), sendNoteCohort: t('wb_send_note_cohort'),
        sendGo: t('wb_send_go'), cancel: t('wb_cancel'), sending: t('wb_sending'), sent: (a) => t('wb_sent', a),
        sentOpen: t('wb_sent_open'), sendError: (e) => t('wb_send_error', e), sendEmpty: t('wb_send_empty'),
        defaultName: (d) => t('wb_default_name', d),
    };
    // Inside a course, a teacher who can add content can share the board with a class (saved in the course, and its
    // students get a notification).
    const AULA = core.moodle && core.moodle.boardurl ? core.moodle : null;
    const COLOURS = [[t('wb_black'), '#1c1a19'], [t('wb_blue'), '#164281'], [t('wb_red'), '#ce1423'], [t('wb_green'), '#067e36'],
        [t('wb_orange'), '#ea7317'], [t('wb_yellow'), '#f5b800'], [t('wb_purple'), '#5b2fb8']];
    const SIZES = { s: 0.0035, m: 0.007, l: 0.014 };   // as a share of the board's width
    const MARKER = { s: 0.012, m: 0.022, l: 0.038 };   // the highlighter, wider and see-through
    const LETTERS = { s: 0.022, m: 0.032, l: 0.05 };   // the height of the text
    const ERASER = 0.03;
    // What draws: the pen by hand, the highlighter, shapes from where the finger goes down to where it lifts, and text.
    const TOOLS = [['pen', 'lapiz'], ['hl', 'fluor'], ['line', 'linea'], ['arrow', 'flecha'], ['rect', 'rect'], ['ellipse', 'elipse'], ['text', 'texto']];
    const SHAPES = ['line', 'arrow', 'rect', 'ellipse'];
    // How big the background is: smaller squares and lines for the older ones, bigger for the youngest. Each screen
    // mode starts with its own and remembers what the teacher chose in it.
    const ZOOMS = [0.6, 0.8, 1, 1.25, 1.6, 2, 2.5];
    const byMode = core.byMode ? core.byMode('pizarra-fondo', {
        early: { zoom: 1.6 }, primary: { zoom: 1 }, secondary: { zoom: 1 }, advanced: { zoom: 0.8 },
    }) : { get: () => ({ zoom: 1 }), set: () => {} };
    const zoomNow = () => (ZOOMS.includes(Number(byMode.get().zoom)) ? Number(byMode.get().zoom) : 1);

    const opt = Object.assign({ colour: COLOURS[1][1], size: 'm', bg: 'blank', tool: 'pen', margin: false }, load('pizarra-dibujo', {}));
    if (!COLOURS.some(([, c]) => c === opt.colour)) { opt.colour = COLOURS[1][1]; }
    if (!SIZES[opt.size]) { opt.size = 'm'; }
    if (!STR.backgrounds[opt.bg]) { opt.bg = 'blank'; }
    if (!TOOLS.some(([k]) => k === opt.tool)) { opt.tool = 'pen'; }
    let erasing = false, clearTimer = 0, zoom = zoomNow(), editing = null;
    // Strokes in board units: x and y as shares of the width, so they keep their shape when the board is resized.
    const strokes = [], undone = [];
    const live = new Map();   // pointerId → stroke being drawn (several fingers at once)

    root.innerHTML = `
        <div class="barra-herr ct-top ct-wb-bar">
            <div class="segmentos ct-wb-tools" role="radiogroup" aria-label="${escape(STR.tool)}" id="wb-tools">
                ${TOOLS.map(([k, icon]) => `<button type="button" role="radio" data-v="${k}" aria-label="${escape(t('wb_t_' + k))}" title="${escape(t('wb_t_' + k))}"><span data-icono="${icon}"></span></button>`).join('')}
            </div>
            <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.colours)}" id="wb-colours">
                ${COLOURS.map(([n, c]) => `<button type="button" role="radio" class="ct-swatch" data-v="${c}" style="--c:${c}" aria-label="${escape(n)}" title="${escape(n)}"></button>`).join('')}
            </div>
            <div class="segmentos ct-wb-sizes" role="radiogroup" aria-label="${escape(STR.size)}" id="wb-size">
                ${Object.entries(STR.sizes).map(([k, v]) => `<button type="button" role="radio" data-v="${k}" aria-label="${escape(v)}" title="${escape(v)}"><span class="ct-wb-dot ct-wb-${k}"></span></button>`).join('')}
            </div>
            <button type="button" class="boton suave ct-wb-redo" id="wb-eraser" aria-pressed="false" aria-label="${escape(STR.eraser)}" title="${escape(STR.eraser)}"><span data-icono="goma"></span></button>
            <span class="ct-wb-hist">
                <button type="button" class="boton suave ct-wb-redo" id="wb-undo" aria-label="${escape(STR.undo)}" title="${escape(STR.undo)}"><span data-icono="deshacer"></span></button>
                <button type="button" class="boton suave ct-wb-redo" id="wb-redo" aria-label="${escape(STR.redo)}" title="${escape(STR.redo)}"><span data-icono="rehacer"></span></button>
            </span>
            <div class="ct-wb-fondo">
                <button type="button" class="boton suave" id="wb-bg-open" aria-expanded="false" aria-controls="wb-bg-panel" title="${escape(STR.background)}"><span id="wb-bg-name"></span><span data-icono="abajo"></span></button>
                <div class="tarjeta ct-wb-panel" id="wb-bg-panel" hidden>
                    <p class="ante">${escape(STR.background)}</p>
                    <div class="ct-wb-fondos" role="radiogroup" aria-label="${escape(STR.background)}" id="wb-bg">
                        ${Object.entries(STR.backgrounds).map(([k, v]) => `<button type="button" role="radio" data-v="${k}"><span class="ct-wb-muestra ct-wb-m-${k}" aria-hidden="true"></span>${escape(v)}</button>`).join('')}
                    </div>
                    <p class="ante">${escape(STR.bgSize)}</p>
                    <div class="giro grande-giro ct-wb-zoom">
                        <button type="button" class="redondo suave" id="wb-zoom-less" aria-label="${escape(STR.smaller)}" title="${escape(STR.smaller)}"><span data-icono="menos"></span></button>
                        <output id="wb-zoom"></output>
                        <button type="button" class="redondo suave" id="wb-zoom-more" aria-label="${escape(STR.bigger)}" title="${escape(STR.bigger)}"><span data-icono="mas"></span></button>
                    </div>
                    <label class="interruptor"><input type="checkbox" id="wb-margin"><span>${escape(STR.margin)}</span></label>
                </div>
            </div>
            <button type="button" class="boton suave ct-wb-redo" id="wb-download" aria-label="${escape(STR.download)}" title="${escape(STR.download)}"><span data-icono="descargar"></span></button>
            ${AULA ? `<button type="button" class="boton ct-wb-redo" id="wb-send" aria-label="${escape(STR.send)}" title="${escape(STR.send)}"><span data-icono="enviar"></span></button>` : ''}
            <button type="button" class="boton rojo-suave ct-push" id="wb-clear"><span data-icono="borrar"></span><span>${STR.clear}</span></button>
        </div>
        <div class="tarjeta ct-wb-stage" id="wb-stage">
            <canvas class="ct-wb-bgcanvas" id="wb-bgc" aria-hidden="true"></canvas>
            <canvas class="ct-wb-ink" id="wb-ink" role="img" aria-label="${escape(STR.board)}"></canvas>
            <canvas class="ct-wb-pre" id="wb-pre" aria-hidden="true"></canvas>
        </div>`;
    $$('[data-icono]', root).forEach((e) => setIcon(e, e.dataset.icono));
    const stage = $('#wb-stage'), bgc = $('#wb-bgc'), ink = $('#wb-ink'), pre = $('#wb-pre');
    let W = 1, H = 1, dpr = 1;

    // --- Backgrounds ---------------------------------------------------------------------------------------
    const paintBackground = (ctx, w, h) => {
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        const u = (w / 40) * zoom;   // a square of the grid: a fortieth of the width, bigger or smaller
        ctx.lineWidth = Math.max(1, w / 1400);
        const across = (y, colour) => { ctx.strokeStyle = colour; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); };
        if (opt.bg === 'grid') {
            ctx.strokeStyle = '#cfdaea';
            ctx.beginPath();
            for (let x = u; x < w; x += u) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
            for (let y = u; y < h; y += u) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
            ctx.stroke();
        } else if (opt.bg === 'lines') {
            // Handwriting lines: two guide lines for the small letters inside each pair of base lines.
            const row = u * 3;
            for (let y = row; y < h; y += row) { across(y - 2 * u, '#d6e0ee'); across(y - u, '#d6e0ee'); across(y, '#8fa6c8'); }
        } else if (opt.bg === 'double') {
            // Double lines: the small letters sit in the narrow band, the tall ones go above it.
            const band = u, row = u * 2.8;
            for (let y = row; y < h; y += row) { across(y - band, '#9db2d2'); across(y, '#9db2d2'); }
        } else if (opt.bg === 'ruled') {
            for (let y = u * 1.4; y < h; y += u * 1.4) { across(y, '#a9bad3'); }
        } else if (opt.bg === 'staff') {
            // Music staves: as many as fit, spread over the height.
            const gap = u * 0.75, staff = gap * 4, room = u * 1.6;
            const n = Math.max(1, Math.floor((h - room) / (staff + room)));
            const space = (h - n * staff) / (n + 1);
            ctx.strokeStyle = '#7f8fa6';
            for (let i = 0; i < n; i++) {
                const top = space + i * (staff + space);
                ctx.beginPath();
                for (let k = 0; k < 5; k++) { const y = top + k * gap; ctx.moveTo(u, y); ctx.lineTo(w - u, y); }
                ctx.stroke();
            }
        }
        // The margin of the notebooks: a red line on the left (on a line of the grid when there is one).
        if (opt.margin) {
            const x = Math.max(u, Math.round((w * 0.08) / u) * u);
            ctx.strokeStyle = '#e0626d'; ctx.lineWidth = Math.max(1.5, w / 800);
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
    };

    // --- Ink ------------------------------------------------------------------------------------------------
    const ictx = () => { const c = ink.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); return c; };
    // The highlighter goes see-through and multiplied, like a real one: what is under it still shows.
    const pen = (ctx, s) => {
        ctx.globalCompositeOperation = s.e ? 'destination-out' : (s.k === 'hl' ? 'multiply' : 'source-over');
        ctx.globalAlpha = s.k === 'hl' ? 0.4 : 1;
        ctx.strokeStyle = s.c; ctx.fillStyle = s.c;
        ctx.lineWidth = s.w * W; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    };
    const drawSegment = (ctx, s, from) => {
        const p = s.p, n = p.length;
        pen(ctx, s);
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
    const drawShape = (ctx, s) => {
        const [x0, y0] = [s.p[0][0] * W, s.p[0][1] * W], [x1, y1] = [s.p[1][0] * W, s.p[1][1] * W];
        pen(ctx, s);
        ctx.beginPath();
        if (s.k === 'rect') { ctx.rect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)); }
        if (s.k === 'ellipse') { ctx.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2); }
        if (s.k === 'line' || s.k === 'arrow') { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); }
        ctx.stroke();
        if (s.k === 'arrow' && Math.hypot(x1 - x0, y1 - y0) > 4) {
            const a = Math.atan2(y1 - y0, x1 - x0), len = Math.max(14, s.w * W * 4.5);
            ctx.beginPath();
            ctx.moveTo(x1 - len * Math.cos(a - 0.45), y1 - len * Math.sin(a - 0.45));
            ctx.lineTo(x1, y1);
            ctx.lineTo(x1 - len * Math.cos(a + 0.45), y1 - len * Math.sin(a + 0.45));
            ctx.stroke();
        }
    };
    const drawText = (ctx, s) => {
        pen(ctx, s);
        ctx.font = `800 ${s.f * W}px Nunito, system-ui, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(s.t, s.p[0][0] * W, s.p[0][1] * W);
    };
    const drawStroke = (ctx, s) => {
        // (The highlighter is drawn whole, so it does not darken where it crosses itself.)
        if (s.k === 'text') { drawText(ctx, s); } else if (SHAPES.includes(s.k)) { drawShape(ctx, s); } else { drawSegment(ctx, s, 1); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    };
    const buttons = () => { $('#wb-undo').disabled = !strokes.length; $('#wb-redo').disabled = !undone.length; };
    const redraw = () => {
        const ctx = ictx();
        ctx.clearRect(0, 0, W, H);
        strokes.forEach((s) => { if (!live.size || ![...live.values()].includes(s) || !s.k) { drawStroke(ctx, s); } });
        preview();
        buttons();
    };
    // Shapes and the highlighter, while they are being drawn, go on a layer of their own; on lifting, onto the ink.
    const preview = () => {
        const ctx = pre.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        live.forEach((s) => { if (s.k) { drawStroke(ctx, s); } });
    };
    const layout = () => {
        const box = stage.getBoundingClientRect();
        if (!box.width) { return; }
        W = box.width; H = box.height; dpr = Math.min(2, window.devicePixelRatio || 1);
        [bgc, ink, pre].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
        const bctx = bgc.getContext('2d'); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintBackground(bctx, W, H);
        redraw();
    };
    const point = (e) => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) / W, (e.clientY - r.top) / W]; };
    const add = (s) => { strokes.push(s); undone.length = 0; buttons(); };
    ink.addEventListener('pointerdown', (e) => {
        if (e.button > 0) { return; }
        e.preventDefault();
        const at = point(e);
        if (opt.tool === 'text' && !erasing) { writeAt(at); return; }
        finishText();
        try { ink.setPointerCapture(e.pointerId); } catch (err) { /* a pointer that cannot be captured still draws */ }
        let s;
        if (erasing) { s = { c: opt.colour, w: ERASER, e: true, p: [at] }; } else if (opt.tool === 'hl') {
            s = { k: 'hl', c: opt.colour, w: MARKER[opt.size], p: [at] };
        } else if (SHAPES.includes(opt.tool)) {
            s = { k: opt.tool, c: opt.colour, w: SIZES[opt.size], p: [at, at] };
        } else { s = { c: opt.colour, w: SIZES[opt.size], e: false, p: [at] }; }
        add(s); live.set(e.pointerId, s);
        if (s.k) { preview(); } else { drawSegment(ictx(), s, 1); ictx().globalCompositeOperation = 'source-over'; }
    });
    ink.addEventListener('pointermove', (e) => {
        const s = live.get(e.pointerId);
        if (!s) { return; }
        if (SHAPES.includes(s.k)) { s.p[1] = point(e); preview(); return; }
        const before = s.p.length;
        const all = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        (all.length ? all : [e]).forEach((ev) => s.p.push(point(ev)));
        if (s.k) { preview(); return; }
        const ctx = ictx(); drawSegment(ctx, s, before);
        ctx.globalCompositeOperation = 'source-over';
    });
    const end = (e) => {
        const s = live.get(e.pointerId);
        live.delete(e.pointerId);
        if (!s || !s.k) { return; }
        // A shape that did not grow (a tap) is not kept.
        if (SHAPES.includes(s.k) && Math.hypot(s.p[1][0] - s.p[0][0], s.p[1][1] - s.p[0][1]) < 0.004) {
            strokes.splice(strokes.indexOf(s), 1); buttons();
        } else { drawStroke(ictx(), s); }
        preview();
    };
    ink.addEventListener('pointerup', end);
    ink.addEventListener('pointercancel', end);

    // Text: a box where the finger went down; Enter (or tapping elsewhere) writes it on the board, Escape drops it.
    const writeAt = (at) => {
        finishText();
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'ct-wb-text'; input.maxLength = 120; input.placeholder = STR.textPh;
        input.setAttribute('aria-label', STR.textPh);
        const f = LETTERS[opt.size];
        Object.assign(input.style, { left: `${at[0] * W}px`, top: `${at[1] * W}px`, fontSize: `${f * W}px`, color: opt.colour });
        stage.append(input);
        editing = { input, at, f, c: opt.colour };
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); finishText(); }
            if (e.key === 'Escape') { input.value = ''; finishText(); }
            e.stopPropagation();
        });
        input.addEventListener('blur', () => setTimeout(finishText, 0));
        setTimeout(() => input.focus(), 0);
    };
    function finishText() {
        if (!editing) { return; }
        const { input, at, f, c } = editing;
        editing = null;
        const text = input.value.trim();
        input.remove();
        if (text) { const s = { k: 'text', c, f, p: [at], t: text }; add(s); drawStroke(ictx(), s); }
    }

    // --- Controls -------------------------------------------------------------------------------------------
    const paintControls = () => {
        $$('#wb-tools button').forEach((b) => b.setAttribute('aria-checked', String(!erasing && b.dataset.v === opt.tool)));
        $$('#wb-colours .ct-swatch').forEach((b) => b.setAttribute('aria-checked', String(!erasing && b.dataset.v === opt.colour)));
        $$('#wb-size button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.size)));
        $('#wb-eraser').setAttribute('aria-pressed', String(erasing));
        $('#wb-eraser').classList.toggle('activo', erasing);
        $$('#wb-bg button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.bg)));
        $('#wb-bg-name').textContent = STR.backgrounds[opt.bg];
        $('#wb-bg-open').setAttribute('aria-label', `${STR.background}: ${STR.backgrounds[opt.bg]}`);
        $('#wb-zoom').textContent = `${Math.round(zoom * 100)} %`;
        $('#wb-zoom-less').disabled = zoom <= ZOOMS[0];
        $('#wb-zoom-more').disabled = zoom >= ZOOMS[ZOOMS.length - 1];
        $('#wb-margin').checked = !!opt.margin;
        stage.classList.toggle('ct-wb-erasing', erasing);
        stage.dataset.tool = erasing ? 'eraser' : opt.tool;
    };
    const persist = () => save('pizarra-dibujo', opt);
    $('#wb-tools').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.tool = b.dataset.v; erasing = false; persist(); paintControls(); } });
    $('#wb-colours').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]'); if (!b) { return; }
        opt.colour = b.dataset.v; erasing = false; persist(); paintControls();
        if (editing) { editing.c = opt.colour; editing.input.style.color = opt.colour; editing.input.focus(); }
    });
    $('#wb-size').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.size = b.dataset.v; persist(); paintControls(); } });
    $('#wb-eraser').addEventListener('click', () => { erasing = !erasing; paintControls(); });
    const undo = () => { finishText(); const s = strokes.pop(); if (s) { undone.push(s); } redraw(); };
    const redo = () => { const s = undone.pop(); if (s) { strokes.push(s); } redraw(); };
    $('#wb-undo').addEventListener('click', undo);
    $('#wb-redo').addEventListener('click', redo);
    // The background: a small panel with the kind, how big and the margin.
    const panel = $('#wb-bg-panel');
    const showPanel = (on) => { panel.hidden = !on; $('#wb-bg-open').setAttribute('aria-expanded', String(on)); };
    $('#wb-bg-open').addEventListener('click', () => showPanel(panel.hidden));
    document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !e.target.closest('.ct-wb-fondo')) { showPanel(false); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { showPanel(false); $('#wb-bg-open').focus(); } });
    $('#wb-bg').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.bg = b.dataset.v; persist(); paintControls(); layout(); } });
    const setZoom = (d) => {
        const i = Math.max(0, Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + d));
        zoom = ZOOMS[i]; byMode.set({ zoom }); paintControls(); layout();
    };
    $('#wb-zoom-less').addEventListener('click', () => setZoom(-1));
    $('#wb-zoom-more').addEventListener('click', () => setZoom(1));
    $('#wb-margin').addEventListener('change', () => { opt.margin = $('#wb-margin').checked; persist(); layout(); });
    document.addEventListener('classtools:mode', () => { zoom = zoomNow(); paintControls(); layout(); });
    $('#wb-clear').addEventListener('click', () => {
        const b = $('#wb-clear');
        if (!b.classList.contains('confirma') && strokes.length) {
            b.classList.add('confirma'); core.relabel(b, STR.clearSure);
            clearTimeout(clearTimer); clearTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.clear); }, 4000);
            return;
        }
        clearTimeout(clearTimer); b.classList.remove('confirma'); core.relabel(b, STR.clear);
        finishText(); strokes.length = 0; undone.length = 0; redraw();
    });
    // The drawing with its background, as one image.
    const compose = () => {
        const c = document.createElement('canvas');
        c.width = ink.width; c.height = ink.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(bgc, 0, 0); ctx.drawImage(ink, 0, 0);
        return c;
    };
    $('#wb-download').addEventListener('click', () => {
        const c = compose();
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
    // --- Sharing with a class -------------------------------------------------------------------------------
    // The same dialog sends this board or a picture of another tool (the brainstorm): «source» says which.
    let source = null, share = null;
    if (AULA) {
        const dialog = document.createElement('dialog');
        dialog.className = 'editor'; dialog.id = 'wb-send-dialog'; dialog.setAttribute('aria-labelledby', 'wb-send-title');
        dialog.innerHTML = `
            <form method="dialog" id="wb-send-form">
                <h2 id="wb-send-title">${escape(STR.sendTitle)}</h2>
                <label class="campo apilado"><span>${escape(STR.sendFor)}</span><select id="wb-send-list">
                    ${(AULA.lists || []).map((l) => `<option value="${escape(l.id)}">${escape(l.name)} (${(l.students || []).length})</option>`).join('')}</select></label>
                <label class="campo apilado"><span>${escape(STR.sendName)}</span><input type="text" id="wb-send-name" maxlength="100" autocomplete="off"></label>
                <p class="ante">${escape(STR.sendFormat)}</p>
                <div class="segmentos" role="radiogroup" aria-label="${escape(STR.sendFormat)}" id="wb-send-format">
                    <button type="button" role="radio" aria-checked="true" data-v="png">PNG</button>
                    <button type="button" role="radio" aria-checked="false" data-v="pdf">PDF</button>
                </div>
                <p class="nota" id="wb-send-note"></p>
                <p class="nota" id="wb-send-result" aria-live="polite"></p>
                <div class="botonera">
                    <button type="submit" class="boton" id="wb-send-go"><span data-icono="enviar"></span><span>${escape(STR.sendGo)}</span></button>
                    <button type="button" class="boton suave" id="wb-send-cancel">${escape(STR.cancel)}</button>
                </div>
            </form>`;
        document.body.append(dialog);
        $$('[data-icono]', dialog).forEach((e) => setIcon(e, e.dataset.icono));
        const note = () => { $('#wb-send-note').textContent = $('#wb-send-list').value.startsWith('h') ? `${STR.sendNote} ${STR.sendNoteCohort}` : STR.sendNote; };
        $('#wb-send-list').addEventListener('change', note);
        $('#wb-send-format').addEventListener('click', (e) => {
            const b = e.target.closest('[data-v]'); if (!b) { return; }
            $$('#wb-send-format button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        });
        const close = () => { if (dialog.close) { dialog.close(); } else { dialog.removeAttribute('open'); } };
        $('#wb-send-cancel').addEventListener('click', close);
        const open = (src, name) => {
            source = src;
            const r = $('#wb-send-result'); r.textContent = ''; r.classList.remove('error');
            $('#wb-send-go').disabled = src.empty();
            if (src.empty()) { r.textContent = STR.sendEmpty; }
            $('#wb-send-name').value = name;
            note();
            if (dialog.showModal) { dialog.showModal(); } else { dialog.setAttribute('open', ''); }
        };
        $('#wb-send').addEventListener('click', () => {
            const when = new Date().toLocaleString(document.documentElement.lang || undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            open({ compose, empty: () => !strokes.length }, STR.defaultName(when));
        });
        share = (make, name) => open({ compose: make, empty: () => false }, name);
        $('#wb-send-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const r = $('#wb-send-result'), go = $('#wb-send-go');
            const format = ($('#wb-send-format [aria-checked="true"]') || { dataset: { v: 'png' } }).dataset.v;
            go.disabled = true; r.classList.remove('error'); r.textContent = STR.sending;
            core.toMoodle(AULA.boardurl, { listid: $('#wb-send-list').value, name: $('#wb-send-name').value, format, image: (source ? source.compose : compose)().toDataURL('image/png') })
                .then((j) => {
                    r.innerHTML = `${escape(STR.sent({ folder: j.folder, n: j.notified }))} <a href="${escape(j.url)}" target="_blank" rel="noopener">${escape(STR.sentOpen)}</a>`;
                    announce(STR.sent({ folder: j.folder, n: j.notified }));
                    core.play('elegido');
                })
                .catch((err) => { r.textContent = STR.sendError(err.message || ''); r.classList.add('error'); })
                .finally(() => { go.disabled = false; });
        });
    }

    // Ctrl+Z undoes and Ctrl+Y (or Ctrl+Shift+Z) does it again, while the board is on screen.
    document.addEventListener('keydown', (e) => {
        if (root.hidden || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' || document.querySelector('dialog[open]')) { return; }
        e.preventDefault();
        if (e.shiftKey) { redo(); } else { undo(); }
    });
    document.addEventListener('keydown', (e) => {
        if (root.hidden || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'y' || document.querySelector('dialog[open]')) { return; }
        e.preventDefault(); redo();
    });
    if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(layout)).observe(stage); }
    core.register('pizarra', { entra: () => requestAnimationFrame(layout) });
    paintControls();

    // share(make, name): opens «Send to the class» with the canvas that make() draws (only inside a course).
    window.ClasstoolsWhiteboard = { strokes: () => strokes, layout, opt: () => opt, share };
})();
