// Live sessions on the board: a vote or team buzzers answered from the students' devices, or the teacher's phone as a
// remote. The board opens the session in Moodle, shows the code and its QR, and asks every second and a half how it
// goes. Only inside a Moodle course, where the session lives.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-envivo');
    const AULA = core && core.moodle;
    if (!core || !root || !AULA || !AULA.liveurl) { return; }
    const { $, $$, t, escape, save, load, play, announce, setIcon, relabel, repeatWhileHeld } = core;

    const COLOURS = {
        A: ['#ce1423'], B: ['#164281'], C: ['#fbbe17', true], D: ['#067e36'],
        yes: ['#067e36'], no: ['#ce1423'], green: ['#067e36'], yellow: ['#fbbe17', true], red: ['#ce1423'],
        1: ['#ce1423'], 2: ['#ea7317'], 3: ['#fbbe17', true], 4: ['#5f9e2f'], 5: ['#067e36'],
    };
    const TEAMS = [['#164281'], ['#ce1423'], ['#067e36'], ['#5b2fb8'], ['#fbbe17', true], ['#0e7c86']];
    const label = (v) => (['yes', 'no', 'green', 'yellow', 'red'].includes(v) ? t('lv_' + v) : v);
    const KEY = 'envivo-' + AULA.courseid;   // the open session, to find it again after reloading the page

    root.innerHTML = `
        <aside class="tarjeta lv-side">
            <div class="lv-setup" id="lv-setup">
                <p class="ante" id="lv-l-kind">${escape(t('lv_what'))}</p>
                <div class="segmentos" role="radiogroup" aria-labelledby="lv-l-kind" id="lv-kind">
                    ${['vote', 'buzz', 'remote'].map((k) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${escape(t('lv_kind_' + k))}</button>`).join('')}
                </div>
                <div class="lv-box" id="lv-identity-box">
                    <p class="ante" id="lv-l-identity">${escape(t('lv_how'))}</p>
                    <div class="segmentos" role="radiogroup" aria-labelledby="lv-l-identity" id="lv-identity">
                        ${['anon', 'moodle'].map((k) => `<button type="button" role="radio" aria-checked="false" data-v="${k}">${escape(t('lv_' + k))}</button>`).join('')}
                    </div>
                    <p class="nota" id="lv-identity-hint"></p>
                </div>
                <label class="campo apilado" id="lv-vote-box"><span>${escape(t('lv_answers'))}</span><select id="lv-vote">
                    ${['abcd', 'yesno', 'light', 'five'].map((k) => `<option value="${k}">${escape(t('lv_v_' + k))}</option>`).join('')}
                </select></label>
                <div class="lv-box" id="lv-teams-box">
                    <p class="ante">${escape(t('lv_teams'))}</p>
                    <div class="giro grande-giro">
                        <button type="button" class="redondo suave" id="lv-menos" aria-label="${escape(t('g_less'))}"><span data-icono="menos"></span></button>
                        <output id="lv-n">2</output>
                        <button type="button" class="redondo suave" id="lv-mas" aria-label="${escape(t('g_more'))}"><span data-icono="mas"></span></button>
                    </div>
                </div>
                <p class="nota" id="lv-remote-hint">${escape(t('lv_remote_hint'))}</p>
                <button type="button" class="boton grande ancho" id="lv-start"><span data-icono="empezar"></span><span>${escape(t('lv_start'))}</span></button>
                <p class="nota lv-error" id="lv-error" role="alert" hidden></p>
            </div>
            <div class="lv-join" id="lv-join" hidden>
                <div class="lv-qr" id="lv-qr"></div>
                <p class="lv-codigo"><span class="ante">${escape(t('lv_code'))}</span><strong id="lv-code"></strong></p>
                <p class="nota lv-url" id="lv-url"></p>
                <p class="lv-cuenta" id="lv-count" aria-live="polite"></p>
                <p class="nota lv-aviso" id="lv-others" role="status" hidden></p>
                <details class="lv-quien" id="lv-who"><summary>${escape(t('lv_devices'))}</summary><ul id="lv-devices"></ul></details>
                <button type="button" class="boton suave ancho" id="lv-end"><span data-icono="cerrar"></span><span>${escape(t('lv_end'))}</span></button>
            </div>
        </aside>
        <div class="tarjeta lv-stage" id="lv-stage"></div>`;
    $$('[data-icono]', root).forEach((el) => setIcon(el, el.dataset.icono));
    const stage = $('#lv-stage');

    // ---------------------------------------------------------------------------------------------------
    // Setting it up
    // ---------------------------------------------------------------------------------------------------
    let kind = ['vote', 'buzz', 'remote'].includes(load('envivo-tipo', 'vote')) ? load('envivo-tipo', 'vote') : 'vote';
    let identity = load('envivo-entrada', 'anon') === 'moodle' ? 'moodle' : 'anon';
    let teams = Math.max(2, Math.min(6, Number(load('envivo-equipos', 2)) || 2));
    $('#lv-vote').value = ['abcd', 'yesno', 'light', 'five'].includes(load('envivo-voto', 'abcd')) ? load('envivo-voto', 'abcd') : 'abcd';
    const paintSetup = () => {
        $$('#lv-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === kind)));
        $$('#lv-identity button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === identity)));
        $('#lv-identity-box').hidden = kind === 'remote';
        $('#lv-identity-hint').textContent = t('lv_' + identity + '_hint');
        $('#lv-vote-box').hidden = kind !== 'vote';
        $('#lv-teams-box').hidden = kind !== 'buzz';
        $('#lv-remote-hint').hidden = kind !== 'remote';
        $('#lv-n').textContent = teams;
        if (!S) { stage.innerHTML = `<div class="vacio">${core.icon(kind === 'remote' ? 'mando' : 'mano')}<p>${escape(t('lv_intro_' + kind))}</p></div>`; }
    };
    $('#lv-kind').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { kind = b.dataset.v; save('envivo-tipo', kind); paintSetup(); } });
    $('#lv-identity').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { identity = b.dataset.v; save('envivo-entrada', identity); paintSetup(); } });
    $('#lv-vote').addEventListener('change', () => save('envivo-voto', $('#lv-vote').value));
    const changeTeams = (d) => { teams = Math.max(2, Math.min(6, teams + d)); save('envivo-equipos', teams); paintSetup(); };
    repeatWhileHeld($('#lv-menos'), () => changeTeams(-1));
    repeatWhileHeld($('#lv-mas'), () => changeTeams(1));

    // ---------------------------------------------------------------------------------------------------
    // Talking to Moodle
    // ---------------------------------------------------------------------------------------------------
    let S = null, timer = 0, failures = 0, seq = 0, question = '';
    const call = (action, extra = {}) => {
        const body = new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, action, ...extra });
        if (S && action !== 'start') { body.set('id', S.id); }
        return fetch(AULA.liveurl, { method: 'POST', body, credentials: 'same-origin' })
            .then((r) => r.json())
            .then((j) => { if (!j || j.error || j.errorcode) { throw new Error((j && (j.errorcode || j.error)) || 'error'); } return j; });
    };
    const visible = () => !root.hidden;
    // One question at a time: every second and a half while it is on screen (always, for a remote); otherwise just
    // enough to keep it open.
    const schedule = () => {
        clearTimeout(timer);
        if (S && !S.ended) { timer = setTimeout(poll, visible() || S.kind === 'remote' ? 1500 : 5000); }
    };
    function poll() {
        clearTimeout(timer);
        if (!S || S.ended) { return; }
        call('state', { since: seq }).then(apply).catch((e) => {
            console.warn('live', e);
            if (++failures === 3) { $('#lv-others').hidden = false; $('#lv-others').textContent = t('lv_failed'); }
        }).finally(schedule);
    }
    const act = (action, extra) => call(action, extra).then(apply).catch((e) => { console.warn('live', action, e); });

    $('#lv-start').addEventListener('click', () => {
        const b = $('#lv-start'); b.disabled = true; $('#lv-error').hidden = true;
        const names = Array.from({ length: teams }, (_, i) => t('lv_team_n', i + 1));
        call('start', { kind, identity, vote: $('#lv-vote').value, teams: JSON.stringify(names) })
            .then((v) => { seq = 0; question = ''; apply(v); save(KEY, v.id); announce(t('lv_opened', v.code)); schedule(); })
            .catch(() => { $('#lv-error').hidden = false; $('#lv-error').textContent = t('lv_failed'); })
            .finally(() => { b.disabled = false; });
    });
    let confirmEnd = 0;
    $('#lv-end').addEventListener('click', () => {
        const b = $('#lv-end');
        if (!confirmEnd) {
            relabel(b, t('lv_end_confirm'), 'cerrar');
            confirmEnd = setTimeout(() => { confirmEnd = 0; relabel(b, t('lv_end'), 'cerrar'); }, 3000);
            return;
        }
        clearTimeout(confirmEnd); confirmEnd = 0; relabel(b, t('lv_end'), 'cerrar');
        act('end');
    });

    // ---------------------------------------------------------------------------------------------------
    // What the board shows
    // ---------------------------------------------------------------------------------------------------
    function apply(v) {
        failures = 0;
        const first = !S || S.id !== v.id;
        S = v;
        if (v.ended) {
            save(KEY, null);
            $('#lv-setup').hidden = false; $('#lv-join').hidden = true;
            S = null; paintSetup(); announce(t('lv_ended'));
            return;
        }
        $('#lv-setup').hidden = true; $('#lv-join').hidden = false;
        if (first) {
            $('#lv-qr').innerHTML = window.ClasstoolsQr ? window.ClasstoolsQr.build(v.url, null) : '';
            $('#lv-code').textContent = v.code;
            // The address to type (without the code, which the page asks for), with breaks allowed after each «/».
            $('#lv-url').innerHTML = escape(v.url.replace(/^https?:\/\//, '').replace(/\?.*$/, '')).split('/').join('/<wbr>');
        }
        paintJoin(v);
        if (v.kind === 'remote') { runCommands(v); paintRemote(v, first); } else if (v.kind === 'vote') { paintVote(v, first); } else { paintBuzz(v, first); }
    }
    const paintJoin = (v) => {
        const n = v.kind === 'remote' ? (v.joined ? 1 : 0) : v.devices.length;
        $('#lv-count').textContent = v.kind === 'remote' ? (v.joined ? t('lv_remote_ok') : t('lv_remote_waiting')) : t(n === 1 ? 'lv_in_one' : 'lv_in_many', n);
        const others = $('#lv-others');
        others.hidden = !v.others;
        if (v.others) { others.textContent = t(v.others === 1 ? 'lv_others_one' : 'lv_others_many', v.others); }
        $('#lv-who').hidden = v.kind === 'remote' || !v.devices.length;
        if (v.kind === 'remote') { return; }
        const names = v.devices.map((d, i) => d.name || t('lv_device_n', i + 1));
        const html = v.devices.map((d, i) => `<li><span>${escape(names[i])}${d.team && v.teams ? ` <small>${escape(v.teams[d.team - 1] || '')}</small>` : ''}</span>`
            + `<button type="button" class="lv-saca" data-device="${escape(d.device)}" aria-label="${escape(t('lv_kick', names[i]))}" title="${escape(t('lv_kick', names[i]))}">${core.icon('cerrar')}</button></li>`).join('');
        if ($('#lv-devices').dataset.html !== html) { $('#lv-devices').innerHTML = html; $('#lv-devices').dataset.html = html; }
    };
    // Taking a device out: a first tap asks, a second one does it.
    $('#lv-devices').addEventListener('click', (e) => {
        const b = e.target.closest('.lv-saca'); if (!b) { return; }
        if (!b.classList.contains('seguro')) { b.classList.add('seguro'); setTimeout(() => b.classList.remove('seguro'), 3000); return; }
        act('kick', { device: b.dataset.device });
    });

    // A vote: the question (optional, only on the board), how many have answered while it is open, and the bars when
    // it closes. «Show on the devices» sends the bars to the tablets too.
    const paintVote = (v, first) => {
        if (first || !$('#lv-bars')) {
            stage.innerHTML = `<div class="lv-pregunta"><input type="text" id="lv-question" maxlength="140" placeholder="${escape(t('lv_question_ph'))}" aria-label="${escape(t('lv_question_ph'))}"></div>
                <div class="lv-centro"><p class="lv-ronda" id="lv-round"></p><p class="lv-grande" id="lv-progress"></p><div class="lv-barras" id="lv-bars"></div></div>
                <div class="botonera centro lv-mandos">
                    <select id="lv-kind-vote" aria-label="${escape(t('lv_answers'))}">${['abcd', 'yesno', 'light', 'five'].map((k) => `<option value="${k}">${escape(t('lv_v_' + k))}</option>`).join('')}</select>
                    <button type="button" class="boton grande" id="lv-open"><span data-icono="empezar"></span><span></span></button>
                    <label class="interruptor"><input type="checkbox" id="lv-show"><span>${escape(t('lv_show'))}</span></label>
                </div>`;
            $('#lv-question').value = question;
            $('#lv-question').addEventListener('input', () => { question = $('#lv-question').value; });
            $('#lv-open').addEventListener('click', () => {
                if (S.open) { act('close'); play('cuenta'); } else { act('open', { vote: $('#lv-kind-vote').value }); play('tic'); }
            });
            $('#lv-show').addEventListener('change', () => act('show', { show: $('#lv-show').checked ? 1 : 0 }));
        }
        $('#lv-kind-vote').value = v.vote; $('#lv-kind-vote').disabled = v.open;
        $('#lv-show').checked = v.show;
        relabel($('#lv-open'), v.open ? t('lv_close_vote') : (v.round ? t('lv_again') : t('lv_open_vote')), v.open ? 'pausa' : 'empezar');
        $('#lv-open').classList.toggle('amarillo', v.open);
        $('#lv-round').textContent = v.round ? t('lv_question_n', v.round) : '';
        const answered = Object.values(v.results || {}).reduce((a, b) => a + b, 0);
        const bars = $('#lv-bars');
        if (!v.round) {
            $('#lv-progress').textContent = t('lv_wait_open');
            bars.innerHTML = '';
        } else if (v.open) {
            // While it is open, only how many: the bars could make them follow the others.
            $('#lv-progress').textContent = t('lv_answered', { n: answered, of: v.devices.length });
            bars.innerHTML = '';
        } else {
            $('#lv-progress').textContent = t(answered === 1 ? 'lv_votes_one' : 'lv_votes_many', answered);
            const most = Math.max(1, ...Object.values(v.results));
            const html = Object.entries(v.results).map(([o, n]) => {
                const [c, light] = COLOURS[o] || ['#164281'];
                return `<div class="lv-barra"><span class="lv-op${light ? ' claro' : ''}" style="--c:${c}">${escape(label(o))}</span>`
                    + `<span class="lv-pista"><i style="--c:${c}; width:${(100 * n / most).toFixed(1)}%"></i></span><strong>${n}</strong></div>`;
            }).join('');
            if (bars.dataset.html !== html) { bars.innerHTML = html; bars.dataset.html = html; }
        }
    };

    // Buzzers: «Open the buzzers», and the first team shows big; the others below, with how much later they pressed.
    let lastFirst = '';
    const paintBuzz = (v, first) => {
        if (first || !$('#lv-presses')) {
            stage.innerHTML = `<div class="lv-equipos" id="lv-teams"></div>
                <div class="lv-centro"><div id="lv-winner"></div><ol class="lv-pulsados" id="lv-presses"></ol></div>
                <div class="botonera centro lv-mandos"><button type="button" class="boton grande" id="lv-open"><span data-icono="empezar"></span><span></span></button></div>`;
            $('#lv-open').addEventListener('click', () => { if (S.open) { act('close'); } else { act('open'); play('tic'); } });
        }
        const count = v.teams.map((_, i) => v.devices.filter((d) => d.team === i + 1).length);
        $('#lv-teams').innerHTML = v.teams.map((name, i) => {
            const [c, light] = TEAMS[i % TEAMS.length];
            return `<span class="lv-equipo${light ? ' claro' : ''}" style="--c:${c}">${escape(name)} <small>${count[i]}</small></span>`;
        }).join('');
        relabel($('#lv-open'), v.open ? t('lv_close_round') : (v.round ? t('lv_next_round') : t('lv_open_round')), v.open ? 'pausa' : 'empezar');
        $('#lv-open').classList.toggle('amarillo', v.open);
        const p = v.presses || [];
        const who = (x) => `${escape(v.teams[x.team - 1] || '')}${x.name ? ` <small>${escape(x.name)}</small>` : ''}`;
        if (!p.length) {
            $('#lv-winner').innerHTML = `<p class="lv-grande">${escape(v.open ? t('lv_nobody') : (v.round ? '' : t('lv_wait_round_board')))}</p>`;
            $('#lv-presses').innerHTML = '';
            lastFirst = '';
            return;
        }
        const [c, light] = TEAMS[(p[0].team - 1) % TEAMS.length];
        const key = `${v.round}:${p[0].device}`;
        $('#lv-winner').innerHTML = `<p class="lv-ganador${light ? ' claro' : ''}" style="--c:${c}">${who(p[0])}</p>`;
        $('#lv-presses').innerHTML = p.slice(1, 8).map((x) => `<li>${who(x)} <span>${escape(t('lv_after', (x.after / 1000).toFixed(2)))}</span></li>`).join('');
        if (key !== lastFirst) {
            lastFirst = key;
            play('elegido');
            announce(t('lv_first', v.teams[p[0].team - 1] || ''));
        }
    };

    // The remote: whether the phone is in, and what it asked for last.
    const RUN = {
        tm_toggle: () => click('#tm-marcha'),
        tm_reset: () => click('#tm-reiniciar'),
        tm_plus: () => click('#tm-mas1'),
        pick: () => { core.show('quien'); click('#q-elegir'); },
        tab_next: () => step(1),
        tab_prev: () => step(-1),
        present: () => click(document.documentElement.classList.contains('presentando') ? '#b-salir-presentar' : '#b-presentar'),
    };
    const click = (sel) => { const b = document.querySelector(sel); if (b && !b.disabled && !b.hidden) { b.click(); } };
    const step = (d) => { const tabs = core.tabs(), i = tabs.indexOf(core.current()); core.show(tabs[(i + d + tabs.length) % tabs.length]); };
    const runCommands = (v) => {
        (v.cmds || []).forEach((c) => {
            if (c.seq <= seq) { return; }
            seq = c.seq;
            if (RUN[c.cmd]) { try { RUN[c.cmd](); } catch (e) { /* a tool that is not there */ } }
        });
        seq = Math.max(seq, v.seq || 0);
    };
    const paintRemote = (v, first) => {
        if (first || !$('#lv-remote')) {
            stage.innerHTML = `<div class="lv-centro" id="lv-remote"><div class="vacio">${core.icon('mando')}<p id="lv-remote-state"></p><p class="nota">${escape(t('lv_remote_help'))}</p></div></div>`;
        }
        $('#lv-remote-state').textContent = v.joined ? t('lv_remote_ok') : t('lv_remote_waiting');
    };

    core.register('envivo', { entra: () => { if (S) { poll(); } } });
    paintSetup();
    // A session left open (the page was reloaded): pick it up again.
    const kept = Number(load(KEY, 0)) || 0;
    if (kept) {
        S = { id: kept };
        call('state').then((v) => { S = null; seq = v.seq || 0; apply(v); schedule(); }).catch(() => { S = null; save(KEY, null); paintSetup(); });
    }
})();
