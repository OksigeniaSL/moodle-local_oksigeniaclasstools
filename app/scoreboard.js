// Scoreboard for the classroom board: 2 to 8 teams with big buttons, the leader crowned, and the teams made in
// «Hacer grupos» (with their faces) in one tap. It is kept for each course in the browser and, inside Moodle, for
// the teacher in the course, so the contest can go on another day from any computer. UI strings live in STR.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-marcador');
    if (!core || !root) { return; }
    const { $, $$, t, escape, reducedMotion, save, load, play, setIcon, announce, icon } = core;

    const STR = {
        addTeam: t('sc_add_team'), fromGroups: t('sc_from_groups'), reset: t('sc_reset'),
        resetSure: t('sc_reset_sure'), team: (n) => t('sc_team', n), group: (n) => t('sc_group', n),
        remove: t('sc_remove'), name: t('sc_name'), color: t('sc_colour'),
        points: (n) => t(n === 1 ? 'sc_points_one' : 'sc_points_many', n), leads: (x) => t('sc_leads', x), tie: t('sc_tie'),
        noGroups: t('sc_no_groups'), teams: (n) => t(n === 1 ? 'sc_teams_one' : 'sc_teams_many', n),
    };
    const COLORS = ['#164281', '#ce1423', '#067e36', '#fbbe17', '#5b2fb8', '#0e7c86', '#c2410c', '#0f2f5e'];
    const steps = () => ((core.mode ? core.mode() : 'primary') === 'early' ? [-1, 1] : [-1, 1, 5, 10]);   // the youngest: only one point at a time
    const key = 'marcador' + (core.moodle ? ':' + core.moodle.courseid : '');
    const fresh = () => ({ teams: [0, 1].map((i) => ({ name: STR.team(i + 1), color: COLORS[i], score: 0, members: [] })) });
    let state = load(key, null);
    const kept = core.kept('scoreboard');   // what Moodle has: wins if it is newer (saved from another computer)
    if (kept && Array.isArray(kept.teams) && kept.teams.length && (!state || (kept.updated || 0) > (state.updated || 0))) { state = kept; }
    if (!state || !Array.isArray(state.teams) || state.teams.length < 1) { state = fresh(); }
    state.teams = state.teams.slice(0, 8).map((t, i) => ({
        name: String((t && t.name) || STR.team(i + 1)).slice(0, 24), color: COLORS.includes(t && t.color) ? t.color : COLORS[i % COLORS.length],
        score: Math.max(0, Math.round(Number(t && t.score) || 0)), members: Array.isArray(t && t.members) ? t.members.filter((m) => typeof m === 'string') : [],
        listId: (t && typeof t.listId === 'string') ? t.listId : null,
    }));
    let leader = null, resetTimer = 0;

    core.sounds.point = (a) => core.bell(a, 1046.5, 0, 0.22, 0.6);
    core.sounds.minus = (a) => core.click(a, 300, 0, 0.12);
    core.sounds.lead = (a) => { core.bell(a, 783.99, 0, 0.3, 1); core.bell(a, 1174.66, 0.12, 0.3, 1.3); };

    root.innerHTML = `
        <div class="barra-herr ct-top">
            <button type="button" class="boton suave" id="sc-add"><span data-icono="mas"></span>${STR.addTeam}</button>
            <button type="button" class="boton suave" id="sc-groups"><span data-icono="grupos"></span>${STR.fromGroups}</button>
            <p class="nota" id="sc-note" aria-live="polite"></p>
            <button type="button" class="boton rojo-suave ct-push" id="sc-reset"><span data-icono="reiniciar"></span><span>${STR.reset}</span></button>
        </div>
        <div class="ct-teams" id="sc-teams"></div>`;
    $$('[data-icono]', root).forEach((el) => setIcon(el, el.dataset.icono));

    const persist = () => { state.updated = Date.now(); save(key, state); core.keep('scoreboard', state); };
    const best = () => {
        const max = Math.max(...state.teams.map((t) => t.score));
        const top = state.teams.map((t, i) => (t.score === max ? i : -1)).filter((i) => i >= 0);
        return max > 0 && top.length === 1 ? top[0] : null;
    };
    const membersHTML = (t) => {
        if (!t.members || !t.members.length) { return ''; }
        const list = core.lists().find((l) => l.id === t.listId) || null;
        return `<ul class="ct-members">${t.members.map((n) => `<li title="${escape(n)}">${list ? core.face(list, n, 'cara-mini') : ''}<span>${escape(n)}</span></li>`).join('')}</ul>`;
    };
    const paint = () => {
        const lead = best();
        const box = $('#sc-teams');
        box.dataset.n = state.teams.length;
        box.innerHTML = state.teams.map((t, i) => {
            const light = t.color === '#fbbe17';
            return `<article class="ct-team${light ? ' claro' : ''}${i === lead ? ' ct-lead' : ''}" style="--c:${t.color}" data-i="${i}">
                <header>
                    <button type="button" class="ct-color" title="${escape(STR.color)}" aria-label="${escape(STR.color)}"></button>
                    <input class="ct-team-name" value="${escape(t.name)}" maxlength="24" aria-label="${escape(STR.name)}">
                    ${i === lead ? `<span class="ct-crown" aria-hidden="true">${icon('corona')}</span>` : ''}
                    <button type="button" class="ct-x" title="${escape(STR.remove)}" aria-label="${escape(STR.remove)}"${state.teams.length < 3 ? ' hidden' : ''}>${icon('cerrar')}</button>
                </header>
                <output class="ct-score" aria-live="polite" aria-label="${escape(t.name)}: ${escape(STR.points(t.score))}">${t.score}</output>
                ${membersHTML(t)}
                <div class="ct-steps">${steps().map((s) => `<button type="button" class="ct-step${s < 0 ? ' ct-minus' : ''}" data-step="${s}">${s > 0 ? '+' + s : '−' + Math.abs(s)}</button>`).join('')}</div>
            </article>`;
        }).join('');
        $('#sc-add').disabled = state.teams.length >= 8;
    };
    // Only the scores, the leader and the crown: repainting the cards would wipe a team name being typed.
    const paintScores = () => {
        const lead = best();
        $$('#sc-teams .ct-team').forEach((card) => {
            const i = Number(card.dataset.i), t = state.teams[i];
            if (!t) { return; }
            const out = card.querySelector('.ct-score');
            out.textContent = String(t.score); out.setAttribute('aria-label', `${t.name}: ${STR.points(t.score)}`);
            card.classList.toggle('ct-lead', i === lead);
            const crown = card.querySelector('.ct-crown');
            if (i === lead && !crown) { card.querySelector('.ct-team-name').insertAdjacentHTML('afterend', `<span class="ct-crown" aria-hidden="true">${icon('corona')}</span>`); }
            if (i !== lead && crown) { crown.remove(); }
        });
    };
    const bump = (i, step) => {
        const t = state.teams[i];
        t.score = Math.max(0, t.score + step);
        persist();
        const before = leader;
        leader = best();
        paintScores();
        const card = $(`#sc-teams .ct-team[data-i="${i}"]`);
        if (card && !reducedMotion()) { card.classList.remove('ct-bump'); void card.offsetWidth; card.classList.add(step > 0 ? 'ct-bump' : 'ct-drop'); }
        if (leader !== null && leader !== before) { play('lead'); announce(STR.leads(state.teams[leader].name)); }
        else { play(step > 0 ? 'point' : 'minus'); announce(`${t.name}: ${STR.points(t.score)}`); }
    };

    $('#sc-teams').addEventListener('click', (e) => {
        const card = e.target.closest('.ct-team');
        if (!card) { return; }
        const i = Number(card.dataset.i);
        const step = e.target.closest('.ct-step');
        if (step) { bump(i, Number(step.dataset.step)); return; }
        if (e.target.closest('.ct-color')) {
            const t = state.teams[i];
            t.color = COLORS[(COLORS.indexOf(t.color) + 1) % COLORS.length];
            persist(); paint(); return;
        }
        if (e.target.closest('.ct-x')) {
            state.teams.splice(i, 1); persist(); leader = best(); paint();
        }
    });
    $('#sc-teams').addEventListener('change', (e) => {
        const input = e.target.closest('.ct-team-name');
        if (!input) { return; }
        const i = Number(input.closest('.ct-team').dataset.i);
        state.teams[i].name = input.value.trim() || STR.team(i + 1);
        persist(); paint();
    });
    $('#sc-add').addEventListener('click', () => {
        if (state.teams.length >= 8) { return; }
        const used = state.teams.map((t) => t.color);
        state.teams.push({ name: STR.team(state.teams.length + 1), color: COLORS.find((c) => !used.includes(c)) || COLORS[0], score: 0, members: [] });
        persist(); paint();
    });
    $('#sc-groups').addEventListener('click', () => {
        const g = core.lastGroups();
        if (!g || !g.grupos || !g.grupos.length) { $('#sc-note').textContent = STR.noGroups; return; }
        $('#sc-note').textContent = '';
        state.teams = g.grupos.slice(0, 8).map((members, i) => ({
            name: STR.group(i + 1), color: COLORS[i % COLORS.length], score: 0, members: members.slice(), listId: g.lista ? g.lista.id : null,
        }));
        persist(); leader = null; paint();
        announce(STR.teams(state.teams.length));
    });
    $('#sc-reset').addEventListener('click', () => {
        const b = $('#sc-reset');
        if (!b.classList.contains('confirma')) {
            b.classList.add('confirma'); core.relabel(b, STR.resetSure);
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => { b.classList.remove('confirma'); core.relabel(b, STR.reset); }, 4000);
            return;
        }
        clearTimeout(resetTimer); b.classList.remove('confirma'); core.relabel(b, STR.reset);
        state.teams.forEach((t) => { t.score = 0; });
        persist(); leader = null; paint();
    });

    document.addEventListener('classtools:mode', () => paint());
    core.register('marcador', {
        entra: () => {
            $('#sc-groups').disabled = !core.lastGroups();
            $('#sc-note').textContent = '';
            paint();
        },
    });
    leader = best();
    paint();

    window.ClasstoolsScoreboard = { bump, state: () => state };   // for automated tests
})();
