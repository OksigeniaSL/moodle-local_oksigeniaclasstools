// The page where a device joins a live session of the board: it asks for the code (unless it came in the address,
// from the QR), joins, and then shows only buttons — the answers of a vote, the team buzzer, a box for a word or two
// in a brainstorm, or the remote for the teacher's own phone. It asks the site every second and a half how the session goes.
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

    // Without their name: their critter, its name, and that nobody sees who they are.
    const me = () => {
        if (!view || !view.seed || !window.ClasstoolsCritter) { return ''; }
        const pack = window.CLASSTOOLS_CONTENT && window.CLASSTOOLS_CONTENT.avatar;
        const name = window.ClasstoolsCritter.name(view.seed, pack);
        return `<div class="jn-yo">${window.ClasstoolsCritter.svg(view.seed, name)}<p>${name ? `<strong>${escape(name)}</strong>` : ''}`
            + `<span>${escape(t(view.identity === 'hidden' ? 'lv_you_hidden' : 'lv_you_anon'))}</span></p></div>`;
    };
    const head = () => `<header class="jn-cabeza"><span>${escape(J.site || '')}</span><strong>${escape(J.code || '')}</strong></header>${me()}`;
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
    if (J.identity === 'anon') {
        try { device = localStorage.getItem('classtools-device') || ''; } catch (e) { device = ''; }
        if (!/^[a-f0-9]{32}$/.test(device)) {
            const a = new Uint8Array(16); crypto.getRandomValues(a);
            device = [...a].map((x) => x.toString(16).padStart(2, '0')).join('');
            try { localStorage.setItem('classtools-device', device); } catch (e) { /* only for this visit */ }
        }
    }
    const post = (action, extra = {}) => fetch(J.api, {
        method: 'POST',
        credentials: J.identity === 'anon' ? 'omit' : 'same-origin',
        body: new URLSearchParams({ action, c: J.code, device, sesskey: J.sesskey || '', ...extra }),
    }).then((r) => r.json());

    let view = null, shown = '', failures = 0, timer = 0, team = 0;
    // A vote with a time limit: the seconds left, counted here between the questions to the site.
    let deadline = 0, total = 0;
    const ticker = () => {
        const box = document.getElementById('jn-left');
        if (!box) { return; }
        const left = deadline ? Math.max(0, (deadline - performance.now()) / 1000) : 0, whole = Math.ceil(left);
        box.hidden = !deadline;
        box.querySelector('i').style.width = `${(100 * left / (total || 1)).toFixed(1)}%`;
        box.querySelector('span').textContent = t('lv_left', `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`);
        box.classList.toggle('ultimo', whole <= 5);
    };
    setInterval(ticker, 250);
    const render = () => {
        const v = view;
        const key = JSON.stringify({ ...v, left: 0 });   // the time left alone does not draw the screen again
        if (key === shown) { return; }
        shown = key;
        if (v.ended) { screen(t('lv_bye')); stop(); return; }
        if (v.kicked) { screen(t('lv_kicked')); stop(); return; }
        if (v.full) { screen(t('lv_full')); return; }
        if (v.kind === 'remote') { remote(); return; }
        if (v.kind === 'buzz' && (!v.joined || !v.team || team === -1)) { pickTeam(v); return; }
        // A quiz by teams that they choose: the team first (unless their group already gave them one).
        if (v.kind === 'quiz' && v.pick && v.joined && (!v.team || team === -1)) { pickTeam(v); return; }
        if (v.kind === 'quiz') { quiz(v); return; }
        if (v.kind === 'vote') { vote(v); return; }
        if (v.kind === 'ideas') { ideas(v); return; }
        if (v.kind === 'buzz') { buzzer(v); }
    };

    const vote = (v) => {
        const opts = v.options || [];
        const shape = v.vote === 'light' ? ' una' : (v.vote === 'five' ? ' cinco' : '');
        if (v.open) {
            root.innerHTML = `${head()}<div class="jn-centro"><p class="jn-texto">${escape(t('lv_question_n', v.round))}</p>
                <div class="jn-reloj" id="jn-left" hidden><b><i></i></b><span></span></div>
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

    // A brainstorm: the question, a box for a word or two, and the answers sent, which can be taken back while it is
    // open. What is being typed survives the screen being drawn again.
    const ideas = (v) => {
        const mine = v.mine || [];
        const list = mine.length ? `<div class="jn-ideas"><p class="jn-texto">${escape(t('lv_idea_yours'))}</p><ul>${mine.map((m) => `<li><span>${escape(m.text)}</span>`
            + (v.open ? `<button type="button" class="jn-quita" data-slot="${m.slot}" aria-label="${escape(t('lv_idea_remove', m.text))}" title="${escape(t('lv_idea_remove', m.text))}">×</button>` : '')
            + '</li>').join('')}</ul></div>` : '';
        if (!v.round) { screen(t('lv_wait_question'), t('lv_joined')); return; }
        if (!v.open) { screen(t('lv_closed'), v.q || '', list); return; }
        const before = document.getElementById('jn-idea');
        const typed = before ? before.value : '', focused = !!before && document.activeElement === before;
        const left = Math.max(0, (v.max || 1) - mine.length);
        root.innerHTML = `${head()}<div class="jn-centro">
            ${v.q ? `<p class="jn-titulo">${escape(v.q)}</p>` : `<p class="jn-texto">${escape(t('lv_question_n', v.round))}</p>`}
            ${left ? `<form class="jn-idea" id="jn-idea-form"><input id="jn-idea" maxlength="${v.length || 32}" autocomplete="off" enterkeyhint="send" spellcheck="true"
                placeholder="${escape(t('lv_idea_ph'))}" aria-label="${escape(t('lv_idea_ph'))}"><button class="jn-boton" type="submit">${escape(t('lv_idea_send'))}</button></form>
                <p class="jn-texto">${escape(left === 1 ? t('lv_idea_left_one') : t('lv_idea_left_many', left))}</p>`
                : `<p class="jn-titulo jn-listo">${escape(t('lv_idea_done'))}</p>`}
            ${list}</div>`;
        const input = document.getElementById('jn-idea');
        if (input) {
            input.value = typed;
            if (focused) { input.focus(); }
            document.getElementById('jn-idea-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if (!text) { input.focus(); return; }
                buzz();
                const b = e.currentTarget.querySelector('button'); b.disabled = true;
                post('idea', { text }).then((r) => { input.value = ''; apply(r); const again = document.getElementById('jn-idea'); if (again) { again.focus(); } })
                    .catch(() => { b.disabled = false; });
            });
        }
        root.querySelectorAll('.jn-quita').forEach((b) => b.addEventListener('click', () => {
            buzz(); b.disabled = true;
            post('unidea', { slot: b.dataset.slot }).then(apply).catch(() => { b.disabled = false; });
        }));
    };

    // A quiz: one big button per answer, in its colour and with its letter (and its text, if the teacher shows it on
    // the devices); one tap. Once the board reveals it: right or not, the points, the total and the place.
    const QUIZ = [['#ce1423'], ['#164281'], ['#fbbe17', true], ['#067e36']];
    // One answer, small: its letter and colour (and its text, if the devices have it).
    const tile = (v, i) => {
        const [c, light] = QUIZ[i] || QUIZ[0];
        return `<span class="jn-op jn-op-quiz jn-mini${light ? ' claro' : ''}" style="--c:${c}"><span>${'ABCD'[i] || ''}</span>${v.options && v.options[i] ? `<small>${escape(v.options[i])}</small>` : ''}</span>`;
    };
    const quiz = (v) => {
        const tm = v.team && v.teams && v.teams[v.team - 1] ? TEAMS[(v.team - 1) % TEAMS.length] : null;
        const chip = tm ? `<span class="jn-equipo${tm[1] ? ' claro' : ''}" style="--c:${tm[0]}">${escape(v.teams[v.team - 1])}</span>` : '';
        if (!v.round) { screen(t('lv_quiz_wait'), t('lv_joined'), chip); return; }
        if (v.result) {
            const r = v.result;
            const title = r.right ? t('lv_quiz_right') : (r.right === false ? t('lv_quiz_wrong') : t('lv_quiz_none'));
            const lines = [r.right ? '' : `<p class="jn-texto">${escape(t('lv_quiz_was'))}</p>${tile(v, r.correct)}`, `<p class="jn-puntos${r.right ? ' bien' : ''}">${r.right ? '+' + r.points : '0'}</p>`,
                `<p class="jn-texto">${escape(t('lv_quiz_total', r.total))}</p>`];
            if (r.rank) { lines.push(`<p class="jn-texto">${escape(t('lv_quiz_rank', r.rank))}</p>`); }
            if (r.teamrank) { lines.push(`<p class="jn-texto">${escape(t('lv_quiz_teamrank', r.teamrank))}</p>`); }
            screen(title, '', chip + lines.join(''));
            root.querySelector('.jn-titulo').classList.add(r.right ? 'jn-bien' : 'jn-mal');
            return;
        }
        if (v.open && v.mine === '') {
            const n = v.n || 2;
            root.innerHTML = `${head()}<div class="jn-centro">${chip}${v.q ? `<p class="jn-titulo jn-pregunta">${escape(v.q)}</p>` : `<p class="jn-texto">${escape(t('lv_question_n', v.round))}</p>`}
                <div class="jn-reloj" id="jn-left" hidden><b><i></i></b><span></span></div>
                <div class="jn-ops${n === 2 ? '' : ' cuatro'}">${Array.from({ length: n }, (_, i) => {
                    const [c, light] = QUIZ[i];
                    const text = v.options && v.options[i] ? `<small>${escape(v.options[i])}</small>` : '';
                    return `<button type="button" class="jn-op jn-op-quiz${light ? ' claro' : ''}" style="--c:${c}" data-o="${i}"><span>${'ABCD'[i]}</span>${text}</button>`;
                }).join('')}</div></div>`;
            root.querySelectorAll('.jn-op').forEach((b) => b.addEventListener('click', () => {
                buzz();
                root.querySelectorAll('.jn-op').forEach((x) => { x.disabled = true; });
                view = { ...view, mine: b.dataset.o }; render();
                post('answer', { answer: b.dataset.o }).then(apply).catch(() => {});
            }));
            return;
        }
        const yours = v.mine !== '' && /^\d$/.test(String(v.mine)) ? `<p class="jn-texto">${escape(t('lv_quiz_yours'))}</p>${tile(v, Number(v.mine))}` : '';
        if (v.open) { screen(t('lv_quiz_sent'), t('lv_quiz_wait_reveal'), chip + yours); return; }
        screen(t('lv_quiz_time'), t('lv_quiz_wait_reveal'), chip + yours);
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
        if (v.open && v.left) {
            const end = performance.now() + v.left * 1000;
            if (!deadline || Math.abs(end - deadline) > 1500) { deadline = end; }
            if (total < v.left) { total = v.left; }
        } else {
            deadline = 0; total = 0;
        }
        if ((v.kind === 'buzz' || v.kind === 'quiz') && v.joined && v.team && team !== -1) { team = v.team; }   // -1: choosing another
        view = v; render(); ticker();
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
