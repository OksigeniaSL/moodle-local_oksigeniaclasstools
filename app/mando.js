// The teacher's fixed remote, on the phone: the address with its key, without logging in. It shows the teacher's
// boards that are open (the course of each, nothing about the students); with more than one, it asks which one. The
// buttons send orders to that board: the timer, a pick, whose turn, the next question, presenting, the tools. It asks
// the site every two seconds which boards are open.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const R = window.CLASSTOOLS_REMOTE || {};
    const STR = R.str || {};
    const root = document.getElementById('jn');
    const t = (key, a) => { let s = STR[key] || key; if (a !== undefined) { s = s.split('{$a}').join(a); } return s; };
    const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const buzz = () => { if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* no vibration */ } } };
    const head = () => `<header class="jn-cabeza"><span>${escape(R.site || '')}</span><strong>${escape(t('rm_title'))}</strong></header>`;
    const screen = (title, text = '', extra = '') => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(title)}</p>${text ? `<p class="jn-texto">${escape(text)}</p>` : ''}${extra}</div>`;
    };
    if (!R.k) { screen(t('rm_off_title'), t('rm_off_text')); return; }

    const COMMANDS = [['tm_toggle', 'lv_cmd_timer', 'grande'], ['tm_reset', 'lv_cmd_reset'], ['tm_plus', 'lv_cmd_plus'],
        ['pick', 'lv_cmd_pick'], ['turn', 'rm_cmd_turn'], ['next', 'rm_cmd_next'], ['present', 'lv_cmd_present'],
        ['tab_prev', 'lv_cmd_prev'], ['tab_next', 'lv_cmd_next']];
    const post = (action, extra = {}) => fetch(R.api, { method: 'POST', body: new URLSearchParams({ k: R.k, action, ...extra }) })
        .then((r) => r.json());
    let boards = [], course = Number(localStorage.getItem('mando-curso')) || 0, shown = '', timer = 0, failures = 0, last = '';
    const board = () => boards.find((b) => b.course === course) || boards[0] || null;

    const render = () => {
        const b = board();
        if (!b) { shown = ''; screen(t('rm_no_board_title'), t('rm_no_board_text'), '<div class="jn-espera" aria-hidden="true"><i></i><i></i><i></i></div>'); return; }
        course = b.course;
        // Painted again only when the boards, the one chosen or its tool change: a tap is not lost under the finger.
        const key = JSON.stringify([boards.map((x) => [x.course, x.name]), b.course, b.tool, b.tools]);
        if (key === shown) { return; }
        shown = key;
        const tools = b.tools || [], now = tools.find((x) => x[0] === b.tool);
        root.innerHTML = `${head()}
            ${boards.length > 1 ? `<div class="jn-tablas" role="radiogroup" aria-label="${escape(t('rm_which'))}">${boards.map((x) => `<button type="button" role="radio" aria-checked="${x.course === b.course}" data-course="${x.course}">${escape(x.name)}</button>`).join('')}</div>` : `<p class="jn-texto">${escape(b.name)}</p>`}
            ${now ? `<p class="jn-texto">${escape(t('rm_on_board', now[1]))}</p>` : ''}
            <div class="jn-mando">${COMMANDS.map(([c, k, cls]) => `<button type="button" class="${cls || ''}" data-cmd="${c}">${escape(t(k))}</button>`).join('')}</div>
            <p class="jn-texto" id="jn-hecho" aria-live="polite">${escape(last) || '&nbsp;'}</p>
            ${tools.length ? `<details class="jn-herramientas"><summary>${escape(t('rm_tools'))}</summary><div class="jn-mando">${tools.map(([id, name]) => `<button type="button" data-cmd="tool_${escape(id)}"${id === b.tool ? ' aria-current="true"' : ''}>${escape(name)}</button>`).join('')}</div></details>` : ''}`;
    };
    root.addEventListener('click', (e) => {
        const pick = e.target.closest('[data-course]');
        if (pick) { course = Number(pick.dataset.course); localStorage.setItem('mando-curso', String(course)); shown = ''; render(); return; }
        const b = e.target.closest('[data-cmd]');
        if (!b) { return; }
        buzz();
        const cmd = b.dataset.cmd, label = cmd.startsWith('tool_') ? b.textContent : t((COMMANDS.find((x) => x[0] === cmd) || [])[1] || '');
        post('command', { cmd, course }).then((v) => {
            if (v && v.off) { stop(); screen(t('rm_off_title'), t('rm_off_text')); return; }
            last = v && v.ok ? `${label} · ${t('lv_sent')}` : (v && v.why === 'closed' ? t('rm_closed') : '');
            const done = document.getElementById('jn-hecho');
            if (done) { done.textContent = last || ' '; }
            if (v && v.why === 'closed') { poll(); }
        }).catch(() => { const done = document.getElementById('jn-hecho'); if (done) { done.textContent = t('lv_offline'); } });
    });

    const poll = () => {
        clearTimeout(timer);
        if (document.hidden) { return; }
        post('state').then((v) => {
            failures = 0;
            if (v && v.off) { stop(); screen(t('rm_off_title'), t('rm_off_text')); return; }
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
