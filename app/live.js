// Live sessions on the board: a vote, team buzzers or a brainstorm (ideas.js) answered from the students' devices, or
// the teacher's phone as a remote. The board opens the session in Moodle, shows the code and its QR, and asks every second and a half how it
// goes (only inside a Moodle course, where the session lives). And, anywhere, a vote by a show of hands, counted on the
// board with + and −.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-envivo');
    const AULA = core && core.moodle;
    if (!core || !root) { return; }
    const LIVE = !!(AULA && AULA.liveurl);   // sessions with devices; without them, only the show of hands
    const { $, $$, t, escape, save, load, play, announce, setIcon, relabel, repeatWhileHeld } = core;

    const COLOURS = {
        A: ['#ce1423'], B: ['#164281'], C: ['#fbbe17', true], D: ['#067e36'],
        yes: ['#067e36'], no: ['#ce1423'], green: ['#067e36'], yellow: ['#fbbe17', true], red: ['#ce1423'],
        1: ['#ce1423'], 2: ['#ea7317'], 3: ['#fbbe17', true], 4: ['#5f9e2f'], 5: ['#067e36'],
    };
    const TEAMS = [['#164281'], ['#ce1423'], ['#067e36'], ['#5b2fb8'], ['#fbbe17', true], ['#0e7c86']];
    const label = (v) => (['yes', 'no', 'green', 'yellow', 'red'].includes(v) ? t('lv_' + v) : v);
    const KEY = 'envivo-' + (LIVE ? AULA.courseid : 0);   // the open session, to find it again after reloading the page
    const KINDS = LIVE ? ['vote', 'ideas', 'buzz', 'remote', 'hands'] : ['hands'];

    // Each choice as a card: an icon, its name and what it is, in a line.
    const KIND_ICONS = { vote: 'encuesta', ideas: 'nube', buzz: 'campana', remote: 'mando', hands: 'mano' };
    const card = (v, ico, name, text) => `<button type="button" role="radio" aria-checked="false" data-v="${v}" class="lv-opcion">`
        + `<span class="lv-opcion-ico">${core.icon(ico)}</span><span class="lv-opcion-texto"><strong>${escape(name)}</strong><small>${escape(text)}</small></span></button>`;
    root.innerHTML = `
        <aside class="tarjeta lv-side">
            <div class="lv-setup" id="lv-setup">
                <p class="ante" id="lv-l-kind">${escape(t('lv_what'))}</p>
                <div class="lv-opciones" role="radiogroup" aria-labelledby="lv-l-kind" id="lv-kind">
                    ${KINDS.map((k) => card(k, KIND_ICONS[k], t('lv_kind_' + k), t('lv_short_' + k))).join('')}
                </div>
                <div class="lv-box" id="lv-identity-box">
                    <p class="ante" id="lv-l-identity">${escape(t('lv_how'))}</p>
                    <div class="lv-opciones" role="radiogroup" aria-labelledby="lv-l-identity" id="lv-identity">
                        ${['anon', 'moodle', 'hidden'].map((k) => card(k, { anon: 'qr', moodle: 'usuario', hidden: 'anonimo' }[k], t('lv_' + k), t('lv_' + k + '_short'))).join('')}
                    </div>
                </div>
                <label class="campo apilado" id="lv-vote-box"><span>${escape(t('lv_answers'))}</span><select id="lv-vote">
                    ${['abcd', 'yesno', 'light', 'five'].map((k) => `<option value="${k}">${escape(t('lv_v_' + k))}</option>`).join('')}
                    <option value="custom" id="lv-vote-custom">${escape(t('lv_v_custom'))}</option>
                </select></label>
                <label class="campo apilado" id="lv-custom-box"><span>${escape(t('lv_custom'))}</span>
                    <textarea id="lv-custom" rows="5" spellcheck="false" placeholder="${escape(t('lv_custom_ph'))}"></textarea></label>
                <div class="lv-box" id="lv-teams-box">
                    <p class="ante">${escape(t('lv_teams'))}</p>
                    <div class="giro grande-giro">
                        <button type="button" class="redondo suave" id="lv-menos" aria-label="${escape(t('g_less'))}"><span data-icono="menos"></span></button>
                        <output id="lv-n">2</output>
                        <button type="button" class="redondo suave" id="lv-mas" aria-label="${escape(t('g_more'))}"><span data-icono="mas"></span></button>
                    </div>
                </div>
                <label class="campo apilado" id="lv-max-box"><span>${escape(t('id_max'))}</span><select id="lv-max">
                    ${[1, 2, 3].map((n) => `<option value="${n}">${escape(n === 1 ? t('id_max_one') : t('id_max_many', n))}</option>`).join('')}
                </select></label>
                <p class="nota" id="lv-remote-hint">${escape(t('lv_remote_hint'))}</p>
                <button type="button" class="boton grande ancho" id="lv-start"><span data-icono="empezar"></span><span>${escape(t('lv_start'))}</span></button>
                <p class="nota lv-error" id="lv-error" role="alert" hidden></p>
            </div>
            <div class="lv-join" id="lv-join" hidden>
                <div class="lv-qr" id="lv-qr"></div>
                <p class="lv-codigo"><span class="ante">${escape(t('lv_code'))}</span><strong id="lv-code"></strong></p>
                <ol class="lv-pasos" id="lv-pasos"></ol>
                <p class="lv-cuenta" id="lv-count" aria-live="polite"></p>
                <div class="lv-bichos" id="lv-critters" aria-hidden="true"></div>
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
    let kind = KINDS.includes(load('envivo-tipo', KINDS[0])) ? load('envivo-tipo', KINDS[0]) : KINDS[0];
    let identity = ['anon', 'moodle', 'hidden'].includes(load('envivo-entrada', 'anon')) ? load('envivo-entrada', 'anon') : 'anon';
    // Without names (with the code, or anonymous with their account), each device is a critter with a name of its own,
    // the same on the board and on the device.
    const CONTENT = window.CLASSTOOLS_CONTENT || {};
    const nameOf = (v, d, i) => {
        if (v.identity === 'moodle') { return d.name || t('lv_device_n', i + 1); }
        return window.ClasstoolsCritter && CONTENT.avatar ? window.ClasstoolsCritter.name(d.device, CONTENT.avatar) : t('lv_device_n', i + 1);
    };
    const critters = new Set();
    let teams = Math.max(2, Math.min(6, Number(load('envivo-equipos', 2)) || 2));
    $('#lv-vote').value = ['abcd', 'yesno', 'light', 'five', 'custom'].includes(load('envivo-voto', 'abcd')) ? load('envivo-voto', 'abcd') : 'abcd';
    const paintSetup = () => {
        $$('#lv-kind button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === kind)));
        $$('#lv-identity button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === identity)));
        const hands = kind === 'hands';
        $('#lv-identity-box').hidden = kind === 'remote' || hands;
        $('#lv-vote-box').hidden = kind !== 'vote' && !hands;
        // Answers of your own only by a show of hands (the devices have their buttons).
        $('#lv-vote-custom').hidden = !hands;
        if (!hands && $('#lv-vote').value === 'custom') { $('#lv-vote').value = 'abcd'; }
        $('#lv-custom-box').hidden = !hands || $('#lv-vote').value !== 'custom';
        $('#lv-teams-box').hidden = kind !== 'buzz';
        $('#lv-max-box').hidden = kind !== 'ideas';
        $('#lv-remote-hint').hidden = kind !== 'remote';
        $('#lv-start').hidden = hands;
        $('#lv-n').textContent = teams;
        if (S) { return; }
        if (hands) { paintHands(); } else { stage.innerHTML = `<div class="vacio">${core.icon(kind === 'remote' ? 'mando' : 'mano')}<p>${escape(t('lv_intro_' + kind))}</p></div>`; }
    };

    // ---------------------------------------------------------------------------------------------------
    // A show of hands: the answers with how many hands, counted with + and − (no devices, no names)
    // ---------------------------------------------------------------------------------------------------
    const OPTIONS = { abcd: ['A', 'B', 'C', 'D'], yesno: ['yes', 'no'], light: ['green', 'yellow', 'red'], five: ['1', '2', '3', '4', '5'] };
    const hd = Object.assign({ counts: {}, question: '' }, load('manos', {}));
    $('#lv-custom').value = load('envivo-propias', '');
    const handOptions = () => {
        if ($('#lv-vote').value !== 'custom') { return OPTIONS[$('#lv-vote').value] || OPTIONS.abcd; }
        const own = [...new Set($('#lv-custom').value.split(/\r?\n/).map((x) => x.trim().slice(0, 40)).filter(Boolean))].slice(0, 5);
        return own.length >= 2 ? own : ['A', 'B'];
    };
    const colourOf = (o, i) => (OPTIONS.abcd.concat(OPTIONS.yesno, OPTIONS.light, OPTIONS.five).includes(o) && $('#lv-vote').value !== 'custom'
        ? COLOURS[o] : TEAMS[i % TEAMS.length]);
    const keepHands = () => save('manos', hd);
    const paintHands = () => {
        stage.innerHTML = `<div class="lv-pregunta"><input type="text" id="lv-hq" maxlength="140" placeholder="${escape(t('lv_question_ph'))}" aria-label="${escape(t('lv_question_ph'))}"></div>
            <div class="lv-centro"><p class="lv-grande" id="lv-htotal"></p><div class="lv-barras" id="lv-hbars"></div></div>
            <div class="botonera centro lv-mandos"><button type="button" class="boton suave" id="lv-hreset"><span data-icono="reiniciar"></span><span>${escape(t('lv_hands_reset'))}</span></button></div>`;
        $$('[data-icono]', stage).forEach((e) => setIcon(e, e.dataset.icono));
        $('#lv-hq').value = hd.question;
        $('#lv-hq').addEventListener('input', () => { hd.question = $('#lv-hq').value; keepHands(); });
        $('#lv-hreset').addEventListener('click', () => { hd.counts = {}; keepHands(); paintHandBars(); play('tic'); });
        paintHandBars();
    };
    const paintHandBars = () => {
        const opts = handOptions(), counts = opts.map((o) => Math.max(0, Number(hd.counts[o]) || 0));
        const most = Math.max(1, ...counts), all = counts.reduce((a, b) => a + b, 0);
        $('#lv-htotal').textContent = t(all === 1 ? 'lv_hands_one' : 'lv_hands_many', all);
        $('#lv-hbars').innerHTML = opts.map((o, i) => {
            const [c, light] = colourOf(o, i);
            return `<div class="lv-barra lv-mano"><span class="lv-op${light ? ' claro' : ''}" style="--c:${c}">${escape(label(o))}</span>`
                + `<span class="lv-pista"><i style="--c:${c}; width:${(100 * counts[i] / most).toFixed(1)}%"></i></span>`
                + `<span class="lv-tally"><button type="button" class="redondo suave" data-o="${escape(o)}" data-d="-1" aria-label="${escape(t('lv_hand_less', label(o)))}"${counts[i] ? '' : ' disabled'}>${core.icon('menos')}</button>`
                + `<strong>${counts[i]}</strong>`
                + `<button type="button" class="redondo lv-mas${light ? ' claro' : ''}" style="--c:${c}" data-o="${escape(o)}" data-d="1" aria-label="${escape(t('lv_hand_more', label(o)))}">${core.icon('mas')}</button></span></div>`;
        }).join('');
    };
    stage.addEventListener('click', (e) => {
        const b = e.target.closest('[data-d]'); if (!b || kind !== 'hands' || S) { return; }
        hd.counts[b.dataset.o] = Math.max(0, (Number(hd.counts[b.dataset.o]) || 0) + Number(b.dataset.d));
        keepHands(); paintHandBars(); play('tic');
    });
    $('#lv-custom').addEventListener('input', () => { save('envivo-propias', $('#lv-custom').value); hd.counts = {}; keepHands(); if (kind === 'hands' && !S) { paintHandBars(); } });
    $('#lv-kind').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { kind = b.dataset.v; save('envivo-tipo', kind); paintSetup(); } });
    $('#lv-identity').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { identity = b.dataset.v; save('envivo-entrada', identity); paintSetup(); } });
    $('#lv-vote').addEventListener('change', () => { save('envivo-voto', $('#lv-vote').value); hd.counts = {}; keepHands(); paintSetup(); });
    $('#lv-max').value = String([1, 2, 3].includes(Number(load('ideas-max', 1))) ? Number(load('ideas-max', 1)) : 1);
    $('#lv-max').addEventListener('change', () => save('ideas-max', Number($('#lv-max').value) || 1));
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
        call('start', { kind, identity, vote: $('#lv-vote').value, teams: JSON.stringify(names), max: $('#lv-max').value })
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
            // How they get in, step by step: the notice in the course (inside Moodle), the QR, or the address and the
            // code (the address with breaks allowed after each «/»).
            const url = escape(v.url.replace(/^https?:\/\//, '').replace(/\?.*$/, '')).split('/').join('/<wbr>');
            const steps = [];
            if (v.kind !== 'remote' && v.notice) { steps.push(escape(t('lv_step_notice'))); }
            steps.push(escape(t('lv_step_qr')));
            steps.push(t('lv_step_url', `<span class="lv-url">${url}</span>`));
            steps.push(escape(t(v.identity === 'anon' ? 'lv_step_anon' : 'lv_step_login')));
            $('#lv-pasos').innerHTML = steps.map((x) => `<li>${x}</li>`).join('');
        }
        paintJoin(v);
        if (v.kind === 'remote') { runCommands(v); paintRemote(v, first); } else if (v.kind === 'vote') { paintVote(v, first); } else if (v.kind === 'ideas') {
            if (window.ClasstoolsLiveIdeas) { window.ClasstoolsLiveIdeas.paint(stage, v, first, act); }
        } else { paintBuzz(v, first); }
    }
    const paintJoin = (v) => {
        const n = v.kind === 'remote' ? (v.joined ? 1 : 0) : v.devices.length;
        $('#lv-count').textContent = v.kind === 'remote' ? (v.joined ? t('lv_remote_ok') : t('lv_remote_waiting')) : t(n === 1 ? 'lv_in_one' : 'lv_in_many', n);
        const others = $('#lv-others');
        others.hidden = !v.others;
        if (v.others) { others.textContent = t(v.others === 1 ? 'lv_others_one' : 'lv_others_many', v.others); }
        $('#lv-who').hidden = v.kind === 'remote' || !v.devices.length;
        if (v.kind === 'remote') { return; }
        const names = v.devices.map((d, i) => nameOf(v, d, i));
        // The critters of those who are in (the new ones pop in).
        const box = $('#lv-critters');
        const show = v.identity !== 'moodle' && window.ClasstoolsCritter;
        box.hidden = !show || !v.devices.length;
        if (show) {
            const ids = v.devices.map((d) => d.device).join(',');
            if (box.dataset.ids !== ids) {
                box.dataset.ids = ids;
                box.innerHTML = v.devices.slice(0, 60).map((d, i) => `<span class="lv-bicho${critters.has(d.device) ? '' : ' nuevo'}" title="${escape(names[i])}">${window.ClasstoolsCritter.svg(d.device, names[i])}</span>`).join('')
                    + (v.devices.length > 60 ? `<span class="lv-bicho-mas">+${v.devices.length - 60}</span>` : '');
                v.devices.forEach((d) => critters.add(d.device));
            }
        }
        const html = v.devices.map((d, i) => `<li><span>${show ? window.ClasstoolsCritter.svg(d.device) : ''}${escape(names[i])}${d.team && v.teams ? ` <small>${escape(v.teams[d.team - 1] || '')}</small>` : ''}</span>`
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
                <div class="lv-centro"><p class="lv-ronda" id="lv-round"></p><p class="lv-grande" id="lv-progress"></p>
                    <div class="lv-reloj" id="lv-clock" hidden><span class="lv-reloj-pista"><i id="lv-clock-bar"></i></span><strong id="lv-clock-text"></strong></div>
                    <div class="lv-barras" id="lv-bars"></div></div>
                <div class="botonera centro lv-mandos">
                    <select id="lv-kind-vote" aria-label="${escape(t('lv_answers'))}">${['abcd', 'yesno', 'light', 'five'].map((k) => `<option value="${k}">${escape(t('lv_v_' + k))}</option>`).join('')}</select>
                    <select id="lv-limit" aria-label="${escape(t('lv_limit'))}" title="${escape(t('lv_limit'))}">${LIMITS.map((x) => `<option value="${x}">${escape(limitLabel(x))}</option>`).join('')}</select>
                    <button type="button" class="boton grande" id="lv-open"><span data-icono="empezar"></span><span></span></button>
                    <label class="interruptor"><input type="checkbox" id="lv-show"><span>${escape(t('lv_show'))}</span></label>
                </div>`;
            $('#lv-question').value = question;
            $('#lv-question').addEventListener('input', () => { question = $('#lv-question').value; });
            $('#lv-open').addEventListener('click', () => {
                if (S.open) { act('close'); play('cuenta'); return; }
                limitTotal = Number($('#lv-limit').value) || 0;
                act('open', { vote: $('#lv-kind-vote').value, secs: limitTotal }); play('tic');
            });
            $('#lv-limit').value = String(LIMITS.includes(Number(load('envivo-cierre', 0))) ? Number(load('envivo-cierre', 0)) : 0);
            $('#lv-limit').addEventListener('change', () => save('envivo-cierre', Number($('#lv-limit').value)));
            $('#lv-show').addEventListener('change', () => act('show', { show: $('#lv-show').checked ? 1 : 0 }));
        }
        $('#lv-kind-vote').value = v.vote; $('#lv-kind-vote').disabled = v.open; $('#lv-limit').disabled = v.open;
        clock(v);
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

    // Closing by itself: the time left, counted on the board between the questions to Moodle (which closes it anyway),
    // a tick in the last five seconds, and the close when it reaches zero.
    const LIMITS = [0, 10, 20, 30, 60, 120];
    const limitLabel = (x) => (!x ? t('lv_limit_none') : (x < 60 ? t('lv_limit_s', x) : (x === 60 ? t('lv_limit_m1') : t('lv_limit_m', x / 60))));
    let limitTotal = 0, deadline = 0, ticker = 0, lastTick = -1;
    const clock = (v) => {
        const box = $('#lv-clock');
        if (!box) { return; }
        if (!v.open || !v.left) { box.hidden = true; deadline = 0; clearInterval(ticker); ticker = 0; return; }
        const end = performance.now() + v.left * 1000;
        // Moodle counts in whole seconds: only a real difference moves the local clock.
        if (!deadline || Math.abs(end - deadline) > 1500) { deadline = end; }
        if (!limitTotal || limitTotal < v.left) { limitTotal = v.left; }
        box.hidden = false;
        if (!ticker) { ticker = setInterval(tick, 200); tick(); }
    };
    const tick = () => {
        const left = Math.max(0, (deadline - performance.now()) / 1000), whole = Math.ceil(left);
        $('#lv-clock-text').textContent = t('lv_closes_in', `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`);
        $('#lv-clock-bar').style.width = `${(100 * left / (limitTotal || 1)).toFixed(1)}%`;
        $('#lv-clock').classList.toggle('ultimo', whole <= 5);
        if (whole <= 5 && whole > 0 && whole !== lastTick) { lastTick = whole; play('cuenta'); }
        if (left <= 0) {
            clearInterval(ticker); ticker = 0; deadline = 0; lastTick = -1;
            if (S && S.open) { act('close'); play('cuentaFinal'); }
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
        const pressName = (x) => (v.identity === 'moodle' ? x.name : nameOf(v, x, 0));
        const who = (x) => `${escape(v.teams[x.team - 1] || '')}${pressName(x) ? ` <small>${escape(pressName(x))}</small>` : ''}`;
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
    const kept = LIVE ? Number(load(KEY, 0)) || 0 : 0;
    if (kept) {
        S = { id: kept };
        call('state').then((v) => { S = null; seq = v.seq || 0; apply(v); schedule(); }).catch(() => { S = null; save(KEY, null); paintSetup(); });
    }
})();
