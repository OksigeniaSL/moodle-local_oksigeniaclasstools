// Drawing board for the classroom screen.
//
// The simple board (by default up to Primary): a pen, a highlighter, straight lines, arrows, rectangles, circles and
// text, in a few colours and thicknesses, an eraser, undo and redo, and backgrounds for different lessons (plain,
// squared paper, handwriting lines, double lines, single lines, music staves; white, or green or black like a
// chalkboard, where the inks turn to chalk), bigger or smaller and with a margin line if wanted. Several fingers can
// draw at once on a touch board.
//
// The full board (by default from Secondary on, or with its button) adds pages with thumbnails; a picture or the pages
// of a PDF as the background of a page; selecting what is drawn to move it, resize it, copy it, recolour it or delete
// it; zooming and moving around the page; a laser pointer; and, from instruments.js, the ruler, the set squares, the
// protractor, the compass, the curtain and the spotlight. Ideas from OpenBoard (GPL 3), written anew for the web.
//
// The pages are kept for each course in the browser and, inside Moodle, for the teacher in the course (the pictures
// stay in the browser). A page can be saved as a PNG or sent to the class.
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
        surface: t('wb_surface'), surfaces: { white: t('wb_sf_white'), green: t('wb_sf_green'), black: t('wb_sf_black') },
        full: t('wb_full'), more: t('wb_more'), image: t('wb_image'), imageRemove: t('wb_image_remove'), imageMissing: t('wb_image_missing'),
        importing: (a) => t('wb_importing', a), importError: t('wb_import_error'), pdfMany: (n) => t('wb_pdf_many', n),
        zoomIn: t('wb_zoom_in'), zoomOut: t('wb_zoom_out'), zoomReset: t('wb_zoom_reset'), fit: t('wb_fit'),
        pages: t('wb_pages'), pageOf: (a) => t('wb_page_of', a), prev: t('wb_prev'), next: t('wb_next'), newPage: t('wb_new_page'),
        dupPage: t('wb_dup_page'), delPage: t('wb_del_page'), delPageSure: t('wb_del_page_sure'), tooBig: t('wb_too_big'),
        selCopy: t('wb_sel_copy'), selDelete: t('wb_sel_delete'), magic: t('wb_magic'),
    };
    // Inside a course, a teacher who can add content can share the board with a class (saved in the course, and its
    // students get a notification).
    const AULA = core.moodle && core.moodle.boardurl ? core.moodle : null;
    const COLOURS = [[t('wb_black'), '#1c1a19'], [t('wb_blue'), '#164281'], [t('wb_red'), '#ce1423'], [t('wb_green'), '#067e36'],
        [t('wb_orange'), '#ea7317'], [t('wb_yellow'), '#f5b800'], [t('wb_purple'), '#5b2fb8']];
    // On a chalkboard each ink is drawn as its chalk (the drawing keeps its colours if the page turns white again).
    const CHALK = { '#1c1a19': '#f4f2ea', '#164281': '#9cc8ff', '#ce1423': '#ff9d9d', '#067e36': '#a8eba1', '#ea7317': '#ffbe7d', '#f5b800': '#ffe27a', '#5b2fb8': '#d4b9ff' };
    const SURFACES = { white: '#ffffff', green: '#26493b', black: '#23272c' };
    const SIZES = { s: 0.0035, m: 0.007, l: 0.014 };   // as a share of the board's width
    const MARKER = { s: 0.012, m: 0.022, l: 0.038 };   // the highlighter, wider and see-through
    const LETTERS = { s: 0.022, m: 0.032, l: 0.05 };   // the height of the text
    const ERASER = 0.03;
    // What draws: the pen by hand, the highlighter, shapes from where the finger goes down to where it lifts, and text.
    const TOOLS = [['pen', 'lapiz'], ['hl', 'fluor'], ['line', 'linea'], ['arrow', 'flecha'], ['rect', 'rect'], ['ellipse', 'elipse'], ['text', 'texto'], ['formula', 'formula']];
    // And in the full board: select (and move, resize…), move around the page, and the laser pointer.
    const MORE = [['select', 'seleccion'], ['hand', 'mano'], ['laser', 'laser']];
    const SHAPES = ['line', 'arrow', 'rect', 'ellipse'];
    const KINDS = ['hl', 'text', 'math', 'poly', ...SHAPES];
    const FORMULA = 1.25;   // a formula, a little bigger than text of the same size
    // How big the background is: smaller squares and lines for the older ones, bigger for the youngest. Each screen
    // mode starts with its own and remembers what the teacher chose in it.
    const ZOOMS = [0.6, 0.8, 1, 1.25, 1.6, 2, 2.5];
    const byMode = core.byMode ? core.byMode('pizarra-fondo', {
        early: { zoom: 1.6 }, primary: { zoom: 1 }, secondary: { zoom: 1 }, advanced: { zoom: 0.8 },
    }) : { get: () => ({ zoom: 1 }), set: () => {} };
    const zoomNow = () => (ZOOMS.includes(Number(byMode.get().zoom)) ? Number(byMode.get().zoom) : 1);
    // The simple board or the full one: each screen mode starts with its own and remembers the teacher's choice.
    const fullBy = core.byMode ? core.byMode('pizarra-completa', {
        early: { on: false }, primary: { on: false }, secondary: { on: true }, advanced: { on: true },
    }) : { get: () => ({ on: false }), set: () => {} };
    const MAX_PAGES = 60, MAX_ZOOM = 6, MIN_ZOOM = 0.25;

    const opt = Object.assign({ colour: COLOURS[1][1], size: 'm', bg: 'blank', tool: 'pen', margin: false, surface: 'white', magic: true }, load('pizarra-dibujo', {}));
    if (!COLOURS.some(([, c]) => c === opt.colour)) { opt.colour = COLOURS[1][1]; }
    if (!SIZES[opt.size]) { opt.size = 'm'; }
    if (!STR.backgrounds[opt.bg]) { opt.bg = 'blank'; }
    if (!SURFACES[opt.surface]) { opt.surface = 'white'; }
    let full = !!fullBy.get().on;
    if (!TOOLS.some(([k]) => k === opt.tool) && !(full && MORE.some(([k]) => k === opt.tool))) { opt.tool = 'pen'; }
    let erasing = false, clearTimer = 0, zoom = zoomNow(), editing = null;

    // --- Pages ----------------------------------------------------------------------------------------------
    // Each page: its strokes, in board units (x and y as shares of the width, so they keep their shape when the board
    // is resized), its background, and maybe a picture with where it goes. A new page takes the background of the
    // one it follows.
    const KEY = 'pizarra-paginas' + (core.moodle ? ':' + core.moodle.courseid : '');
    const IMG = 'pizarra-img:' + (core.moodle ? core.moodle.courseid : 0) + ':';
    const blankPage = (like) => ({ s: [], bg: like ? like.bg : opt.bg, surface: like ? like.surface : opt.surface, margin: like ? !!like.margin : !!opt.margin, img: '', ir: null });
    const num = (x) => (typeof x === 'number' && isFinite(x) ? x : 0);
    // Stored small: the points as whole numbers (ten thousandths of the width).
    const writeStroke = (s) => {
        const o = { c: s.c, w: +num(s.w).toFixed(5), p: s.p.flatMap(([x, y]) => [Math.round(x * 1e4), Math.round(y * 1e4)]) };
        if (s.e) { o.e = 1; }
        if (s.m) { o.m = 1; }
        if (s.k) { o.k = s.k; }
        if (s.k === 'text' || s.k === 'math') { o.t = s.t; o.f = +num(s.f).toFixed(5); }
        return o;
    };
    const readStroke = (o) => {
        if (!o || !Array.isArray(o.p) || o.p.length < 2) { return null; }
        const s = { c: COLOURS.some(([, c]) => c === o.c) ? o.c : COLOURS[0][1], w: Math.min(0.1, Math.abs(num(o.w))) || SIZES.m, p: [] };
        for (let i = 0; i + 1 < o.p.length; i += 2) { s.p.push([num(o.p[i]) / 1e4, num(o.p[i + 1]) / 1e4]); }
        if (o.e) { s.e = true; }
        if (o.m) { s.m = 1; }
        if (KINDS.includes(o.k)) { s.k = o.k; }
        if (SHAPES.includes(s.k) && s.p.length < 2) { return null; }
        if (s.k === 'text' || s.k === 'math') {
            s.t = String(o.t || '').slice(0, s.k === 'math' ? 300 : 120); s.f = Math.min(0.5, Math.abs(num(o.f))) || LETTERS.m;
            if (!s.t) { return null; }
        }
        return s;
    };
    const writePage = (pg) => {
        const o = { bg: pg.bg, surface: pg.surface, margin: pg.margin ? 1 : 0, s: pg.s.map(writeStroke) };
        if (pg.img && pg.ir) { o.img = pg.img; o.ir = pg.ir.map((x) => +x.toFixed(5)); }
        return o;
    };
    const readPage = (o) => {
        const pg = blankPage();
        if (!o || typeof o !== 'object') { return pg; }
        pg.bg = STR.backgrounds[o.bg] ? o.bg : 'blank';
        pg.surface = SURFACES[o.surface] ? o.surface : 'white';
        pg.margin = !!o.margin;
        pg.s = (Array.isArray(o.s) ? o.s : []).map(readStroke).filter(Boolean);
        if (typeof o.img === 'string' && /^[\w:.-]{1,120}$/.test(o.img) && Array.isArray(o.ir) && o.ir.length === 4) { pg.img = o.img; pg.ir = o.ir.map(num); }
        return pg;
    };
    // What this browser has, or what Moodle has if it is newer (drawn on another computer).
    let stored = load(KEY, null);
    const kept = core.kept('board');
    if (kept && typeof kept === 'object' && (kept.updated || 0) > ((stored && stored.updated) || 0)) { stored = kept; }
    const pages = stored && Array.isArray(stored.pages) && stored.pages.length ? stored.pages.slice(0, MAX_PAGES).map(readPage) : [blankPage()];
    let cur = Math.max(0, Math.min(pages.length - 1, Number(stored && stored.at) || 0));
    const page = () => pages[cur];
    let saveTimer = 0;
    const flush = () => {
        clearTimeout(saveTimer); saveTimer = 0;
        const data = { updated: Date.now(), at: cur, pages: pages.map(writePage) };
        save(KEY, data);
        // Moodle keeps up to 200 kB for each tool: a bigger board stays in this browser only.
        const big = JSON.stringify(data).length > 190000;
        if (!big) { core.keep('board', data); }
        $('#wb-big').textContent = big ? STR.tooBig : '';
    };
    const persist = () => { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 700); };
    // (Before the page goes away: Moodle gets it with what the other tools still have to send.)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) { flush(); } });

    // Undo and redo, for each page: what was done and how to take it back.
    const logs = new WeakMap();
    const log = (pg = page()) => { if (!logs.has(pg)) { logs.set(pg, { done: [], undone: [] }); } return logs.get(pg); };
    const record = (op, pg = page()) => { const l = log(pg); l.done.push(op); l.undone.length = 0; if (l.done.length > 400) { l.done.shift(); } };
    const drop = (list, s) => { const i = list.lastIndexOf(s); if (i >= 0) { list.splice(i, 1); } };

    // --- The screen -----------------------------------------------------------------------------------------
    const seg = (id, label, list) => `<div class="segmentos ct-wb-tools" role="radiogroup" aria-label="${escape(label)}" id="${id}">
        ${list.map(([k, icon]) => `<button type="button" role="radio" data-v="${k}" aria-label="${escape(t('wb_t_' + k))}" title="${escape(t('wb_t_' + k))}"><span data-icono="${icon}"></span></button>`).join('')}</div>`;
    const iconButton = (id, icon, label, cls = 'suave') => `<button type="button" class="boton ${cls} ct-wb-redo" id="${id}" aria-label="${escape(label)}" title="${escape(label)}"><span data-icono="${icon}"></span></button>`;
    root.innerHTML = `
        <div class="barra-herr ct-top ct-wb-bar">
            ${seg('wb-tools', STR.tool, TOOLS)}
            <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.colours)}" id="wb-colours">
                ${COLOURS.map(([n, c]) => `<button type="button" role="radio" class="ct-swatch" data-v="${c}" style="--c:${c}" aria-label="${escape(n)}" title="${escape(n)}"></button>`).join('')}
            </div>
            <div class="segmentos ct-wb-sizes" role="radiogroup" aria-label="${escape(STR.size)}" id="wb-size">
                ${Object.entries(STR.sizes).map(([k, v]) => `<button type="button" role="radio" data-v="${k}" aria-label="${escape(v)}" title="${escape(v)}"><span class="ct-wb-dot ct-wb-${k}"></span></button>`).join('')}
            </div>
            <button type="button" class="boton suave ct-wb-redo" id="wb-eraser" aria-pressed="false" aria-label="${escape(STR.eraser)}" title="${escape(STR.eraser)}"><span data-icono="goma"></span></button>
            <span class="ct-wb-hist">${iconButton('wb-undo', 'deshacer', STR.undo)}${iconButton('wb-redo', 'rehacer', STR.redo)}</span>
            <div class="ct-wb-fondo">
                <button type="button" class="boton suave" id="wb-bg-open" aria-expanded="false" aria-controls="wb-bg-panel" title="${escape(STR.background)}"><span id="wb-bg-name"></span><span data-icono="abajo"></span></button>
                <div class="tarjeta ct-wb-panel" id="wb-bg-panel" hidden>
                    <p class="ante">${escape(STR.background)}</p>
                    <div class="ct-wb-fondos" role="radiogroup" aria-label="${escape(STR.background)}" id="wb-bg">
                        ${Object.entries(STR.backgrounds).map(([k, v]) => `<button type="button" role="radio" data-v="${k}"><span class="ct-wb-muestra ct-wb-m-${k}" aria-hidden="true"></span>${escape(v)}</button>`).join('')}
                    </div>
                    <p class="ante">${escape(STR.surface)}</p>
                    <div class="segmentos ct-wb-surfaces" role="radiogroup" aria-label="${escape(STR.surface)}" id="wb-surface">
                        ${Object.entries(STR.surfaces).map(([k, v]) => `<button type="button" role="radio" data-v="${k}"><span class="ct-wb-sf" style="--c:${SURFACES[k]}" aria-hidden="true"></span>${escape(v)}</button>`).join('')}
                    </div>
                    <p class="ante">${escape(STR.bgSize)}</p>
                    <div class="giro grande-giro ct-wb-zoom">
                        <button type="button" class="redondo suave" id="wb-zoom-less" aria-label="${escape(STR.smaller)}" title="${escape(STR.smaller)}"><span data-icono="menos"></span></button>
                        <output id="wb-zoom"></output>
                        <button type="button" class="redondo suave" id="wb-zoom-more" aria-label="${escape(STR.bigger)}" title="${escape(STR.bigger)}"><span data-icono="mas"></span></button>
                    </div>
                    <label class="interruptor"><input type="checkbox" id="wb-margin"><span>${escape(STR.margin)}</span></label>
                    <button type="button" class="boton suave" id="wb-img-del" hidden><span data-icono="borrar"></span><span>${escape(STR.imageRemove)}</span></button>
                </div>
            </div>
            ${iconButton('wb-download', 'descargar', STR.download)}
            ${AULA ? iconButton('wb-send', 'enviar', STR.send, '') : ''}
            <button type="button" class="boton suave ct-wb-redo" id="wb-full" aria-pressed="false" aria-label="${escape(STR.full)}" title="${escape(STR.full)}"><span data-icono="completa"></span></button>
            <button type="button" class="boton rojo-suave ct-push" id="wb-clear"><span data-icono="borrar"></span><span>${STR.clear}</span></button>
        </div>
        <div class="barra-herr ct-wb-bar2" id="wb-bar2" role="toolbar" aria-label="${escape(STR.more)}" hidden>
            ${seg('wb-more', STR.tool, MORE)}
            <button type="button" class="boton suave ct-wb-redo" id="wb-magic" aria-pressed="false" aria-label="${escape(STR.magic)}" title="${escape(STR.magic)}"><span data-icono="magia"></span></button>
            <span class="ct-wb-kit" id="wb-kit"></span>
            ${iconButton('wb-import', 'imagen', STR.image)}
            <span class="ct-wb-zoomer ct-push">
                ${iconButton('wb-out', 'lupa-menos', STR.zoomOut)}
                <button type="button" class="boton suave ct-wb-pct" id="wb-pct" title="${escape(STR.zoomReset)}" aria-label="${escape(STR.zoomReset)}"></button>
                ${iconButton('wb-in', 'lupa-mas', STR.zoomIn)}
                ${iconButton('wb-fit', 'encajar', STR.fit)}
            </span>
            <span class="ct-wb-pager">
                ${iconButton('wb-prev', 'anterior', STR.prev)}
                <button type="button" class="boton suave" id="wb-pages" aria-expanded="false" aria-controls="wb-drawer" title="${escape(STR.pages)}"><span data-icono="paginas"></span><span id="wb-page-n"></span></button>
                ${iconButton('wb-next', 'siguiente', STR.next)}
                ${iconButton('wb-new', 'mas', STR.newPage)}
            </span>
        </div>
        <div class="tarjeta ct-wb-stage" id="wb-stage">
            <canvas class="ct-wb-bgcanvas" id="wb-bgc" aria-hidden="true"></canvas>
            <canvas class="ct-wb-ink" id="wb-ink" role="img" aria-label="${escape(STR.board)}"></canvas>
            <canvas class="ct-wb-pre" id="wb-pre" aria-hidden="true"></canvas>
            <canvas class="ct-wb-fx" id="wb-fx" aria-hidden="true"></canvas>
            <p class="ct-wb-status" id="wb-status" role="status" hidden></p>
            <div class="ct-wb-selbar" id="wb-selbar" hidden>
                ${iconButton('wb-sel-copy', 'duplicar', STR.selCopy)}${iconButton('wb-sel-del', 'borrar', STR.selDelete, 'rojo-suave')}
            </div>
        </div>
        <div class="ct-wb-drawer" id="wb-drawer" hidden>
            <div class="ct-wb-thumbs" id="wb-thumbs" role="list" aria-label="${escape(STR.pages)}"></div>
            <div class="ct-wb-drawer-acts">
                <button type="button" class="boton suave" id="wb-dup"><span data-icono="duplicar"></span><span>${escape(STR.dupPage)}</span></button>
                <button type="button" class="boton rojo-suave" id="wb-del"><span data-icono="borrar"></span><span>${escape(STR.delPage)}</span></button>
                <p class="nota" id="wb-big"></p>
            </div>
        </div>`;
    $$('[data-icono]', root).forEach((e) => setIcon(e, e.dataset.icono));
    const stage = $('#wb-stage'), bgc = $('#wb-bgc'), ink = $('#wb-ink'), pre = $('#wb-pre'), fx = $('#wb-fx');
    let W = 1, H = 1, dpr = 1;
    let painting = null;   // the page being painted (the one on screen, or one in a thumbnail)

    // --- The view: zoom and where the screen is on the page (only in the full board) -------------------------
    const SAME = Object.freeze({ z: 1, x: 0, y: 0 });
    const view = () => {
        if (!full) { return SAME; }
        if (!page().v) { page().v = { z: 1, x: 0, y: 0 }; }
        return page().v;
    };
    // Board units to the canvas: the pixels of a width, then the zoom and the scroll.
    const place = (ctx, v = view()) => ctx.setTransform(dpr * v.z, 0, 0, dpr * v.z, -v.x * W * v.z * dpr, -v.y * W * v.z * dpr);
    const point = (e) => { const r = ink.getBoundingClientRect(), v = view(); return [(e.clientX - r.left) / (W * v.z) + v.x, (e.clientY - r.top) / (W * v.z) + v.y]; };
    const toScreen = ([x, y], v = view()) => [(x - v.x) * W * v.z, (y - v.y) * W * v.z];
    const watchers = { view: [], full: [] };
    const tell = (k) => watchers[k].forEach((f) => { try { f(); } catch (err) { /* a helper that fails does not stop the board */ } });

    // --- Pictures (and PDF pages), kept in this browser ------------------------------------------------------
    const MISSING = 'missing';
    const pictures = new Map();   // id → image, null while it loads, or MISSING (it is in another browser)
    const memory = new Map();     // if the browser cannot keep them (a private window), only while the page is open
    let db = null;
    const idb = (mode, fn) => {
        db = db || new Promise((ok, ko) => {
            try {
                const r = indexedDB.open('classtools-pizarra', 1);
                r.onupgradeneeded = () => r.result.createObjectStore('img');
                r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
            } catch (err) { ko(err); }
        });
        return db.then((base) => new Promise((ok, ko) => {
            const tx = base.transaction('img', mode), req = fn(tx.objectStore('img'));
            tx.oncomplete = () => ok(req && req.result); tx.onerror = () => ko(tx.error);
        }));
    };
    const store = {
        put: (k, v) => idb('readwrite', (s) => s.put(v, k)).catch(() => { memory.set(k, v); }),
        get: (k) => (memory.has(k) ? Promise.resolve(memory.get(k)) : idb('readonly', (s) => s.get(k)).catch(() => undefined)),
        del: (k) => { memory.delete(k); return idb('readwrite', (s) => s.delete(k)).catch(() => {}); },
        keys: () => idb('readonly', (s) => s.getAllKeys()).catch(() => []),
    };
    const imageOf = (blob) => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = URL.createObjectURL(blob); });
    const picture = (id) => {
        if (!pictures.has(id)) {
            pictures.set(id, null);
            store.get(id).then((blob) => (blob ? imageOf(blob) : MISSING)).catch(() => MISSING)
                .then((im) => { pictures.set(id, im); paintBackground(); thumbsSoon(); });
        }
        return pictures.get(id);
    };
    // The pictures of this course that no page uses any more go away.
    const tidy = () => store.keys().then((keys) => {
        const used = new Set(pages.map((p) => p.img).filter(Boolean));
        (keys || []).filter((k) => typeof k === 'string' && k.startsWith(IMG) && !used.has(k)).forEach((k) => store.del(k));
    });

    // --- Backgrounds ---------------------------------------------------------------------------------------
    const isDark = (pg) => pg.surface !== 'white';
    const drawBackground = (ctx, pg, v) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = SURFACES[pg.surface]; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        place(ctx, v);
        // What is on screen, in the pixels of a width.
        const x0 = v.x * W, y0 = v.y * W, x1 = x0 + W / v.z, y1 = y0 + H / v.z;
        if (pg.img && pg.ir) {
            const im = picture(pg.img), [ix, iy, iw, ih] = pg.ir.map((n) => n * W);
            if (im && im !== MISSING) { ctx.drawImage(im, ix, iy, iw, ih); } else if (im === MISSING) {
                ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = '#9aa8bd'; ctx.lineWidth = 2; ctx.strokeRect(ix, iy, iw, ih);
                ctx.fillStyle = '#6b7a90'; ctx.font = `700 ${Math.max(12, W / 70)}px Nunito, system-ui, sans-serif`; ctx.textAlign = 'center';
                ctx.fillText(STR.imageMissing, ix + iw / 2, iy + ih / 2, iw * 0.9); ctx.restore();
            }
        }
        const dark = isDark(pg);
        const u = (W / 40) * zoom;   // a square of the grid: a fortieth of the width, bigger or smaller
        ctx.lineWidth = Math.max(1, W / 1400) / Math.min(1, v.z);
        const across = (y, colour) => { ctx.strokeStyle = colour; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); };
        const faint = dark ? 'rgba(255, 255, 255, .16)' : '#d6e0ee', base = dark ? 'rgba(255, 255, 255, .34)' : '#8fa6c8';
        const first = (step) => Math.floor(y0 / step) * step;
        if (pg.bg === 'grid') {
            ctx.strokeStyle = dark ? 'rgba(255, 255, 255, .18)' : '#cfdaea';
            ctx.beginPath();
            for (let x = Math.floor(x0 / u) * u; x <= x1; x += u) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
            for (let y = first(u); y <= y1; y += u) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
            ctx.stroke();
        } else if (pg.bg === 'lines') {
            // Handwriting lines: two guide lines for the small letters inside each pair of base lines.
            const row = u * 3;
            for (let y = first(row); y <= y1 + row; y += row) { across(y - 2 * u, faint); across(y - u, faint); across(y, base); }
        } else if (pg.bg === 'double') {
            // Double lines: the small letters sit in the narrow band, the tall ones go above it.
            const row = u * 2.8, line = dark ? 'rgba(255, 255, 255, .3)' : '#9db2d2';
            for (let y = first(row); y <= y1 + row; y += row) { across(y - u, line); across(y, line); }
        } else if (pg.bg === 'ruled') {
            const row = u * 1.4, line = dark ? 'rgba(255, 255, 255, .28)' : '#a9bad3';
            for (let y = first(row); y <= y1; y += row) { across(y, line); }
        } else if (pg.bg === 'staff') {
            // Music staves: as many as fit in the page, spread over its height (and on, below it).
            const gap = u * 0.75, staff = gap * 4, room = u * 1.6;
            const n = Math.max(1, Math.floor((H - room) / (staff + room)));
            const space = (H - n * staff) / (n + 1), every = staff + space;
            ctx.strokeStyle = dark ? 'rgba(255, 255, 255, .45)' : '#7f8fa6';
            ctx.beginPath();
            for (let top = space + Math.floor((y0 - space) / every) * every; top <= y1; top += every) {
                for (let k = 0; k < 5; k++) { const y = top + k * gap; ctx.moveTo(u, y); ctx.lineTo(W - u, y); }
            }
            ctx.stroke();
        }
        // The margin of the notebooks: a red line on the left (on a line of the grid when there is one).
        if (pg.margin) {
            const x = Math.max(u, Math.round((W * 0.08) / u) * u);
            ctx.strokeStyle = dark ? 'rgba(255, 140, 140, .7)' : '#e0626d'; ctx.lineWidth = Math.max(1.5, W / 800) / Math.min(1, v.z);
            ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
        }
    };
    const paintBackground = () => { painting = page(); drawBackground(bgc.getContext('2d'), page(), view()); };

    // --- Ink ------------------------------------------------------------------------------------------------
    const colourOf = (c) => (painting && isDark(painting) && CHALK[c]) || c;
    // The highlighter goes see-through and multiplied, like a real one: what is under it still shows (also a shape
    // made with it, m).
    const pen = (ctx, s) => {
        const marker = s.k === 'hl' || s.m;
        ctx.globalCompositeOperation = s.e ? 'destination-out' : (marker ? 'multiply' : 'source-over');
        ctx.globalAlpha = marker ? 0.4 : 1;
        ctx.strokeStyle = colourOf(s.c); ctx.fillStyle = colourOf(s.c);
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
    // A shape with corners (a triangle, a quadrilateral): straight sides.
    const drawPoly = (ctx, s) => {
        pen(ctx, s);
        ctx.beginPath();
        s.p.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * W) : ctx.moveTo(x * W, y * W)));
        ctx.stroke();
    };
    const drawMath = (ctx, s) => {
        pen(ctx, s);
        if (window.ClasstoolsFormula) { window.ClasstoolsFormula.draw(ctx, s.t, s.p[0][0] * W, s.p[0][1] * W, s.f * W, colourOf(s.c)); }
    };
    const drawText = (ctx, s) => {
        pen(ctx, s);
        ctx.font = `800 ${s.f * W}px Nunito, system-ui, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(s.t, s.p[0][0] * W, s.p[0][1] * W);
    };
    const drawStroke = (ctx, s) => {
        // (The highlighter is drawn whole, so it does not darken where it crosses itself.)
        if (s.k === 'text') { drawText(ctx, s); } else if (s.k === 'math') { drawMath(ctx, s); } else if (s.k === 'poly') { drawPoly(ctx, s); } else if (SHAPES.includes(s.k)) { drawShape(ctx, s); } else { drawSegment(ctx, s, 1); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    };
    const ictx = () => { const c = ink.getContext('2d'); place(c); return c; };
    const buttons = () => {
        $('#wb-undo').disabled = !log().done.length; $('#wb-redo').disabled = !log().undone.length;
        $('#wb-sel-copy').disabled = $('#wb-sel-del').disabled = !sel.length;
    };
    const drawing = (s) => [...live.values()].some((g) => g.s === s);
    const redraw = () => {
        painting = page();
        const ctx = ink.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ink.width, ink.height);
        place(ctx);
        page().s.forEach((s) => { if (!s.k || !drawing(s)) { drawStroke(ctx, s); } });
        preview();
        buttons();
    };
    // Shapes and the highlighter while they are being drawn, the selection and the box that selects go on a layer of
    // their own; on lifting, onto the ink.
    const preview = () => {
        const ctx = pre.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, pre.width, pre.height);
        place(ctx);
        live.forEach((g) => {
            if (g.s && g.s.k) { drawStroke(ctx, g.s); }
            if (g.box) { outlineBox(ctx, g.box[0][0], g.box[0][1], g.box[1][0], g.box[1][1], false); }
        });
        showSelection(ctx);
    };
    const changed = () => { buttons(); persist(); thumbsSoon(); };
    const add = (s) => {
        const pg = page();
        pg.s.push(s);
        const op = { undo: () => drop(pg.s, s), redo: () => pg.s.push(s) };
        record(op, pg); changed();
        return op;
    };
    const layout = () => {
        const box = stage.getBoundingClientRect();
        if (!box.width) { return; }
        W = box.width; H = box.height; dpr = Math.min(2, window.devicePixelRatio || 1);
        [bgc, ink, pre, fx].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
        paintBackground(); redraw(); tell('view'); thumbsSoon();
    };
    // After the view moves: everything again, once a frame.
    let frame = 0;
    const moved = () => {
        if (frame) { return; }
        frame = requestAnimationFrame(() => { frame = 0; paintBackground(); redraw(); tell('view'); paintZoom(); });
    };

    // A stroke drawn by hand keeps only the points it needs (a straight bit needs two).
    const segDist = (q, a, b) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
        const k = l ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l)) : 0;
        return Math.hypot(q[0] - a[0] - k * dx, q[1] - a[1] - k * dy);
    };
    const simplify = (pts, eps) => {
        if (pts.length < 3) { return pts; }
        const keep = new Uint8Array(pts.length), todo = [[0, pts.length - 1]];
        keep[0] = keep[pts.length - 1] = 1;
        while (todo.length) {
            const [a, b] = todo.pop();
            let far = -1, best = eps;
            for (let i = a + 1; i < b; i++) { const d = segDist(pts[i], pts[a], pts[b]); if (d > best) { best = d; far = i; } }
            if (far > 0) { keep[far] = 1; todo.push([a, far], [far, b]); }
        }
        return pts.filter((_, i) => keep[i]);
    };

    // --- Pointers -------------------------------------------------------------------------------------------
    // Each finger (or the mouse) does one thing: draw, select or move what is selected, move around the page, or
    // point. Several can draw at once.
    const live = new Map();
    const snappers = [];   // instruments.js: the edges of the ruler and the set squares, which straighten a stroke
    const pans = new Map();
    ink.addEventListener('pointerdown', (e) => {
        if (e.button > 0) { return; }
        e.preventDefault();
        const at = point(e);
        const tool = erasing ? 'eraser' : opt.tool;
        if (tool === 'text') { writeAt(at); return; }
        if (tool === 'formula') { formulaAt(at); return; }
        finishText();
        try { ink.setPointerCapture(e.pointerId); } catch (err) { /* a pointer that cannot be captured still draws */ }
        if (tool === 'hand') { pans.set(e.pointerId, [e.clientX, e.clientY]); live.set(e.pointerId, { pan: true }); return; }
        if (tool === 'laser') { laser.press(e); live.set(e.pointerId, { laser: true }); return; }
        if (tool === 'select') { selectDown(e, at); return; }
        if (sel.length) { unselect(); }
        let s;
        if (tool === 'eraser') { s = { c: opt.colour, w: ERASER, e: true, p: [at] }; } else if (tool === 'hl') {
            s = { k: 'hl', c: opt.colour, w: MARKER[opt.size], p: [at] };
        } else if (SHAPES.includes(tool)) {
            s = { k: tool, c: opt.colour, w: SIZES[opt.size], p: [at, at] };
        } else { s = { c: opt.colour, w: SIZES[opt.size], e: false, p: [at] }; }
        // Along the edge of a ruler or a set square, a stroke goes straight.
        const snap = full && ['pen', 'hl', 'line', 'arrow'].includes(tool) ? snappers.map((f) => f(at, s.w)).find(Boolean) : null;
        if (snap) { s.p = s.p.map(snap); }
        const op = add(s);
        live.set(e.pointerId, { s, snap, op, magic: opt.magic && !snap && (tool === 'pen' || tool === 'hl') ? 'wait' : '' });
        if (s.k) { preview(); } else { drawSegment(ictx(), s, 1); ictx().globalCompositeOperation = 'source-over'; }
    });
    ink.addEventListener('pointermove', (e) => {
        if (opt.tool === 'laser' && full && !erasing) { laser.move(e); }
        const g = live.get(e.pointerId);
        if (!g) { return; }
        if (g.pan) { panMove(e); return; }
        if (g.sel) { selectMove(g, point(e)); return; }
        const s = g.s;
        if (!s || g.magic === 'done') { return; }
        // Kept still for a moment at the end: the stroke becomes the shape it looks like.
        if (g.magic === 'wait' && (!g.still || Math.hypot(e.clientX - g.still[0], e.clientY - g.still[1]) > 5)) {
            g.still = [e.clientX, e.clientY];
            clearTimeout(g.hold); g.hold = setTimeout(() => magic(e.pointerId), 600);
        }
        const fix = g.snap || ((q) => q);
        if (SHAPES.includes(s.k)) { s.p[1] = fix(point(e)); preview(); return; }
        const before = s.p.length;
        const all = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        (all.length ? all : [e]).forEach((ev) => s.p.push(fix(point(ev))));
        if (s.k) { preview(); return; }
        const ctx = ictx(); drawSegment(ctx, s, before);
        ctx.globalCompositeOperation = 'source-over';
    });
    const end = (e) => {
        const g = live.get(e.pointerId);
        live.delete(e.pointerId);
        if (opt.tool === 'laser') { laser.release(e); }
        if (!g) { return; }
        if (g.pan) { pans.delete(e.pointerId); return; }
        if (g.sel) { selectUp(g); return; }
        clearTimeout(g.hold);
        const s = g.s;
        if (!s) { return; }
        if (SHAPES.includes(s.k) && Math.hypot(s.p[1][0] - s.p[0][0], s.p[1][1] - s.p[0][1]) < 0.004) {
            // A shape that did not grow (a tap) is not kept.
            drop(page().s, s);
            const l = log(), i = l.done.lastIndexOf(g.op);
            if (i >= 0) { l.done.splice(i, 1); }
        } else {
            if (!SHAPES.includes(s.k) && s.k !== 'poly') { s.p = simplify(s.p, 0.00035); }
            if (s.k) { drawStroke(ictx(), s); }
        }
        changed();
        preview();
    };
    // --- Magic shapes --------------------------------------------------------------------------------------
    // What a stroke by hand looks like: a straight line (level or upright if it nearly is), a circle or an ellipse, a
    // triangle, a rectangle or another quadrilateral; or nothing (then it stays as it was drawn).
    const recognise = (pts) => {
        if (pts.length < 5) { return null; }
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, len = 0;
        pts.forEach(([x, y], i) => {
            x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
            if (i) { len += Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]); }
        });
        const size = Math.hypot(x1 - x0, y1 - y0), first = pts[0], last = pts[pts.length - 1];
        if (size < 0.015) { return null; }
        const gap = Math.hypot(last[0] - first[0], last[1] - first[1]);
        if (gap > 0.22 * size || len < 1.8 * size) {
            // Open: a line if every point is near the one from the start to the end.
            const far = Math.max(...pts.map((q) => segDist(q, first, last)));
            if (far > 0.07 * gap) { return null; }
            let [a, b] = [first.slice(), last.slice()];
            const ang = Math.abs(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI);
            if (ang < 6 || ang > 174) { const y = (a[1] + b[1]) / 2; a[1] = y; b[1] = y; }
            if (Math.abs(ang - 90) < 6) { const x = (a[0] + b[0]) / 2; a[0] = x; b[0] = x; }
            return { k: 'line', p: [a, b] };
        }
        // Closed: its corners (the points the outline turns at), then what it is.
        const loop = simplify(pts.concat([first]), 0.07 * size).slice(0, -1);
        const turn = (p, a, b) => {
            const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
            return Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / ((Math.hypot(...u) * Math.hypot(...v)) || 1)))) * 180 / Math.PI;
        };
        let corners = loop.filter((p, i) => turn(p, loop[(i + loop.length - 1) % loop.length], loop[(i + 1) % loop.length]) < 150);
        // Two corners almost on top of each other (where the stroke started and ended) are one.
        corners = corners.filter((p, i) => Math.hypot(p[0] - corners[(i + 1) % corners.length][0], p[1] - corners[(i + 1) % corners.length][1]) > 0.08 * size);
        // A side that is nearly level (or upright) is made so.
        const square = (vs) => {
            vs = vs.map((q) => q.slice());
            vs.forEach((p, i) => {
                const q = vs[(i + 1) % vs.length], a = Math.abs(Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI);
                if (a < 6 || a > 174) { const y = (p[1] + q[1]) / 2; p[1] = y; q[1] = y; }
                if (Math.abs(a - 90) < 6) { const x = (p[0] + q[0]) / 2; p[0] = x; q[0] = x; }
            });
            return [...vs, vs[0]];
        };
        if (corners.length === 3) { return { k: 'poly', p: square(corners) }; }
        if (corners.length === 4) {
            const level = corners.every((p, i) => {
                const q = corners[(i + 1) % 4], a = Math.abs(Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI) % 90;
                return a < 12 || a > 78;
            });
            if (level) { return { k: 'rect', p: [[x0, y0], [x1, y1]] }; }
            return { k: 'poly', p: square(corners) };
        }
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
        const off = pts.reduce((t, [x, y]) => t + Math.abs(Math.hypot((x - cx) / (rx || 1e-6), (y - cy) / (ry || 1e-6)) - 1), 0) / pts.length;
        if (off > 0.11) { return null; }
        // Nearly round: a circle.
        if (Math.abs(rx - ry) / Math.max(rx, ry) < 0.14) { const r = (rx + ry) / 2; return { k: 'ellipse', p: [[cx - r, cy - r], [cx + r, cy + r]] }; }
        return { k: 'ellipse', p: [[x0, y0], [x1, y1]] };
    };
    function magic(id) {
        const g = live.get(id);
        if (!g || g.magic !== 'wait' || !g.s) { return; }
        const shape = recognise(g.s.p);
        if (!shape) { return; }
        const pg = page(), old = g.s, i = pg.s.indexOf(old);
        if (i < 0) { return; }
        const made = Object.assign({ c: old.c, w: old.w }, shape, old.k === 'hl' ? { m: 1 } : {});
        pg.s[i] = made;
        record({ undo: () => { const j = pg.s.indexOf(made); if (j >= 0) { pg.s[j] = old; } }, redo: () => { const j = pg.s.indexOf(old); if (j >= 0) { pg.s[j] = made; } } }, pg);
        g.s = made; g.magic = 'done';
        redraw();
        core.play('tic');
    }

    ink.addEventListener('pointerup', end);
    ink.addEventListener('pointercancel', end);
    ink.addEventListener('pointerleave', (e) => { if (opt.tool === 'laser') { laser.release(e, true); } });

    // Moving around the page: one finger drags it, two pinch to zoom; the wheel scrolls and, with Ctrl (or pinching a
    // touchpad), zooms.
    const zoomAt = (k, sx, sy) => {
        const v = view();
        if (!full) { return; }
        const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.z * k));
        const bx = sx / (W * v.z) + v.x, by = sy / (W * v.z) + v.y;
        v.x = bx - sx / (W * z); v.y = by - sy / (W * z); v.z = z;
        finishText(); moved();
    };
    const panMove = (e) => {
        const before = [...pans.values()].slice(0, 2).map((p) => p.slice());
        pans.set(e.pointerId, [e.clientX, e.clientY]);
        const now = [...pans.values()].slice(0, 2), v = view(), r = stage.getBoundingClientRect();
        if (now.length > 1) {
            const mid = (l) => [(l[0][0] + l[1][0]) / 2 - r.left, (l[0][1] + l[1][1]) / 2 - r.top];
            const far = (l) => Math.max(1, Math.hypot(l[0][0] - l[1][0], l[0][1] - l[1][1]));
            const [m0, m1] = [mid(before), mid(now)];
            zoomAt(far(now) / far(before), m1[0], m1[1]);
            v.x -= (m1[0] - m0[0]) / (W * v.z); v.y -= (m1[1] - m0[1]) / (W * v.z);
        } else {
            v.x -= (now[0][0] - before[0][0]) / (W * v.z); v.y -= (now[0][1] - before[0][1]) / (W * v.z);
        }
        moved();
    };
    stage.addEventListener('wheel', (e) => {
        if (!full || e.target.closest('.ct-wb-cortina')) { return; }
        e.preventDefault();
        const r = stage.getBoundingClientRect(), line = e.deltaMode === 1 ? 16 : 1;
        if (e.ctrlKey || e.metaKey) { zoomAt(Math.exp(-e.deltaY * line * 0.0018), e.clientX - r.left, e.clientY - r.top); return; }
        const v = view(), dx = (e.shiftKey ? e.deltaY : e.deltaX) * line, dy = (e.shiftKey ? 0 : e.deltaY) * line;
        v.x += dx / (W * v.z); v.y += dy / (W * v.z);
        finishText(); moved();
    }, { passive: false });
    const paintZoom = () => {
        const v = view();
        $('#wb-pct').textContent = `${Math.round(v.z * 100)} %`;
        $('#wb-out').disabled = v.z <= MIN_ZOOM; $('#wb-in').disabled = v.z >= MAX_ZOOM;
        $('#wb-fit').hidden = !page().ir;
    };
    $('#wb-in').addEventListener('click', () => zoomAt(1.25, W / 2, H / 2));
    $('#wb-out').addEventListener('click', () => zoomAt(0.8, W / 2, H / 2));
    $('#wb-pct').addEventListener('click', () => { Object.assign(view(), { z: 1, x: 0, y: 0 }); finishText(); moved(); });
    // The picture of the page as wide as the screen (to read a sheet), or the whole page again.
    $('#wb-fit').addEventListener('click', () => {
        const ir = page().ir, v = view();
        if (!ir) { return; }
        const wide = Math.min(MAX_ZOOM, 1 / ir[2]);
        Object.assign(v, Math.abs(v.z - wide) < 0.01 && Math.abs(v.x - ir[0]) < 0.001 ? { z: 1, x: 0, y: 0 } : { z: wide, x: ir[0], y: ir[1] });
        finishText(); moved();
    });

    // The laser pointer: a red dot with a short trail that fades; nothing stays on the board.
    const laser = (() => {
        const trail = [];
        let held = false, last = null, running = 0;
        const at = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        const paint = () => {
            running = 0;
            const ctx = fx.getContext('2d'), now = performance.now();
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
            if (held && last) { trail.push([last[0], last[1], now]); }
            while (trail.length && now - trail[0][2] > 600) { trail.shift(); }
            if (!trail.length) { return; }
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            for (let i = 1; i < trail.length; i++) {
                const a = Math.max(0, 1 - (now - trail[i][2]) / 600);
                ctx.strokeStyle = `rgba(255, 36, 36, ${(a * 0.75).toFixed(3)})`; ctx.lineWidth = 2 + 6 * a;
                ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
            }
            const [x, y] = trail[trail.length - 1], glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
            glow.addColorStop(0, 'rgba(255, 255, 255, 1)'); glow.addColorStop(0.22, 'rgba(255, 40, 40, 1)'); glow.addColorStop(1, 'rgba(255, 40, 40, 0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
            running = requestAnimationFrame(paint);
        };
        const go = () => { if (!running) { running = requestAnimationFrame(paint); } };
        return {
            press: (e) => { held = true; last = at(e); trail.push([...last, performance.now()]); go(); },
            // A mouse points without pressing; a finger, only while it touches.
            move: (e) => { if (e.pointerType === 'mouse' || held) { last = at(e); held = held || e.pointerType === 'mouse'; trail.push([...last, performance.now()]); go(); } },
            release: (e, gone) => { if (gone || e.pointerType !== 'mouse') { held = false; } },
            stop: () => { held = false; trail.length = 0; go(); },
        };
    })();

    // --- Selecting ------------------------------------------------------------------------------------------
    // A tap selects what is under it (Shift adds); dragging from an empty place selects what falls inside the box.
    // What is selected moves by dragging it, grows or shrinks from its corner, and can be copied, recoloured, made
    // thicker or thinner, or deleted.
    let sel = [];
    const measure = document.createElement('canvas').getContext('2d');
    const bbox = (s) => {
        if (s.k === 'math' && window.ClasstoolsFormula) {
            const m = window.ClasstoolsFormula.measure(s.t, s.f * 1000);
            return [s.p[0][0], s.p[0][1], s.p[0][0] + m.w / 1000, s.p[0][1] + m.h / 1000];
        }
        if (s.k === 'text') {
            measure.font = `800 ${s.f * 1000}px Nunito, system-ui, sans-serif`;
            return [s.p[0][0], s.p[0][1], s.p[0][0] + measure.measureText(s.t).width / 1000, s.p[0][1] + s.f * 1.15];
        }
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        s.p.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
        const m = (s.w || 0) / 2;
        return [x0 - m, y0 - m, x1 + m, y1 + m];
    };
    const selBox = () => sel.map(bbox).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
    const outline = (s) => {
        const [[x0, y0], [x1, y1]] = s.p.length > 1 ? s.p : [s.p[0], s.p[0]];
        if (s.k === 'rect') { return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]; }
        if (s.k === 'ellipse') {
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
            return Array.from({ length: 49 }, (_, i) => [cx + rx * Math.cos((i * Math.PI) / 24), cy + ry * Math.sin((i * Math.PI) / 24)]);
        }
        return s.p;
    };
    const hits = (s, q, tol) => {
        if (s.e) { return false; }
        if (s.k === 'text' || s.k === 'math') { const [x0, y0, x1, y1] = bbox(s); return q[0] >= x0 - tol && q[0] <= x1 + tol && q[1] >= y0 - tol && q[1] <= y1 + tol; }
        const pts = outline(s), r = tol + (s.w || 0) / 2;
        if (pts.length === 1) { return Math.hypot(q[0] - pts[0][0], q[1] - pts[0][1]) <= r; }
        for (let i = 1; i < pts.length; i++) { if (segDist(q, pts[i - 1], pts[i]) <= r) { return true; } }
        return false;
    };
    const snapshot = (list) => new Map(list.map((s) => [s, { p: s.p.map((q) => q.slice()), f: s.f, w: s.w, c: s.c }]));
    const restore = (snap) => snap.forEach((v, s) => { s.p = v.p.map((q) => q.slice()); s.f = v.f; s.w = v.w; s.c = v.c; });
    const commit = (before, list) => {
        const after = snapshot(list);
        record({ undo: () => restore(before), redo: () => restore(after) });
        changed();
    };
    const unselect = () => { if (sel.length) { sel = []; preview(); buttons(); } };
    const outlineBox = (ctx, x0, y0, x1, y1, handle) => {
        const z = view().z;
        ctx.save();
        ctx.lineWidth = 1.5 / z; ctx.setLineDash([7 / z, 5 / z]); ctx.strokeStyle = '#1d6fd8';
        ctx.fillStyle = 'rgba(29, 111, 216, .06)';
        const [a, b, c, d] = [Math.min(x0, x1) * W, Math.min(y0, y1) * W, Math.abs(x1 - x0) * W, Math.abs(y1 - y0) * W];
        ctx.fillRect(a, b, c, d); ctx.strokeRect(a, b, c, d);
        if (handle) {
            const h = 9 / z;
            ctx.setLineDash([]); ctx.fillStyle = '#fff'; ctx.lineWidth = 2 / z;
            ctx.fillRect(a + c - h, b + d - h, h * 2, h * 2); ctx.strokeRect(a + c - h, b + d - h, h * 2, h * 2);
        }
        ctx.restore();
    };
    const showSelection = (ctx) => {
        const bar = $('#wb-selbar');
        if (!sel.length) { bar.hidden = true; return; }
        const pad = 6 / (W * view().z), [x0, y0, x1, y1] = selBox();
        outlineBox(ctx, x0 - pad, y0 - pad, x1 + pad, y1 + pad, true);
        const [sx, sy] = toScreen([x0 - pad, y0 - pad]), [, ey] = toScreen([x1, y1 + pad]);
        bar.hidden = false;
        bar.style.left = `${Math.max(4, Math.min(W - bar.offsetWidth - 4, sx))}px`;
        bar.style.top = `${sy - bar.offsetHeight - 8 >= 4 ? sy - bar.offsetHeight - 8 : Math.min(H - bar.offsetHeight - 4, ey + 8)}px`;
    };
    function selectDown(e, at) {
        const v = view(), tol = 10 / (W * v.z);
        let g = null;
        if (sel.length) {
            const pad = 6 / (W * v.z), [x0, y0, x1, y1] = selBox(), grab = 18 / (W * v.z);
            if (Math.abs(at[0] - (x1 + pad)) < grab && Math.abs(at[1] - (y1 + pad)) < grab) {
                g = { sel: 'scale', from: at, anchor: [x0, y0], before: snapshot(sel) };
            } else if (at[0] >= x0 - tol && at[0] <= x1 + tol && at[1] >= y0 - tol && at[1] <= y1 + tol && !e.shiftKey) {
                g = { sel: 'move', from: at, before: snapshot(sel) };
            }
        }
        if (!g) {
            const hit = [...page().s].reverse().find((s) => hits(s, at, tol));
            if (hit) {
                sel = e.shiftKey ? [...new Set([...sel, hit])] : [hit];
                g = { sel: 'move', from: at, before: snapshot(sel) };
            } else {
                if (!e.shiftKey) { sel = []; }
                g = { sel: 'box', box: [at, at] };
            }
        }
        live.set(e.pointerId, g);
        preview(); buttons();
    }
    function selectMove(g, q) {
        if (g.sel === 'box') { g.box[1] = q; preview(); return; }
        if (g.sel === 'move') {
            const dx = q[0] - g.from[0], dy = q[1] - g.from[1];
            sel.forEach((s) => { s.p = g.before.get(s).p.map(([x, y]) => [x + dx, y + dy]); });
        } else {
            const [ax, ay] = g.anchor;
            const k = Math.max(0.05, Math.hypot(q[0] - ax, q[1] - ay) / Math.max(1e-6, Math.hypot(g.from[0] - ax, g.from[1] - ay)));
            sel.forEach((s) => {
                const b = g.before.get(s);
                s.p = b.p.map(([x, y]) => [ax + (x - ax) * k, ay + (y - ay) * k]);
                if (s.k === 'text' || s.k === 'math') { s.f = b.f * k; }
            });
        }
        g.moved = true;
        redraw();
    }
    function selectUp(g) {
        if (g.sel === 'box') {
            const [[ax, ay], [bx, by]] = g.box, [x0, x1, y0, y1] = [Math.min(ax, bx), Math.max(ax, bx), Math.min(ay, by), Math.max(ay, by)];
            if (x1 - x0 > 0.002 || y1 - y0 > 0.002) {
                const inside = page().s.filter((s) => { if (s.e) { return false; } const b = bbox(s); return b[0] >= x0 && b[2] <= x1 && b[1] >= y0 && b[3] <= y1; });
                sel = [...new Set([...sel, ...inside])];
            }
        } else if (g.moved) { commit(g.before, sel); }
        preview(); buttons();
    }
    const deleteSelection = () => {
        if (!sel.length) { return; }
        const pg = page(), gone = sel.map((s) => [pg.s.indexOf(s), s]).filter(([i]) => i >= 0).sort((a, b) => a[0] - b[0]);
        const out = () => { for (let k = gone.length - 1; k >= 0; k--) { pg.s.splice(gone[k][0], 1); } };
        const back = () => gone.forEach(([i, s]) => pg.s.splice(i, 0, s));
        out(); record({ undo: back, redo: out }, pg);
        sel = []; redraw(); changed();
    };
    const copySelection = () => {
        if (!sel.length) { return; }
        const pg = page(), copies = sel.map((s) => ({ ...s, p: s.p.map(([x, y]) => [x + 0.02, y + 0.02]) }));
        copies.forEach((c) => pg.s.push(c));
        record({ undo: () => copies.forEach((c) => drop(pg.s, c)), redo: () => copies.forEach((c) => pg.s.push(c)) }, pg);
        sel = copies; redraw(); changed();
    };
    const restyle = (fn) => {
        if (!sel.length) { return false; }
        const before = snapshot(sel);
        sel.forEach((s) => { if (!s.e) { fn(s); } });
        commit(before, sel); redraw();
        return true;
    };
    $('#wb-sel-del').addEventListener('click', deleteSelection);
    $('#wb-sel-copy').addEventListener('click', copySelection);

    // --- Text -----------------------------------------------------------------------------------------------
    // A box where the finger went down; Enter (or tapping elsewhere) writes it on the board, Escape drops it.
    const writeAt = (at) => {
        finishText();
        unselect();
        const input = document.createElement('input');
        input.type = 'text'; input.className = 'ct-wb-text'; input.maxLength = 120; input.placeholder = STR.textPh;
        input.setAttribute('aria-label', STR.textPh);
        const f = LETTERS[opt.size], [sx, sy] = toScreen(at);
        painting = page();
        Object.assign(input.style, { left: `${sx}px`, top: `${sy}px`, fontSize: `${f * W * view().z}px`, color: colourOf(opt.colour) });
        input.classList.toggle('oscura', isDark(page()));
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

    // --- Formulas ------------------------------------------------------------------------------------------
    // A tap opens the editor where the finger went down; on a formula already there, to change it (or delete it).
    const formulaAt = (at) => {
        if (!window.ClasstoolsFormula) { return; }
        finishText(); unselect();
        const pg = page(), tol = 8 / (W * view().z);
        const there = [...pg.s].reverse().find((s) => s.k === 'math' && hits(s, at, tol));
        const mode = core.mode ? core.mode() : 'primary';
        if (there) {
            window.ClasstoolsFormula.edit({
                src: there.t, mode,
                onDone: (src) => {
                    const before = there.t;
                    there.t = src;
                    record({ undo: () => { there.t = before; }, redo: () => { there.t = src; } }, pg);
                    redraw(); changed();
                },
                onDelete: () => {
                    const i = pg.s.indexOf(there);
                    if (i < 0) { return; }
                    pg.s.splice(i, 1);
                    record({ undo: () => pg.s.splice(i, 0, there), redo: () => drop(pg.s, there) }, pg);
                    redraw(); changed();
                },
            });
            return;
        }
        window.ClasstoolsFormula.edit({
            mode,
            onDone: (src) => { add({ k: 'math', c: opt.colour, f: LETTERS[opt.size] * FORMULA, p: [at], t: src }); redraw(); },
        });
    };

    // --- Pages: going from one to another, and the strip of thumbnails ---------------------------------------
    const go = (i) => {
        finishText(); unselect();
        cur = Math.max(0, Math.min(pages.length - 1, i));
        paintBackground(); redraw(); paintControls(); tell('view'); persist();
    };
    const newPageAfter = (like, extra = {}) => {
        if (pages.length >= MAX_PAGES) { return -1; }
        pages.splice(cur + 1, 0, Object.assign(blankPage(like), extra));
        return cur + 1;
    };
    $('#wb-prev').addEventListener('click', () => go(cur - 1));
    $('#wb-next').addEventListener('click', () => go(cur + 1));
    $('#wb-new').addEventListener('click', () => { const i = newPageAfter(page()); if (i >= 0) { go(i); thumbsSoon(); } });
    $('#wb-dup').addEventListener('click', () => {
        if (pages.length >= MAX_PAGES) { return; }
        const p = page();
        pages.splice(cur + 1, 0, { ...p, s: p.s.map((s) => ({ ...s, p: s.p.map((q) => q.slice()) })), v: null });
        go(cur + 1); thumbsSoon();
    });
    let delTimer = 0;
    $('#wb-del').addEventListener('click', () => {
        const b = $('#wb-del');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); core.relabel(b, STR.delPageSure);
            clearTimeout(delTimer); delTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.delPage); }, 4000);
            return;
        }
        clearTimeout(delTimer); b.classList.remove('confirma'); core.relabel(b, STR.delPage);
        if (pages.length > 1) { pages.splice(cur, 1); } else { pages[0] = blankPage(page()); }
        go(Math.min(cur, pages.length - 1)); thumbsSoon(); tidy();
    });
    const drawer = $('#wb-drawer');
    const showDrawer = (on) => { drawer.hidden = !on; $('#wb-pages').setAttribute('aria-expanded', String(on)); if (on) { thumbsNow(); } };
    $('#wb-pages').addEventListener('click', () => showDrawer(drawer.hidden));
    // A thumbnail: the page drawn small, with its background and its picture.
    const thumb = (c, pg) => {
        const tw = 132, th = Math.max(40, Math.round((tw * H) / Math.max(1, W)));
        if (c.width !== tw || c.height !== th) { c.width = tw; c.height = th; }
        const was = [W, H, dpr];
        [W, H, dpr] = [tw, th, 1];
        try {
            painting = pg;
            const ctx = c.getContext('2d');
            drawBackground(ctx, pg, SAME);
            const off = document.createElement('canvas'); off.width = tw; off.height = th;
            const octx = off.getContext('2d'); place(octx, SAME);
            pg.s.forEach((s) => drawStroke(octx, s));
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(off, 0, 0);
        } finally { [W, H, dpr] = was; painting = page(); }
    };
    let thumbTimer = 0;
    function thumbsSoon() { if (!drawer.hidden) { clearTimeout(thumbTimer); thumbTimer = setTimeout(thumbsNow, 350); } }
    function thumbsNow() {
        clearTimeout(thumbTimer);
        if (drawer.hidden) { return; }
        const list = $('#wb-thumbs');
        while (list.children.length > pages.length) { list.lastChild.remove(); }
        while (list.children.length < pages.length) {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'ct-wb-thumb'; b.setAttribute('role', 'listitem');
            b.innerHTML = '<canvas aria-hidden="true"></canvas><span></span>';
            list.append(b);
        }
        [...list.children].forEach((b, i) => {
            b.dataset.i = i;
            b.querySelector('span').textContent = i + 1;
            b.setAttribute('aria-label', STR.pageOf({ n: i + 1, of: pages.length }));
            b.setAttribute('aria-current', String(i === cur));
            thumb(b.querySelector('canvas'), pages[i]);
        });
        const now = list.children[cur];
        if (now && now.scrollIntoView) { now.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    }
    // A tap on a thumbnail goes to its page; dragging it sideways puts the page somewhere else.
    (() => {
        const list = $('#wb-thumbs');
        let drag = null;
        list.addEventListener('pointerdown', (e) => {
            const b = e.target.closest('.ct-wb-thumb');
            if (!b || e.button > 0) { return; }
            drag = { b, i: Number(b.dataset.i), x: e.clientX, on: false, id: e.pointerId };
        });
        list.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.id) { return; }
            const dx = e.clientX - drag.x;
            if (!drag.on && Math.abs(dx) > 8) {
                drag.on = true; drag.b.classList.add('moviendo');
                try { list.setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ }
            }
            if (drag.on) { drag.b.style.transform = `translateX(${dx}px)`; }
        });
        const up = (e) => {
            if (!drag || e.pointerId !== drag.id) { return; }
            const d = drag;
            drag = null;
            if (!d.on) { go(d.i); thumbsNow(); return; }
            d.b.classList.remove('moviendo'); d.b.style.transform = '';
            // Where it was dropped: before the first thumbnail whose middle is to the right.
            const others = [...list.children].filter((x) => x !== d.b);
            let to = others.findIndex((x) => { const r = x.getBoundingClientRect(); return e.clientX < r.left + r.width / 2; });
            if (to < 0) { to = others.length; }
            if (to !== d.i) {
                const here = page(), [moving] = pages.splice(d.i, 1);
                pages.splice(to, 0, moving);
                cur = pages.indexOf(here);
                paintControls(); persist(); thumbsNow();
            }
        };
        list.addEventListener('pointerup', up);
        list.addEventListener('pointercancel', () => { if (drag && drag.on) { drag.b.classList.remove('moviendo'); drag.b.style.transform = ''; } drag = null; });
    })();

    // --- A picture or a PDF as the background ----------------------------------------------------------------
    // On the page on screen if it is empty; if not, on a new one after it. A PDF: a page for each of its pages.
    // What is going on, in a corner of the board: while it works it stays; a message goes after a few seconds.
    let statusTimer = 0;
    const status = (text, stay = false) => {
        const box = $('#wb-status');
        box.textContent = text; box.hidden = !text;
        clearTimeout(statusTimer);
        if (text && !stay) { statusTimer = setTimeout(() => { box.hidden = true; }, 6000); }
    };
    const toBlob = (c, type, q) => new Promise((ok) => c.toBlob(ok, type, q));
    const newId = () => IMG + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    // Where the picture goes: whole on the page as it is on screen, in the middle.
    const fitIn = (w, h) => {
        const ph = H / W, m = 0.02, k = Math.min((1 - 2 * m) / w, (ph - 2 * m) / h);
        return [(1 - w * k) / 2, (ph - h * k) / 2, w * k, h * k];
    };
    const blank = (pg) => !pg.s.length && !pg.img;
    const putPicture = async (blob, w, h, where) => {
        const id = newId();
        await store.put(id, blob);
        pictures.set(id, await imageOf(blob));
        Object.assign(pages[where], { img: id, ir: fitIn(w, h) });
    };
    const importImage = async (file) => {
        const im = await imageOf(file);
        const w0 = im.naturalWidth, h0 = im.naturalHeight, k = Math.min(1, 2400 / Math.max(w0, h0));
        let blob = file;
        // Very big photos are made smaller (a board does not need more than this).
        if (k < 1 || file.size > 4e6) {
            const c = document.createElement('canvas');
            c.width = Math.round(w0 * k); c.height = Math.round(h0 * k);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            blob = await toBlob(c, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
        }
        URL.revokeObjectURL(im.src);
        let where = cur;
        if (!blank(page())) { where = newPageAfter(page(), { bg: 'blank', surface: 'white', margin: false }); }
        if (where < 0) { return; }
        await putPicture(blob, w0, h0, where);
        go(where); thumbsSoon();
    };
    let pdfjs = null;
    const loadPdf = () => {
        pdfjs = pdfjs || import(new URL('lib/pdfjs/pdf.min.js', document.baseURI).href).then((m) => {
            m.GlobalWorkerOptions.workerSrc = new URL('lib/pdfjs/pdf.worker.min.js', document.baseURI).href;
            return m;
        }).catch((err) => { pdfjs = null; throw err; });
        return pdfjs;
    };
    const importPdf = async (file) => {
        status(STR.importing({ n: 1, of: '…' }), true);
        const lib = await loadPdf();
        const task = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }), doc = await task.promise;
        try {
            const room = MAX_PAGES - pages.length + (blank(page()) ? 1 : 0), n = Math.min(doc.numPages, room);
            let first = -1;
            for (let i = 1; i <= n; i++) {
                status(STR.importing({ n: i, of: n }), true);
                const p = await doc.getPage(i);
                const one = p.getViewport({ scale: 1 }), vp = p.getViewport({ scale: Math.min(1800 / one.width, 2400 / one.height) });
                const c = document.createElement('canvas');
                c.width = Math.round(vp.width); c.height = Math.round(vp.height);
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
                await p.render({ canvas: c, canvasContext: ctx, viewport: vp }).promise;
                p.cleanup();
                const where = first < 0 && blank(page()) ? cur : newPageAfter(page(), { bg: 'blank', surface: 'white', margin: false });
                if (where < 0) { break; }
                await putPicture(await toBlob(c, 'image/jpeg', 0.86), c.width, c.height, where);
                if (first < 0) { first = where; }
                cur = where;   // the next one goes after this one
            }
            status(n < doc.numPages ? STR.pdfMany(n) : '');
            go(first < 0 ? cur : first); thumbsSoon();
        } finally { task.destroy(); }
    };
    const importFile = (file) => {
        if (!file) { return Promise.resolve(); }
        const pdf = /pdf$/i.test(file.type) || /\.pdf$/i.test(file.name || '');
        if (!pdf && !/^image\//.test(file.type)) { status(STR.importError); return Promise.resolve(); }
        return (pdf ? importPdf(file) : importImage(file)).catch((err) => { status(STR.importError); if (window.console) { console.warn('Class tools board: ' + ((err && (err.stack || err.message)) || err)); } });
    };
    const picker = document.createElement('input');
    picker.type = 'file'; picker.accept = 'image/*,application/pdf,.pdf'; picker.hidden = true; picker.id = 'wb-file';
    root.append(picker);
    $('#wb-import').addEventListener('click', () => picker.click());
    picker.addEventListener('change', () => { const f = picker.files && picker.files[0]; picker.value = ''; importFile(f); });
    // Or dropped on the board.
    stage.addEventListener('dragover', (e) => { if (full && e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); } });
    stage.addEventListener('drop', (e) => { if (full && e.dataTransfer && e.dataTransfer.files.length) { e.preventDefault(); importFile(e.dataTransfer.files[0]); } });
    $('#wb-img-del').addEventListener('click', () => { Object.assign(page(), { img: '', ir: null }); paintBackground(); paintControls(); persist(); thumbsSoon(); tidy(); });

    // --- Controls -------------------------------------------------------------------------------------------
    function paintControls() {
        const pg = page();
        painting = pg;
        $$('#wb-tools button, #wb-more button').forEach((b) => b.setAttribute('aria-checked', String(!erasing && b.dataset.v === opt.tool)));
        $$('#wb-colours .ct-swatch').forEach((b) => {
            b.setAttribute('aria-checked', String(!erasing && b.dataset.v === opt.colour));
            b.style.setProperty('--c', colourOf(b.dataset.v));
        });
        $('#wb-colours').classList.toggle('tiza', isDark(pg));
        $$('#wb-size button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.size)));
        $('#wb-eraser').setAttribute('aria-pressed', String(erasing));
        $('#wb-eraser').classList.toggle('activo', erasing);
        $$('#wb-bg button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === pg.bg)));
        $$('#wb-surface button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === pg.surface)));
        $('#wb-bg-name').textContent = STR.backgrounds[pg.bg];
        $('#wb-bg-open').setAttribute('aria-label', `${STR.background}: ${STR.backgrounds[pg.bg]}`);
        $('#wb-zoom').textContent = `${Math.round(zoom * 100)} %`;
        $('#wb-zoom-less').disabled = zoom <= ZOOMS[0];
        $('#wb-zoom-more').disabled = zoom >= ZOOMS[ZOOMS.length - 1];
        $('#wb-margin').checked = !!pg.margin;
        $('#wb-img-del').hidden = !pg.img;
        $('#wb-magic').setAttribute('aria-pressed', String(!!opt.magic));
        $('#wb-magic').classList.toggle('activo', !!opt.magic);
        $('#wb-full').setAttribute('aria-pressed', String(full));
        $('#wb-full').classList.toggle('activo', full);
        $('#wb-page-n').textContent = `${cur + 1} / ${pages.length}`;
        $('#wb-pages').setAttribute('aria-label', `${STR.pages}: ${STR.pageOf({ n: cur + 1, of: pages.length })}`);
        $('#wb-prev').disabled = cur <= 0;
        $('#wb-next').disabled = cur >= pages.length - 1;
        $('#wb-new').disabled = $('#wb-dup').disabled = pages.length >= MAX_PAGES;
        stage.classList.toggle('ct-wb-erasing', erasing);
        stage.dataset.tool = erasing ? 'eraser' : opt.tool;
        stage.classList.toggle('oscura', isDark(pg));
        paintZoom();
        buttons();
    }
    const keepOpt = () => save('pizarra-dibujo', opt);
    const pickTool = (v) => {
        opt.tool = v; erasing = false; keepOpt();
        if (v !== 'select') { unselect(); }
        if (v !== 'laser') { laser.stop(); }
        paintControls();
    };
    $('#wb-tools').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { pickTool(b.dataset.v); } });
    $('#wb-more').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { pickTool(b.dataset.v); } });
    $('#wb-colours').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) { return; }
        opt.colour = b.dataset.v; keepOpt();
        // With something selected, it takes the colour.
        if (restyle((s) => { s.c = opt.colour; })) { paintControls(); return; }
        erasing = false; paintControls();
        if (editing) { editing.c = opt.colour; editing.input.style.color = colourOf(opt.colour); editing.input.focus(); }
    });
    $('#wb-size').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]');
        if (!b) { return; }
        opt.size = b.dataset.v; keepOpt(); paintControls();
        restyle((s) => { if (s.k === 'text') { s.f = LETTERS[opt.size]; } else if (s.k === 'math') { s.f = LETTERS[opt.size] * FORMULA; } else { s.w = (s.k === 'hl' ? MARKER : SIZES)[opt.size]; } });
    });
    $('#wb-eraser').addEventListener('click', () => { erasing = !erasing; unselect(); paintControls(); });
    $('#wb-magic').addEventListener('click', () => { opt.magic = !opt.magic; keepOpt(); paintControls(); });
    const undo = () => { finishText(); unselect(); const op = log().done.pop(); if (op) { op.undo(); log().undone.push(op); } redraw(); changed(); };
    const redo = () => { finishText(); unselect(); const op = log().undone.pop(); if (op) { op.redo(); log().done.push(op); } redraw(); changed(); };
    $('#wb-undo').addEventListener('click', undo);
    $('#wb-redo').addEventListener('click', redo);
    // The background: a small panel with the kind, the surface, how big, the margin and the picture.
    const panel = $('#wb-bg-panel');
    const showPanel = (on) => { panel.hidden = !on; $('#wb-bg-open').setAttribute('aria-expanded', String(on)); };
    $('#wb-bg-open').addEventListener('click', () => showPanel(panel.hidden));
    document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !e.target.closest('.ct-wb-fondo')) { showPanel(false); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { showPanel(false); $('#wb-bg-open').focus(); } });
    const setPage = (changes) => { Object.assign(page(), changes); Object.assign(opt, changes); keepOpt(); persist(); paintControls(); paintBackground(); redraw(); thumbsSoon(); };
    $('#wb-bg').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { setPage({ bg: b.dataset.v }); } });
    $('#wb-surface').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { setPage({ surface: b.dataset.v }); } });
    const setZoom = (d) => {
        const i = Math.max(0, Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + d));
        zoom = ZOOMS[i]; byMode.set({ zoom }); paintControls(); layout();
    };
    $('#wb-zoom-less').addEventListener('click', () => setZoom(-1));
    $('#wb-zoom-more').addEventListener('click', () => setZoom(1));
    $('#wb-margin').addEventListener('change', () => setPage({ margin: $('#wb-margin').checked }));
    // The simple board or the full one.
    const setFull = (on, remember) => {
        full = on;
        if (remember) { fullBy.set({ on }); }
        root.classList.toggle('ct-wb-completa', on);
        $('#wb-bar2').hidden = !on;
        if (!on) {
            showDrawer(false); unselect(); laser.stop();
            if (MORE.some(([k]) => k === opt.tool)) { opt.tool = 'pen'; keepOpt(); }
        }
        paintControls(); layout(); tell('full');
    };
    $('#wb-full').addEventListener('click', () => setFull(!full, true));
    document.addEventListener('classtools:mode', () => {
        zoom = zoomNow();
        if (!!fullBy.get().on !== full) { setFull(!!fullBy.get().on, false); } else { paintControls(); layout(); }
    });
    // Clearing the page (it can be undone).
    $('#wb-clear').addEventListener('click', () => {
        const b = $('#wb-clear'), pg = page();
        if (!b.classList.contains('confirma') && pg.s.length) {
            b.classList.add('confirma'); core.relabel(b, STR.clearSure);
            clearTimeout(clearTimer); clearTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.clear); }, 4000);
            return;
        }
        clearTimeout(clearTimer); b.classList.remove('confirma'); core.relabel(b, STR.clear);
        finishText(); unselect();
        const was = pg.s.slice();
        if (!was.length) { return; }
        pg.s.length = 0;
        record({ undo: () => { pg.s.push(...was); }, redo: () => { pg.s.length = 0; } }, pg);
        redraw(); changed();
    });
    // The page on screen with its background, as one image.
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
            const b = e.target.closest('[data-v]');
            if (!b) { return; }
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
            open({ compose, empty: () => !page().s.length && !page().img }, STR.defaultName(when));
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

    // Keys, while the board is on screen: Ctrl+Z undoes, Ctrl+Y (or Ctrl+Shift+Z) does it again; in the full board,
    // Delete removes what is selected, Escape lets it go, and Page Up and Page Down change the page.
    document.addEventListener('keydown', (e) => {
        if (root.hidden || document.querySelector('dialog[open]') || (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]'))) { return; }
        const k = e.key.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) { redo(); } else { undo(); } return; }
        if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return; }
        if (!full) { return; }
        if ((k === 'delete' || k === 'backspace') && sel.length) { e.preventDefault(); deleteSelection(); return; }
        if (k === 'escape' && sel.length) { unselect(); return; }
        if (k === 'pagedown') { e.preventDefault(); go(cur + 1); }
        if (k === 'pageup') { e.preventDefault(); go(cur - 1); }
    });
    if (window.ResizeObserver) { new ResizeObserver(() => requestAnimationFrame(layout)).observe(stage); }
    core.register('pizarra', { entra: () => requestAnimationFrame(layout) });
    root.classList.toggle('ct-wb-completa', full);
    $('#wb-bar2').hidden = !full;
    paintControls();
    tidy();

    // For instruments.js: where things are, the full board coming and going, the edges that straighten strokes, and
    // drawing a stroke by hand (the compass).
    const kit = {
        stage, bar: $('#wb-kit'), full: () => full,
        unit: () => W * view().z,
        toScreen: (p) => toScreen(p),
        toBoard: (sx, sy) => { const v = view(); return [sx / (W * v.z) + v.x, sy / (W * v.z) + v.y]; },
        middle: () => { const v = view(); return [v.x + 0.5 / v.z, v.y + H / (2 * W * v.z)]; },
        onView: (f) => watchers.view.push(f), onFull: (f) => watchers.full.push(f),
        snapper: (f) => snappers.push(f),
        begin: (p) => { unselect(); const s = { c: opt.colour, w: SIZES[opt.size], e: false, p: [p] }; add(s); drawSegment(ictx(), s, 1); return s; },
        extend: (s, pts) => { const before = s.p.length; s.p.push(...pts); const ctx = ictx(); drawSegment(ctx, s, before); ctx.globalCompositeOperation = 'source-over'; },
        end: (s) => { s.p = simplify(s.p, 0.0002); changed(); },
    };
    // share(make, name): opens «Send to the class» with the canvas that make() draws (only inside a course).
    window.ClasstoolsWhiteboard = {
        strokes: () => page().s, pages: () => pages, page: () => cur, go, layout, opt: () => opt, share, kit,
        full: () => full, setFull, view, selection: () => sel, importFile,
    };
})();
