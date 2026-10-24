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
 * Presentation: a Canva presentation inside the board, with the other tools at hand (the split screen, the small
 * timer). The teacher pastes the link of the design from Share → Copy link (with the access level «Anyone with the
 * link»), a short one (canva.link, followed by Moodle) or a long one, or its embed link or HTML code; the board keeps
 * the last ones of the course. Nothing comes from Canva until one is opened, and a site shows this tab only when its
 * administrator turns it on.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-presentacion');
    if (!core || !root) { return; }
    const { $, t, escape, save, load, setIcon, announce } = core;
    const STR = {
        link: t('pr_link'), placeholder: t('pr_placeholder'), name: t('pr_name'), open: t('pr_open'), where: t('pr_where'),
        steps: [t('pr_step1'), t('pr_step2'), t('pr_step3')], note: t('pr_note'), bad: t('pr_bad'), short: t('pr_short'),
        shortFail: t('pr_short_fail'), recent: t('pr_recent'), remove: t('pr_remove'), inCanva: t('pr_in_canva'), other: t('pr_other'), blank: t('pr_blank'),
        untitled: t('pr_untitled'), opened: (x) => t('pr_opened', x), turn: t('turn_button'), turnTask: t('pr_turn_task'),
        write: t('pr_write'), writeNote: t('pr_write_note'), undo: t('wb_undo'), clear: t('wb_clear'),
    };
    const MAX = 12;
    const COLOURS = [[t('wb_red'), '#ce1423'], [t('wb_blue'), '#164281'], [t('wb_green'), '#067e36'], [t('wb_yellow'), '#f5b800'],
        [t('wb_black'), '#1c1a19']];

    // A Canva design in whatever was pasted: its embed, view or edit link, or the HTML embed code. The second part of
    // the path, when there is one, is the design's share token. → { id, token } or null.
    const parse = (text) => {
        const m = String(text || '').match(/canva\.com\/design\/([A-Za-z0-9_-]{8,})(?:\/([A-Za-z0-9_-]{10,}))?/);
        return m ? { id: m[1], token: m[2] || '' } : null;
    };
    const SHORT = /^\s*(?:https?:\/\/)?canva\.link\/[A-Za-z0-9]{4,40}\/?\s*$/i;
    const base = (d) => `https://www.canva.com/design/${d.id}/${d.token ? d.token + '/' : ''}`;
    const embedUrl = (d) => base(d) + 'view?embed';

    // The presentations of this course: in the browser and, inside Moodle, for the teacher in the course (the newest
    // one wins).
    const storeKey = 'presentaciones' + (core.moodle ? ':' + core.moodle.courseid : '');
    let store = load(storeKey, null);
    const kept = core.kept('presentaciones');
    if (kept && Array.isArray(kept.items) && (!store || (kept.updated || 0) > (store.updated || 0))) { store = kept; }
    if (!store || !Array.isArray(store.items)) { store = { items: [], last: null }; }
    const persist = () => { store.updated = Date.now(); save(storeKey, store); core.keep('presentaciones', store); };

    root.innerHTML = `
        <div class="pr-elige" id="pr-elige">
            <div class="tarjeta pr-pegar">
                <label class="campo apilado" for="pr-enlace"><span>${escape(STR.link)}</span></label>
                <input type="text" inputmode="url" id="pr-enlace" maxlength="2000" autocomplete="off" spellcheck="false" placeholder="${escape(STR.placeholder)}">
                <label class="campo apilado" for="pr-nombre"><span>${escape(STR.name)}</span></label>
                <input type="text" id="pr-nombre" maxlength="60" autocomplete="off">
                <div class="botonera"><button type="button" class="boton" id="pr-abrir"><span data-icono="empezar"></span>${escape(STR.open)}</button></div>
                <p class="pr-error" id="pr-error" role="alert" hidden></p>
                <details class="pr-como"><summary>${escape(STR.where)}</summary>
                    <ol>${STR.steps.map((s) => `<li>${escape(s)}</li>`).join('')}</ol></details>
                <p class="nota">${escape(STR.note)}</p>
            </div>
            <div class="tarjeta pr-recientes" id="pr-recientes" hidden>
                <p class="ante">${escape(STR.recent)}</p>
                <ul id="pr-lista"></ul>
            </div>
        </div>
        <div class="pr-vista" id="pr-vista" hidden>
            <div class="pr-barra">
                <strong class="pr-titulo" id="pr-titulo"></strong>
                <button type="button" class="boton" id="pr-turno" hidden><span data-icono="quien"></span>${escape(STR.turn)}</button>
                <button type="button" class="boton suave" id="pr-escribir" aria-pressed="false" title="${escape(STR.writeNote)}"><span data-icono="lapiz"></span>${escape(STR.write)}</button>
                <a class="boton suave" id="pr-canva" target="_blank" rel="noopener noreferrer"><span data-icono="ventana"></span>${escape(STR.inCanva)}</a>
                <button type="button" class="boton suave" id="pr-otra"><span data-icono="lista"></span>${escape(STR.other)}</button>
            </div>
            <div class="pr-marco" id="pr-marco">
                <canvas class="pr-lamina" id="pr-lamina" hidden></canvas>
                <div class="pr-paleta" id="pr-paleta" role="toolbar" aria-label="${escape(STR.write)}" hidden>
                    <div class="ct-swatches" role="radiogroup" aria-label="${escape(STR.write)}">${COLOURS.map(([n, c], i) => `<button type="button" role="radio" class="ct-swatch" aria-checked="${i === 0}" data-c="${c}" style="--c:${c}" aria-label="${escape(n)}" title="${escape(n)}"></button>`).join('')}</div>
                    <button type="button" class="redondo suave" id="pr-deshacer" aria-label="${escape(STR.undo)}" title="${escape(STR.undo)}"><span data-icono="deshacer"></span></button>
                    <button type="button" class="redondo suave" id="pr-borrar" aria-label="${escape(STR.clear)}" title="${escape(STR.clear)}"><span data-icono="borrar"></span></button>
                </div>
            </div>
            <p class="nota pr-pista">${escape(STR.blank)}</p>
        </div>`;
    root.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));

    const showError = (text) => { const e = $('#pr-error'); e.textContent = text || ''; e.hidden = !text; };
    const paintList = () => {
        $('#pr-recientes').hidden = !store.items.length;
        $('#pr-lista').innerHTML = store.items.map((it) => `<li>
                <button type="button" class="pr-item" data-id="${escape(it.id)}"><span data-icono="presentacion"></span><span>${escape(it.name)}</span></button>
                <button type="button" class="redondo suave pr-quitar" data-quitar="${escape(it.id)}" aria-label="${escape(STR.remove + ': ' + it.name)}" title="${escape(STR.remove)}"><span data-icono="cerrar"></span></button>
            </li>`).join('');
        $('#pr-lista').querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
    };
    // --- Writing on it: a clear sheet over the slide (Canva's page cannot be drawn on from here). Off, what was written
    // goes away, so that the slides can be moved on. Strokes in fractions of the sheet, to draw them again at any size.
    const sheet = $('#pr-lamina'), pen = sheet.getContext('2d');
    let writing = false, colour = COLOURS[0][1], strokes = [], stroke = null;
    const fit = () => {
        const w = sheet.clientWidth, h = sheet.clientHeight, r = window.devicePixelRatio || 1;
        if (sheet.width !== Math.round(w * r) || sheet.height !== Math.round(h * r)) { sheet.width = Math.round(w * r); sheet.height = Math.round(h * r); }
        pen.setTransform(r, 0, 0, r, 0, 0);
        pen.lineCap = 'round'; pen.lineJoin = 'round';
        return [w, h];
    };
    const line = (s, from, w, h) => {
        pen.strokeStyle = s.c; pen.lineWidth = Math.max(3, s.w * w);
        pen.beginPath();
        const [x0, y0] = s.p[Math.max(0, from - 1)];
        pen.moveTo(x0 * w, y0 * h);
        s.p.slice(from).forEach(([x, y]) => pen.lineTo(x * w, y * h));
        if (s.p.length === 1) { pen.lineTo(x0 * w + .1, y0 * h); }
        pen.stroke();
    };
    const repaint = () => { const [w, h] = fit(); pen.clearRect(0, 0, w, h); strokes.forEach((s) => line(s, 0, w, h)); };
    const where = (e) => { const b = sheet.getBoundingClientRect(); return [(e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height]; };
    sheet.addEventListener('pointerdown', (e) => {
        try { sheet.setPointerCapture(e.pointerId); } catch (x) { /* a pointer that is no longer down */ }
        stroke = { c: colour, w: 0.005, p: [where(e)] };
        strokes.push(stroke);
        const [w, h] = fit(); line(stroke, 0, w, h);
    });
    sheet.addEventListener('pointermove', (e) => {
        if (!stroke) { return; }
        stroke.p.push(where(e));
        line(stroke, stroke.p.length - 1, sheet.clientWidth, sheet.clientHeight);
    });
    ['pointerup', 'pointercancel'].forEach((k) => sheet.addEventListener(k, () => { stroke = null; }));
    if (window.ResizeObserver) { new ResizeObserver(() => { if (writing) { repaint(); } }).observe(sheet); }
    const write = (on) => {
        writing = on;
        sheet.hidden = !on; $('#pr-paleta').hidden = !on;
        $('#pr-escribir').setAttribute('aria-pressed', String(on));
        strokes = []; stroke = null;
        if (on) { repaint(); }
    };
    $('#pr-escribir').addEventListener('click', () => write(!writing));
    $('#pr-paleta .ct-swatches').addEventListener('click', (e) => {
        const b = e.target.closest('[data-c]');
        if (!b) { return; }
        colour = b.dataset.c;
        $('#pr-paleta').querySelectorAll('[data-c]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    });
    $('#pr-deshacer').addEventListener('click', () => { strokes.pop(); repaint(); });
    $('#pr-borrar').addEventListener('click', () => { strokes = []; repaint(); });

    // «Whose turn?» over the slide, to ask someone of the class (with a list chosen in «Whose turn?»).
    const paintTurn = () => { $('#pr-turno').hidden = !(core.turn && core.lists && core.lists().length); };
    $('#pr-turno').addEventListener('click', () => core.turn($('#pr-marco'), { task: STR.turnTask }));
    document.addEventListener('classtools:lists', paintTurn);
    paintTurn();

    // The frame is made again for each presentation (a new address in the same frame would add to the page history).
    const show = (it) => {
        const marco = $('#pr-marco');
        const old = $('#pr-iframe');
        if (old) { old.remove(); }
        write(false);
        const frame = document.createElement('iframe');
        frame.id = 'pr-iframe';
        frame.title = it.name;
        frame.allow = 'fullscreen';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.src = embedUrl(it);
        marco.prepend(frame);
        $('#pr-titulo').textContent = it.name;
        $('#pr-canva').href = base(it) + 'view';
        $('#pr-elige').hidden = true;
        $('#pr-vista').hidden = false;
        announce(STR.opened(it.name));
    };
    const open = (it) => {
        store.items = [it].concat(store.items.filter((x) => x.id !== it.id)).slice(0, MAX);
        store.last = it.id;
        persist();
        show(it);
    };
    const back = () => {
        const old = $('#pr-iframe');
        if (old) { old.remove(); }
        write(false);
        $('#pr-vista').hidden = true;
        $('#pr-elige').hidden = false;
        store.last = null;
        persist();
        paintList();
        $('#pr-enlace').focus();
    };

    const add = (d) => {
        showError('');
        const before = store.items.find((x) => x.id === d.id);
        const name = $('#pr-nombre').value.trim() || (before && before.name) || STR.untitled;
        open({ id: d.id, token: d.token || (before && before.token) || '', name, at: Date.now() });
        $('#pr-enlace').value = ''; $('#pr-nombre').value = '';
    };
    // A short link: Moodle asks canva.link where it leads (the browser cannot). Outside Moodle, the long one is needed.
    const AULA = core.moodle;
    const follow = (text) => {
        const button = $('#pr-abrir');
        button.disabled = true;
        core.callJson('presentation_resolve', { courseid: AULA.courseid, url: text.trim() })
            .then((j) => { if (j && j.ok && j.id) { add(j); } else { showError(STR.shortFail); } })
            .catch(() => showError(STR.shortFail))
            .finally(() => { button.disabled = false; });
    };
    $('#pr-abrir').addEventListener('click', () => {
        const text = $('#pr-enlace').value.trim(), d = parse(text);
        if (d) { add(d); return; }
        if (!SHORT.test(text)) { showError(STR.bad); return; }
        if (AULA && core.has('presentation')) { follow(text); } else { showError(STR.short); }
    });
    $('#pr-enlace').addEventListener('keydown', (e) => { if (e.key === 'Enter') { $('#pr-abrir').click(); } });
    $('#pr-nombre').addEventListener('keydown', (e) => { if (e.key === 'Enter') { $('#pr-abrir').click(); } });
    $('#pr-lista').addEventListener('click', (e) => {
        const item = e.target.closest('[data-id]'), gone = e.target.closest('[data-quitar]');
        if (gone) {
            store.items = store.items.filter((x) => x.id !== gone.dataset.quitar);
            persist();
            paintList();
            return;
        }
        if (item) {
            const it = store.items.find((x) => x.id === item.dataset.id);
            if (it) { open(Object.assign({}, it, { at: Date.now() })); }
        }
    });
    $('#pr-otra').addEventListener('click', back);

    // The one that was open opens again when the tab is shown (it loads from Canva only then).
    let started = false;
    core.register('presentacion', {
        entra: () => {
            if (started) { return; }
            started = true;
            const last = store.last && store.items.find((x) => x.id === store.last);
            if (last) { show(last); } else { paintList(); }
        },
    });
    paintList();

    window.ClasstoolsPresentation = { parse, embedUrl, short: (x) => SHORT.test(x), state: () => store, strokes: () => strokes.length };   // for automated tests
})();
