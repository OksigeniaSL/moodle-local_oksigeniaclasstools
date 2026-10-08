// Quiz on the board, a live session of kind «quiz»: sets of questions with one right answer among two to four (or
// true/false), written here, pasted as text or brought from the Moodle question bank; one question at a time with
// its seconds, the answers from the devices, the right one revealed with how many chose each, points (calm: being
// right; fast: also how soon), a ranking after each question and/or at the end (only the top ones, if the teacher
// wants), teams from the groups made on the board or chosen on the devices, a podium, and a summary for the teacher.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    if (!core) { return; }
    const { t, escape, save, load, play, announce, setIcon } = core;
    const AULA = core.moodle;
    const COLOURS = [['#ce1423'], ['#164281'], ['#fbbe17', true], ['#067e36']];
    const TEAM_COLOURS = ['#164281', '#ce1423', '#067e36', '#5b2fb8', '#fbbe17', '#0e7c86', '#c2410c', '#d6336c'];
    const SECS = [10, 20, 30, 45, 60];
    const LETTERS = 'ABCD';

    // ---------------------------------------------------------------------------------------------------
    // The sets of questions: kept for each course in the browser and, inside Moodle, for the teacher in the course
    // ---------------------------------------------------------------------------------------------------
    const key = 'concursos' + (AULA ? ':' + AULA.courseid : '');
    const example = () => ({ id: 'ejemplo', name: t('qz_example'), questions: [1, 2, 3].map((i) => ({
        q: t('qz_ex_q' + i), o: t('qz_ex_o' + i).split('|'), c: 0, secs: 0 })) });
    let data = load(key, null);
    const kept = core.kept('quizzes');
    if (kept && Array.isArray(kept.sets) && (!data || (kept.updated || 0) > (data.updated || 0))) { data = kept; }
    if (!data || !Array.isArray(data.sets)) { data = { sets: [example()] }; }
    const keep = () => { data.updated = Date.now(); save(key, data); core.keep('quizzes', data); };
    const opt = Object.assign({ set: data.sets[0] ? data.sets[0].id : '', mode: 'calm', secs: 20, teams: 'none', nteams: 2,
        after: true, end: true, top: 0, devtext: false }, load('concurso-opciones', {}));
    const keepOpt = () => save('concurso-opciones', opt);
    const current = () => data.sets.find((x) => x.id === opt.set) || data.sets[0] || null;
    const clean = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);

    // Questions pasted as text, one per line: «Question | *right | other | other», or «Question | V» / «| F».
    const TRUE = /^(v|verdadero|true|t|wahr|w|vrai|vero|waar|sant|verdadeiro)$/i, FALSE = /^(f|falso|false|falsch|faux|onwaar|falskt|falso)$/i;
    const parse = (text) => String(text).split(/\r?\n/).map((line) => line.split('|').map((x) => x.trim())).filter((p) => p.length >= 2 && p[0]).map((p) => {
        if (p.length === 2 && (TRUE.test(p[1]) || FALSE.test(p[1]))) {
            return { q: clean(p[0], 300), o: [t('qz_true'), t('qz_false')], c: TRUE.test(p[1]) ? 0 : 1, secs: 0 };
        }
        const opts = p.slice(1, 5);
        const c = Math.max(0, opts.findIndex((o) => o.startsWith('*')));
        return { q: clean(p[0], 300), o: opts.map((o) => clean(o.replace(/^\*/, ''), 120)).filter(Boolean), c, secs: 0 };
    }).filter((q) => q.o.length >= 2 && q.c < q.o.length);

    // ---------------------------------------------------------------------------------------------------
    // Setting it up (on the stage, before the session opens)
    // ---------------------------------------------------------------------------------------------------
    let stage = null;
    const groups = () => { const g = core.lastGroups ? core.lastGroups() : null; return g && g.grupos && g.grupos.length >= 2 ? g : null; };
    function setup(st) {
        stage = st;
        const set = current();
        const g = groups();
        if (opt.teams === 'groups' && !g) { opt.teams = 'none'; }
        stage.innerHTML = `<div class="qz-setup">
            <div class="qz-fila"><label class="campo apilado qz-crece"><span>${escape(t('qz_set'))}</span><select id="qz-set">${data.sets.map((x) => `<option value="${escape(x.id)}">${escape(x.name)} (${x.questions.length})</option>`).join('')}</select></label>
                <button type="button" class="boton suave" id="qz-edit"><span data-icono="editar"></span><span>${escape(t('qz_edit'))}</span></button>
                <button type="button" class="boton suave" id="qz-new"><span data-icono="nueva"></span><span>${escape(t('qz_new'))}</span></button>
                ${AULA && AULA.bankurl ? `<button type="button" class="boton suave" id="qz-bank"><span data-icono="descargar"></span><span>${escape(t('qz_bank'))}</span></button>` : ''}</div>
            <div class="qz-opciones">
                <div><p class="ante">${escape(t('qz_points'))}</p><div class="segmentos" id="qz-mode">${['calm', 'fast'].map((m) => `<button type="button" role="radio" data-v="${m}">${escape(t('qz_mode_' + m))}</button>`).join('')}</div>
                    <p class="nota">${escape(t('qz_mode_hint_' + opt.mode))}</p></div>
                <label class="campo apilado"><span>${escape(t('qz_secs'))}</span><select id="qz-secs">${SECS.map((s) => `<option value="${s}">${escape(t('qz_secs_n', s))}</option>`).join('')}</select></label>
                <div><p class="ante">${escape(t('qz_teams'))}</p><div class="segmentos" id="qz-teams">
                    <button type="button" role="radio" data-v="none">${escape(t('qz_teams_none'))}</button>
                    ${g ? `<button type="button" role="radio" data-v="groups">${escape(t('qz_teams_groups', g.grupos.length))}</button>` : ''}
                    <button type="button" role="radio" data-v="pick">${escape(t('qz_teams_pick'))}</button></div>
                    ${opt.teams === 'pick' ? `<label class="campo"><span>${escape(t('qz_nteams'))}</span><select id="qz-nteams">${[2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n}</option>`).join('')}</select></label>` : ''}
                    <p class="nota">${escape(opt.teams === 'groups' ? t('qz_teams_groups_hint') : (opt.teams === 'pick' ? t('qz_teams_pick_hint') : t('qz_teams_none_hint')))}</p></div>
                <div><p class="ante">${escape(t('qz_ranking'))}</p>
                    <label class="interruptor"><input type="checkbox" id="qz-after"><span>${escape(t('qz_after'))}</span></label>
                    <label class="interruptor"><input type="checkbox" id="qz-end"><span>${escape(t('qz_end'))}</span></label>
                    <label class="campo"><span>${escape(t('qz_top'))}</span><select id="qz-top">${[0, 3, 4, 5].map((n) => `<option value="${n}">${escape(n ? t('qz_top_n', n) : t('qz_top_all'))}</option>`).join('')}</select></label></div>
                <label class="interruptor"><input type="checkbox" id="qz-devtext"><span>${escape(t('qz_devtext'))}</span></label>
            </div>
            <p class="nota qz-listo" id="qz-ready">${escape(set && set.questions.length ? t('qz_ready', set.questions.length) : t('qz_empty'))}</p></div>`;
        stage.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        const $ = (s) => stage.querySelector(s);
        if (set) { $('#qz-set').value = set.id; }
        $('#qz-secs').value = String(SECS.includes(Number(opt.secs)) ? opt.secs : 20);
        $('#qz-after').checked = !!opt.after; $('#qz-end').checked = !!opt.end; $('#qz-devtext').checked = !!opt.devtext;
        $('#qz-top').value = String([0, 3, 4, 5].includes(Number(opt.top)) ? opt.top : 0);
        if ($('#qz-nteams')) { $('#qz-nteams').value = String(opt.nteams); }
        stage.querySelectorAll('#qz-mode button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.mode)));
        stage.querySelectorAll('#qz-teams button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === opt.teams)));
        const redo = () => { keepOpt(); setup(stage); };
        $('#qz-set').addEventListener('change', () => { opt.set = $('#qz-set').value; redo(); });
        $('#qz-mode').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.mode = b.dataset.v; redo(); } });
        $('#qz-teams').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { opt.teams = b.dataset.v; redo(); } });
        if ($('#qz-nteams')) { $('#qz-nteams').addEventListener('change', () => { opt.nteams = Number($('#qz-nteams').value); keepOpt(); }); }
        $('#qz-secs').addEventListener('change', () => { opt.secs = Number($('#qz-secs').value); keepOpt(); });
        $('#qz-after').addEventListener('change', () => { opt.after = $('#qz-after').checked; keepOpt(); });
        $('#qz-end').addEventListener('change', () => { opt.end = $('#qz-end').checked; keepOpt(); });
        $('#qz-top').addEventListener('change', () => { opt.top = Number($('#qz-top').value); keepOpt(); });
        $('#qz-devtext').addEventListener('change', () => { opt.devtext = $('#qz-devtext').checked; keepOpt(); });
        $('#qz-edit').addEventListener('click', () => editor(current()));
        $('#qz-new').addEventListener('click', () => {
            const x = { id: 'q' + Date.now().toString(36), name: t('qz_new_name', data.sets.length + 1), questions: [] };
            data.sets.push(x); opt.set = x.id; keep(); keepOpt(); editor(x);
        });
        if ($('#qz-bank')) { $('#qz-bank').addEventListener('click', bankDialog); }
    }

    // What the session needs to open: the options, and the teams (from the groups: names and who is in each).
    const startOptions = () => {
        const set = current();
        if (!set || !set.questions.length) { return null; }
        const out = { mode: opt.mode, top: opt.top, devtext: opt.devtext ? 1 : 0, pick: 0, teams: '[]', members: '{}' };
        const g = groups();
        if (opt.teams === 'groups' && g) {
            out.teams = JSON.stringify(g.grupos.map((_, i) => t('g_group_n', i + 1)));
            const members = {};
            g.grupos.forEach((names, i) => names.forEach((n) => { const id = g.lista && g.lista.ids && g.lista.ids[n]; if (id) { members[id] = i + 1; } }));
            out.members = JSON.stringify(members);
            out.pick = 1;   // who is in no group (or joined with the code) chooses on the device
        } else if (opt.teams === 'pick') {
            out.teams = JSON.stringify(Array.from({ length: opt.nteams }, (_, i) => t('lv_team_n', i + 1)));
            out.pick = 1;
        }
        return out;
    };

    // ---------------------------------------------------------------------------------------------------
    // The editor of a set: its name, its questions (2 to 4 answers or true/false, the right one, its seconds), and
    // questions pasted as text
    // ---------------------------------------------------------------------------------------------------
    let dialog = null;
    const openDialog = (html, wire) => {
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'editor qz-dialogo';
            document.body.append(dialog);
        }
        dialog.innerHTML = html;
        dialog.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        wire(dialog);
        if (!dialog.open) { if (dialog.showModal) { dialog.showModal(); } else { dialog.setAttribute('open', ''); } }
    };
    const closeDialog = () => { if (dialog && dialog.open) { if (dialog.close) { dialog.close(); } else { dialog.removeAttribute('open'); } } if (stage && !S) { setup(stage); } };
    function editor(set, editing = -1) {
        if (!set) { return; }
        const q = editing >= 0 ? set.questions[editing] : null;
        const tf = q ? q.o.length === 2 && q.o[0] === t('qz_true') && q.o[1] === t('qz_false') : false;
        openDialog(`<form method="dialog" class="qz-editor">
            <h2>${escape(t('qz_edit_title'))}</h2>
            <label class="campo apilado"><span>${escape(t('qz_set_name'))}</span><input type="text" id="qz-name" maxlength="60" value="${escape(set.name)}"></label>
            <ol class="qz-lista">${set.questions.map((x, i) => `<li><span>${escape(x.q)}</span>`
                + `<button type="button" class="redondo suave" data-edit="${i}" aria-label="${escape(t('qz_edit_q'))}" title="${escape(t('qz_edit_q'))}">${core.icon('editar')}</button>`
                + `<button type="button" class="redondo suave" data-del="${i}" aria-label="${escape(t('qz_del_q'))}" title="${escape(t('qz_del_q'))}">${core.icon('borrar')}</button></li>`).join('')}</ol>
            <fieldset class="qz-campo"><legend>${escape(editing >= 0 ? t('qz_edit_q') : t('qz_add_q'))}</legend>
                <textarea id="qz-q" rows="2" maxlength="300" placeholder="${escape(t('qz_q_ph'))}">${escape(q ? q.q : '')}</textarea>
                <div class="segmentos" id="qz-kind"><button type="button" role="radio" data-v="choice" aria-checked="${!tf}">${escape(t('qz_kind_choice'))}</button><button type="button" role="radio" data-v="tf" aria-checked="${tf}">${escape(t('qz_kind_tf'))}</button></div>
                <div class="qz-respuestas" id="qz-answers" ${tf ? 'hidden' : ''}>${[0, 1, 2, 3].map((i) => `<label class="qz-respuesta" style="--c:${COLOURS[i][0]}"><input type="radio" name="qz-right" value="${i}" ${q && !tf && q.c === i ? 'checked' : (!q && i === 0 ? 'checked' : '')} aria-label="${escape(t('qz_right'))}">`
                    + `<b>${LETTERS[i]}</b><input type="text" maxlength="120" data-o="${i}" value="${escape(q && !tf ? q.o[i] || '' : '')}" placeholder="${escape(i < 2 ? t('qz_answer') : t('qz_answer_optional'))}"></label>`).join('')}</div>
                <div class="segmentos" id="qz-tf" ${tf ? '' : 'hidden'}><button type="button" role="radio" data-v="0" aria-checked="${!q || !tf || q.c === 0}">${escape(t('qz_true'))}</button><button type="button" role="radio" data-v="1" aria-checked="${!!(q && tf && q.c === 1)}">${escape(t('qz_false'))}</button></div>
                <label class="campo"><span>${escape(t('qz_secs'))}</span><select id="qz-qsecs"><option value="0">${escape(t('qz_secs_default'))}</option>${SECS.map((s) => `<option value="${s}">${escape(t('qz_secs_n', s))}</option>`).join('')}</select></label>
                <p class="nota" id="qz-msg" aria-live="polite"></p>
                <div class="botonera"><button type="button" class="boton" id="qz-save-q"><span data-icono="hecho"></span><span>${escape(editing >= 0 ? t('qz_save_q') : t('qz_add_q'))}</span></button>
                    ${editing >= 0 ? `<button type="button" class="boton suave" id="qz-cancel-q">${escape(t('wb_cancel'))}</button>` : ''}</div></fieldset>
            <details class="qz-pegar"><summary>${escape(t('qz_paste'))}</summary><p class="nota">${escape(t('qz_paste_hint'))}</p>
                <textarea id="qz-paste" rows="5" spellcheck="false" placeholder="${escape(t('qz_paste_ph'))}"></textarea>
                <button type="button" class="boton suave" id="qz-paste-go">${escape(t('qz_paste_go'))}</button></details>
            <div class="botonera"><button type="button" class="boton grande" id="qz-done">${escape(t('qz_done'))}</button>
                ${data.sets.length > 1 ? `<button type="button" class="boton rojo-suave" id="qz-del-set">${escape(t('qz_del_set'))}</button>` : ''}</div>
        </form>`, (d) => {
            const $ = (s) => d.querySelector(s);
            $('#qz-qsecs').value = String(q && q.secs ? q.secs : 0);
            const kind = () => (d.querySelector('#qz-kind [aria-checked="true"]') || {}).dataset;
            d.querySelector('#qz-kind').addEventListener('click', (e) => {
                const b = e.target.closest('[data-v]'); if (!b) { return; }
                d.querySelectorAll('#qz-kind button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
                $('#qz-answers').hidden = b.dataset.v === 'tf'; $('#qz-tf').hidden = b.dataset.v !== 'tf';
            });
            d.querySelector('#qz-tf').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { d.querySelectorAll('#qz-tf button').forEach((x) => x.setAttribute('aria-checked', String(x === b))); } });
            $('#qz-name').addEventListener('input', () => { set.name = clean($('#qz-name').value, 60) || set.name; keep(); });
            d.querySelector('.qz-lista').addEventListener('click', (e) => {
                const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
                if (ed) { editor(set, Number(ed.dataset.edit)); }
                if (del) { set.questions.splice(Number(del.dataset.del), 1); keep(); editor(set); }
            });
            $('#qz-save-q').addEventListener('click', () => {
                const text = clean($('#qz-q').value, 300);
                let item;
                if (kind().v === 'tf') {
                    item = { q: text, o: [t('qz_true'), t('qz_false')], c: Number((d.querySelector('#qz-tf [aria-checked="true"]') || { dataset: { v: 0 } }).dataset.v), secs: Number($('#qz-qsecs').value) };
                } else {
                    const all = [0, 1, 2, 3].map((i) => clean(d.querySelector(`[data-o="${i}"]`).value, 120));
                    const right = Number((d.querySelector('[name="qz-right"]:checked') || { value: 0 }).value);
                    const kept2 = all.map((o, i) => ({ o, i })).filter((x) => x.o);
                    const c = kept2.findIndex((x) => x.i === right);
                    item = { q: text, o: kept2.map((x) => x.o), c, secs: Number($('#qz-qsecs').value) };
                }
                if (!item.q || item.o.length < 2 || item.c < 0) { $('#qz-msg').textContent = t('qz_need'); return; }
                if (editing >= 0) { set.questions[editing] = item; } else { set.questions.push(item); }
                keep(); play('tic'); editor(set);
            });
            if ($('#qz-cancel-q')) { $('#qz-cancel-q').addEventListener('click', () => editor(set)); }
            $('#qz-paste-go').addEventListener('click', () => {
                const got = parse($('#qz-paste').value);
                if (!got.length) { $('#qz-msg').textContent = t('qz_paste_none'); return; }
                set.questions.push(...got); keep(); play('card'); editor(set);
            });
            $('#qz-done').addEventListener('click', (e) => { e.preventDefault(); closeDialog(); });
            if ($('#qz-del-set')) {
                $('#qz-del-set').addEventListener('click', () => {
                    const b = $('#qz-del-set');
                    if (!b.classList.contains('confirma')) { b.classList.add('confirma'); b.textContent = t('qz_del_set_sure'); return; }
                    data.sets = data.sets.filter((x) => x !== set); opt.set = data.sets[0] ? data.sets[0].id : ''; keep(); keepOpt(); closeDialog();
                });
            }
        });
    }

    // ---------------------------------------------------------------------------------------------------
    // From the Moodle question bank: a category, its questions with a tick each, added to the set
    // ---------------------------------------------------------------------------------------------------
    const bank = (action, extra = {}) => fetch(AULA.bankurl, { method: 'POST', credentials: 'same-origin',
        body: new URLSearchParams({ courseid: AULA.courseid, sesskey: AULA.sesskey, action, ...extra }) })
        .then((r) => r.json()).then((j) => { if (!j || j.error || j.errorcode) { throw new Error((j && (j.errorcode || j.error)) || 'error'); } return j; });
    function bankDialog() {
        openDialog(`<form method="dialog" class="qz-banco"><h2>${escape(t('qz_bank_title'))}</h2><p class="nota" id="qz-b-msg">${escape(t('qz_bank_loading'))}</p>
            <label class="campo apilado"><span>${escape(t('qz_bank_category'))}</span><select id="qz-b-cat" disabled></select></label>
            <ul class="qz-b-lista" id="qz-b-list"></ul>
            <div class="botonera"><button type="button" class="boton" id="qz-b-add" disabled>${escape(t('qz_bank_add'))}</button><button type="button" class="boton suave" id="qz-b-close">${escape(t('wb_cancel'))}</button></div></form>`, (d) => {
            const $ = (s) => d.querySelector(s);
            let found = [];
            $('#qz-b-close').addEventListener('click', closeDialog);
            const list = (id) => {
                $('#qz-b-list').innerHTML = ''; $('#qz-b-add').disabled = true; $('#qz-b-msg').textContent = t('qz_bank_loading');
                bank('questions', { categoryid: id }).then((j) => {
                    found = j.questions || [];
                    $('#qz-b-msg').textContent = found.length ? (j.skipped ? t('qz_bank_skipped', j.skipped) : '') : t('qz_bank_none');
                    $('#qz-b-list').innerHTML = found.map((q, i) => `<li><label class="qz-b-item"><input type="checkbox" checked data-i="${i}"><span><strong>${escape(q.text)}</strong>`
                        + `<small>${q.options.map((o, k) => (k === q.correct ? `<b>${escape(o)}</b>` : escape(o))).join(' · ')}</small></span></label></li>`).join('');
                    $('#qz-b-add').disabled = !found.length;
                }).catch(() => { $('#qz-b-msg').textContent = t('qz_bank_error'); });
            };
            bank('categories').then((j) => {
                const cats = j.categories || [];
                if (!cats.length) { $('#qz-b-msg').textContent = t('qz_bank_empty'); return; }
                $('#qz-b-cat').innerHTML = cats.map((c) => `<option value="${c.id}">${escape(c.name)} (${c.count})</option>`).join('');
                $('#qz-b-cat').disabled = false;
                $('#qz-b-cat').addEventListener('change', () => list($('#qz-b-cat').value));
                list(cats[0].id);
            }).catch(() => { $('#qz-b-msg').textContent = t('qz_bank_error'); });
            $('#qz-b-add').addEventListener('click', () => {
                const set = current() || (() => { const x = { id: 'q' + Date.now().toString(36), name: t('qz_new_name', 1), questions: [] }; data.sets.push(x); opt.set = x.id; return x; })();
                d.querySelectorAll('#qz-b-list input:checked').forEach((cb) => {
                    const q = found[Number(cb.dataset.i)];
                    set.questions.push({ q: clean(q.text, 300), o: q.options.slice(0, 4).map((o) => clean(o, 120)), c: q.correct, secs: 0 });
                });
                keep(); keepOpt(); play('card'); closeDialog();
            });
        });
    }

    // ---------------------------------------------------------------------------------------------------
    // The quiz running: the question, the reveal, the ranking, the podium and the summary
    // ---------------------------------------------------------------------------------------------------
    let S = null, act = null, run = null, ticker = 0, deadline = 0, lastTick = -1, revealing = false;
    const runKey = (v) => `concurso-${v.id}`;
    const nameOf = (v, d, i) => (v.identity === 'moodle' ? (d.name || t('lv_device_n', i + 1))
        : (window.ClasstoolsCritter && window.CLASSTOOLS_CONTENT && window.CLASSTOOLS_CONTENT.avatar ? window.ClasstoolsCritter.name(d.device, window.CLASSTOOLS_CONTENT.avatar) : t('lv_device_n', i + 1)));
    const face = (v, d) => (v.identity === 'moodle' || !window.ClasstoolsCritter ? '' : window.ClasstoolsCritter.svg(d.device));
    const question = (i) => (run && run.set ? run.set.questions[i] : null);
    const openQuestion = (i) => {
        const q = question(i);
        if (!q) { return; }
        revealing = false;
        run.full = q.secs || run.secs; save(runKey(S), run);
        act('open', { q: q.q, options: JSON.stringify(q.o), correct: q.c, secs: run.full });
        play('tic');
    };
    const reveal = () => { if (revealing || !S || S.revealed) { return; } revealing = true; act('reveal'); };
    const total = () => (run && run.set ? run.set.questions.length : 0);

    function paint(st, v, first, actFn) {
        stage = st; act = actFn; S = v;
        if (first || !run || run.id !== v.id) {
            // The set and the options of this session (kept in the browser, so a reload picks it up again).
            run = load(runKey(v), null);
            if (!run || run.id !== v.id) {
                run = { id: v.id, set: JSON.parse(JSON.stringify(current() || { questions: [] })), secs: opt.secs, after: opt.after, end: opt.end, phase: '' };
                save(runKey(v), run);
            }
        }
        const phase = v.round === 0 ? 'lobby' : (v.revealed ? (run.phase || 'reveal') : (v.open ? 'question' : 'closed'));
        if (phase === 'question') { clock(v); } else { stopClock(); }
        // Everybody answered: the answer is revealed by itself.
        if (phase === 'question' && v.devices.length && v.answered >= v.devices.length) { setTimeout(reveal, 900); }
        if (phase === 'closed') { reveal(); }
        if (v.revealed && !run.played) { run.played = v.round; save(runKey(v), run); play('elegido'); }
        if (!v.revealed) { run.played = 0; }
        const sig = JSON.stringify([phase, v.round, v.answered, v.devices.length, v.revealed, v.counts, phase === 'ranking' || phase === 'podium' || phase === 'results' ? v.scores : 0]);
        if (!first && stage.dataset.sig === sig && stage.querySelector('.qz-run')) { return; }
        stage.dataset.sig = sig;
        stage.innerHTML = `<div class="qz-run qz-${phase}">${({ lobby, question: showQuestion, closed: showQuestion, reveal: showReveal, ranking, podium, results })[phase](v)}</div>`;
        stage.querySelectorAll('[data-icono]').forEach((el) => setIcon(el, el.dataset.icono));
        wire(v, phase);
    }
    const head = (v) => `<p class="lv-ronda">${escape(t('qz_q_n', { n: v.round, of: total() }))}</p>`;
    function lobby(v) {
        const teams = v.teams && v.teams.length ? `<div class="lv-equipos">${v.teams.map((name, i) => `<span class="lv-equipo" style="--c:${TEAM_COLOURS[i % TEAM_COLOURS.length]}">${escape(name)} <small>${v.devices.filter((d) => d.team === i + 1).length}</small></span>`).join('')}</div>` : '';
        return `<div class="lv-centro"><p class="qz-titulo">${escape(run.set.name || '')}</p><p class="lv-grande">${escape(t('qz_lobby', { n: total(), m: v.devices.length }))}</p>
            <p class="nota">${escape(t('qz_mode_hint_' + v.mode))}</p>${teams}</div>
            <div class="botonera centro lv-mandos"><button type="button" class="boton grande verde" id="qz-go" ${total() ? '' : 'disabled'}><span data-icono="empezar"></span><span>${escape(t('qz_start'))}</span></button></div>`;
    }
    const tiles = (q, v, revealed) => {
        const most = Math.max(1, ...(v.counts || [0]));
        return `<div class="qz-respuestas-grandes n${q.o.length}">${q.o.map((o, i) => {
            const [c, light] = COLOURS[i];
            const right = revealed && i === q.c, wrong = revealed && i !== q.c;
            return `<div class="qz-tile${light ? ' claro' : ''}${right ? ' bien' : ''}${wrong ? ' apagada' : ''}" style="--c:${c}"><b>${LETTERS[i]}</b><span>${escape(o)}</span>`
                + (revealed ? `<i class="qz-cuantos" style="width:${(100 * (v.counts[i] || 0) / most).toFixed(1)}%"></i><strong>${v.counts[i] || 0}</strong>` : '') + '</div>';
        }).join('')}</div>`;
    };
    function showQuestion(v) {
        const q = question(v.round - 1);
        if (!q) { return '<p class="lv-grande">…</p>'; }
        return `${head(v)}<p class="qz-pregunta">${escape(q.q)}</p>
            <div class="lv-reloj" id="qz-clock"><span class="lv-reloj-pista"><i id="qz-clock-bar"></i></span><strong id="qz-clock-text"></strong></div>
            ${tiles(q, v, false)}
            <div class="botonera centro lv-mandos"><p class="lv-grande qz-contestado">${escape(t('lv_answered', { n: v.answered, of: v.devices.length }))}</p>
                <button type="button" class="boton amarillo" id="qz-reveal"><span data-icono="hecho"></span><span>${escape(t('qz_reveal'))}</span></button></div>`;
    }
    function showReveal(v) {
        const q = question(v.round - 1);
        const last = v.round >= total();
        const next = run.after ? t('qz_to_ranking') : (last ? (run.end ? t('qz_to_podium') : t('qz_to_results')) : t('qz_next'));
        return `${head(v)}<p class="qz-pregunta">${escape(q ? q.q : '')}</p>${q ? tiles(q, v, true) : ''}
            <div class="botonera centro lv-mandos"><button type="button" class="boton grande" id="qz-next"><span data-icono="seguir"></span><span>${escape(next)}</span></button></div>`;
    }
    // The places, shared on a tie (1, 1, 3), as the devices get them.
    const places = (list) => list.map((x) => 1 + list.filter((y) => y.total > x.total).length);
    const individual = (v, n) => {
        const at = places(v.scores);
        const list = v.scores.filter((d, i) => !n || at[i] <= n);
        return `<ol class="qz-tabla">${list.map((d, i) => `<li><span class="qz-puesto">${at[i]}</span>${face(v, d)}<span class="qz-nombre">${escape(nameOf(v, d, i))}</span>`
            + `${d.last ? `<small class="qz-mas">+${d.last}</small>` : ''}<strong>${d.total}</strong></li>`).join('')}</ol>`;
    };
    const teamTable = (v) => {
        const most = Math.max(1, ...v.teamscores.map((x) => x.total)), at = places(v.teamscores);
        return `<div class="qz-equipos">${v.teamscores.map((x, i) => `<div class="qz-equipo"><span class="qz-puesto">${at[i]}</span><span class="qz-nombre">${escape(x.name)} <small>${x.members}</small></span>`
            + `<span class="lv-pista"><i style="--c:${TEAM_COLOURS[(x.team - 1) % TEAM_COLOURS.length]}; width:${(100 * x.total / most).toFixed(1)}%"></i></span><strong>${x.total}</strong></div>`).join('')}</div>`;
    };
    function ranking(v) {
        const last = v.round >= total();
        return `<p class="qz-titulo">${escape(t('qz_ranking'))}</p>${v.teamscores.length ? teamTable(v) : individual(v, v.top || 10)}
            <div class="botonera centro lv-mandos"><button type="button" class="boton grande" id="qz-next"><span data-icono="seguir"></span><span>${escape(last ? (run.end ? t('qz_to_podium') : t('qz_to_results')) : t('qz_next'))}</span></button></div>`;
    }
    // The first three places; a tie shares its step (and the next place is skipped, as in a race).
    const podiumSteps = (v) => {
        const all = v.teamscores.length ? v.teamscores.map((x) => ({ name: x.name, total: x.total, face: '' }))
            : v.scores.map((d, i) => ({ name: nameOf(v, d, i), total: d.total, face: face(v, d) }));
        const at = places(all);
        return [1, 2, 3].map((p) => ({ place: p, who: all.filter((x, i) => at[i] === p) })).filter((s) => s.who.length && s.who[0].total > 0);
    };
    function podium(v) {
        const steps = podiumSteps(v);
        const order = [2, 1, 3].map((p) => steps.find((s) => s.place === p)).filter(Boolean);
        const step = (s) => {
            const shown = s.who.slice(0, 3), more = s.who.length - shown.length;
            return `<div class="qz-escalon p${s.place}${s.who.length > 1 ? ' empate' : ''}"><span class="qz-caras">${shown.map((x) => x.face).join('')}</span>`
                + shown.map((x) => `<span class="qz-nombre">${escape(x.name)}</span>`).join('') + (more ? `<small>${escape(t('qz_and_more', more))}</small>` : '')
                + `<strong>${s.who[0].total}</strong><div class="qz-cajon">${s.place}</div></div>`;
        };
        return `<p class="qz-titulo">${escape(t('qz_podium'))}</p><div class="qz-podio">${order.map(step).join('')}</div>
            ${v.teamscores.length ? teamTable(v) : ''}
            <div class="botonera centro lv-mandos"><button type="button" class="boton grande" id="qz-results"><span data-icono="lista"></span><span>${escape(t('qz_results'))}</span></button></div>`;
    }
    function results(v) {
        const rows = (v.summary || []).map((x) => {
            const pct = x.answered ? Math.round((100 * x.right) / x.answered) : 0;
            return `<tr><td>${x.round}</td><td>${escape(x.q)}</td><td>${x.right} / ${x.answered}</td><td><span class="qz-pct" style="--p:${pct}%">${pct} %</span></td></tr>`;
        }).join('');
        const people = v.identity === 'moodle' ? `<h3>${escape(t('qz_by_student'))}</h3><table class="qz-resultados"><thead><tr><th>${escape(t('qz_student'))}</th><th>${escape(t('qz_hits'))}</th><th>${escape(t('qz_points_col'))}</th></tr></thead><tbody>`
            + v.scores.map((d, i) => `<tr><td>${escape(nameOf(v, d, i))}</td><td>${d.hits} / ${total()}</td><td>${d.total}</td></tr>`).join('') + '</tbody></table>' : '';
        return `<p class="qz-titulo">${escape(t('qz_results'))}</p><div class="qz-scroll"><table class="qz-resultados"><thead><tr><th>#</th><th>${escape(t('qz_question'))}</th><th>${escape(t('qz_right_col'))}</th><th>%</th></tr></thead><tbody>${rows}</tbody></table>${people}</div>
            <p class="nota">${escape(t('qz_results_note'))}</p>`;
    }
    function wire(v, phase) {
        const $ = (s) => stage.querySelector(s);
        if ($('#qz-go')) { $('#qz-go').addEventListener('click', () => { run.phase = ''; save(runKey(v), run); openQuestion(0); }); }
        if ($('#qz-reveal')) { $('#qz-reveal').addEventListener('click', reveal); }
        if ($('#qz-next')) {
            $('#qz-next').addEventListener('click', () => {
                const last = v.round >= total();
                if (phase === 'reveal' && run.after) { run.phase = 'ranking'; } else if (!last) { run.phase = ''; save(runKey(v), run); openQuestion(v.round); return; } else { run.phase = run.end ? 'podium' : 'results'; }
                save(runKey(v), run); stage.dataset.sig = ''; paint(stage, S, false, act);
                if (run.phase === 'podium') {
                    const first = podiumSteps(S)[0], names = first ? first.who.map((x) => x.name) : [];
                    play('fin');
                    if (core.celebrate && names.length) { core.celebrate(stage, { title: names.length > 3 ? t('qz_tie_n', names.length) : names.join(' · '), text: t(names.length > 1 ? 'qz_first_tie' : 'qz_first') }); }
                    announce(t('qz_podium'));
                }
            });
        }
        if ($('#qz-results')) { $('#qz-results').addEventListener('click', () => { run.phase = 'results'; save(runKey(v), run); stage.dataset.sig = ''; paint(stage, S, false, act); }); }
    }

    // The seconds of the question, counted here between the questions to Moodle (which closes it anyway).
    const clock = (v) => {
        if (!v.left) { return; }
        const end = performance.now() + v.left * 1000;
        if (!deadline || Math.abs(end - deadline) > 1500) { deadline = end; }
        if (!run.full || run.full < v.left) { run.full = v.left; }
        if (!ticker) { ticker = setInterval(tick, 200); }
        tick();
    };
    const stopClock = () => { clearInterval(ticker); ticker = 0; deadline = 0; lastTick = -1; };
    const tick = () => {
        const box = stage && stage.querySelector('#qz-clock');
        const left = Math.max(0, (deadline - performance.now()) / 1000), whole = Math.ceil(left);
        if (box) {
            stage.querySelector('#qz-clock-text').textContent = `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
            stage.querySelector('#qz-clock-bar').style.width = `${(100 * left / (run.full || 1)).toFixed(1)}%`;
            box.classList.toggle('ultimo', whole <= 5);
        }
        if (whole <= 5 && whole > 0 && whole !== lastTick) { lastTick = whole; play('cuenta'); }
        if (left <= 0) { stopClock(); reveal(); }
    };

    window.ClasstoolsQuiz = { setup, startOptions, paint, parse };
})();
