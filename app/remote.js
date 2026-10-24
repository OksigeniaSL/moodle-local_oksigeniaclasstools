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
 * The remote on the board: what each order of the teacher's phone does (for the remote of a live session and for the
 * fixed one, which can also send the printed cards it reads), and the fixed remote itself. While it is on, the open
 * board asks the site every second and a half for its orders and says which tool it is on, with the buttons of that
 * tool for the phone (the main one first, with the names they have now); its panel (in «Live»,
 * «Remote») turns it on and off, shows its address and QR, and changes the address when it may have been shared.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { escape, t, play } = core;
    const AULA = core.moodle;

    // --- The orders --------------------------------------------------------------------------------------------
    const visible = (b) => b && !b.disabled && !b.hidden && b.offsetParent !== null;
    const click = (sel) => { const b = document.querySelector(sel); if (b && !b.disabled && !b.hidden) { b.click(); } };
    const step = (d) => { const tabs = core.tabs(), i = tabs.indexOf(core.current()); core.show(tabs[(i + d + tabs.length) % tabs.length]); };
    const RUN = {
        tm_toggle: () => click('#tm-marcha'),
        tm_reset: () => click('#tm-reiniciar'),
        tm_plus: () => click('#tm-mas1'),
        pick: () => { core.show('quien'); click('#q-elegir'); },
        // «Whose turn?» of the game or the material on screen.
        turn: () => { const b = ['#ga-turn', '#mt-turn'].map((s) => document.querySelector(s)).find(visible); if (b) { b.click(); } },
        // The next question of a quiz.
        next: () => { const b = document.querySelector('#qz-next'); if (visible(b)) { b.click(); } },
        tab_next: () => step(1),
        tab_prev: () => step(-1),
        present: () => click(document.documentElement.classList.contains('presentando') ? '#b-salir-presentar' : '#b-presentar'),
        // The curtain of the board, on or off, and uncovering a little more.
        curtain: () => { core.show('pizarra'); if (window.ClasstoolsInstruments) { window.ClasstoolsInstruments.remoteCurtain('toggle'); } },
        reveal: () => { core.show('pizarra'); if (window.ClasstoolsInstruments) { window.ClasstoolsInstruments.remoteCurtain('reveal'); } },
        // The relay of «Whose turn?» on screen: on (as last chosen, or every minute) or off.
        relay: () => {
            const sel = [...document.querySelectorAll('.ct-turno-cada')].find(visible);
            if (!sel) { return; }
            sel.value = sel.value !== '0' ? '0' : String(core.load('turno-relevo-ultimo', 60) || 60);
            sel.dispatchEvent(new Event('change', { bubbles: true }));
        },
        // Open or close what is on in «Live»: the vote, the brainstorm question or the exit ticket.
        live: () => { const b = ['#lv-open', '#id-open', '#ex-close', '#ex-open'].map((s) => document.querySelector(s)).find(visible); if (b) { b.click(); } },
    };
    // --- What the phone shows of the tool on screen --------------------------------------------------------------
    // Rows of the board's own buttons, with the names they have now («Pause» while the timer runs, «Again» once the
    // groups are made), only the ones that can be pressed. An item is [key, selector, how, name]: each button the
    // selector finds is the order «x_<key>» (and its place, when it finds several); how is big (the main one), less or
    // more (a step), yes or no (right or wrong), val (a value, not a button) or txt (a line of text); name, when there
    // is one, is a text of the board or a function of the element, instead of the button's own. Without a selector,
    // the key is a known order. The options (below) go as chk or chkon (a switch, off or on), opt or opton (one of a
    // choice) and cap (the name of a choice). A button with an icon on the board takes it to the phone, fourth.
    const GAME_GO = ['#ro-start', '#ro-again', '#si-start', '#ec-listen', '#ah-start', '#wo-start', '#me-start', '#sc2-start',
        '#ordenar-start', '#clasificar-start', '#errores-start', '#quiensoy-start'].join(', ');
    const GAME_MORE = ['#ro-pause', '#ro-end', '#ro-change', '#ec-again', '#ec-new', '#ah-uncover', '#ah-reveal', '#errores-show',
        '#quiensoy-clue', '#quiensoy-show'].join(', ');
    // The letter of the wheel on screen, and its answer, which only the teacher sees on the phone.
    const roscoNow = () => {
        const g = window.ClasstoolsRosco && document.querySelector('#ro-game');
        const st = g && g.offsetParent !== null ? window.ClasstoolsRosco.state() : null;
        const team = st && st.running ? st.teams[st.turn] : null, it = team && team.items[team.pos];
        return it ? it : null;
    };
    const HERE = {
        temporizador: [[['go', '#tm-marcha', 'big']],
            [['ml', '#h-temporizador [data-ajusta="min"][data-paso="-1"]', 'less'], ['mv', '#tm-min', 'val', (el) => `${el.value} min`],
                ['mm', '#h-temporizador [data-ajusta="min"][data-paso="1"]', 'more']],
            [['re', '#tm-reiniciar'], ['pl', '#tm-mas1', '', 'lv_cmd_plus']],
            [['ch', '#h-temporizador .chip[data-min]']]],
        cronometro: [[['go', '#cr-marcha', 'big']], [['la', '#cr-vuelta'], ['re', '#cr-reiniciar']]],
        quien: [[['go', '#q-elegir', 'big']], [['re', '#q-reset']]],
        grupos: [[['md', '#g-modo [data-modo]']], [['le', '#g-menos', 'less'], ['n', '#g-n', 'val'], ['mr', '#g-mas', 'more']],
            [['go', '#g-hacer', 'big']], [['ro', '#g-rotar']]],
        semaforo: [[['go', '#s-marcha', 'big']], [['aj', '#s-ajustar']]],
        azar: [[['md', '#ch-mode button']], [['go', '#wh-spin, #di-roll, #co-toss, #ca-draw', 'big']], [['re', '#ca-reshuffle, #co-reset']]],
        juegos: [[['', null, 'txt', () => { const it = roscoNow(), k = document.querySelector('#ro-kind'), c = document.querySelector('#ro-clue');
            return it ? `${k ? k.textContent.trim() : it.l}: ${c ? c.textContent.trim() : ''}` : ''; }]],
            [['', null, 'txt', () => { const it = roscoNow(); return it ? t('rm_answer', it.a) : ''; }]],
            [['go', GAME_GO, 'big']], [['ok', '#ro-ok', 'yes'], ['ko', '#ro-bad', 'no'], ['ps', '#ro-pass']],
            [['ri', '#quiensoy-right, #ec-good', 'yes'], ['mo', GAME_MORE]], [['tu', '#ga-turn']]],
        material: [[['tu', '#mt-turn']]],
        pizarra: [[['curtain', null, '', 'rm_cmd_curtain'], ['reveal', null, '', 'rm_cmd_reveal']], [['pv', '#wb-prev'], ['nx', '#wb-next']],
            [['nw', '#wb-new'], ['tu', '#wb-turn']]],
        presentacion: [[['tu', '#pr-turno']], [['es', '#pr-escribir'], ['de', '#pr-deshacer'], ['bo', '#pr-borrar']]],
        // Each team, its points and its steps; or the class goal.
        marcador: () => [[['md', '#h-marcador [role="radio"][data-v]']],
            ...[...document.querySelectorAll('#sc-teams .ct-team')].flatMap((card) => {
                const sel = `#sc-teams .ct-team[data-i="${card.dataset.i}"]`, name = card.querySelector('.ct-team-name');
                return [[[`t${card.dataset.i}`, `${sel} .ct-score`, 'val', (el) => `${name ? name.value : ''} · ${el.textContent}`]],
                    [[`s${card.dataset.i}`, `${sel} .ct-step`]]];
            }),
            [['gc', '#gl-count', 'val', (el) => el.textContent]], [['gs', '#gl-steps [data-s]']]],
        asi: [[['md', '#h-asi .modo-trabajo']], [['ce', '#gigante-cerrar']]],
        envivo: [[['go', '#lv-start, #lv-open, #id-open, #ex-open, #ex-close, #qz-go, #qz-next', 'big']], [['rv', '#qz-reveal, #ex-reopen']]],
    };
    const named = (el) => (el.getAttribute('aria-label') || (el.tagName === 'INPUT' ? el.value : el.textContent) || '').trim();

    // The options of the tool, after its buttons, as the board has them: each choice (its radio buttons or its list) in
    // a row with its name, the switches together («Deal with suspense», «Scratch to reveal»…) and each slider with its
    // two steps. What opens something to type («Numbers…», «Paste names now…») stays on the board.
    const OPTIONS = { temporizador: '#h-temporizador', quien: '#h-quien', grupos: '#h-grupos', semaforo: '#h-semaforo',
        azar: '#h-azar', juegos: '#h-juegos', material: '#h-material', marcador: '#h-marcador', reloj: '#h-reloj',
        envivo: '#h-envivo' };
    // The name of a control: its own, the one that labels it, or the text of its label without the control.
    const caption = (el) => {
        const by = el.getAttribute('aria-labelledby'), lab = el.closest('label') || (el.id && document.querySelector(`label[for="${el.id}"]`));
        const text = el.getAttribute('aria-label') || (by ? by.split(' ').map((id) => (document.getElementById(id) || {}).textContent || '').join(' ')
            : lab ? [...lab.childNodes].filter((n) => !n.contains(el)).map((n) => n.textContent).join(' ') : '');
        return (text || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    };
    const fire = (el, events) => events.forEach((e) => el.dispatchEvent(new Event(e, { bubbles: true })));
    // A choice: the options of its list, or its radio buttons, in a row with its name (none if there is nothing to
    // choose).
    const choice = (el, key, used, acts) => {
        const list = el.matches('select');
        const opts = list
            ? (visible(el) ? [...el.options].map((o, i) => [o, i]).filter(([o]) => !o.disabled && !o.hidden && !/(…|\.\.\.)\s*$/.test(o.textContent)) : [])
            : [...el.querySelectorAll('[role="radio"]')].map((o, i) => [o, i]).filter(([o]) => visible(o));
        if (opts.length < 2 || used.has(el) || opts.some(([o]) => used.has(o))) { return null; }
        used.add(el);
        const row = [['', caption(el), 'cap']];
        opts.slice(0, 11).forEach(([o, i]) => {
            // A choice with a name and a line under it («Vote», «They answer A–D…»): its name.
            const strong = !list && o.querySelector('strong, b');
            const text = (o.getAttribute('aria-label') || (strong || o).textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
            const on = list ? o.selected : ['aria-checked', 'aria-pressed'].some((a) => o.getAttribute(a) === 'true');
            if (!text) { return; }
            // With its icon, when the board shows one, for the phone to draw the choice as big buttons.
            const ic = !list && o.querySelector('[data-icono]');
            row.push(ic ? [`${key}x${i}`, text, on ? 'opton' : 'opt', ic.dataset.icono] : [`${key}x${i}`, text, on ? 'opton' : 'opt']);
            acts.set(`${key}x${i}`, list ? () => { el.value = o.value; fire(el, ['change']); } : () => o.click());
        });
        return row;
    };
    const options = (box, used, acts) => {
        const rows = [];
        let switches = null;
        box.querySelectorAll('[role="radiogroup"], select, input[type="checkbox"], input[type="range"]').forEach((el, n) => {
            const key = `x_o${n}`;
            if (el.matches('input[type="checkbox"]')) {
                const text = caption(el);
                if (el.disabled || !(visible(el) || visible(el.closest('label'))) || !text) { return; }
                if (!switches) { switches = []; rows.push(switches); }
                switches.push([key, text, el.checked ? 'chkon' : 'chk']);
                acts.set(key, () => el.click());
                return;
            }
            switches = null;
            if (el.matches('input[type="range"]')) {
                if (!visible(el)) { return; }
                const step = Number(el.step) || 1, min = Number(el.min || 0), max = Number(el.max || 100);
                const go = (d) => () => { el.value = String(Math.min(max, Math.max(min, Number(el.value) + d * step))); fire(el, ['input', 'change']); };
                rows.push([['', caption(el), 'cap'], [`${key}l`, t('g_less'), 'less'], ['', el.value, 'val'], [`${key}m`, t('g_more'), 'more']]);
                acts.set(`${key}l`, go(-1)); acts.set(`${key}m`, go(1));
                return;
            }
            const row = choice(el, key, used, acts);
            if (row) { rows.push(row); }
        });
        return rows;
    };

    // Which class first, before the buttons: the list of «Whose turn?» and the students of «Groups».
    const FIRST = { quien: '#q-lista', grupos: '#g-lista' };
    // The rows for the phone, and what each order does.
    const here = () => {
        const spec = HERE[core.current()], rows = [], acts = new Map(), used = new Set();
        const first = FIRST[core.current()] && document.querySelector(FIRST[core.current()]);
        const which = first ? choice(first, 'x_l', used, acts) : null;
        if (which) { rows.push(which); }
        (typeof spec === 'function' ? spec() : spec || []).forEach((row) => {
            const items = [];
            row.forEach(([key, sel, how = '', name]) => {
                if (!sel) {
                    const text = typeof name === 'function' ? name() : t(name);
                    if (text) { items.push([how === 'txt' ? '' : key, text, how]); }
                    return;
                }
                const all = [...document.querySelectorAll(sel)];
                all.forEach((el, i) => {
                    if (how === 'val' ? el.offsetParent === null : !visible(el)) { return; }
                    const cmd = how === 'val' ? '' : `x_${key}${all.length > 1 ? i : ''}`;
                    const text = (typeof name === 'function' ? name(el) : name ? t(name) : named(el)).replace(/\s+/g, ' ').slice(0, 60);
                    const on = ['aria-checked', 'aria-pressed'].some((a) => el.getAttribute(a) === 'true') || el.classList.contains('activo');
                    if (!text) { return; }
                    // With the icon it has on the board, if it has one.
                    const ic = el.querySelector && el.querySelector('[data-icono]');
                    items.push(ic && cmd ? [cmd, text, how || (on ? 'on' : ''), ic.dataset.icono] : [cmd, text, how || (on ? 'on' : '')]);
                    used.add(el);
                    if (cmd) { acts.set(cmd, () => el.click()); }
                });
            });
            if (items.length) { rows.push(items.slice(0, 12)); }
        });
        const box = OPTIONS[core.current()] && document.querySelector(OPTIONS[core.current()]);
        const more = box ? options(box, used, acts) : [];
        if (more.length) { rows.push([['', t('rm_options'), 'cap']], ...more); }
        return { rows: rows.slice(0, 40), acts };
    };

    // What the phone asked for, in words, for the board to show it.
    const NAMES = { tm_toggle: 'lv_cmd_timer', tm_reset: 'lv_cmd_reset', tm_plus: 'lv_cmd_plus', pick: 'lv_cmd_pick', turn: 'rm_cmd_turn',
        next: 'rm_cmd_next', present: 'lv_cmd_present', tab_prev: 'lv_cmd_prev', tab_next: 'lv_cmd_next', curtain: 'rm_cmd_curtain',
        reveal: 'rm_cmd_reveal', relay: 'rm_cmd_relay', live: 'rm_cmd_live' };
    const said = (cmd) => {
        if (cmd.startsWith('cards_')) { return t('rm_scan'); }
        if (cmd.startsWith('course_')) { return t('rm_course'); }
        if (cmd.startsWith('tool_')) { const b = document.querySelector(`[data-h="${cmd.slice(5)}"]`); return b ? (b.getAttribute('aria-label') || b.textContent || '').trim() : ''; }
        if (cmd.startsWith('x_')) { const b = here().rows.flat().find((x) => x[0] === cmd); return b ? b[1] : ''; }
        return NAMES[cmd] ? t(NAMES[cmd]) : '';
    };
    let lastOrder = '';
    // Five orders from the phone in a page: a real use of the remote, for the teacher's sticker.
    let orders = 0;
    const run = (cmd) => {
        orders++;
        if (orders >= 5 && core.logro) { core.logro('mandamas'); }
        lastOrder = said(cmd);
        document.dispatchEvent(new CustomEvent('classtools:order', { detail: { cmd, said: lastOrder } }));
        try {
            // Another course: the board goes to that course's board (the phone only lists the teacher's own).
            if (cmd.startsWith('course_')) {
                const id = Number(cmd.slice(7));
                if (id > 0) { location.href = `${location.pathname}?id=${id}`; }
                return;
            }
            if (cmd.startsWith('tool_')) { const id = cmd.slice(5); if (core.tabs().includes(id)) { core.show(id); } return; }
            // Cards read by the phone: card numbers and answers (cards.js).
            if (cmd.startsWith('cards_')) { if (window.ClasstoolsCards) { window.ClasstoolsCards.fromPhone(cmd); } return; }
            // A button or an option of the tool on screen, if it is still there.
            if (cmd.startsWith('x_')) { const act = here().acts.get(cmd); if (act) { act(); } return; }
            if (RUN[cmd]) { RUN[cmd](); }
        } catch (e) { /* a tool that is not there */ }
    };

    // --- The fixed remote --------------------------------------------------------------------------------------
    // Not in a copy of a duel (duel.js): only the board itself takes the phone's orders.
    if (!AULA || !core.has('remote') || AULA.mode !== 'teacher' || core.duelo) { window.ClasstoolsRemote = { run }; return; }
    let status = Object.assign({ on: false }, AULA.remote || {}), seq = -1, timer = 0, phone = false, panel = null;
    // The web services of the fixed remote: remote_poll (its answer, a JSON document), remote_enable, remote_rotate
    // and remote_status.
    const call = (action, extra = {}) => {
        const args = { courseid: AULA.courseid, ...extra };
        if (action === 'poll') { return core.callJson('remote_poll', args); }
        if (action === 'on' || action === 'off') { return core.call('remote_enable', { ...args, on: action === 'on' }); }
        return core.call(action === 'rotate' ? 'remote_rotate' : 'remote_status', args);
    };
    // The tools of the board, with their names, for the phone to go to them.
    const tools = () => core.tabs().map((id) => {
        // The label of the tab (the timer's tab also carries its countdown, which would change every second).
        const b = document.querySelector(`[data-h="${id}"]`), label = b && (b.querySelector('[data-t]') || b);
        const name = b ? (b.getAttribute('aria-label') || label.textContent || '').trim() : '';
        return { id, name: name.slice(0, 40) };
    }).filter((x) => x.name);
    const poll = () => {
        clearTimeout(timer);
        if (!status.on) { return; }
        let ran = false;
        call('poll', { since: Math.max(seq, 0), tool: core.current(), tools: tools(), here: JSON.stringify(here().rows) }).then((v) => {
            if (!v.on) { status = { on: false }; paint(); return; }
            // The first answer only says where the orders are: the ones left from before are not run.
            if (seq >= 0) { (v.cmds || []).forEach((c) => { if (c.seq > seq) { run(c.cmd); ran = true; } }); }
            seq = Math.max(seq, v.seq || 0);
            if (v.phone !== phone) { phone = v.phone; paint(); }
        }).catch(() => { /* offline for a moment: it tries again */ })
            // After an order, soon again: the phone sees how the board was left. With the phone there, more often, so
            // that its orders come sooner.
            .finally(() => { if (status.on) { timer = setTimeout(poll, ran ? 400 : phone ? 700 : 1500); } });
    };

    // The panel: off, a button to turn it on; on, the QR, the address, and the buttons to change it or turn it off.
    function paint() {
        if (!panel || !panel.isConnected) { return; }
        if (!status.on) {
            panel.innerHTML = `<div class="vacio">${core.icon('mando')}<p><strong>${escape(t('rm_title'))}</strong></p><p>${escape(t('rm_intro'))}</p>
                <button type="button" class="boton grande" data-rm="on"><span>${escape(t('rm_turn_on'))}</span></button>
                <p class="nota">${escape(t('rm_or_session'))}</p></div>`;
            return;
        }
        panel.innerHTML = `<div class="ct-rm">
            <div class="lv-qr">${window.ClasstoolsQr ? window.ClasstoolsQr.build(status.url, null) : ''}</div>
            <div class="ct-rm-texto">
                <div class="ct-rm-anim" aria-hidden="true"><span class="ct-rm-movil">${core.icon('mando')}</span>
                    <span class="ct-rm-ondas"><i></i><i></i><i></i></span><span class="ct-rm-pizarra">${core.icon('marca')}</span></div>
                <p class="ct-rm-ultima" aria-live="polite">${escape(lastOrder ? t('rm_last', lastOrder) : t('rm_waiting_orders'))}</p>
                <p><strong>${escape(t('rm_title'))}</strong> · <span class="${phone ? 'ct-rm-ok' : ''}">${escape(t(phone ? 'rm_phone_in' : 'rm_phone_waiting'))}</span></p>
                <p class="nota">${escape(t('rm_how'))}</p>
                <p class="ct-rm-url"><code>${escape(status.url)}</code></p>
                <div class="botonera">
                    <button type="button" class="boton suave" data-rm="copy"><span>${escape(t('rm_copy'))}</span></button>
                    <button type="button" class="boton suave" data-rm="rotate"><span>${escape(t('rm_rotate'))}</span></button>
                    <button type="button" class="boton rojo-suave" data-rm="off"><span>${escape(t('rm_turn_off'))}</span></button>
                </div>
                <p class="nota">${escape(t('rm_warning'))}</p>
                <p class="nota" data-rm-note aria-live="polite"></p>
            </div></div>`;
    }
    const act = (what, b) => {
        const note = (x) => { const n = panel.querySelector('[data-rm-note]'); if (n) { n.textContent = x; } };
        if (what === 'copy') {
            const done = () => note(t('rm_copied'));
            if (navigator.clipboard) { navigator.clipboard.writeText(status.url).then(done, () => {}); }
            return;
        }
        // A new address: on the second tap, as the old one stops working.
        if (what === 'rotate' && !b.classList.contains('confirma')) { b.classList.add('confirma'); b.textContent = t('rm_rotate_sure'); return; }
        call(what === 'rotate' ? 'rotate' : what).then((v) => {
            status = v; phone = false; seq = -1; paint();
            if (status.on) { poll(); play(what === 'rotate' ? 'card' : 'tic'); } else { clearTimeout(timer); }
        }).catch(() => note(t('lv_offline')));
    };
    /**
     * Puts the panel of the fixed remote in an element (the stage of «Live» when «Remote» is chosen).
     *
     * @param {HTMLElement} el
     */
    // Each order that arrives: the waves go from the phone to the board, and it says what it was.
    document.addEventListener('classtools:order', () => {
        if (!panel || !panel.isConnected) { return; }
        const anim = panel.querySelector('.ct-rm-anim'), last = panel.querySelector('.ct-rm-ultima');
        if (last) { last.textContent = lastOrder ? t('rm_last', lastOrder) : t('rm_waiting_orders'); }
        if (anim) { anim.classList.remove('pulso'); void anim.offsetWidth; anim.classList.add('pulso'); }
    });
    const show = (el) => {
        panel = el;
        paint();
        el.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { act(b.dataset.rm, b); } });
    };
    if (status.on) { poll(); }
    window.ClasstoolsRemote = { run, show, state: () => ({ status, seq, phone }) };
    document.dispatchEvent(new CustomEvent('classtools:remote'));
})();
