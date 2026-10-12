// A timeline, among the materials: events (a point) and periods (a bar) on a line that zooms from days to the age
// of the Earth, with marks that follow the zoom (days, months, years, centuries, thousands of years, millions). It
// is dragged to move along it and zoomed with the wheel, two fingers or its buttons; «See it all» fits everything.
// Dates as they are written: «1969-07-20», «1492», «753 BC», «66 Ma» (millions of years ago), «300 ka»; a period
// is two dates with a dash between them. «Hide the dates» shows only the names, to put them in order first; a tap on
// one shows its date. Timelines of examples for each school level, and the teacher's own (written, or asked to an AI).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core || !core.material) { return; }
    const { escape, save, load, play, announce, setIcon } = core;
    const t = core.t;
    const NS = 'http://www.w3.org/2000/svg';
    const lang = document.documentElement.lang || 'en';
    const PRESENT = new Date().getFullYear() + (new Date().getMonth() + 0.5) / 12;
    const DAY = 1 / 365.25;
    const COLOURS = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#c2410c', '#0e7c86', '#be185d', '#8a5a2b'];
    // The examples of each school level: their text is a language string.
    const EXAMPLES = { flight: ['early', 'primary'], ages: ['primary', 'secondary'], earth: ['secondary', 'advanced'] };

    // --- Reading the dates and the text --------------------------------------------------------------------------
    // A date → its time in years (negative before Christ) and how it is shown; null if it is not one.
    const dateOf = (raw) => {
        if (/^(hoy|today|now|aujourd'hui|heute|oggi|vandaag|idag|hoje)$/i.test(String(raw).trim())) { return { t: PRESENT, show: t('tl_today') }; }
        const s = String(raw).trim().replace(/(\d)[\s.](?=\d{3}\b)/g, '$1').replace(',', '.');
        let m = s.match(/^(?:hace\s+|ago\s+)?(\d+(?:\.\d+)?)\s*(ga|ma|ka)$/i);
        if (m) {
            const k = { ga: 1e9, ma: 1e6, ka: 1e3 }[m[2].toLowerCase()], ago = Number(m[1]) * k;
            return { t: PRESENT - ago, show: agoText(ago) };
        }
        m = s.match(/^(\d{1,4})-(\d{1,2})(?:-(\d{1,2}))?$/);
        if (m) {
            const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3] || 0);
            if (mo < 1 || mo > 12 || d > 31) { return null; }
            const when = new Date(Date.UTC(y, mo - 1, d || 15));
            if (y < 100) { when.setUTCFullYear(y); }
            const start = Date.UTC(y, 0, 1), inYear = (when.getTime() - start) / 864e5 / 365.25;
            const opts = d ? { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' };
            return { t: y + inYear, show: new Intl.DateTimeFormat(lang, opts).format(when) };
        }
        m = s.match(/^(\d+)\s*(?:a\.?\s*c\.?|a\.?\s*de\s*c\.?|bc|bce|av\.?\s*j\.?-?c\.?|v\.?\s*chr\.?)$/i);
        if (m) { return { t: -Number(m[1]), show: t('tl_bc', m[1]) }; }
        m = s.match(/^([-−]?)(\d+)(?:\s*(?:d\.?\s*c\.?|ad|ce))?$/i);
        if (m) {
            const y = Number(m[2]) * (m[1] ? -1 : 1);
            return { t: y + 0.5, show: y < 0 ? t('tl_bc', -y) : String(y) };
        }
        return null;
    };
    // Years ago, as said: millions of years from a million on, years with their thousands below.
    function agoText(ago) {
        if (ago >= 1e6) { return t('tl_ago_ma', Number((ago / 1e6).toPrecision(4)).toLocaleString(lang)); }
        return t('tl_ago_years', Math.round(ago).toLocaleString(lang));
    }
    // The text of a timeline: a title (a first line without «|»), then «date | name» or «date – date | name».
    const parse = (text) => {
        const tl = { title: '', items: [], bad: [] };
        String(text).replace(/\r/g, '').split('\n').forEach((raw, i) => {
            const line = raw.trim();
            if (!line || line.startsWith('#')) { return; }
            const bar = line.indexOf('|');
            if (bar < 0) {
                const h = line.match(/^(?:t[ií]tulo|title|titre|titel|titolo)\s*:\s*(.+)$/i);
                if (h || (!tl.title && !tl.items.length)) { tl.title = (h ? h[1] : line).slice(0, 80); } else { tl.bad.push(i + 1); }
                return;
            }
            const when = line.slice(0, bar).trim(), name = line.slice(bar + 1).trim().slice(0, 120);
            // «1936-1939» is a period too (a date of a month has one or two digits after the dash).
            const years = when.match(/^(-?\d{1,10})-(\d{3,10})$/);
            const parts = years ? [years[1], years[2]] : when.split(/\s+[–—-]\s+|\s*\.\.\s*|\s*–\s*/).filter(Boolean);
            const a = dateOf(parts[0] || ''), b = parts[1] ? dateOf(parts[1]) : null;
            if (!a || !name || (parts[1] && !b)) { tl.bad.push(i + 1); return; }
            tl.items.push(b ? { a: Math.min(a.t, b.t), b: Math.max(a.t, b.t), show: `${a.show} – ${b.show}`, name } : { a: a.t, show: a.show, name });
        });
        tl.items.forEach((x, i) => { x.colour = COLOURS[i % COLOURS.length]; });
        return tl;
    };

    // --- What is kept ------------------------------------------------------------------------------------------------
    const st = Object.assign({ current: '', mine: [], hide: false }, load('lineas-tiempo', {}));
    if (!Array.isArray(st.mine)) { st.mine = []; }
    const keep = () => save('lineas-tiempo', st);
    const level = () => (core.mode ? core.mode() : 'primary');
    const examples = () => Object.keys(EXAMPLES).map((id) => ({ id: 'ex:' + id, text: t('tl_ex_' + id), example: true, levels: EXAMPLES[id] }));
    const all = () => examples().concat(st.mine.map((x) => ({ id: x.id, text: x.text })));
    const current = () => all().find((x) => x.id === st.current) || examples().find((x) => x.levels.includes(level())) || examples()[0];

    const panel = core.material.add('tiempo', t('mt_timeline'), `
        <aside class="tarjeta ct-side">
            <label class="campo apilado"><span>${escape(t('tl_which'))}</span><select id="tl-which"></select></label>
            <div class="ct-row">
                <button type="button" class="boton suave" id="tl-new"><span data-icono="mas"></span><span>${escape(t('tl_new'))}</span></button>
                <button type="button" class="boton suave" id="tl-edit"><span data-icono="editar"></span><span>${escape(t('tl_edit'))}</span></button>
            </div>
            <label class="interruptor"><input type="checkbox" id="tl-hide"><span>${escape(t('tl_hide'))}</span></label>
            <p class="nota">${escape(t('tl_help'))}</p>
        </aside>
        <div class="tarjeta ct-stage ct-tl-stage">
            <div class="ct-tl-top">
                <p class="ct-tl-info" id="tl-info" aria-live="polite"></p>
                <div class="ct-tl-zoom">
                    <button type="button" class="redondo suave" id="tl-out" aria-label="${escape(t('tl_zoom_out'))}" title="${escape(t('tl_zoom_out'))}"><span data-icono="lupa-menos"></span></button>
                    <button type="button" class="redondo suave" id="tl-in" aria-label="${escape(t('tl_zoom_in'))}" title="${escape(t('tl_zoom_in'))}"><span data-icono="lupa-mas"></span></button>
                    <button type="button" class="boton suave" id="tl-fit"><span data-icono="encajar"></span><span>${escape(t('tl_fit'))}</span></button>
                </div>
            </div>
            <svg class="ct-tl" id="tl-svg" role="img" aria-label="${escape(t('mt_timeline'))}"></svg>
            <p class="nota ct-tl-bad" id="tl-bad" hidden></p>
        </div>`, () => { fitted ? paint() : fit(); });
    const $ = (s) => panel.querySelector(s);
    panel.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
    const svg = $('#tl-svg');
    let tl = parse(current().text), view = { a: 0, b: 1 }, fitted = false, picked = -1;
    const shown = new Set();   // with the dates hidden, the ones whose date has been asked for

    // --- The view: what part of time is on screen --------------------------------------------------------------------
    const MIN_SPAN = 3 * DAY, MAX_SPAN = 2e10;
    const fit = () => {
        if (!tl.items.length) { view = { a: PRESENT - 100, b: PRESENT + 5 }; paint(); return; }
        let a = Math.min(...tl.items.map((x) => x.a)), b = Math.max(...tl.items.map((x) => x.b || x.a));
        const span = Math.max(b - a, 10);
        const mid = (a + b) / 2;
        a = mid - span * 0.56; b = mid + span * 0.56;
        view = { a, b }; fitted = true; paint();
    };
    const zoomAt = (f, t0) => {
        const span = Math.max(MIN_SPAN, Math.min(MAX_SPAN, (view.b - view.a) * f));
        const k = (t0 - view.a) / (view.b - view.a);
        view = { a: t0 - k * span, b: t0 - k * span + span };
        paint();
    };
    const pan = (dt) => { view = { a: view.a + dt, b: view.b + dt }; paint(); };

    // --- The marks of the line: as many as fit, round for the zoom ---------------------------------------------------
    const STEPS = [DAY, 7 * DAY, 1 / 12, 0.25, 0.5];
    for (let p = 0; p <= 9; p++) { [1, 2, 5].forEach((m) => STEPS.push(m * 10 ** p)); }
    const ticks = (W) => {
        const span = view.b - view.a, want = Math.max(3, Math.floor(W / 110));
        const step = STEPS.find((s) => span / s <= want) || STEPS[STEPS.length - 1];
        const far = Math.max(Math.abs(PRESENT - view.a), Math.abs(PRESENT - view.b)) >= 1e5 && step >= 1000;
        const out = [];
        if (far) {
            // Long ago: round numbers of years ago.
            const from = Math.ceil((PRESENT - view.b) / step) * step, to = PRESENT - view.a;
            // Today is marked on its own.
            for (let ago = from; ago <= to && out.length < 60; ago += step) { if (ago > 0) { out.push({ t: PRESENT - ago, text: agoText(ago) }); } }
            return out;
        }
        if (step < 1) {
            // Months and days.
            const opts = step < 1 / 12 ? { day: 'numeric', month: 'short', timeZone: 'UTC' } : { month: 'short', year: 'numeric', timeZone: 'UTC' };
            const fmt = new Intl.DateTimeFormat(lang, opts);
            const startMs = Date.UTC(Math.floor(view.a), 0, 1) + (view.a - Math.floor(view.a)) * 365.25 * 864e5;
            const d = new Date(startMs);
            if (step >= 1 / 12) { d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0); } else { d.setUTCHours(0, 0, 0, 0); }
            const add = (x) => (step >= 1 / 12 ? x.setUTCMonth(x.getUTCMonth() + Math.round(step * 12)) : x.setUTCDate(x.getUTCDate() + Math.round(step * 365.25)));
            for (let i = 0; i < 80; i++) {
                const y = d.getUTCFullYear(), tt = y + (d.getTime() - Date.UTC(y, 0, 1)) / 864e5 / 365.25;
                if (tt > view.b) { break; }
                if (tt >= view.a) { out.push({ t: tt, text: fmt.format(d) }); }
                add(d);
            }
            return out;
        }
        for (let y = Math.ceil(view.a / step) * step; y <= view.b && out.length < 60; y += step) {
            out.push({ t: y, text: y < 0 ? t('tl_bc', -Math.round(y)) : String(Math.round(y)) });
        }
        return out;
    };

    // --- Drawing -----------------------------------------------------------------------------------------------------
    const el = (name, attrs = {}, parent = svg) => {
        const e = document.createElementNS(NS, name);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        parent.append(e);
        return e;
    };
    const textWidth = (s, size) => String(s).length * size * 0.56;
    function paint() {
        const W = svg.clientWidth || 800, H = svg.clientHeight || 400;
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.innerHTML = '';
        const x = (tt) => ((tt - view.a) / (view.b - view.a)) * W;
        const axis = Math.round(H * 0.52);
        // The line and its marks.
        el('line', { x1: 0, y1: axis, x2: W, y2: axis, class: 'ct-tl-eje' });
        ticks(W).forEach((k) => {
            const X = x(k.t);
            el('line', { x1: X, y1: axis - 6, x2: X, y2: axis + 6, class: 'ct-tl-marca' });
            el('text', { x: X, y: axis + 22, class: 'ct-tl-fecha', 'text-anchor': 'middle' }).textContent = k.text;
        });
        // «Today», when it is in view.
        if (PRESENT >= view.a && PRESENT <= view.b) {
            el('line', { x1: x(PRESENT), y1: axis - 14, x2: x(PRESENT), y2: axis + 14, class: 'ct-tl-hoy' });
            el('text', { x: x(PRESENT), y: axis - 18, class: 'ct-tl-hoy-txt', 'text-anchor': 'middle' }).textContent = t('tl_today');
        }
        const size = Math.max(12, Math.min(18, W / 60));
        const label = (it, i) => (st.hide && !shown.has(i) ? it.name : `${it.name} · ${it.show}`);
        // Periods, below the marks, in lanes so they do not overlap.
        // Each lane keeps the stretches it has taken (the bar and its name, which may stick out of it).
        const lanesP = [];
        const free = (lane, s, e) => lane.every(([a, b]) => e < a - 6 || s > b + 6);
        tl.items.forEach((it, i) => {
            if (it.b === undefined) { return; }
            const x1 = x(it.a), x2 = x(it.b);
            if (x2 < -50 || x1 > W + 50) { return; }
            const w = Math.max(4, x2 - x1), txt = label(it, i), lw = textWidth(txt, size);
            // The name inside the screen, also when the bar goes past its edge.
            const tx = Math.max(4, Math.min(Math.max(x1, 0) + 6, W - lw - 6));
            const s = Math.min(x1, tx), e = Math.max(x1 + w, tx + lw);
            let lane = lanesP.findIndex((l) => free(l, s, e));
            if (lane < 0) { lane = lanesP.length; lanesP.push([]); }
            lanesP[lane].push([s, e]);
            const y = axis + 34 + lane * (size + 18);
            if (y > H - 4) { return; }
            const g = el('g', { class: 'ct-tl-periodo' + (picked === i ? ' elegido' : ''), 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `${it.name}, ${it.show}` });
            el('rect', { x: x1, y, width: w, height: size + 10, rx: 6, fill: it.colour, 'fill-opacity': 0.22, stroke: it.colour }, g);
            el('text', { x: tx, y: y + size + 1, class: 'ct-tl-nombre' }, g).textContent = txt;
        });
        // Events, above the line, with their stems, in lanes going up.
        const lanesE = [];
        tl.items.forEach((it, i) => {
            if (it.b !== undefined) { return; }
            const X = x(it.a);
            if (X < -10 || X > W + 10) { return; }
            const txt = label(it, i), wt = textWidth(txt, size) + 14;
            const left = Math.min(Math.max(X - wt / 2, 2), W - wt - 2);
            let lane = lanesE.findIndex((end) => end < left - 6);
            if (lane < 0) { lane = lanesE.length; lanesE.push(0); }
            lanesE[lane] = left + wt;
            const y = axis - 34 - lane * (size + 22);
            const g = el('g', { class: 'ct-tl-hecho' + (picked === i ? ' elegido' : ''), 'data-i': i, tabindex: 0, role: 'button', 'aria-label': `${it.name}, ${it.show}` });
            el('line', { x1: X, y1: axis, x2: X, y2: y + 4, stroke: it.colour, class: 'ct-tl-palo' }, g);
            el('circle', { cx: X, cy: axis, r: 6, fill: it.colour }, g);
            if (y - size - 8 < 0) { return; }
            el('rect', { x: left, y: y - size - 6, width: wt, height: size + 12, rx: 8, fill: '#fff', stroke: it.colour }, g);
            el('text', { x: left + 7, y: y + 1, class: 'ct-tl-nombre' }, g).textContent = txt;
        });
        if (!tl.items.length) { el('text', { x: W / 2, y: axis - 40, 'text-anchor': 'middle', class: 'ct-tl-vacia' }).textContent = t('tl_empty'); }
        $('#tl-bad').hidden = !tl.bad.length;
        $('#tl-bad').textContent = tl.bad.length ? t('tl_bad_lines', tl.bad.join(', ')) : '';
    }

    // --- Moving and zooming ------------------------------------------------------------------------------------------
    const tAt = (clientX) => { const r = svg.getBoundingClientRect(); return view.a + ((clientX - r.left) / r.width) * (view.b - view.a); };
    svg.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * 0.0015), tAt(e.clientX)); }, { passive: false });
    const fingers = new Map();
    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
        const hit = e.target.closest('[data-i]');
        fingers.set(e.pointerId, e.clientX);
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* it still moves */ }
        drag = { x: e.clientX, view: { ...view }, moved: false, hit: hit ? Number(hit.dataset.i) : -1 };
        if (fingers.size === 2) {
            const [p, q] = [...fingers.values()];
            drag.pinch = { d: Math.abs(p - q) || 1, mid: tAt((p + q) / 2), view: { ...view } };
        }
    });
    svg.addEventListener('pointermove', (e) => {
        if (!fingers.has(e.pointerId) || !drag) { return; }
        fingers.set(e.pointerId, e.clientX);
        const r = svg.getBoundingClientRect();
        if (drag.pinch && fingers.size === 2) {
            const [p, q] = [...fingers.values()];
            const f = drag.pinch.d / (Math.abs(p - q) || 1);
            view = drag.pinch.view;
            zoomAt(f, drag.pinch.mid);
            drag.moved = true;
            return;
        }
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 4) { drag.moved = true; }
        if (drag.moved) { view = drag.view; pan((-dx / r.width) * (drag.view.b - drag.view.a)); }
    });
    const up = (e) => {
        fingers.delete(e.pointerId);
        if (!drag) { return; }
        if (!drag.moved && drag.hit >= 0) { pick(drag.hit); }
        if (!fingers.size) { drag = null; } else { drag.pinch = null; drag.x = [...fingers.values()][0]; drag.view = { ...view }; }
    };
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
    svg.addEventListener('keydown', (e) => { const g = e.target.closest('[data-i]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(Number(g.dataset.i)); } });
    // A tap on one: its name and date, big; with the dates hidden, its date shows from then on.
    function pick(i) {
        const it = tl.items[i];
        if (!it) { return; }
        picked = i;
        if (st.hide) { shown.add(i); }
        $('#tl-info').textContent = `${it.name} · ${it.show}`;
        announce(`${it.name}, ${it.show}`);
        play('tic'); paint();
    }
    $('#tl-in').addEventListener('click', () => zoomAt(0.6, (view.a + view.b) / 2));
    $('#tl-out').addEventListener('click', () => zoomAt(1 / 0.6, (view.a + view.b) / 2));
    $('#tl-fit').addEventListener('click', fit);
    $('#tl-hide').checked = !!st.hide;
    $('#tl-hide').addEventListener('change', () => { st.hide = $('#tl-hide').checked; keep(); shown.clear(); $('#tl-info').textContent = ''; picked = -1; paint(); });

    // --- Choosing, writing and keeping timelines --------------------------------------------------------------------
    const titleOf = (x) => parse(x.text).title || t('tl_untitled');
    const fillWhich = () => {
        const ex = examples(), mine = st.mine;
        $('#tl-which').innerHTML = `<optgroup label="${escape(t('tl_examples'))}">${ex.map((x) => `<option value="${x.id}">${escape(titleOf(x))}</option>`).join('')}</optgroup>`
            + (mine.length ? `<optgroup label="${escape(t('tl_mine'))}">${mine.map((x) => `<option value="${escape(x.id)}">${escape(titleOf(x))}</option>`).join('')}</optgroup>` : '');
        $('#tl-which').value = current().id;
        $('#tl-edit').hidden = !!current().example;
    };
    const choose = (id) => { st.current = id; keep(); tl = parse(current().text); picked = -1; shown.clear(); $('#tl-info').textContent = ''; fillWhich(); fit(); };
    $('#tl-which').addEventListener('change', () => choose($('#tl-which').value));
    let dialog = null;
    const edit = (item) => {
        if (!dialog) { dialog = document.createElement('dialog'); dialog.className = 'editor ct-tl-dialogo'; document.body.append(dialog); }
        dialog.innerHTML = `<form method="dialog"><h2>${escape(t(item ? 'tl_edit' : 'tl_new'))}</h2>
            <p class="nota">${escape(t('tl_format'))}</p>
            <textarea id="tl-text" rows="12" spellcheck="true" placeholder="${escape(t('tl_text_ph'))}"></textarea>
            <div id="tl-ai"></div>
            <p class="nota" id="tl-err" aria-live="polite"></p>
            <div class="botonera"><button type="submit" class="boton" value="save"><span data-icono="guardar"></span><span>${escape(t('gen_save'))}</span></button>
                <button type="button" class="boton suave" id="tl-cancel">${escape(t('gen_cancel'))}</button>
                ${item ? `<button type="button" class="boton rojo-suave" id="tl-del"><span data-icono="borrar"></span><span>${escape(t('tl_delete'))}</span></button>` : ''}</div></form>`;
        dialog.querySelectorAll('[data-icono]').forEach((x) => setIcon(x, x.dataset.icono));
        const area = dialog.querySelector('#tl-text');
        area.value = item ? item.text : '';
        if (window.ClasstoolsAI) {
            const box = window.ClasstoolsAI.box({
                kind: () => 'timeline', levels: ['primary', 'secondary', 'advanced'], counts: [6, 10, 15], count: 10,
                add: (text) => {
                    const got = parse(text);
                    if (!got.items.length) { return 0; }
                    area.value = (area.value.trim() ? area.value.trim() + '\n' : '') + text.trim();
                    return got.items.length;
                },
            });
            dialog.querySelector('#tl-ai').append(box.el);
        }
        dialog.querySelector('#tl-cancel').addEventListener('click', () => dialog.close());
        const del = dialog.querySelector('#tl-del');
        if (del) {
            del.addEventListener('click', () => {
                if (!del.classList.contains('confirma')) { del.classList.add('confirma'); core.relabel(del, t('tl_delete_sure'), 'borrar'); return; }
                st.mine = st.mine.filter((x) => x.id !== item.id); keep(); dialog.close(); choose(examples()[0].id);
            });
        }
        dialog.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const got = parse(area.value);
            if (!got.items.length) { dialog.querySelector('#tl-err').textContent = t('tl_err_empty'); return; }
            const text = area.value.trim().slice(0, 20000);
            if (item) { item.text = text; } else { item = { id: 'tl' + Date.now().toString(36), text }; st.mine.unshift(item); }
            keep(); dialog.close(); choose(item.id); play('card');
        });
        dialog.showModal();
    };
    $('#tl-new').addEventListener('click', () => edit(null));
    $('#tl-edit').addEventListener('click', () => { const c = current(); if (!c.example) { edit(st.mine.find((x) => x.id === c.id)); } });
    // The keyboard, while it is on screen: + and − zoom, the arrows move.
    document.addEventListener('keydown', (e) => {
        if (panel.hidden || panel.closest('[hidden]') || e.target.closest('input, textarea, select, dialog')) { return; }
        const span = view.b - view.a, mid = (view.a + view.b) / 2;
        const k = { '+': () => zoomAt(0.6, mid), '-': () => zoomAt(1 / 0.6, mid), ArrowLeft: () => pan(-span / 8), ArrowRight: () => pan(span / 8) }[e.key];
        if (k) { e.preventDefault(); k(); }
    });
    document.addEventListener('classtools:mode', () => { if (!st.current) { tl = parse(current().text); fillWhich(); fit(); } });
    fillWhich();

    window.ClasstoolsTimeline = { parse, dateOf, view: () => view, setView: (a, b) => { view = { a, b }; paint(); }, ticks: () => ticks(svg.clientWidth || 800), current: () => tl, fit, pick };   // for automated tests
})();
