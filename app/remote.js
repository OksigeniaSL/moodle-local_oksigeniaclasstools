// The remote on the board: what each order of the teacher's phone does (for the remote of a live session and for the
// fixed one, which can also send the printed cards it reads), and the fixed remote itself. While it is on, the open
// board asks the site every second and a half for its orders and says which tool it is on, with the buttons of that
// tool for the phone (the main one first, with the names they have now); its panel (in «Live»,
// «Remote») turns it on and off, shows its address and QR, and changes the address when it may have been shared.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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
    // the key is a known order.
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
        envivo: [[['go', '#lv-open, #id-open, #ex-open, #ex-close, #qz-go, #qz-next', 'big']], [['rv', '#qz-reveal, #ex-reopen']]],
    };
    const named = (el) => (el.getAttribute('aria-label') || (el.tagName === 'INPUT' ? el.value : el.textContent) || '').trim();
    // The rows for the phone, and the button of each order.
    const here = () => {
        const spec = HERE[core.current()], rows = [], els = new Map();
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
                    items.push([cmd, text, how || (on ? 'on' : '')]);
                    if (cmd) { els.set(cmd, el); }
                });
            });
            if (items.length) { rows.push(items.slice(0, 6)); }
        });
        return { rows: rows.slice(0, 24), els };
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
            // A button of the tool on screen, if it is still there.
            if (cmd.startsWith('x_')) { const b = here().els.get(cmd); if (b) { b.click(); } return; }
            if (RUN[cmd]) { RUN[cmd](); }
        } catch (e) { /* a tool that is not there */ }
    };

    // --- The fixed remote --------------------------------------------------------------------------------------
    // Not in a copy of a duel (duel.js): only the board itself takes the phone's orders.
    if (!AULA || !AULA.remoteurl || AULA.mode !== 'teacher' || core.duelo) { window.ClasstoolsRemote = { run }; return; }
    let status = Object.assign({ on: false }, AULA.remote || {}), seq = -1, timer = 0, phone = false, panel = null;
    const call = (action, extra = {}) => fetch(AULA.remoteurl, { method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, action, ...extra }) })
        .then((r) => r.json()).then((j) => { if (!j || j.error || j.errorcode) { throw new Error('remote'); } return j; });
    // The tools of the board, with their names, for the phone to go to them.
    const tools = () => core.tabs().map((id) => {
        // The label of the tab (the timer's tab also carries its countdown, which would change every second).
        const b = document.querySelector(`[data-h="${id}"]`), label = b && (b.querySelector('[data-t]') || b);
        const name = b ? (b.getAttribute('aria-label') || label.textContent || '').trim() : '';
        return `${id}|${name.replace(/[|;]/g, ' ').slice(0, 40)}`;
    }).filter((x) => !x.endsWith('|')).join(';');
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
            // After an order, soon again: the phone sees how the board was left.
            .finally(() => { if (status.on) { timer = setTimeout(poll, ran ? 400 : 1500); } });
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
