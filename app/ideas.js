// Brainstorm on the board, for a live session of kind «ideas»: each device sends a word or two and the board turns
// the answers into a live cloud, where the same answer written in different ways counts as one and grows. The
// teacher taps to highlight, joins answers that mean the same, hides what should not be on screen (or checks
// everything before it shows), sorts them in a ranking or drags them into a template — SWOT, urgent and important,
// for and against, a scale from 1 to 5 — and saves the result as an image or sends it to the class. How the teacher
// arranged each question stays in the browser.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, escape, save, load, play, announce, setIcon } = core;

    const VIEWS = ['cloud', 'list', 'swot', 'eisen', 'procon', 'scale'];
    // The boxes of each template, with their colour.
    const ZONES = {
        swot: [['s', '#067e36'], ['w', '#ce1423'], ['o', '#164281'], ['t', '#ea7317']],
        eisen: [['ui', '#ce1423'], ['ni', '#164281'], ['un', '#ea7317'], ['nn', '#6b7684']],
        procon: [['pro', '#067e36'], ['con', '#ce1423']],
        scale: [['1', '#ce1423'], ['2', '#ea7317'], ['3', '#b07d00'], ['4', '#5f9e2f'], ['5', '#067e36']],
    };
    const COLOURS = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#c2410c', '#0e7c86', '#d6336c', '#8b5a2b'];
    const zoneName = (view, z) => (view === 'scale'
        ? (z === '1' ? `1 · ${t('id_scale_low')}` : (z === '5' ? `5 · ${t('id_scale_high')}` : z)) : t('id_z_' + z));

    // The same answer however it is written: without accents, capitals, punctuation or extra spaces.
    const keyOf = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
    const colourOf = (key) => COLOURS[[...key].reduce((a, c) => (a * 31 + c.codePointAt(0)) % 9973, 7) % COLOURS.length];

    let S = null, act = null, stage = null;
    let view = VIEWS.includes(load('ideas-vista', 'cloud')) ? load('ideas-vista', 'cloud') : 'cloud';
    let review = load('ideas-revisar', true) !== false;
    let maxEach = [1, 2, 3].includes(Number(load('ideas-max', 1))) ? Number(load('ideas-max', 1)) : 1;
    let R = null, roundKey = '', lastSig = '', showHidden = false, drag = null;
    const sel = new Set(), seen = new Set();
    let seenRound = '';

    // What the teacher did with the answers of a question: shown (true) or hidden (false) after checking, joined into
    // another, highlighted, placed in a box of each template, and the order of the ranking when moved by hand.
    const loadRound = (v) => {
        const key = `ideas-${v.id}-${v.round}`;
        if (key === roundKey) { return; }
        roundKey = key;
        R = Object.assign({ ok: {}, merge: {}, star: {}, place: {}, order: [] }, load(key, {}));
        VIEWS.forEach((x) => { if (ZONES[x] && (typeof R.place[x] !== 'object' || !R.place[x])) { R.place[x] = {}; } });
        sel.clear();
    };
    const keepRound = () => { if (roundKey) { save(roundKey, R); } };
    const rootOf = (k) => { let n = 0; while (R.merge[k] && n++ < 50) { k = R.merge[k]; } return k; };

    // The answers grouped: one per answer however it is written (and per answers joined by hand), with how many times
    // it came, and its label: the way it was written most often.
    const groups = () => {
        const by = new Map();
        (S.ideas || []).forEach((it) => {
            const own = keyOf(it.text);
            if (!own) { return; }
            const k = rootOf(own);
            let g = by.get(k);
            if (!g) { g = { key: k, n: 0, first: it.t, forms: {} }; by.set(k, g); }
            g.n++;
            g.first = Math.min(g.first, it.t);
            g.forms[it.text] = (g.forms[it.text] || 0) + (own === k ? 1000 : 1);
        });
        by.forEach((g) => { g.label = Object.entries(g.forms).sort((a, b) => b[1] - a[1])[0][0]; });
        return [...by.values()].sort((a, b) => a.first - b.first);
    };
    const status = (g) => (R.ok[g.key] === false ? 'hidden' : (R.ok[g.key] === true || !review ? 'shown' : 'pending'));

    // ---------------------------------------------------------------------------------------------------
    // The frame: the question, the count, the answers to check, the view, what to do with the chosen ones, and the
    // controls of the session
    // ---------------------------------------------------------------------------------------------------
    const build = () => {
        stage.innerHTML = `
            <div class="id-foto" id="id-foto">
                <div class="lv-pregunta"><input type="text" id="id-q" maxlength="140" placeholder="${escape(t('id_question_ph'))}" aria-label="${escape(t('id_question_ph'))}"></div>
                <div class="id-lienzo" id="id-canvas"></div>
            </div>
            <p class="id-cuenta" id="id-count" aria-live="polite"></p>
            <div class="id-bandeja-revisar" id="id-pending" hidden></div>
            <div class="id-bandeja-revisar id-ocultas" id="id-hidden-list" hidden></div>
            <div class="id-seleccion" id="id-sel" hidden>
                <span id="id-sel-n"></span>
                <button type="button" class="boton suave" id="id-star"><span data-icono="estrella"></span><span>${escape(t('id_star'))}</span></button>
                <button type="button" class="boton suave" id="id-merge"><span data-icono="juntar"></span><span>${escape(t('id_merge'))}</span></button>
                <button type="button" class="boton rojo-suave" id="id-hide"><span data-icono="ocultar"></span><span>${escape(t('id_hide'))}</span></button>
                <button type="button" class="boton suave" id="id-unselect">${escape(t('id_unselect'))}</button>
            </div>
            <div class="botonera centro lv-mandos id-mandos">
                <button type="button" class="boton grande" id="id-open"><span data-icono="empezar"></span><span></span></button>
                <button type="button" class="boton suave" id="id-new" hidden><span data-icono="mas"></span><span>${escape(t('id_new'))}</span></button>
                <select id="id-max" aria-label="${escape(t('id_max'))}" title="${escape(t('id_max'))}">${[1, 2, 3].map((n) => `<option value="${n}">${escape(n === 1 ? t('id_max_one') : t('id_max_many', n))}</option>`).join('')}</select>
                <select id="id-view" aria-label="${escape(t('id_view'))}" title="${escape(t('id_view'))}">${VIEWS.map((x) => `<option value="${x}">${escape(t('id_v_' + x))}</option>`).join('')}</select>
                <label class="interruptor"><input type="checkbox" id="id-review"><span>${escape(t('id_review'))}</span></label>
                <button type="button" class="boton suave" id="id-hidden" hidden></button>
                <button type="button" class="boton suave" id="id-save"><span data-icono="descargar"></span><span>${escape(t('id_save'))}</span></button>
                <button type="button" class="boton suave" id="id-send" hidden><span data-icono="enviar"></span><span>${escape(t('id_send'))}</span></button>
            </div>`;
        stage.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        const $ = (s) => stage.querySelector(s);
        maxEach = [1, 2, 3].includes(Number(load('ideas-max', 1))) ? Number(load('ideas-max', 1)) : 1;   // as chosen when it was opened
        $('#id-max').value = String(maxEach);
        $('#id-view').value = view;
        $('#id-review').checked = review;
        $('#id-send').hidden = !(window.ClasstoolsWhiteboard && window.ClasstoolsWhiteboard.share);
        $('#id-open').addEventListener('click', () => {
            if (S.open) { act('close'); play('cuenta'); return; }
            if (S.round) { act('reopen'); play('tic'); return; }
            act('open', { q: $('#id-q').value, max: maxEach }); play('tic');
        });
        $('#id-new').addEventListener('click', () => { act('open', { q: $('#id-q').value, max: maxEach }); play('tic'); });
        $('#id-max').addEventListener('change', () => { maxEach = Number($('#id-max').value) || 1; save('ideas-max', maxEach); });
        $('#id-view').addEventListener('change', () => { view = $('#id-view').value; save('ideas-vista', view); sel.clear(); paintCanvas(true); });
        $('#id-review').addEventListener('change', () => {
            review = $('#id-review').checked; save('ideas-revisar', review);
            // Checking from now on: what is already on screen stays there.
            if (review) { groups().forEach((g) => { if (R.ok[g.key] === undefined) { R.ok[g.key] = true; } }); keepRound(); }
            paintCanvas(true);
        });
        $('#id-hidden').addEventListener('click', () => { showHidden = !showHidden; paintCanvas(true); });
        $('#id-star').addEventListener('click', () => {
            const all = [...sel].every((k) => R.star[k]);
            sel.forEach((k) => { if (all) { delete R.star[k]; } else { R.star[k] = true; } });
            sel.clear(); keepRound(); paintCanvas(true); play('tic');
        });
        $('#id-merge').addEventListener('click', () => {
            const [into, ...rest] = [...sel];
            rest.forEach((k) => {
                R.merge[k] = into;
                if (R.star[k]) { R.star[into] = true; }
                delete R.star[k];
                Object.values(R.place).forEach((p) => { delete p[k]; });
            });
            R.order = R.order.filter((k) => !rest.includes(k));
            sel.clear(); keepRound(); paintCanvas(true); play('card');
        });
        $('#id-hide').addEventListener('click', () => { sel.forEach((k) => { R.ok[k] = false; }); sel.clear(); keepRound(); paintCanvas(true); play('tic'); });
        $('#id-unselect').addEventListener('click', () => { sel.clear(); paintCanvas(true); });
        $('#id-save').addEventListener('click', saveImage);
        $('#id-send').addEventListener('click', () => {
            const when = new Date().toLocaleString(document.documentElement.lang || undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            window.ClasstoolsWhiteboard.share(snapshot, t('id_default_name', when));
        });
        // Checking: show or hide each answer, or all of them at once; and the hidden ones back.
        $('#id-pending').addEventListener('click', (e) => {
            const b = e.target.closest('[data-ok]'); if (!b) { return; }
            const keys = b.dataset.k ? [b.dataset.k] : groups().filter((g) => status(g) === 'pending').map((g) => g.key);
            keys.forEach((k) => { R.ok[k] = b.dataset.ok === '1'; });
            keepRound(); paintCanvas(true); play(b.dataset.ok === '1' ? 'card' : 'tic');
        });
        $('#id-hidden-list').addEventListener('click', (e) => {
            const b = e.target.closest('[data-k]'); if (!b) { return; }
            R.ok[b.dataset.k] = true; keepRound(); paintCanvas(true);
        });
        wireCanvas($('#id-canvas'));
    };

    // ---------------------------------------------------------------------------------------------------
    // Painting
    // ---------------------------------------------------------------------------------------------------
    function paint(st, v, first, actFn) {
        stage = st; act = actFn; S = v;
        loadRound(v);
        if (first || !stage.querySelector('#id-canvas')) { build(); lastSig = ''; }
        const $ = (s) => stage.querySelector(s);
        const q = $('#id-q');
        // While the answers are open, the question is the one the devices see; closed, it can be changed for the next.
        q.readOnly = !!v.open;
        if (document.activeElement !== q || v.open) { if (v.round && (v.open || q.dataset.round !== String(v.round))) { q.value = v.q || ''; } }
        q.dataset.round = String(v.round);
        relabel($('#id-open'), v.open ? t('id_close') : (v.round ? t('id_reopen') : t('id_open')), v.open ? 'pausa' : 'empezar');
        $('#id-open').classList.toggle('amarillo', !!v.open);
        $('#id-new').hidden = !!v.open || !v.round;
        $('#id-max').disabled = !!v.open;
        $('#id-max').value = String(v.open ? v.max : maxEach);
        const who = new Set((v.ideas || []).map((x) => x.device)).size;
        $('#id-count').textContent = !v.round ? t('id_wait_open')
            : t('id_count', { n: (v.ideas || []).length, who, of: v.devices.length });
        paintCanvas(false);
    }
    const relabel = (b, text, icon) => core.relabel(b, text, icon);

    const paintCanvas = (force) => {
        if (!S || drag) { return; }
        const $ = (s) => stage.querySelector(s);
        const gs = groups();
        const sig = JSON.stringify([view, review, showHidden, S.round, gs.map((g) => [g.key, g.label, g.n]), R, [...sel]]);
        if (!force && sig === lastSig) { return; }
        lastSig = sig;
        if (seenRound !== roundKey) { seen.clear(); seenRound = roundKey; }
        const shown = gs.filter((g) => status(g) === 'shown');
        const pending = gs.filter((g) => status(g) === 'pending');
        const hidden = gs.filter((g) => status(g) === 'hidden');
        [...sel].forEach((k) => { if (!shown.some((g) => g.key === k)) { sel.delete(k); } });

        // To check: each new answer with «show» and «hide», and «show all».
        const pend = $('#id-pending');
        pend.hidden = !pending.length;
        pend.innerHTML = pending.length ? `<p class="ante">${escape(t('id_pending', pending.length))}</p><div class="id-revisar-lista">`
            + pending.map((g) => `<span class="id-revisar"><span>${escape(g.label)}${g.n > 1 ? ` <b>${g.n}</b>` : ''}</span>`
                + `<button type="button" class="id-si" data-ok="1" data-k="${escape(g.key)}" aria-label="${escape(t('id_accept', g.label))}" title="${escape(t('id_accept', g.label))}">${core.icon('hecho')}</button>`
                + `<button type="button" class="id-no" data-ok="0" data-k="${escape(g.key)}" aria-label="${escape(t('id_reject', g.label))}" title="${escape(t('id_reject', g.label))}">${core.icon('cerrar')}</button></span>`).join('')
            + `</div><button type="button" class="boton suave" data-ok="1">${escape(t('id_show_all'))}</button>` : '';
        const hb = $('#id-hidden');
        hb.hidden = !hidden.length;
        hb.textContent = t('id_hidden', hidden.length);
        if (!hidden.length) { showHidden = false; }
        const hl = $('#id-hidden-list');
        hl.hidden = !showHidden;
        hl.innerHTML = showHidden ? `<p class="ante">${escape(t('id_restore'))}</p><div class="id-revisar-lista">`
            + hidden.map((g) => `<button type="button" class="id-revisar" data-k="${escape(g.key)}">${escape(g.label)}</button>`).join('') + '</div>' : '';

        // The chosen ones: what can be done with them.
        $('#id-sel').hidden = !sel.size;
        $('#id-sel-n').textContent = t(sel.size === 1 ? 'id_selected_one' : 'id_selected_many', sel.size);
        $('#id-merge').disabled = sel.size < 2;
        core.relabel($('#id-star'), [...sel].length && [...sel].every((k) => R.star[k]) ? t('id_unstar') : t('id_star'), 'estrella');

        const canvas = $('#id-canvas');
        canvas.dataset.view = view;
        if (!shown.length) {
            canvas.innerHTML = `<p class="id-vacio">${escape(S.round ? (pending.length ? t('id_check_first') : t('id_empty')) : t('id_wait_open'))}</p>`;
        } else if (view === 'cloud') {
            canvas.innerHTML = cloud(shown);
        } else if (view === 'list') {
            canvas.innerHTML = ranking(shown);
        } else {
            canvas.innerHTML = template(shown);
        }
        shown.forEach((g) => seen.add(g.key));
    };

    const cls = (g) => `${R.star[g.key] ? ' destacada' : ''}${sel.has(g.key) ? ' elegida' : ''}${seen.has(g.key) ? '' : ' nueva'}`;
    const attrs = (g, more = '') => `data-k="${escape(g.key)}" aria-pressed="${sel.has(g.key)}" style="--c:${colourOf(g.key)}${more}"`;

    // The cloud: the most repeated, bigger and in the middle.
    const cloud = (shown) => {
        const most = Math.max(...shown.map((g) => g.n));
        const top = shown.length > 40 ? 2.8 : (shown.length > 20 ? 3.6 : 4.4);
        const byCount = shown.slice().sort((a, b) => b.n - a.n || a.first - b.first);
        const placed = [];
        byCount.forEach((g, i) => { if (i % 2) { placed.push(g); } else { placed.unshift(g); } });
        return `<div class="id-nube">${placed.map((g) => {
            const size = 1.15 + (top - 1.15) * Math.sqrt((g.n - 1) / Math.max(1, most - 1));
            return `<button type="button" class="id-palabra${cls(g)}" ${attrs(g, `; font-size:${size.toFixed(2)}rem`)} data-foto="${escape(g.label)}">`
                + `${escape(g.label)}${g.n > 1 ? `<sup data-foto="${g.n}">${g.n}</sup>` : ''}</button>`;
        }).join('')}</div>`;
    };

    // The ranking: by how many times, or in the order the teacher dragged them to.
    const ranked = (shown) => {
        const byCount = shown.slice().sort((a, b) => b.n - a.n || a.first - b.first);
        if (!R.order.length) { return byCount; }
        const pos = (k) => { const i = R.order.indexOf(k); return i < 0 ? 1e6 : i; };
        return byCount.slice().sort((a, b) => pos(a.key) - pos(b.key));
    };
    const ranking = (shown) => {
        const most = Math.max(...shown.map((g) => g.n));
        return `<ol class="id-lista">${ranked(shown).map((g) => `<li class="id-fila${cls(g)}" ${attrs(g)} tabindex="0" role="button">`
            + `<span class="id-asa" aria-hidden="true">${core.icon('mover')}</span><span class="id-texto" data-foto="${escape(g.label)}">${escape(g.label)}</span>`
            + `<span class="id-pista"><i style="width:${(100 * g.n / most).toFixed(1)}%" data-foto=""></i></span><strong data-foto="${g.n}">${g.n}</strong></li>`).join('')}</ol>`
            + (R.order.length ? `<p class="centro"><button type="button" class="boton suave" id="id-sort">${escape(t('id_sort'))}</button></p>` : '');
    };

    // A template: the answers not placed yet above, and the boxes; each answer is dragged to its box.
    const card = (g) => `<button type="button" class="id-tarjeta${cls(g)}" ${attrs(g)} data-foto=""><span data-foto="${escape(g.label)}">${escape(g.label)}</span>`
        + `${g.n > 1 ? `<b data-foto="${g.n}">${g.n}</b>` : ''}</button>`;
    const template = (shown) => {
        const zones = ZONES[view];
        const ids = zones.map(([z]) => z);
        const place = R.place[view];
        const loose = shown.filter((g) => !ids.includes(place[g.key]));
        return `<div class="id-bandeja" data-z=""><p class="nota">${escape(loose.length ? t('id_tray') : t('id_tray_empty'))}</p>`
            + `<div class="id-tarjetas">${loose.map(card).join('')}</div></div>`
            + `<div class="id-plantilla id-t-${view}">${zones.map(([z, c]) => `<section class="id-zona" data-z="${z}" style="--c:${c}" data-foto="">`
                + `<h3 data-foto="${escape(zoneName(view, z))}">${escape(zoneName(view, z))}</h3>`
                + `<div class="id-tarjetas">${shown.filter((g) => place[g.key] === z).map(card).join('')}</div></section>`).join('')}</div>`;
    };

    // ---------------------------------------------------------------------------------------------------
    // Tapping and dragging
    // ---------------------------------------------------------------------------------------------------
    const wireCanvas = (canvas) => {
        let press = null;
        canvas.addEventListener('pointerdown', (e) => {
            const el = e.target.closest('[data-k]');
            if (!el || e.button > 0) { return; }
            press = { el, key: el.dataset.k, x: e.clientX, y: e.clientY, id: e.pointerId };
        });
        canvas.addEventListener('pointermove', (e) => {
            if (!press || e.pointerId !== press.id) { return; }
            const can = view !== 'cloud';
            if (!drag && can && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) {
                const r = press.el.getBoundingClientRect();
                const ghost = press.el.cloneNode(true);
                ghost.classList.add('id-fantasma');
                Object.assign(ghost.style, { width: `${r.width}px`, height: `${r.height}px`, left: `${r.left}px`, top: `${r.top}px` });
                document.body.append(ghost);
                press.el.classList.add('arrastrando');
                drag = { key: press.key, ghost, dx: press.x - r.left, dy: press.y - r.top };
                try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not captured: still works */ }
            }
            if (drag) {
                e.preventDefault();
                drag.ghost.style.left = `${e.clientX - drag.dx}px`;
                drag.ghost.style.top = `${e.clientY - drag.dy}px`;
                const over = targetAt(e.clientX, e.clientY);
                canvas.querySelectorAll('.encima').forEach((x) => x.classList.remove('encima'));
                if (over) { over.classList.add('encima'); }
            }
        });
        const up = (e) => {
            if (!press || e.pointerId !== press.id) { return; }
            const p = press; press = null;
            if (!drag) {
                // A tap: chosen or not (drawn again after the click that follows, so the click still finds its answer).
                if (sel.has(p.key)) { sel.delete(p.key); } else { sel.add(p.key); }
                play('tic'); setTimeout(() => paintCanvas(true), 0);
                return;
            }
            const d = drag; drag = null;
            d.ghost.remove();
            const over = e.type === 'pointerup' ? targetAt(e.clientX, e.clientY) : null;
            if (over && view === 'list') {
                const order = [...canvas.querySelectorAll('.id-fila')].map((x) => x.dataset.k).filter((k) => k !== d.key);
                const r = over.getBoundingClientRect();
                const at = order.indexOf(over.dataset.k) + (e.clientY > r.top + r.height / 2 ? 1 : 0);
                order.splice(Math.max(0, at), 0, d.key);
                R.order = order;
                play('card');
            } else if (over) {
                if (over.dataset.z) { R.place[view][d.key] = over.dataset.z; } else { delete R.place[view][d.key]; }
                play('card');
            }
            keepRound(); setTimeout(() => paintCanvas(true), 0);
        };
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', up);
        // A tap on nothing lets go of the chosen ones; «sort by count» undoes the order dragged by hand.
        canvas.addEventListener('click', (e) => {
            if (e.target.closest('#id-sort')) { R.order = []; keepRound(); paintCanvas(true); return; }
            if (!e.target.closest('[data-k]') && sel.size) { sel.clear(); paintCanvas(true); }
        });
        // From the keyboard: Enter or Space chooses.
        canvas.addEventListener('keydown', (e) => {
            const el = e.target.closest('[data-k]');
            if (!el || (e.key !== 'Enter' && e.key !== ' ')) { return; }
            if (el.tagName !== 'BUTTON') { e.preventDefault(); }
            if (el.tagName === 'BUTTON') { return; }
            if (sel.has(el.dataset.k)) { sel.delete(el.dataset.k); } else { sel.add(el.dataset.k); }
            paintCanvas(true);
        });
        canvas.addEventListener('click', (e) => {
            const el = e.target.closest('button[data-k]');
            // Buttons chosen from the keyboard (a pointer tap is handled on pointerup).
            if (el && e.detail === 0) { if (sel.has(el.dataset.k)) { sel.delete(el.dataset.k); } else { sel.add(el.dataset.k); } paintCanvas(true); }
        });
    };
    // Where a dragged answer would land: a row of the ranking, or a box (or the tray) of a template.
    const targetAt = (x, y) => {
        const el = document.elementFromPoint(x, y);
        if (!el || !stage.contains(el)) { return null; }
        return view === 'list' ? el.closest('.id-fila') : el.closest('[data-z]');
    };

    // ---------------------------------------------------------------------------------------------------
    // The picture: what is on screen (the question and the view) drawn again on a canvas, box by box and text by text
    // ---------------------------------------------------------------------------------------------------
    const snapshot = () => {
        const area = stage.querySelector('#id-foto');
        const box = area.getBoundingClientRect(), k = 2;
        const c = document.createElement('canvas');
        c.width = Math.round(box.width * k); c.height = Math.round(box.height * k);
        const g = c.getContext('2d');
        g.scale(k, k);
        g.fillStyle = '#ffffff'; g.fillRect(0, 0, box.width, box.height);
        const q = stage.querySelector('#id-q');
        q.dataset.foto = q.value;
        [q, ...area.querySelectorAll('[data-foto]')].forEach((el) => {
            const r = el.getBoundingClientRect();
            if (!r.width || !r.height || r.bottom < box.top || r.top > box.bottom) { return; }
            const cs = getComputedStyle(el), x = r.left - box.left, y = r.top - box.top;
            const bg = cs.backgroundColor, bw = parseFloat(cs.borderTopWidth) || 0;
            const filled = bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg);
            if ((filled || (bw && cs.borderTopStyle !== 'none' && cs.borderTopStyle !== 'dashed')) && el !== q) {
                const rad = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, r.height / 2, r.width / 2);
                g.beginPath();
                if (g.roundRect) { g.roundRect(x + bw / 2, y + bw / 2, r.width - bw, r.height - bw, rad); } else { g.rect(x, y, r.width, r.height); }
                if (filled) { g.fillStyle = bg; g.fill(); }
                if (bw) { g.lineWidth = bw; g.strokeStyle = cs.borderTopColor; g.stroke(); }
                // A card: its coloured edge on the left, and a hairline where the screen has a shadow.
                const bl = parseFloat(cs.borderLeftWidth) || 0;
                if (bl > bw + 1) {
                    g.save(); g.clip(); g.fillStyle = cs.borderLeftColor; g.fillRect(x, y, bl, r.height); g.restore();
                }
                if (!bw && cs.boxShadow && cs.boxShadow !== 'none') { g.lineWidth = 1; g.strokeStyle = '#d9e2ee'; g.stroke(); }
            }
            const text = el.dataset.foto;
            if (!text) { return; }
            g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            g.fillStyle = cs.color;
            g.textBaseline = 'middle';
            const padL = parseFloat(cs.paddingLeft) || 0, padR = parseFloat(cs.paddingRight) || 0;
            const width = r.width - padL - padR + 2;
            const lines = [];
            text.split(/\s+/).forEach((w) => {
                const last = lines.length ? lines[lines.length - 1] : null;
                if (last !== null && g.measureText(`${last} ${w}`).width <= width) { lines[lines.length - 1] = `${last} ${w}`; } else { lines.push(w); }
            });
            const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
            const centred = cs.textAlign === 'center' || el.classList.contains('id-palabra') || el.tagName === 'B' || el.tagName === 'STRONG';
            g.textAlign = centred ? 'center' : 'left';
            const tx = centred ? x + padL + (r.width - padL - padR) / 2 : x + padL;
            const top = y + r.height / 2 - (lines.length - 1) * lh / 2;
            lines.forEach((line, i) => g.fillText(line, tx, top + i * lh));
        });
        delete q.dataset.foto;
        return c;
    };
    const saveImage = () => {
        const c = snapshot();
        c.toBlob((blob) => {
            if (!blob) { return; }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${t('id_file')}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.png`;
            document.body.append(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(a.href), 4000);
            announce(t('id_saved'));
        }, 'image/png');
    };

    window.ClasstoolsLiveIdeas = { paint, keyOf, snapshot, groups: () => (S ? groups() : []) };   // the last two for tests
})();
