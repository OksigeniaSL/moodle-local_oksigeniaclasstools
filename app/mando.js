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
 * The teacher's fixed remote, on the phone: the address with its key, without logging in. It shows the teacher's
 * boards that are open (the course of each, nothing about the students); with more than one, it asks which one. On top,
 * the tool on the board, with its icon (a tap changes it); then its buttons as the board sends them, the main one big
 * and pressable (the groups: how many, «Make groups»; a game: «Right», «Wrong», «Pass»), and its options. «Let a
 * student press it» leaves only that main button, big and round, for a child to press: a pause after each press, and
 * leaving only by holding. At the bottom, «More orders» (the ones for any tool: the timer, a pick, presenting…), the
 * printed cards and changing the class. It asks the site every two seconds which boards are open. «Cards» turns the
 * phone into the reader of the printed cards: the camera, each card outlined in the colour of its answer, and the
 * readings sent to the board (only the numbers of the cards and their answers: the names are on the board).
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const R = window.CLASSTOOLS_REMOTE || {};
    const STR = R.str || {};
    const root = document.getElementById('jn');
    const t = (key, a) => { let s = STR[key] || key; if (a !== undefined) { s = s.split('{$a}').join(a); } return s; };
    const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const buzz = (p = 30) => { if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) { /* no vibration */ } } };
    const head = () => `<header class="jn-cabeza"><span>${escape(R.site || '')}</span><strong>${escape(t('rm_title'))}</strong></header>`;
    const screen = (title, text = '', extra = '') => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(title)}</p>${text ? `<p class="jn-texto">${escape(text)}</p>` : ''}${extra}</div>`;
    };
    if (!R.k) { screen(t('rm_off_title'), t('rm_off_text')); return; }

    // The look of each tool: the icon of its tab on the board (icons.js), and one of the board's colours.
    const TOOL_ICONS = { pizarra: 'pincel', marcador: 'trofeo', envivo: 'mano' };
    const TOOL_COLOURS = { temporizador: '#164281', cronometro: '#164281', quien: '#5b2fb8', grupos: '#067e36', semaforo: '#067e36',
        azar: '#ce1423', juegos: '#ce1423', material: '#5b2fb8', pizarra: '#164281', presentacion: '#5b2fb8', marcador: '#0e7c86',
        asi: '#0e7c86', reloj: '#164281', qr: '#164281', envivo: '#ce1423' };
    const ico = (n, cls = 'jn-ico') => (n && typeof icono === 'function' ? icono(n, cls) : '');
    const toolIcon = (id, cls) => ico(TOOL_ICONS[id] || id, cls);
    const colour = (id) => TOOL_COLOURS[id] || '#164281';

    const COMMANDS = [['tm_toggle', 'lv_cmd_timer', 'grande'], ['tm_reset', 'lv_cmd_reset'], ['tm_plus', 'lv_cmd_plus'],
        ['pick', 'lv_cmd_pick'], ['turn', 'rm_cmd_turn'], ['next', 'rm_cmd_next'], ['present', 'lv_cmd_present'],
        ['tab_prev', 'lv_cmd_prev'], ['tab_next', 'lv_cmd_next'], ['live', 'rm_cmd_live'], ['relay', 'rm_cmd_relay'],
        ['curtain', 'rm_cmd_curtain'], ['reveal', 'rm_cmd_reveal']];
    const post = (action, extra = {}) => fetch(R.api, { method: 'POST', body: new URLSearchParams({ k: R.k, action, ...extra }) })
        .then((r) => r.json());
    let boards = [], course = Number(localStorage.getItem('mando-curso')) || 0, shown = '', timer = 0, failures = 0;
    // Until when the buttons of the tool are not painted again: an option just touched shows at once, and the board
    // takes a moment to say so (meanwhile it would go back).
    let hold = 0;
    // The main button of the tool on the board (for a student to press), and until when it rests after a press.
    let main = null, kid = false, kidUntil = 0, wake = null;
    const board = () => boards.find((b) => b.course === course) || boards[0] || null;

    // What was sent, for a moment, over the bottom of the screen.
    let last = '', lastUntil = 0, noteTimer = 0;
    const note = (text) => {
        last = text; lastUntil = Date.now() + 2600;
        const el = document.getElementById('jn-hecho');
        if (!el) { return; }
        el.textContent = text || ' ';
        el.classList.toggle('visto', !!text);
        clearTimeout(noteTimer); noteTimer = setTimeout(() => el.classList.remove('visto'), 2600);
    };
    // The orders for any tool (not what the tool already has on top: the timer's own, the curtain on the board).
    const general = (b, mine) => {
        const dup = new Set(mine.flat().map((x) => x[0]).concat(b.tool === 'temporizador' ? ['tm_toggle', 'tm_reset', 'tm_plus'] : []));
        return `<div class="jn-mando">${COMMANDS.filter(([c]) => !dup.has(c)).map(([c, k, cls]) => `<button type="button" class="${mine.length ? '' : cls || ''}" data-cmd="${c}">${escape(t(k))}</button>`).join('')}</div>`;
    };

    const render = () => {
        if (scanning) { return; }
        const b = board();
        if (!b) {
            shown = ''; main = null;
            screen(t('rm_no_board_title'), t('rm_no_board_text'), '<div class="jn-espera" aria-hidden="true"><i></i><i></i><i></i></div>');
            if (kid) { paintKid(); }
            return;
        }
        course = b.course;
        // Painted again only when the boards, the one chosen or its tool change: a tap is not lost under the finger. The
        // buttons of the tool, only when they change.
        const mine = Array.isArray(b.here) ? b.here : [];
        const key = JSON.stringify([boards.map((x) => [x.course, x.name]), b.course, b.tool, b.tools, mine.length > 0]);
        if (key === shown) { paintHere(mine); return; }
        shown = key;
        const tools = b.tools || [], now = tools.find((x) => x[0] === b.tool);
        root.style.setProperty('--c', colour(b.tool));
        root.innerHTML = `${head()}
            ${boards.length > 1 ? `<div class="jn-tablas" role="radiogroup" aria-label="${escape(t('rm_which'))}">${boards.map((x) => `<button type="button" role="radio" aria-checked="${x.course === b.course}" data-course="${x.course}">${escape(x.name)}</button>`).join('')}</div>` : `<p class="jn-curso">${escape(b.name)}</p>`}
            ${tools.length ? `<button type="button" class="jn-herr" id="jn-herr" aria-haspopup="dialog">
                <span class="jn-herr-ico">${toolIcon(b.tool)}</span>
                <span class="jn-herr-txt"><small>${escape(t('rm_on_board_short'))}</small><strong>${escape(now ? now[1] : '')}</strong></span>
                <span class="jn-herr-cambiar">${escape(t('rm_change'))}${ico('siguiente')}</span></button>` : ''}
            ${mine.length ? '<div class="jn-aqui" id="jn-aqui"></div>' : general(b, mine)}
            <button type="button" class="jn-alumno" id="jn-b-alumno" hidden>${ico('mano')}<span>${escape(t('rm_kid'))}</span></button>
            <nav class="jn-pie" aria-label="${escape(t('rm_title'))}">
                ${mine.length ? `<button type="button" id="jn-b-mas" aria-haspopup="dialog">${ico('lista')}<span>${escape(t('rm_more'))}</span></button>` : ''}
                ${window.ClasstoolsScanner ? `<button type="button" id="jn-leer">${ico('cartas')}<span>${escape(t('rm_bar_cards'))}</span></button>` : ''}
                <button type="button" id="jn-b-clase" aria-haspopup="dialog">${ico('cambiar')}<span>${escape(t('rm_bar_class'))}</span></button>
            </nav>
            <p class="jn-toast" id="jn-hecho" aria-live="polite"></p>
            <div class="jn-hoja" id="jn-hoja" hidden><div class="jn-hoja-panel" role="dialog" aria-modal="true" aria-labelledby="jn-hoja-titulo">
                <div class="jn-hoja-cabeza"><strong id="jn-hoja-titulo"></strong><button type="button" class="jn-hoja-cerrar" data-cerrar aria-label="${escape(t('rm_close'))}">${ico('cerrar')}</button></div>
                <div class="jn-hoja-cuerpo" id="jn-hoja-cuerpo"></div></div></div>`;
        if (Date.now() < lastUntil) { note(last); }
        paintHere(mine);
    };
    // The buttons of the tool on the board, in its rows: the main one big, the one that is on marked, right and wrong in
    // their colours, a value between its two steps (then «−» and «+»), a line of text; from «Options» on, its options
    // in a card of their own.
    function paintHere(rows) {
        main = rows.flat().find((x) => x[2] === 'big') || null;
        const kidButton = document.getElementById('jn-b-alumno');
        if (kidButton) { kidButton.hidden = !main; }
        if (kid) { paintKid(); }
        const box = document.getElementById('jn-aqui'), key = JSON.stringify(rows);
        if (!box || box.dataset.key === key || Date.now() < hold) { return; }
        box.dataset.key = key;
        const button = ([cmd, name, how, icon], glyph) => {
            const attrs = `data-cmd="${escape(cmd)}" data-name="${escape(name)}"`;
            if (how === 'chk' || how === 'chkon') { return `<button type="button" role="switch" aria-checked="${how === 'chkon'}" class="jn-chk" ${attrs}>${escape(name)}</button>`; }
            if (how === 'opt' || how === 'opton') { return `<button type="button" class="jn-opt" aria-pressed="${how === 'opton'}" ${attrs}>${escape(name)}</button>`; }
            if (glyph) { return `<button type="button" ${attrs} aria-label="${escape(name)}">${how === 'less' ? '−' : '+'}</button>`; }
            return `<button type="button" class="${{ big: 'grande', yes: 'jn-si', no: 'jn-no' }[how] || ''}" ${attrs}${how === 'on' ? ' aria-pressed="true"' : ''}>${ico(icon, how === 'big' ? 'jn-ico jn-ico-grande' : 'jn-ico')}<span>${escape(name)}</span></button>`;
        };
        let options = false;
        const html = rows.map((row) => {
            const cap = row.find((x) => x[2] === 'cap'), items = row.filter((x) => x[2] !== 'cap');
            const head = cap ? `<span class="jn-cap">${escape(cap[1])}</span>` : '';
            if (!items.length) {
                // «Options»: from here to the end, a card.
                const open = options ? '</section>' : '';
                options = true;
                return `${open}<section class="jn-opciones"><p class="jn-cap jn-seccion">${escape(cap[1])}</p>`;
            }
            // A long choice (many options, or long ones): a list.
            if (items.every((x) => x[2] === 'opt' || x[2] === 'opton') && (items.length > 4 || items.some((x) => x[1].length > 14))) {
                const none = items.some((x) => x[2] === 'opton') ? '' : '<option value="" selected disabled>—</option>';
                return `<label class="jn-eleccion">${head}<select data-sel>${none}${items.map(([cmd, name, how]) => `<option value="${escape(cmd)}"${how === 'opton' ? ' selected' : ''}>${escape(name)}</option>`).join('')}</select></label>`;
            }
            const steps = items.some((x) => x[2] === 'val'), switches = items.every((x) => x[2] === 'chk' || x[2] === 'chkon');
            // As many in a line as fit: short names (1 min, +5), up to five; three of a game («Right», «Wrong», «Pass»);
            // switches with long names, one under another.
            const n = steps ? items.length : switches ? (items.every((x) => x[1].length <= 14) ? 2 : 1)
                : items.every((x) => x[1].length <= 6) ? Math.min(items.length, 5)
                    : items.length === 3 && items.every((x) => x[1].length <= 12) ? 3 : Math.min(items.length, 2);
            return `<div class="jn-mando jn-fila${steps ? ' jn-pasos' : ''}${n > 3 ? ' jn-cortos' : ''}" style="--n:${n}">${head}${items.map((x) => {
                if (x[2] === 'txt') { return `<p class="jn-linea">${escape(x[1])}</p>`; }
                if (x[2] === 'val') { return `<output class="jn-valor">${escape(x[1])}</output>`; }
                return button(x, steps && (x[2] === 'less' || x[2] === 'more'));
            }).join('')}</div>`;
        }).join('');
        box.innerHTML = html + (options ? '</section>' : '');
    }

    // --- The sheets from the bottom: the tools, more orders, the class ------------------------------------------------
    const closeSheet = () => { const s = document.getElementById('jn-hoja'); if (s) { s.hidden = true; } };
    const openSheet = (what) => {
        const b = board(), sheet = document.getElementById('jn-hoja');
        if (!b || !sheet) { return; }
        const body = document.getElementById('jn-hoja-cuerpo'), title = document.getElementById('jn-hoja-titulo');
        sheet.dataset.what = what;
        if (what === 'tools') {
            title.textContent = t('rm_tools');
            body.innerHTML = `<div class="jn-tiles">${(b.tools || []).map(([id, name]) => `<button type="button" class="jn-tile" style="--c:${colour(id)}" data-cmd="tool_${escape(id)}" data-name="${escape(name)}"${id === b.tool ? ' aria-current="true"' : ''}>${toolIcon(id)}<span>${escape(name)}</span></button>`).join('')}</div>`;
        } else if (what === 'more') {
            title.textContent = t('rm_more');
            body.innerHTML = general(b, Array.isArray(b.here) ? b.here : []);
        } else {
            // Changing the class: the teacher's courses, and the board goes to the one chosen; the phone follows it.
            title.textContent = t('rm_course');
            body.innerHTML = `<p class="jn-texto">${escape(t('rm_course_hint'))}</p><div class="jn-mando" id="jn-clases-lista"></div>`;
            const list = document.getElementById('jn-clases-lista');
            post('courses').then((v) => {
                const courses = (v && v.courses) || [];
                list.innerHTML = courses.filter((c) => c.id !== course).map((c) => `<button type="button" data-goto="${c.id}">${escape(c.name)}</button>`).join('')
                    || `<p class="jn-texto">${escape(t('rm_course_none'))}</p>`;
            }).catch(() => { list.innerHTML = `<p class="jn-texto">${escape(t('lv_offline'))}</p>`; });
        }
        sheet.hidden = false;
    };

    // --- A student presses ------------------------------------------------------------------------------------------
    // Only the main button, big and round, in the colour of the tool. After a press it rests for a moment (a child
    // presses again and again), with confetti; leaving is holding «Hold to leave», which a child does not do by chance.
    const paintKid = () => {
        const layer = document.getElementById('jn-nino');
        if (!layer) { return; }
        const b = board(), now = b && (b.tools || []).find((x) => x[0] === b.tool), wait = Date.now() < kidUntil;
        const key = JSON.stringify([main, b && b.tool, now, wait]);
        if (layer.dataset.key === key) { return; }
        layer.dataset.key = key;
        layer.style.setProperty('--c', colour(b ? b.tool : ''));
        layer.innerHTML = `<button type="button" class="jn-nino-salir" id="jn-nino-salir"><i aria-hidden="true"></i><span>${escape(t('rm_kid_hold'))}</span></button>
            <p class="jn-nino-herr">${b ? toolIcon(b.tool) : ''}<span>${escape(now ? now[1] : '')}</span></p>
            ${main ? `<button type="button" class="jn-nino-boton${wait ? ' espera' : ''}" id="jn-nino-boton" data-cmd="${escape(main[0])}" data-name="${escape(main[1])}"${wait ? ' disabled' : ''}>${ico(main[3], 'jn-ico')}<span>${escape(main[1])}</span></button>`
                : `<p class="jn-nino-nada">${escape(t('rm_kid_none'))}</p>`}
            <p class="jn-nino-nota" aria-live="polite">${wait ? escape(t('rm_kid_look')) : '&nbsp;'}</p>
            <div class="jn-confeti" aria-hidden="true">${wait ? Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('') : ''}</div>`;
    };
    const openKid = () => {
        kid = true; kidUntil = 0;
        closeSheet();
        let layer = document.getElementById('jn-nino');
        if (!layer) { layer = document.createElement('div'); layer.id = 'jn-nino'; layer.className = 'jn-nino'; document.body.append(layer); }
        paintKid();
        // The whole screen, and the phone does not go to sleep while the class plays.
        try { if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen().catch(() => {}); } } catch (e) { /* not here */ }
        try { if (navigator.wakeLock) { navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } } catch (e) { /* not here */ }
    };
    const closeKid = () => {
        kid = false;
        const layer = document.getElementById('jn-nino');
        if (layer) { layer.remove(); }
        try { if (document.fullscreenElement && document.exitFullscreen) { document.exitFullscreen().catch(() => {}); } } catch (e) { /* not here */ }
        if (wake) { wake.release().catch(() => {}); wake = null; }
    };
    let leaving = 0;
    document.addEventListener('click', (e) => {
        const kb = e.target.closest('#jn-nino-boton');
        if (!kb || kb.disabled) { return; }
        buzz([40, 60, 40]);
        kidUntil = Date.now() + 2500;
        order(kb.dataset.cmd, kb.dataset.name);
        paintKid();
        setTimeout(paintKid, 2600);
    });
    document.addEventListener('pointerdown', (e) => {
        const x = e.target.closest('#jn-nino-salir');
        if (!x) { return; }
        x.classList.add('llenando');
        clearTimeout(leaving); leaving = setTimeout(closeKid, 1200);
    });
    const stay = () => { clearTimeout(leaving); const x = document.getElementById('jn-nino-salir'); if (x) { x.classList.remove('llenando'); } };
    document.addEventListener('pointerup', stay);
    document.addEventListener('pointercancel', stay);
    document.addEventListener('contextmenu', (e) => { if (e.target.closest('#jn-nino')) { e.preventDefault(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (kid) { closeKid(); } else { closeSheet(); } } });

    // --- Reading the printed cards ----------------------------------------------------------------------------------
    let scanning = false, stream = null, loop = 0, sendTimer = 0;
    const seen = new Map(), pending = new Map();
    const COLOURS = { A: '#ce1423', B: '#164281', C: '#fbbe17', D: '#067e36' };
    const send = () => {
        clearTimeout(sendTimer);
        if (!scanning) { return; }
        const batch = [...pending.entries()].slice(0, 20);
        if (batch.length) {
            const cmd = 'cards_' + batch.map(([id, a]) => `${id}${a.toLowerCase()}`).join('');
            post('command', { cmd, course }).then((v) => {
                if (v && v.ok) { batch.forEach(([id, a]) => { if (pending.get(id) === a) { pending.delete(id); } }); }
                const note = document.getElementById('jn-leer-nota');
                if (note && v && v.why === 'closed') { note.textContent = t('rm_closed'); }
            }).catch(() => {});
        }
        sendTimer = setTimeout(send, 1000);
    };
    const stopScan = () => {
        scanning = false;
        clearTimeout(loop); clearTimeout(sendTimer);
        if (stream) { stream.getTracks().forEach((tr) => tr.stop()); stream = null; }
        shown = ''; render();
    };
    const startScan = () => {
        scanning = true;
        seen.clear(); pending.clear();
        root.innerHTML = `${head()}<div class="jn-leer">
            <div class="jn-camara"><video id="jn-video" playsinline muted></video><canvas id="jn-capa" aria-hidden="true"></canvas></div>
            <p class="jn-titulo" id="jn-leidas" aria-live="polite">${escape(t('rm_scan_count', 0))}</p>
            <p class="jn-texto" id="jn-leer-nota">${escape(t('rm_scan_hint'))}</p>
            <ol class="jn-ultimas" id="jn-ultimas"></ol>
            <button type="button" class="jn-boton suave" id="jn-leer-fin">${escape(t('rm_scan_back'))}</button></div>`;
        document.getElementById('jn-leer-fin').addEventListener('click', () => { buzz(); stopScan(); });
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { document.getElementById('jn-leer-nota').textContent = t('rm_scan_nocam'); return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
            .then((s) => {
                if (!scanning) { s.getTracks().forEach((tr) => tr.stop()); return; }
                stream = s;
                const video = document.getElementById('jn-video'), layer = document.getElementById('jn-capa');
                video.srcObject = s; video.play().catch(() => {});
                const work = document.createElement('canvas'), wctx = work.getContext('2d', { willReadFrequently: true });
                const tick = () => {
                    if (!scanning) { return; }
                    if (video.videoWidth) {
                        const k = Math.min(1, 1280 / video.videoWidth);
                        work.width = Math.round(video.videoWidth * k); work.height = Math.round(video.videoHeight * k);
                        wctx.drawImage(video, 0, 0, work.width, work.height);
                        const got = window.ClasstoolsScanner.detect(wctx.getImageData(0, 0, work.width, work.height));
                        // The cards read, outlined over the picture in the colour of their answer.
                        layer.width = video.clientWidth; layer.height = video.clientHeight;
                        const ctx = layer.getContext('2d'), f = Math.min(layer.width / work.width, layer.height / work.height);
                        const ox = (layer.width - work.width * f) / 2, oy = (layer.height - work.height * f) / 2;
                        ctx.clearRect(0, 0, layer.width, layer.height);
                        let fresh = false;
                        got.forEach(({ id, answer, corners }) => {
                            ctx.strokeStyle = COLOURS[answer]; ctx.lineWidth = 5; ctx.beginPath();
                            corners.forEach(([x, y], i) => (i ? ctx.lineTo(ox + x * f, oy + y * f) : ctx.moveTo(ox + x * f, oy + y * f)));
                            ctx.closePath(); ctx.stroke();
                            if (seen.get(id) !== answer) { seen.set(id, answer); pending.set(id, answer); fresh = true; }
                        });
                        if (fresh) {
                            buzz();
                            document.getElementById('jn-leidas').textContent = t('rm_scan_count', seen.size);
                            document.getElementById('jn-ultimas').innerHTML = [...seen.entries()].reverse().slice(0, 8)
                                .map(([id, a]) => `<li style="--c:${COLOURS[a]}"><b>${a}</b> ${escape(t('rm_scan_card', id))}</li>`).join('');
                        }
                    }
                    loop = setTimeout(tick, 200);
                };
                tick();
                send();
            })
            .catch(() => { const n = document.getElementById('jn-leer-nota'); if (n) { n.textContent = t('rm_scan_nocam'); } });
    };

    root.addEventListener('click', (e) => {
        if (e.target.closest('#jn-leer')) { buzz(); startScan(); return; }
        if (e.target.closest('#jn-herr')) { buzz(); openSheet('tools'); return; }
        if (e.target.closest('#jn-b-mas')) { buzz(); openSheet('more'); return; }
        if (e.target.closest('#jn-b-clase')) { buzz(); openSheet('class'); return; }
        if (e.target.closest('#jn-b-alumno')) { buzz(); openKid(); return; }
        if (e.target.closest('[data-cerrar]') || e.target.matches('.jn-hoja')) { closeSheet(); return; }
        const goto = e.target.closest('[data-goto]');
        if (goto) {
            buzz();
            const to = Number(goto.dataset.goto), name = goto.textContent;
            post('command', { cmd: `course_${to}`, course }).then((v) => {
                if (v && v.ok) {
                    note(t('rm_course_going', name));
                    // The phone follows the board to its new course.
                    course = to; localStorage.setItem('mando-curso', String(to));
                    closeSheet();
                } else { note(v && v.why === 'closed' ? t('rm_closed') : ''); }
            }).catch(() => {});
            return;
        }
        const pick = e.target.closest('[data-course]');
        if (pick) { course = Number(pick.dataset.course); localStorage.setItem('mando-curso', String(course)); shown = ''; render(); return; }
        const b = e.target.closest('[data-cmd]');
        if (!b) { return; }
        buzz();
        // A switch or an option shows at once how it was left; the big one goes down and sends a wave.
        if (b.matches('.jn-chk')) { b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true')); hold = Date.now() + 2500; }
        if (b.matches('.jn-opt')) { b.parentNode.querySelectorAll('.jn-opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b))); hold = Date.now() + 2500; }
        if (b.matches('.grande')) { b.classList.remove('enviado'); void b.offsetWidth; b.classList.add('enviado'); }
        order(b.dataset.cmd, b.dataset.name || (b.dataset.cmd.startsWith('tool_') ? b.textContent : t((COMMANDS.find((x) => x[0] === b.dataset.cmd) || [])[1] || '')));
        // An order from a sheet: the sheet goes.
        if (b.closest('.jn-hoja')) { closeSheet(); }
    });
    // An option of a list.
    root.addEventListener('change', (e) => {
        const sel = e.target.closest('select[data-sel]');
        if (!sel || !sel.value) { return; }
        buzz();
        hold = Date.now() + 2500;
        order(sel.value, sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '');
    });
    function order(cmd, label) {
        post('command', { cmd, course }).then((v) => {
            if (v && v.off) { stop(); closeKid(); screen(t('rm_off_title'), t('rm_off_text')); return; }
            note(v && v.ok ? `${label} · ${t('lv_sent')}` : (v && v.why === 'closed' ? t('rm_closed') : ''));
            // Closed, or that button is no longer on the board: what there is now. Sent: soon, to see how it was left.
            if (v && (v.why === 'closed' || v.why === 'gone')) { hold = 0; poll(); } else if (v && v.ok && timer !== -1) { clearTimeout(timer); timer = setTimeout(poll, 1000); }
        }).catch(() => note(t('lv_offline')));
    }

    const poll = () => {
        clearTimeout(timer);
        if (document.hidden) { return; }
        post('state').then((v) => {
            failures = 0;
            if (v && v.off) { stop(); closeKid(); screen(t('rm_off_title'), t('rm_off_text')); return; }
            boards = Array.isArray(v && v.boards) ? v.boards : [];
            render();
        }).catch(() => {
            failures++;
            if (failures === 3) { const n = document.createElement('p'); n.className = 'jn-aviso'; n.textContent = t('lv_offline'); root.append(n); shown = ''; }
        }).finally(() => { if (timer !== -1) { timer = setTimeout(poll, 2000); } });
    };
    function stop() { clearTimeout(timer); timer = -1; }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && timer !== -1) { poll(); } });
    screen(t('rm_title'));
    poll();
})();
