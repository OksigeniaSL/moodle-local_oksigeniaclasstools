// The page where a device joins a live session of the board: it asks for the code (unless it came in the address,
// from the QR), joins, and then shows only buttons — the answers of a vote, the team buzzer, or the remote for the
// teacher's own phone. It asks the site every second and a half how the session goes.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const J = window.CLASSTOOLS_JOIN || {};
    const STR = J.str || {};
    const root = document.getElementById('jn');
    const t = (key, a) => {
        let s = STR[key] || key;
        if (a !== undefined && a !== null) {
            if (typeof a === 'object') { Object.keys(a).forEach((k) => { s = s.split(`{$a->${k}}`).join(a[k]); }); } else { s = s.split('{$a}').join(a); }
        }
        return s;
    };
    const escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const buzz = () => { if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) { /* no vibration */ } } };

    // Each answer with its colour (the light ones, with dark text).
    const COLOURS = {
        A: ['#ce1423'], B: ['#164281'], C: ['#fbbe17', true], D: ['#067e36'],
        yes: ['#067e36'], no: ['#ce1423'], green: ['#067e36'], yellow: ['#fbbe17', true], red: ['#ce1423'],
        1: ['#ce1423'], 2: ['#ea7317'], 3: ['#fbbe17', true], 4: ['#5f9e2f'], 5: ['#067e36'],
    };
    const TEAMS = [['#164281'], ['#ce1423'], ['#067e36'], ['#5b2fb8'], ['#fbbe17', true], ['#0e7c86']];
    const label = (v) => (['yes', 'no', 'green', 'yellow', 'red'].includes(v) ? t('lv_' + v) : v);

    const head = () => `<header class="jn-cabeza"><span>${escape(J.site || '')}</span><strong>${escape(J.code || '')}</strong></header>`;
    const screen = (title, text = '', extra = '') => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(title)}</p>${text ? `<p class="jn-texto">${escape(text)}</p>` : ''}${extra}</div>`;
    };

    // No session (no code, or none open with it): the code, typed.
    if (!J.found) {
        root.innerHTML = `<div class="jn-centro"><p class="jn-titulo">${escape(t('lv_join_title'))}</p>
            ${J.code ? `<p class="jn-aviso">${escape(t('lv_no_session'))}</p>` : ''}
            <form class="jn-centro" id="jn-form"><label class="jn-texto" for="jn-code">${escape(t('lv_type_code'))}</label>
            <input class="jn-codigo" id="jn-code" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" value="${escape(J.code || '')}">
            <button class="jn-boton" type="submit">${escape(t('lv_enter'))}</button></form></div>`;
        document.getElementById('jn-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const code = document.getElementById('jn-code').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (code) { location.href = `${J.page}?c=${encodeURIComponent(code)}`; }
        });
        document.getElementById('jn-code').focus();
        return;
    }

    // Who this device is: with an account, the site knows; with the code only, a random token it keeps.
    let device = '';
    if (J.identity !== 'moodle') {
        try { device = localStorage.getItem('classtools-device') || ''; } catch (e) { device = ''; }
        if (!/^[a-f0-9]{32}$/.test(device)) {
            const a = new Uint8Array(16); crypto.getRandomValues(a);
            device = [...a].map((x) => x.toString(16).padStart(2, '0')).join('');
            try { localStorage.setItem('classtools-device', device); } catch (e) { /* only for this visit */ }
        }
    }
    const post = (action, extra = {}) => fetch(J.api, {
        method: 'POST',
        credentials: J.identity === 'moodle' ? 'same-origin' : 'omit',
        body: new URLSearchParams({ action, c: J.code, device, sesskey: J.sesskey || '', ...extra }),
    }).then((r) => r.json());

    let view = null, shown = '', failures = 0, timer = 0, team = 0;
    const render = () => {
        const v = view;
        const key = JSON.stringify(v);
        if (key === shown) { return; }
        shown = key;
        if (v.ended) { screen(t('lv_bye')); stop(); return; }
        if (v.kicked) { screen(t('lv_kicked')); stop(); return; }
        if (v.full) { screen(t('lv_full')); return; }
        if (v.kind === 'remote') { remote(); return; }
        if (v.kind === 'buzz' && (!v.joined || !v.team || team === -1)) { pickTeam(v); return; }
        if (v.kind === 'vote') { vote(v); return; }
        if (v.kind === 'buzz') { buzzer(v); }
    };

    const vote = (v) => {
        const opts = v.options || [];
        const shape = v.vote === 'light' ? ' una' : (v.vote === 'five' ? ' cinco' : '');
        if (v.open) {
            root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-texto">${escape(t('lv_question_n', v.round))}</p>
                <div class="jn-ops${shape}${v.mine ? ' elegido' : ''}">${opts.map((o) => {
                    const [c, light] = COLOURS[o] || ['#164281'];
                    return `<button type="button" class="jn-op${light ? ' claro' : ''}${v.mine === o ? ' mia' : ''}" style="--c:${c}" data-o="${escape(o)}" aria-pressed="${v.mine === o}">${escape(label(o))}</button>`;
                }).join('')}</div>
                <p class="jn-texto">${escape(v.mine ? t('lv_change') : t('lv_choose'))}</p></div>`;
            root.querySelectorAll('.jn-op').forEach((b) => b.addEventListener('click', () => {
                buzz();
                // At once on the screen; the site confirms it on the next answer.
                view = { ...view, mine: b.dataset.o }; render();
                post('answer', { answer: b.dataset.o }).then(apply).catch(() => {});
            }));
            return;
        }
        if (!v.round) { screen(t('lv_wait_question'), t('lv_joined')); return; }
        const results = v.results ? Object.entries(v.results) : [];
        const most = Math.max(1, ...results.map(([, n]) => n));
        const bars = results.length ? `<div class="jn-barras">${results.map(([o, n]) => {
            const [c] = COLOURS[o] || ['#164281'];
            return `<div class="jn-barra"><span>${escape(label(o))}</span><i style="--c:${c}; width:${Math.round(100 * n / most)}%"></i><span>${n}</span></div>`;
        }).join('')}</div>` : '';
        screen(t('lv_closed'), v.mine ? t('lv_your_answer', label(v.mine)) : '', bars);
    };

    const pickTeam = (v) => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(t('lv_pick_team'))}</p>
            <div class="jn-equipos">${(v.teams || []).map((name, i) => {
                const [c, light] = TEAMS[i % TEAMS.length];
                return `<button type="button" class="jn-op${light ? ' claro' : ''}" style="--c:${c}" data-team="${i + 1}">${escape(name)}</button>`;
            }).join('')}</div></div>`;
        root.querySelectorAll('[data-team]').forEach((b) => b.addEventListener('click', () => {
            buzz(); team = Number(b.dataset.team);
            post('join', { team }).then(apply).catch(() => {});
        }));
    };

    const buzzer = (v) => {
        const [c, light] = TEAMS[(v.team - 1) % TEAMS.length];
        const chip = `<span class="jn-equipo${light ? ' claro' : ''}" style="--c:${c}">${escape((v.teams || [])[v.team - 1] || '')}</span>`;
        const change = !v.open ? `<button type="button" class="jn-enlace" id="jn-cambia">${escape(t('lv_change_team'))}</button>` : '';
        if (v.open && !v.mine) {
            root.innerHTML = `${head()}<div class="jn-centro">${chip}<button type="button" class="jn-ya" id="jn-ya">${escape(t('lv_go'))}</button></div>`;
            document.getElementById('jn-ya').addEventListener('pointerdown', (e) => {
                e.preventDefault(); buzz();
                const b = e.currentTarget; b.disabled = true;
                post('answer', { answer: 'press' }).then(apply).catch(() => { b.disabled = false; });
            }, { once: true });
            return;
        }
        if (v.mine) {
            const first = v.place === 1;
            screen('', '', `${chip}<p class="jn-puesto${first ? ' primero' : ''}">${escape(first ? t('lv_place_1') : t('lv_place_n', v.place || '…'))}</p>`);
            return;
        }
        screen(t('lv_wait_round'), '', chip + change);
        const b = document.getElementById('jn-cambia');
        if (b) { b.addEventListener('click', () => { team = -1; shown = ''; render(); }); }
    };

    // The teacher's phone: the board does what it is told, whatever tool it is on.
    const COMMANDS = [['tm_toggle', 'lv_cmd_timer', 'grande'], ['tm_reset', 'lv_cmd_reset'], ['tm_plus', 'lv_cmd_plus'],
        ['pick', 'lv_cmd_pick'], ['present', 'lv_cmd_present'], ['tab_prev', 'lv_cmd_prev'], ['tab_next', 'lv_cmd_next']];
    const remote = () => {
        root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-titulo">${escape(t('lv_remote_title'))}</p>
            <div class="jn-mando">${COMMANDS.map(([c, k, cls]) => `<button type="button" class="${cls || ''}" data-cmd="${c}">${escape(t(k))}</button>`).join('')}</div>
            <p class="jn-texto" id="jn-hecho" aria-live="polite">&nbsp;</p></div>`;
        root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => {
            buzz();
            const done = document.getElementById('jn-hecho');
            post('command', { command: b.dataset.cmd }).then((v) => {
                apply(v); if (!v.error) { done.textContent = `${t(COMMANDS.find((x) => x[0] === b.dataset.cmd)[1])} · ${t('lv_sent')}`; }
            }).catch(() => { done.textContent = t('lv_offline'); });
        }));
    };

    function apply(v) {
        if (!v || typeof v !== 'object') { return; }
        if (v.errorcode === 'kicked') { v = { kicked: true }; } else if (v.errorcode === 'livefull') { v = { full: true }; } else if (v.error) { return; }
        failures = 0;
        if (v.kind === 'buzz' && v.joined && v.team && team !== -1) { team = v.team; }   // -1: choosing another
        view = v; render();
        // Not in yet: a vote or a remote joins at once; a buzzer, when its team is chosen.
        if (!v.joined && !v.ended && !v.kicked && !v.full && v.kind !== 'buzz') { post('join').then(apply).catch(() => {}); }
    }
    const poll = () => {
        clearTimeout(timer);
        if (document.hidden) { return; }
        post('state').then(apply).catch(() => {
            failures++;
            if (failures === 3) { const n = document.createElement('p'); n.className = 'jn-aviso'; n.textContent = t('lv_offline'); root.append(n); shown = ''; }
        }).finally(() => { if (timer !== -1) { timer = setTimeout(poll, 1500); } });
    };
    function stop() { clearTimeout(timer); timer = -1; }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && timer !== -1) { poll(); } });
    screen(t('lv_join_title'));
    poll();
})();
