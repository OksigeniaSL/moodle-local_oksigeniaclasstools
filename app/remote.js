// The remote on the board: what each order of the teacher's phone does (for the remote of a live session and for the
// fixed one), and the fixed remote itself. While it is on, the open board asks the site every second and a half for
// its orders and says which tool it is on; its panel (in «Live», «Remote») turns it on and off, shows its address and
// QR, and changes the address when it may have been shared.
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
    };
    // Five orders from the phone in a page: a real use of the remote, for the teacher's sticker.
    let orders = 0;
    const run = (cmd) => {
        orders++;
        if (orders >= 5 && core.logro) { core.logro('mandamas'); }
        try {
            if (cmd.startsWith('tool_')) { const id = cmd.slice(5); if (core.tabs().includes(id)) { core.show(id); } return; }
            if (RUN[cmd]) { RUN[cmd](); }
        } catch (e) { /* a tool that is not there */ }
    };

    // --- The fixed remote --------------------------------------------------------------------------------------
    if (!AULA || !AULA.remoteurl || AULA.mode !== 'teacher') { window.ClasstoolsRemote = { run }; return; }
    let status = Object.assign({ on: false }, AULA.remote || {}), seq = -1, timer = 0, phone = false, panel = null;
    const call = (action, extra = {}) => fetch(AULA.remoteurl, { method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, action, ...extra }) })
        .then((r) => r.json()).then((j) => { if (!j || j.error || j.errorcode) { throw new Error('remote'); } return j; });
    // The tools of the board, with their names, for the phone to go to them.
    const tools = () => core.tabs().map((id) => {
        const b = document.querySelector(`[data-h="${id}"]`);
        const name = b ? (b.getAttribute('aria-label') || b.textContent || '').trim() : '';
        return `${id}|${name.replace(/[|;]/g, ' ').slice(0, 40)}`;
    }).filter((x) => !x.endsWith('|')).join(';');
    const poll = () => {
        clearTimeout(timer);
        if (!status.on) { return; }
        call('poll', { since: Math.max(seq, 0), tool: core.current(), tools: tools() }).then((v) => {
            if (!v.on) { status = { on: false }; paint(); return; }
            // The first answer only says where the orders are: the ones left from before are not run.
            if (seq >= 0) { (v.cmds || []).forEach((c) => { if (c.seq > seq) { run(c.cmd); } }); }
            seq = Math.max(seq, v.seq || 0);
            if (v.phone !== phone) { phone = v.phone; paint(); }
        }).catch(() => { /* offline for a moment: it tries again */ }).finally(() => { if (status.on) { timer = setTimeout(poll, 1500); } });
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
    const show = (el) => {
        panel = el;
        paint();
        el.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { act(b.dataset.rm, b); } });
    };
    if (status.on) { poll(); }
    window.ClasstoolsRemote = { run, show, state: () => ({ status, seq, phone }) };
    document.dispatchEvent(new CustomEvent('classtools:remote'));
})();
